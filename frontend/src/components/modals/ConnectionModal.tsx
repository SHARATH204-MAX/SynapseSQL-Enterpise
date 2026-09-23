import React, { useState } from 'react';
import { DatabaseConfig, DatabaseType } from '../../types';
import { Database, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: DatabaseConfig;
  onSave: (config: DatabaseConfig) => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave
}) => {
  const [config, setConfig] = useState<DatabaseConfig>(currentConfig);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; message?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection(config);
      if (res.status === 'success') {
        setTestResult({ status: 'success', message: `Connected! Found ${res.tablesCount} tables.` });
      } else {
        setTestResult({ status: 'error', message: res.message || 'Connection failed' });
      }
    } catch (err: any) {
      setTestResult({ status: 'error', message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#111622',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(30, 41, 59, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Database Connection Settings</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* DB Type Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
              Database Engine
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(['sqlite', 'mysql', 'mongodb'] as DatabaseType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConfig({ ...config, type })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: config.type === type ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                    border: `1px solid ${config.type === type ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: config.type === type ? '#38bdf8' : '#cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Type-Specific Fields */}
          {config.type === 'sqlite' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                SQLite Database Path
              </label>
              <input
                type="text"
                placeholder="Leave blank for default student.db"
                value={config.sqlite_path || ''}
                onChange={(e) => setConfig({ ...config, sqlite_path: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Default connects to local <code>student.db</code> (STUDENT & DEPARTMENTS tables).
              </span>
            </div>
          )}

          {config.type === 'mysql' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Host</label>
                <input
                  type="text"
                  placeholder="localhost"
                  value={config.mysql_host || ''}
                  onChange={(e) => setConfig({ ...config, mysql_host: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Username</label>
                  <input
                    type="text"
                    placeholder="root"
                    value={config.mysql_user || ''}
                    onChange={(e) => setConfig({ ...config, mysql_user: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Password</label>
                  <input
                    type="password"
                    value={config.mysql_password || ''}
                    onChange={(e) => setConfig({ ...config, mysql_password: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Database Name</label>
                <input
                  type="text"
                  placeholder="my_database"
                  value={config.mysql_db || ''}
                  onChange={(e) => setConfig({ ...config, mysql_db: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {config.type === 'mongodb' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>MongoDB URI</label>
                <input
                  type="password"
                  placeholder="mongodb+srv://..."
                  value={config.mongo_uri || ''}
                  onChange={(e) => setConfig({ ...config, mongo_uri: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Database Name</label>
                <input
                  type="text"
                  placeholder="students"
                  value={config.mongo_db_name || ''}
                  onChange={(e) => setConfig({ ...config, mongo_db_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* Test connection result */}
          {testResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: testResult.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testResult.status === 'success' ? '#10b981' : '#ef4444'}`,
              color: testResult.status === 'success' ? '#34d399' : '#f87171',
              fontSize: '0.78rem'
            }}>
              {testResult.status === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} style={{ animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
