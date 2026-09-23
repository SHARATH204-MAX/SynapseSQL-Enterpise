import React, { useState } from 'react';
import { Copy, Check, Terminal, Play, Clock, Database, Sparkles } from 'lucide-react';

interface QueryCardProps {
  sql: string;
  isMongo?: boolean;
  executionTimeMs?: number;
  model?: string;
  onExecute?: (query: string) => void;
}

export const QueryCard: React.FC<QueryCardProps> = ({
  sql,
  isMongo = false,
  executionTimeMs,
  model,
  onExecute
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div style={{
      marginTop: '12px',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.25)',
      background: 'rgba(15, 23, 42, 0.85)',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'rgba(30, 41, 59, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {isMongo ? 'MongoDB Query' : 'Generated SQL Query'}
          </span>
          {executionTimeMs && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.2)'
            }}>
              <Clock size={11} /> {executionTimeMs}ms
            </span>
          )}
          {model && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}>
              <Sparkles size={11} /> {model.split('/').pop()}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onExecute && (
            <button
              onClick={() => onExecute(sql)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Run Query Directly"
            >
              <Play size={12} /> Run SQL
            </button>
          )}

          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              color: copied ? '#34d399' : '#38bdf8',
              border: copied ? '1px solid #10b981' : '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {copied ? (
              <>
                <Check size={13} /> Copied!
              </>
            ) : (
              <>
                <Copy size={13} /> Copy Query
              </>
            )}
          </button>
        </div>
      </div>

      {/* Query Code Body */}
      <div style={{ padding: '12px 16px', overflowX: 'auto' }}>
        <pre style={{
          margin: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          lineHeight: '1.6',
          color: '#e2e8f0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          <code>{sql}</code>
        </pre>
      </div>
    </div>
  );
};
