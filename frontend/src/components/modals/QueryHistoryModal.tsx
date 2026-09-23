import React, { useEffect, useState } from 'react';
import { X, Clock, Database, Terminal, CheckCircle2, AlertCircle, ShieldAlert, Copy, Check, RefreshCw } from 'lucide-react';
import { useAuth, QueryLogItem } from '../../context/AuthContext';

interface QueryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery?: (query: string) => void;
}

export const QueryHistoryModal: React.FC<QueryHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuery
}) => {
  const { getUserHistory, user } = useAuth();
  const [logs, setLogs] = useState<QueryLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getUserHistory();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        background: '#111622',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(30, 41, 59, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                My Supabase Query History
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Telemetry & audit logs for {user?.email || 'Current User'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={fetchHistory}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer'
              }}
              title="Refresh logs from Supabase"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '0.9rem' }}>
              Fetching telemetry logs from Supabase PostgreSQL...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Database size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>No Query Logs Recorded Yet</div>
              <p style={{ fontSize: '0.8rem', maxWidth: '380px', margin: '0 auto' }}>
                Run queries in the dashboard while authenticated to automatically log queries, models, and execution duration into Supabase.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.status === 'success' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#4ade80'
                        }}>
                          <CheckCircle2 size={12} /> Success
                        </span>
                      ) : log.status === 'blocked' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171'
                        }}>
                          <ShieldAlert size={12} /> Blocked
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(234, 179, 8, 0.15)',
                          color: '#facc15'
                        }}>
                          <AlertCircle size={12} /> Error
                        </span>
                      )}

                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                        {log.model_name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        • {log.database_type.toUpperCase()}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Query Question */}
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc', marginBottom: '8px' }}>
                    "{log.query_text}"
                  </div>

                  {/* Generated SQL snippet */}
                  {log.generated_sql && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      color: '#a5f3fc'
                    }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                        {log.generated_sql}
                      </div>
                      <button
                        onClick={() => handleCopySql(log.id, log.generated_sql!)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedId === log.id ? '#4ade80' : '#64748b',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        title="Copy SQL"
                      >
                        {copiedId === log.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  )}

                  {/* Metadata Stats */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                    {log.execution_time_ms !== undefined && (
                      <span>Time: <strong>{log.execution_time_ms} ms</strong></span>
                    )}
                    {log.rows_returned !== undefined && (
                      <span>Rows: <strong>{log.rows_returned}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
