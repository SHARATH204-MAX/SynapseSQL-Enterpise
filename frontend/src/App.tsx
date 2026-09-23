import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatContainer } from './components/chat/ChatContainer';
import { ConnectionModal } from './components/modals/ConnectionModal';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { TableDetailsModal } from './components/modals/TableDetailsModal';
import { LoginModal } from './components/modals/LoginModal';
import { QueryHistoryModal } from './components/modals/QueryHistoryModal';
import { useAuth } from './context/AuthContext';

import { DatabaseConfig, SchemaResponse, TableSchema, Conversation, Message, ThoughtStep } from './types';
import { api } from './services/api';

const DEFAULT_CONVERSATION: Conversation = {
  id: 'default-1',
  title: 'Student Database Exploration',
  createdAt: new Date().toISOString(),
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: '👋 Welcome to **SynapseSQL Enterprise**! I am connected to your database.\n\nAsk questions in natural language, request specific data breakdowns, or speak using the voice recorder. I will automatically formulate optimized queries, present structured tables, and provide instant copyable SQL code.',
      timestamp: new Date().toISOString()
    }
  ],
  dbConfig: { type: 'sqlite' }
};

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();


  // Persistence state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('synapsesql_conversations');
    return saved ? JSON.parse(saved) : [DEFAULT_CONVERSATION];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return conversations[0]?.id || 'default-1';
  });

  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => {
    const saved = localStorage.getItem('synapsesql_db_config');
    return saved ? JSON.parse(saved) : { type: 'sqlite' };
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('synapsesql_groq_api_key') || '';
  });

  // UI state
  const [models, setModels] = useState<string[]>(['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']);
  const [selectedModel, setSelectedModel] = useState<string>('qwen/qwen3.8-27b');
  const [readOnly, setReadOnly] = useState<boolean>(true);
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState<boolean>(false);
  const [activeStatus, setActiveStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modals
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTableForModal, setSelectedTableForModal] = useState<TableSchema | null>(null);



  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0] || DEFAULT_CONVERSATION;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('synapsesql_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('synapsesql_db_config', JSON.stringify(dbConfig));
  }, [dbConfig]);

  useEffect(() => {
    localStorage.setItem('synapsesql_groq_api_key', apiKey);
  }, [apiKey]);

  // Load models on startup
  useEffect(() => {
    const loadModels = async () => {
      try {
        const fetched = await api.getModels(apiKey);
        if (fetched.length > 0) {
          setModels(fetched);
          if (!fetched.includes(selectedModel)) {
            setSelectedModel(fetched[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load models', err);
      }
    };
    loadModels();
  }, [apiKey]);

  // Load schema when DB config changes
  const loadSchema = async () => {
    setIsLoadingSchema(true);
    try {
      const data = await api.getSchema(dbConfig);
      setSchema(data);
    } catch (err) {
      console.error('Schema inspection failed', err);
    } finally {
      setIsLoadingSchema(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, [dbConfig]);

  // Conversation thread operations
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: `Query Session ${conversations.length + 1}`,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '👋 New conversation started. How can I assist with your database today?',
          timestamp: new Date().toISOString()
        }
      ],
      dbConfig: { ...dbConfig }
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    if (conversations.length <= 1) return;
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      setActiveConversationId(remaining[0].id);
    }
  };

  // Main SSE Chat Stream Handler
  const handleSendMessage = async (queryText: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!queryText.trim() || isLoading) return;


    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toISOString()
    };

    const assistantMessageId = `assist-${Date.now()}`;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      thoughts: [],
      timestamp: new Date().toISOString()
    };

    // Update conversation with user message + assistant placeholder
    setConversations(prev => prev.map(c => {
      if (c.id === activeConversationId) {
        const title = c.messages.length <= 1 ? queryText.slice(0, 32) + '...' : c.title;
        return {
          ...c,
          title,
          messages: [...c.messages, userMessage, assistantPlaceholder]
        };
      }
      return c;
    }));

    setIsLoading(true);
    setActiveStatus('Initializing query agent...');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const history = activeConversation.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const token = localStorage.getItem('synapsesql_token');
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          query: queryText,
          conversationHistory: history,
          databaseConfig: dbConfig,
          modelName: selectedModel,
          apiKey: apiKey || undefined,
          readOnly: readOnly
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      let streamedContent = '';
      let streamedSql = '';
      let streamedThoughts: ThoughtStep[] = [];
      let executionTimeMs: number | undefined;
      let finalModel: string | undefined;

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Normalize \r\n to \n for reliable SSE chunk splitting
        const normalized = buffer.replace(/\r\n/g, '\n');
        const chunks = normalized.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.trim().startsWith('data:')) continue;
            const jsonStr = line.replace(/^data:\s*/, '').trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === 'status') {
                setActiveStatus(event.message);
              } else if (event.type === 'thought') {
                streamedThoughts.push({
                  tool: event.tool,
                  input: event.input,
                  thought: event.thought
                });
                setActiveStatus(`Executing: ${event.tool || 'Analyzing database...'}`);
              } else if (event.type === 'tool_output') {
                if (streamedThoughts.length > 0) {
                  streamedThoughts[streamedThoughts.length - 1].output = event.output;
                }
              } else if (event.type === 'sql') {
                streamedSql = event.query;
              } else if (event.type === 'token') {
                // Keep streaming answer
                streamedContent += event.content;
              } else if (event.type === 'done') {
                streamedContent = event.answer || streamedContent;
                streamedSql = event.sql || streamedSql;
                executionTimeMs = event.executionTimeMs;
                finalModel = event.model;
              } else if (event.type === 'error') {
                streamedContent = `❌ **Error:** ${event.message}`;
              }

              // Real-time UI update
              setConversations(prev => prev.map(c => {
                if (c.id === activeConversationId) {
                  return {
                    ...c,
                    messages: c.messages.map(m => {
                      if (m.id === assistantMessageId) {
                        return {
                          ...m,
                          content: streamedContent,
                          sql: streamedSql || undefined,
                          thoughts: [...streamedThoughts],
                          executionTimeMs,
                          model: finalModel
                        };
                      }
                      return m;
                    })
                  };
                }
                return c;
              }));

            } catch (e) {
              console.error('Error parsing SSE json event', e, jsonStr);
            }
          }
        }
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Stream failed', err);
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              messages: c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: `❌ **Connection Failed:** ${err.message || 'Unable to connect to AI server.'}`
                  };
                }
                return m;
              })
            };
          }
          return c;
        }));
      }
    } finally {
      setIsLoading(false);
      setActiveStatus('');
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setActiveStatus('');
    }
  };

  const handleExecuteSql = async (sqlQuery: string) => {
    try {
      setActiveStatus('Executing SQL query...');
      const res = await api.executeQuery(sqlQuery, dbConfig, readOnly);
      
      const resMessage: Message = {
        id: `exec-${Date.now()}`,
        role: 'assistant',
        content: `⚡ Direct SQL Execution Results for:\n\`\`\`sql\n${sqlQuery}\n\`\`\``,
        sql: sqlQuery,
        data: res,
        timestamp: new Date().toISOString()
      };

      setConversations(prev => prev.map(c => {
        if (c.id === activeConversationId) {
          return { ...c, messages: [...c.messages, resMessage] };
        }
        return c;
      }));
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setActiveStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        dbConfig={dbConfig}
        schema={schema}
        isLoadingSchema={isLoadingSchema}
        onRefreshSchema={loadSchema}
        onOpenConnectionModal={() => setIsConnectionModalOpen(true)}
        onSelectTable={(table) => setSelectedTableForModal(table)}
      />

      {/* Main App Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        <Header
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          readOnly={readOnly}
          onToggleReadOnly={() => setReadOnly(!readOnly)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
          hasApiKey={!!apiKey}
        />

        <main style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <ChatContainer
            messages={activeConversation.messages}
            isLoading={isLoading}
            activeStatus={activeStatus}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            onExecuteSql={handleExecuteSql}
            isAuthenticated={isAuthenticated}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />

        </main>
      </div>

      {/* Modals */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        currentConfig={dbConfig}
        onSave={(newCfg) => setDbConfig(newCfg)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentApiKey={apiKey}
        onSave={(key) => setApiKey(key)}
      />

      <TableDetailsModal
        table={selectedTableForModal}
        onClose={() => setSelectedTableForModal(null)}
        onQueryTable={(tName) => handleSendMessage(`Analyze table ${tName} and summarize its key metrics.`)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <QueryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectQuery={handleSendMessage}
      />
    </div>
  );
};


export default App;
