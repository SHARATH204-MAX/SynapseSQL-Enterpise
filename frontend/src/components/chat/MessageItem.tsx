import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, QueryDataResult } from '../../types';
import { QueryCard } from './QueryCard';
import { DataTableView } from './DataTableView';
import { ChartView } from './ChartView';
import { Bot, User, Sparkles, ChevronDown, ChevronUp, Table, BarChart2, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface MessageItemProps {
  message: Message;
  onExecuteSql?: (query: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onExecuteSql }) => {
  const isAssistant = message.role === 'assistant';
  const [activeTab, setActiveTab] = useState<'summary' | 'table' | 'chart'>('summary');
  const [showThoughts, setShowThoughts] = useState(false);

  // Extract tabular data if markdown table exists and message.data is empty
  const parsedData = React.useMemo<QueryDataResult | null>(() => {
    if (message.data && message.data.columns.length > 0) return message.data;
    
    // Attempt parsing markdown table from content
    if (message.content && message.content.includes('|') && message.content.includes('-|-')) {
      try {
        const lines = message.content.split('\n')
          .map(l => l.trim())
          .filter(l => l.startsWith('|') && l.endsWith('|'));
        
        if (lines.length >= 2) {
          const columns = lines[0].split('|').slice(1, -1).map(c => c.trim());
          const rows = lines.slice(2).map(line =>
            line.split('|').slice(1, -1).map(c => {
              const val = c.trim();
              const num = Number(val);
              return !isNaN(num) && val !== '' ? num : val;
            })
          );
          if (columns.length > 0 && rows.length > 0) {
            return { columns, rows };
          }
        }
      } catch (err) {
        console.error('Failed to parse table from markdown', err);
      }
    }
    return null;
  }, [message]);

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    if (!parsedData) return;
    try {
      await api.exportData(format, parsedData.columns, parsedData.rows, `query_export_${message.id.slice(0, 6)}`);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      padding: '18px 22px',
      borderRadius: '16px',
      background: isAssistant ? 'rgba(23, 31, 48, 0.75)' : 'rgba(30, 41, 59, 0.45)',
      border: `1px solid ${isAssistant ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
      marginBottom: '16px',
      boxShadow: isAssistant ? '0 4px 24px rgba(0, 0, 0, 0.3)' : 'none'
    }}>
      {/* Avatar */}
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isAssistant
          ? 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)'
          : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
        color: '#ffffff',
        flexShrink: 0,
        boxShadow: isAssistant ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none'
      }}>
        {isAssistant ? <Bot size={22} /> : <User size={22} />}
      </div>

      {/* Message Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isAssistant ? '#38bdf8' : '#e2e8f0' }}>
              {isAssistant ? 'AI Database Specialist' : 'You'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* View Mode Tabs if data is present */}
          {isAssistant && parsedData && (
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.6)', padding: '3px', borderRadius: '8px' }}>
              <button
                onClick={() => setActiveTab('summary')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: activeTab === 'summary' ? '#0284c7' : 'transparent',
                  color: activeTab === 'summary' ? '#fff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <FileText size={12} /> Explanation
              </button>
              <button
                onClick={() => setActiveTab('table')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: activeTab === 'table' ? '#0284c7' : 'transparent',
                  color: activeTab === 'table' ? '#fff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Table size={12} /> Table ({parsedData.rows.length})
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: activeTab === 'chart' ? '#0284c7' : 'transparent',
                  color: activeTab === 'chart' ? '#fff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <BarChart2 size={12} /> Chart
              </button>
            </div>
          )}
        </div>

        {/* Thought Steps Accordion */}
        {message.thoughts && message.thoughts.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => setShowThoughts(!showThoughts)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={13} style={{ color: '#c084fc' }} />
              {showThoughts ? 'Hide Execution Steps' : `View ${message.thoughts.length} Agent Reasoning Steps`}
              {showThoughts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showThoughts && (
              <div style={{
                marginTop: '8px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.78rem',
                color: '#cbd5e1'
              }}>
                {message.thoughts.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {step.thought && <div style={{ color: '#94a3b8', fontStyle: 'italic', marginBottom: '4px' }}>{step.thought}</div>}
                    {step.tool && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Tool: <code style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '2px 6px', borderRadius: '4px' }}>{step.tool}</code> ({step.input})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View Mode Switching */}
        {activeTab === 'summary' && (
          <div className="prose-container" style={{
            fontSize: '0.92rem',
            lineHeight: '1.7',
            color: '#f1f5f9',
            wordBreak: 'break-word'
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h3: ({ node, ...props }) => (
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#38bdf8',
                    margin: '14px 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderBottom: '1px solid rgba(56, 189, 248, 0.15)',
                    paddingBottom: '4px'
                  }} {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', margin: '10px 0 6px' }} {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong style={{ color: '#38bdf8', fontWeight: 700 }} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p style={{ margin: '0 0 10px 0', lineHeight: 1.65 }} {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', listStyleType: 'disc' }} {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol style={{ margin: '0 0 10px 0', paddingLeft: '20px' }} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li style={{ margin: '4px 0', color: '#e2e8f0' }} {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote style={{
                    margin: '10px 0',
                    padding: '8px 14px',
                    borderLeft: '3px solid #38bdf8',
                    background: 'rgba(56, 189, 248, 0.08)',
                    borderRadius: '0 8px 8px 0',
                    color: '#94a3b8'
                  }} {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }} {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#38bdf8', fontWeight: 700 }} {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#f1f5f9' }} {...props} />
                ),
                code: ({ node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  return isInline ? (
                    <code style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '0.85em',
                      border: '1px solid rgba(56, 189, 248, 0.2)'
                    }} {...props}>
                      {children}
                    </code>
                  ) : (
                    <code style={{ fontFamily: 'monospace' }} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === 'table' && parsedData && (
          <DataTableView data={parsedData} onExport={handleExport} />
        )}

        {activeTab === 'chart' && parsedData && (
          <ChartView data={parsedData} />
        )}

        {/* Direct Copyable Query Card */}
        {isAssistant && message.sql && (
          <QueryCard
            sql={message.sql}
            executionTimeMs={message.executionTimeMs}
            model={message.model}
            onExecute={onExecuteSql}
          />
        )}
      </div>
    </div>
  );
};

