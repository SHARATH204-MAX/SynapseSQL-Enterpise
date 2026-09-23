import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, KeyRound, LogIn, LogOut, User, ChevronDown, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  readOnly: boolean;
  onToggleReadOnly: () => void;
  onOpenApiKeyModal: () => void;
  onOpenLoginModal: () => void;
  onOpenHistoryModal?: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  models,
  selectedModel,
  onSelectModel,
  readOnly,
  onToggleReadOnly,
  onOpenApiKeyModal,
  onOpenLoginModal,
  onOpenHistoryModal,
  hasApiKey
}) => {

  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return { bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.4)', text: '#c084fc' };
      case 'analyst':
        return { bg: 'rgba(56, 189, 248, 0.18)', border: 'rgba(56, 189, 248, 0.4)', text: '#38bdf8' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.18)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399' };
    }
  };

  const roleStyle = getRoleBadgeColor(user?.role);

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Left side title / status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>System Online</span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Model Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '4px 10px'
        }}>
          <Cpu size={14} style={{ color: '#38bdf8' }} />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f1f5f9',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {models.map((m) => (
              <option key={m} value={m} style={{ background: '#111622', color: '#f8fafc' }}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Read-only Guardrail Toggle Button */}
        <button
          onClick={onToggleReadOnly}
          disabled={user?.role === 'viewer'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: readOnly ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${readOnly ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: readOnly ? '#34d399' : '#f87171',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: user?.role === 'viewer' ? 'not-allowed' : 'pointer'
          }}
          title={readOnly ? 'Read-Only Guardrails Active' : 'Read/Write Mode Active'}
        >
          {readOnly ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          <span>{readOnly ? 'Read-Only Mode' : 'Read/Write'}</span>
        </button>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: hasApiKey ? 'rgba(56, 189, 248, 0.12)' : 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${hasApiKey ? 'rgba(56, 189, 248, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
            color: hasApiKey ? '#38bdf8' : '#fbbf24',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <KeyRound size={13} />
          <span>{hasApiKey ? 'API Key Set' : 'Set API Key'}</span>
        </button>

        {/* User Auth Profile / Login Button */}
        {isAuthenticated && user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
                alt="Avatar"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: '1px solid #38bdf8'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name.split(' ')[0]}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: roleStyle.bg,
                border: `1px solid ${roleStyle.border}`,
                color: roleStyle.text
              }}>
                {user.role}
              </span>
              <ChevronDown size={13} style={{ color: '#94a3b8' }} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '220px',
                background: '#111622',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                zIndex: 60
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenHistoryModal?.(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Clock size={14} /> My Query History (Supabase)
                </button>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenLoginModal(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <User size={14} /> Switch User / Role
                </button>


                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f87171',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
            }}
          >
            <LogIn size={14} /> Sign In
          </button>
        )}
      </div>
    </header>
  );
};
