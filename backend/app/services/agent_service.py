import json
import time
import re
import asyncio
from typing import AsyncGenerator, Dict, Any, List, Optional
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.core.database import DatabaseManager
from app.core.security import validate_query_safety
from app.core.supabase import SupabaseService

class AgentService:
    @staticmethod
    def get_models(api_key: Optional[str] = None) -> List[str]:
        key = api_key or settings.GROQ_API_KEY
        default_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
        if not key:
            return default_models
        try:
            import groq
            client = groq.Groq(api_key=key)
            fetched = [
                m.id for m in client.models.list().data
                if m.active and not any(k in m.id for k in ['whisper', 'prompt-guard', 'safeguard', 'orpheus', 'allam'])
            ]
            priority = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
            ordered = [m for m in priority if m in fetched] + [m for m in fetched if m not in priority]
            return ordered if ordered else default_models
        except Exception:
            return default_models

    @staticmethod
    async def run_query_stream(
        user_query: str,
        conversation_history: List[Dict[str, str]],
        db_config: Dict[str, Any],
        model_name: Optional[str] = None,
        api_key: Optional[str] = None,
        read_only: bool = True,
        user_info: Optional[Dict[str, Any]] = None
    ) -> AsyncGenerator[str, None]:
        key = api_key or settings.GROQ_API_KEY
        if not key:
            yield json.dumps({"type": "error", "message": "Missing Groq API Key. Please configure it in settings."})
            return

        available_models = AgentService.get_models(key)
        selected_model = model_name if (model_name and model_name in available_models) else available_models[0]
        models_to_try = [selected_model] + [m for m in available_models if m != selected_model]
        db_type = db_config.get("type", "sqlite")

        # Security validation on query prompt
        is_safe, warn_msg = validate_query_safety(user_query, read_only=read_only)
        if not is_safe:
            SupabaseService.log_query_usage(
                user_id=user_info.get("id") if user_info else None,
                user_email=user_info.get("email") if user_info else None,
                user_name=user_info.get("name") if user_info else None,
                query_text=user_query,
                generated_sql=None,
                model_name=selected_model,
                database_type=db_type,
                status="blocked",
                execution_time_ms=0,
                rows_returned=0,
                error_message=warn_msg
            )
            yield json.dumps({"type": "error", "message": warn_msg})
            return

        sqlite_path = db_config.get("sqlite_path")

        mysql_host = db_config.get("mysql_host")
        mysql_user = db_config.get("mysql_user")
        mysql_password = db_config.get("mysql_password")
        mysql_db = db_config.get("mysql_db")

        # Step 1: Real-time schema inspection
        yield json.dumps({"type": "status", "message": "Inspecting database schema & relationships..."})
        try:
            schema_data = DatabaseManager.inspect_schema(
                db_type=db_type,
                sqlite_path=sqlite_path,
                mysql_host=mysql_host,
                mysql_user=mysql_user,
                mysql_password=mysql_password,
                mysql_db=mysql_db
            )
        except Exception as e:
            yield json.dumps({"type": "error", "message": f"Database schema inspection failed: {str(e)}"})
            return

        # Format schema metadata context for LLM
        schema_text_parts = []
        for t in schema_data.get("tables", []):
            col_strs = [f"{c['name']} ({c['type']}{', PK' if c.get('primaryKey') else ''})" for c in t.get("columns", [])]
            fk_strs = [f"{fk.get('constrained_columns')} -> {fk.get('referred_table')}.{fk.get('referred_columns')}" for fk in t.get("foreignKeys", [])]
            sample_preview = str(t.get("sampleData", []))[:300]
            
            t_info = f"Table: {t['name']}\nColumns: {', '.join(col_strs)}"
            if fk_strs:
                t_info += f"\nForeign Keys: {', '.join(fk_strs)}"
            if sample_preview and sample_preview != "[]":
                t_info += f"\nSample Rows: {sample_preview}"
            schema_text_parts.append(t_info)

        schema_context = "\n\n".join(schema_text_parts)

        # Prepare conversation history
        history_context = "\n".join([f"{m.get('role')}: {m.get('content')}" for m in conversation_history[-3:]])
        context_query = f"Recent History:\n{history_context}\n\nCurrent Question: {user_query}" if history_context else user_query

        start_time = time.time()
        success = False

        for current_model in models_to_try:
            yield json.dumps({"type": "status", "message": f"Formulating query with model: {current_model}..."})
            
            try:
                # LLM instance for SQL generation (low temperature for deterministic SQL)
                llm_sql = ChatGroq(
                    groq_api_key=key,
                    model_name=current_model,
                    temperature=0.0,
                    max_tokens=350,
                    timeout=20
                )

                sql_system_prompt = f"""You are a master database architect and SQL developer for {db_type.upper()}.
Given the following database schema:
{schema_context}

RULES:
1. Write ONLY a single, syntactically correct {db_type.upper()} SQL query to answer the user request.
2. Use standard SQL joins, where clauses, aggregations, or groupings appropriate for {db_type.upper()}.
3. If table names or column names match the schema, use exact casing.
4. Output ONLY the raw SQL query. Do NOT wrap in markdown, backticks, or write explanations."""

                yield json.dumps({
                    "type": "thought",
                    "tool": "schema_analysis",
                    "input": user_query,
                    "thought": f"Analyzing schema ({len(schema_data.get('tables', []))} tables) and formulating SQL query."
                })

                sql_response = await llm_sql.ainvoke([
                    SystemMessage(content=sql_system_prompt),
                    HumanMessage(content=context_query)
                ])

                # Extract and clean SQL string
                raw_sql = str(sql_response.content).strip()
                raw_sql = re.sub(r"^```(?:sql)?\s*", "", raw_sql, flags=re.IGNORECASE)
                raw_sql = re.sub(r"\s*```$", "", raw_sql)
                raw_sql = raw_sql.strip()

                # Emit captured SQL
                yield json.dumps({"type": "sql", "query": raw_sql})
                yield json.dumps({
                    "type": "thought",
                    "tool": "sql_execution",
                    "input": raw_sql,
                    "thought": f"Executing formulated SQL on {db_type} database..."
                })

                # Step 2: Execute SQL against Database
                yield json.dumps({"type": "status", "message": "Executing SQL query on database engine..."})
                
                try:
                    query_result = DatabaseManager.execute_raw_query(
                        query=raw_sql,
                        db_type=db_type,
                        sqlite_path=sqlite_path,
                        mysql_host=mysql_host,
                        mysql_user=mysql_user,
                        mysql_password=mysql_password,
                        mysql_db=mysql_db
                    )
                except Exception as db_err:
                    # Self-heal attempt: ask model to fix SQL error once
                    yield json.dumps({
                        "type": "thought",
                        "tool": "sql_self_heal",
                        "input": str(db_err),
                        "thought": f"Database execution error encountered: {str(db_err)}. Self-healing query..."
                    })
                    
                    fix_prompt = f"""The SQL query:
{raw_sql}

Produced this database error:
{str(db_err)}

Correct the SQL query to fix the error. Return ONLY the single corrected raw SQL query with no formatting."""
                    
                    fixed_res = await llm_sql.ainvoke([
                        SystemMessage(content=sql_system_prompt),
                        HumanMessage(content=fix_prompt)
                    ])
                    raw_sql = str(fixed_res.content).strip()
                    raw_sql = re.sub(r"^```(?:sql)?\s*", "", raw_sql, flags=re.IGNORECASE)
                    raw_sql = re.sub(r"\s*```$", "", raw_sql)
                    raw_sql = raw_sql.strip()
                    
                    yield json.dumps({"type": "sql", "query": raw_sql})
                    query_result = DatabaseManager.execute_raw_query(
                        query=raw_sql,
                        db_type=db_type,
                        sqlite_path=sqlite_path,
                        mysql_host=mysql_host,
                        mysql_user=mysql_user,
                        mysql_password=mysql_password,
                        mysql_db=mysql_db
                    )

                yield json.dumps({"type": "tool_output", "output": f"Rows returned: {query_result.get('rowCount', 0)}"})

                # Step 3: Stream Structured 4-Section Analytical Report
                yield json.dumps({"type": "status", "message": "Synthesizing structured analytical report..."})
                
                llm_explain = ChatGroq(
                    groq_api_key=key,
                    model_name=current_model,
                    temperature=0.2,
                    max_tokens=850,
                    streaming=True,
                    timeout=30
                )

                explain_system_prompt = """You are an expert Senior Database Intelligence Specialist and Enterprise SQL Analyst.
Your role is to translate raw database outputs into clean, high-impact executive intelligence.

FOR EVERY QUERY, YOU MUST STRICTLY FORMAT YOUR FINAL ANSWER INTO THESE 4 STRUCTURED MARKDOWN SECTIONS:

### 🎯 Direct Summary
- Provide a direct, concise answer to the user's question.
- Highlight all key metrics, totals, counts, averages, or top values in **bold**.

### 📊 Data Breakdown
- If records or rows are returned, format them into a clean Markdown table with descriptive column headers (e.g. Rank, Name, Class, Section, Marks).
- If it is a single number or statistical aggregation, provide a clear bulleted breakdown of the calculated values.
- If no records match, state: "No records found matching your specified criteria."

### 🔍 Query Logic & Technical Breakdown
- **Tables Consulted**: Specify which table(s) and key columns were accessed.
- **Filters & Conditions**: Explain in clear business language all `WHERE` filters, `GROUP BY` aggregations, `HAVING` clauses, or `ORDER BY` sorting applied, explaining why each was chosen.
- **Query Objective**: Summarize how this SQL statement fulfills the user's intent with optimal performance.

### 💡 Analytical Takeaway
- Provide 1-2 practical analytical insights, patterns, edge-case observations (such as ties or distributions), or recommended follow-up questions/queries.

CRITICAL RULES:
1. NEVER skip any of the 4 sections.
2. Format cleanly with valid Markdown."""

                user_report_prompt = f"""User Question: {user_query}

Executed SQL Query:
```sql
{raw_sql}
```

Database Output:
Columns: {query_result.get('columns', [])}
Rows: {query_result.get('rows', [])[:15]}
Total Rows Count: {query_result.get('rowCount', 0)}

Generate the complete 4-section structured analytical report now."""

                accumulated_answer = ""
                async for chunk in llm_explain.astream([
                    SystemMessage(content=explain_system_prompt),
                    HumanMessage(content=user_report_prompt)
                ]):
                    token_text = chunk.content or ""
                    if token_text:
                        accumulated_answer += token_text
                        yield json.dumps({"type": "token", "content": token_text})

                exec_time_ms = int((time.time() - start_time) * 1000)

                # Persist query interaction to Supabase (metadata + SQL only, no database rows)
                SupabaseService.log_query_usage(
                    user_id=user_info.get("id") if user_info else None,
                    user_email=user_info.get("email") if user_info else None,
                    user_name=user_info.get("name") if user_info else None,
                    query_text=user_query,
                    generated_sql=raw_sql,
                    model_name=current_model,
                    database_type=db_type,
                    status="success",
                    execution_time_ms=exec_time_ms,
                    rows_returned=query_result.get("rowCount", 0),
                    error_message=None
                )

                # Emit final done event with query results and SQL
                yield json.dumps({
                    "type": "done",
                    "answer": accumulated_answer,
                    "sql": raw_sql,
                    "data": query_result,
                    "model": current_model,
                    "executionTimeMs": exec_time_ms
                })

                success = True
                break

            except Exception as e:
                err_str = str(e)
                yield json.dumps({"type": "warning", "message": f"Model {current_model} error: {err_str[:120]}. Failing over..."})
                await asyncio.sleep(0.5)

        if not success:
            SupabaseService.log_query_usage(
                user_id=user_info.get("id") if user_info else None,
                user_email=user_info.get("email") if user_info else None,
                user_name=user_info.get("name") if user_info else None,
                query_text=user_query,
                generated_sql=None,
                model_name=selected_model,
                database_type=db_type,
                status="error",
                execution_time_ms=int((time.time() - start_time) * 1000),
                rows_returned=0,
                error_message="All AI models were unable to complete the query."
            )
            yield json.dumps({
                "type": "error",
                "message": "All AI models were unable to complete the query. Please check database connectivity or try again."
            })

