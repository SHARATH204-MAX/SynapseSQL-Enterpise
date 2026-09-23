import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../../types';
import { MessageItem } from './MessageItem';
import { VoiceInput } from './VoiceInput';
import { Send, Sparkles, StopCircle, RefreshCw, Layers, Lock, ShieldCheck, LogIn } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  activeStatus?: string;
  onSendMessage: (query: string) => void;
  onStopGeneration?: () => void;
  onExecuteSql?: (query: string) => void;
  isAuthenticated: boolean;
  onOpenLoginModal: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  activeStatus,
  onSendMessage,
  onStopGeneration,
  onExecuteSql,
  isAuthenticated,
  onOpenLoginModal
}) => {

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const samplePrompts = [
    "List top scoring students with their department names",
    "What is the average marks per class?",
    "Show students who scored more than 80 marks",
    "Count students in each department"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenLoginModal();
      return;
    }
    if (!inputQuery.trim() || isLoading) return;
    onSendMessage(inputQuery.trim());
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      background: 'var(--bg-primary)'
    }}>
      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        maxWidth: '1050px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70%',
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '16px'
            }}>
              <Layers size={32} />
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
              SynapseSQL Enterprise Intelligence
            </h2>
            <p style={{ maxWidth: '480px', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Ask anything across your databases in plain English or with Voice. Get instant SQL queries, rich interactive tables, and dynamic visual charts.
            </p>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '640px' }}>
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isAuthenticated) {
                      onOpenLoginModal();
                      return;
                    }
                    onSendMessage(prompt);
                  }}
                  style={{

                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                  }}
                >
                  <Sparkles size={12} style={{ color: '#38bdf8' }} /> {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onExecuteSql={onExecuteSql}
            />
          ))
        )}

        {/* Live Streaming Status Bar */}
        {isLoading && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>{activeStatus || 'Analyzing database schema and formulating query...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Bar */}
      <div style={{
        padding: '16px 32px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(10, 13, 20, 0.95) 40%, #0a0d14 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ maxWidth: '1050px', margin: '0 auto', position: 'relative' }}>
          {!isAuthenticated && (

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              marginBottom: '10px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              color: '#bae6fd'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="#38bdf8" />
                <span><strong>Login Required:</strong> Please sign in with Supabase to execute queries and record telemetry.</span>
              </div>
              <button
                type="button"
                onClick={onOpenLoginModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '16px',
            padding: '8px 12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Voice Input */}
            <VoiceInput
              onTranscript={(transcript) => {
                if (!isAuthenticated) {
                  onOpenLoginModal();
                  return;
                }
                setInputQuery(transcript);
                onSendMessage(transcript);
              }}
              disabled={isLoading || !isAuthenticated}
            />

            {/* Text Input Area */}
            <textarea
              ref={textareaRef}
              value={inputQuery}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? "Ask a database question (e.g., 'Show all students sorted by marks descending')..." : "🔒 Sign in to ask a database question..."}
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.92rem',
                resize: 'none',
                maxHeight: '140px',
                padding: '6px 4px',
                lineHeight: '1.5'
              }}
            />

            {/* Send / Stop Buttons */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGeneration}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Stop generation"
              >
                <StopCircle size={18} />
              </button>
            ) : !isAuthenticated ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.78rem'
                }}
                title="Sign in to execute queries"
              >
                <Lock size={15} />
                <span>Sign In</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: inputQuery.trim()
                    ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: inputQuery.trim() ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: inputQuery.trim() ? '0 4px 12px rgba(2, 132, 199, 0.4)' : 'none'
                }}
              >
                <Send size={16} />
              </button>
            )}
          </form>


          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 6px', fontSize: '0.72rem', color: '#64748b' }}>
            <span>Shift + Enter for new line • Enter to send</span>
            <span>Security Guardrails: Read-Only Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
