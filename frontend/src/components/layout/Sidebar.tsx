import React, { useState } from 'react';
import {
  Database,
  Table as TableIcon,
  Columns,
  Key,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Server,
  Layers,
  Settings2,
  RefreshCw
} from 'lucide-react';
import { DatabaseConfig, SchemaResponse, TableSchema, Conversation } from '../../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  dbConfig: DatabaseConfig;
  schema: SchemaResponse | null;
  isLoadingSchema: boolean;
  onRefreshSchema: () => void;
  onOpenConnectionModal: () => void;
  onSelectTable: (table: TableSchema) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  dbConfig,
  schema,
  isLoadingSchema,
  onRefreshSchema,
  onOpenConnectionModal,
  onSelectTable
}) => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'schema' | 'history'>('schema');

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Sidebar Brand & Top Bar */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Database size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>SynapseSQL</h1>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 600 }}>Enterprise AI 2.0</span>
          </div>
        </div>

        <button
          onClick={onNewConversation}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
          title="Start a new chat thread"
        >
          <Plus size={13} /> New Chat
        </button>
      </div>

      {/* Active Database Badge & Connection Config Button */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Active Connection
          </span>
          <button
            onClick={onOpenConnectionModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <Settings2 size={12} /> Configure
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '8px',
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Server size={14} style={{ color: '#34d399' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {dbConfig.type === 'sqlite' ? 'SQLite (student.db)' : dbConfig.type === 'mysql' ? `MySQL (${dbConfig.mysql_db || 'default'})` : `MongoDB (${dbConfig.mongo_db_name || 'default'})`}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
              {schema ? `${schema.tables.length} tables inspected` : 'Ready to query'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        padding: '4px 8px',
        background: 'rgba(15, 23, 42, 0.2)'
      }}>
        <button
          onClick={() => setActiveTab('schema')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'schema' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'schema' ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <Layers size={13} /> Schema Explorer
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px',
            fontSize: '0.78rem',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'history' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'history' ? '#38bdf8' : '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <MessageSquare size={13} /> History ({conversations.length})
        </button>
      </div>

      {/* Sidebar Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {activeTab === 'schema' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                Tables & Collections ({schema?.tables.length || 0})
              </span>
              <button
                onClick={onRefreshSchema}
                disabled={isLoadingSchema}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Refresh Schema"
              >
                <RefreshCw size={13} style={{ animation: isLoadingSchema ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>

            {schema && schema.tables.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {schema.tables.map((table) => {
                  const isExpanded = expandedTables[table.name];
                  return (
                    <div
                      key={table.name}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'rgba(30, 41, 59, 0.3)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Table Header */}
                      <div
                        onClick={() => toggleTableExpand(table.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isExpanded ? <ChevronDown size={13} style={{ color: '#38bdf8' }} /> : <ChevronRight size={13} style={{ color: '#64748b' }} />}
                          <TableIcon size={14} style={{ color: '#38bdf8' }} />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{table.name}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: '#94a3b8' }}>
                          {table.rowCount} rows
                        </span>
                      </div>

                      {/* Expanded Columns */}
                      {isExpanded && (
                        <div style={{ padding: '6px 10px 10px 24px', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {table.columns.map((col) => (
                              <div key={col.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  {col.primaryKey ? <Key size={11} style={{ color: '#f59e0b' }} /> : <Columns size={11} style={{ color: '#64748b' }} />}
                                  <span style={{ color: '#cbd5e1' }}>{col.name}</span>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.68rem', fontFamily: 'monospace' }}>{col.type}</span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); onSelectTable(table); }}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.2)',
                              color: '#38bdf8',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Inspect Table & Samples
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.78rem' }}>
                {isLoadingSchema ? 'Inspecting database schema...' : 'No schema loaded.'}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                    border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.04)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <MessageSquare size={13} style={{ color: isActive ? '#38bdf8' : '#64748b', flexShrink: 0 }} />
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#f8fafc' : '#cbd5e1',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conv.title || 'Conversation'}
                    </span>
                  </div>

                  {conversations.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Delete thread"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
