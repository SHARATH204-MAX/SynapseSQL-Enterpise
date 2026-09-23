import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, Shield, Sparkles, UserCheck, AlertCircle, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    loginWithGoogleCredential, 
    demoLogin 
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !password || !fullName) {
      setError('Please fill in all fields (Full Name, Email, Password).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await signUpWithEmail(email, password, fullName);
      if (res.needEmailConfirmation) {
        setSuccessMsg('Account registered! Please check your email to verify your account before logging in.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    if (!credentialResponse.credential) {
      setError('Google Sign-In did not return valid credentials.');
      return;
    }
    try {
      await loginWithGoogleCredential(credentialResponse.credential);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'analyst' | 'viewer') => {
    setLoadingRole(role);
    setError(null);
    try {
      await demoLogin(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '490px',
        background: '#111622',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(30, 41, 59, 0.4)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              {tab === 'signup' ? 'Create SynapseSQL Account' : tab === 'demo' ? 'Quick Demo Access' : 'Sign In to SynapseSQL'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
              Supabase Auth & Database Observability
            </span>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px',
              background: tab === 'signin' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: tab === 'signin' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderBottom: tab === 'signin' ? '2px solid #38bdf8' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px',
              background: tab === 'signup' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
              color: tab === 'signup' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderBottom: tab === 'signup' ? '2px solid #38bdf8' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => { setTab('demo'); setError(null); }}
            style={{
              flex: 1,
              padding: '12px',
              background: tab === 'demo' ? 'rgba(192, 132, 252, 0.12)' : 'transparent',
              color: tab === 'demo' ? '#c084fc' : '#94a3b8',
              border: 'none',
              borderBottom: tab === 'demo' ? '2px solid #c084fc' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Demo Access
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.82rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              fontSize: '0.82rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <div>
              <form onSubmit={handleEmailSignIn}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: submitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{submitting ? 'Signing in...' : 'Sign In with Email'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* OAuth Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '20px 0 16px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Or Continue With
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              </div>

              {/* Google Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-in was cancelled or failed')}
                    theme="filled_black"
                    shape="pill"
                    text="continue_with"
                    width="100%"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <div>
              <form onSubmit={handleEmailSignUp}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Password (Min 6 Characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: submitting ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{submitting ? 'Creating account...' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: DEMO ACCESS */}
          {tab === 'demo' && (
            <div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
                Instant 1-click profiles for quick evaluation, grading, and presentation testing.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Admin */}
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={!!loadingRole}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={20} color="#a855f7" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                        Admin Role
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>
                        Full access to databases, queries & logs
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>
                    {loadingRole === 'admin' ? 'Connecting...' : 'Launch →'}
                  </span>
                </button>

                {/* Analyst */}
                <button
                  onClick={() => handleDemoLogin('analyst')}
                  disabled={!!loadingRole}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={20} color="#38bdf8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                        Analyst Role
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#7dd3fc' }}>
                        Natural Language querying & analytical charts
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                    {loadingRole === 'analyst' ? 'Connecting...' : 'Launch →'}
                  </span>
                </button>

                {/* Viewer */}
                <button
                  onClick={() => handleDemoLogin('viewer')}
                  disabled={!!loadingRole}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserCheck size={20} color="#22c55e" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                        Viewer Role
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#86efac' }}>
                        Read-only access & exports
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                    {loadingRole === 'viewer' ? 'Connecting...' : 'Launch →'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
