from fastapi import APIRouter, Request, HTTPException, Depends
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.agent_service import AgentService
from app.core.limiter import limiter, CHAT_STREAM_LIMIT
from app.core.auth import get_current_user

router = APIRouter()

class ChatStreamRequest(BaseModel):
    query: str
    conversationHistory: List[Dict[str, str]] = []
    databaseConfig: Dict[str, Any] = {"type": "sqlite"}
    modelName: Optional[str] = None
    apiKey: Optional[str] = None
    readOnly: bool = True

@router.get("/models")
@limiter.limit("60/minute")
def get_available_models(request: Request, api_key: Optional[str] = None):
    try:
        models = AgentService.get_models(api_key)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stream")
@limiter.limit(CHAT_STREAM_LIMIT)
async def chat_stream(
    request: Request,
    req: ChatStreamRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Streams natural language database queries via SSE.
    Enforces mandatory authentication: Only authenticated users can interact with models.
    """
    user_info = {
        "id": current_user.get("id") or current_user.get("sub"),
        "email": current_user.get("email"),
        "name": current_user.get("name")
    }

    async def event_generator():
        async for chunk in AgentService.run_query_stream(
            user_query=req.query,
            conversation_history=req.conversationHistory,
            db_config=req.databaseConfig,
            model_name=req.modelName,
            api_key=req.apiKey,
            read_only=req.readOnly,
            user_info=user_info
        ):
            yield {"data": chunk}

    return EventSourceResponse(event_generator())

