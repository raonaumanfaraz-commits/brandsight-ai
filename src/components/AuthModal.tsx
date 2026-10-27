'use client';

import React, { useState } from 'react';
import { useAuth, AuthModalView } from '@/context/AuthContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Key,
} from 'lucide-react';

export default function AuthModal() {
  const {
    showAuthModal,
    authModalView,
    authModalPrompt,
    closeAuthModal,
    setAuthModalView,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setError(null);
    setInfoMessage(null);
    closeAuthModal();
  };

  const switchView = (newView: AuthModalView) => {
    setError(null);
    setInfoMessage(null);
    setAuthModalView(newView);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    // 1. Reset password request
    if (authModalView === 'reset') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);

      if (res.success) {
        setInfoMessage(
          `We have sent a password reset link to ${email}. Please check your inbox and click the link to update your password.`
        );
      } else {
        setError(res.error || 'Failed to send password reset email.');
      }
      return;
    }

    // 2. Update password flow (from recovery link)
    if (authModalView === 'update_password') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify both fields.');
        return;
      }

      setLoading(true);
      const res = await updatePassword(password);
      setLoading(false);

      if (res.success) {
        setInfoMessage('Your password has been successfully updated! You are now logged in.');
        setTimeout(() => handleClose(), 1500);
      } else {
        setError(res.error || 'Failed to update password.');
      }
      return;
    }

    // 3. Login Flow
    if (authModalView === 'login') {
      if (!email || !password) {
        setError('Please provide both your email and password.');
        return;
      }

      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);

      if (!res.success) {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
      return;
    }

    // 4. Sign Up Flow
    if (authModalView === 'signup') {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await signUp(email, password);
      setLoading(false);

      if (res.success) {
        if (res.requiresConfirmation) {
          setInfoMessage(
            `A confirmation link has been sent to ${email}. Please confirm your email to complete your registration.`
          );
        } else {
          setInfoMessage('Account created successfully! Welcome to BrandSight AI.');
          setTimeout(() => handleClose(), 1200);
        }
      } else {
        setError(res.error || 'Sign up failed.');
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(4, 13, 24, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '30px',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          border: '1px solid rgba(201, 164, 92, 0.25)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(201, 164, 92, 0.15)',
              border: '1px solid rgba(201, 164, 92, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)',
            }}
          >
            {authModalView === 'reset' ? (
              <Mail size={22} />
            ) : authModalView === 'update_password' ? (
              <Key size={22} />
            ) : (
              <ShieldCheck size={22} />
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {authModalView === 'login' && 'Sign In to BrandSight AI'}
              {authModalView === 'signup' && 'Create Your BrandSight Account'}
              {authModalView === 'reset' && 'Reset Your Password'}
              {authModalView === 'update_password' && 'Set New Password'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              {authModalView === 'login' && 'Track generative AI search rankings & citations'}
              {authModalView === 'signup' && 'Get started with free brand visibility monitoring'}
              {authModalView === 'reset' && "We'll send you an email with reset instructions"}
              {authModalView === 'update_password' && 'Enter your secure new password below'}
            </p>
          </div>
        </div>

        {/* Context Prompt (e.g. from Add Brand / Run Check) */}
        {authModalPrompt && (
          <div
            style={{
              background: 'rgba(201, 164, 92, 0.12)',
              border: '1px solid rgba(201, 164, 92, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--gold-light)',
            }}
          >
            <Sparkles size={16} style={{ flexShrink: 0, color: 'var(--gold-primary)' }} />
            <span>{authModalPrompt}</span>
          </div>
        )}

        {/* Tabs for Login / Signup */}
        {(authModalView === 'login' || authModalView === 'signup') && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(8, 25, 46, 0.6)',
              borderRadius: '8px',
              padding: '4px',
              marginBottom: '20px',
              border: '1px solid rgba(201, 164, 92, 0.15)',
            }}
          >
            <button
              type="button"
              onClick={() => switchView('login')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: authModalView === 'login' ? 'var(--gold-primary)' : 'transparent',
                color: authModalView === 'login' ? '#08192E' : 'var(--text-muted)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchView('signup')}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: authModalView === 'signup' ? 'var(--gold-primary)' : 'transparent',
                color: authModalView === 'signup' ? '#08192E' : 'var(--text-muted)',
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: '#FCA5A5',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#EF4444' }} />
            <div>
              <strong>Authentication Notice:</strong> {error}
            </div>
          </div>
        )}

        {/* Info Banner */}
        {infoMessage && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: '#86EFAC',
              lineHeight: 1.4,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#22C55E' }} />
            <div>{infoMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Email input (for login, signup, reset) */}
          {authModalView !== 'update_password' && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-main)',
                }}
              >
                Work Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@yourcompany.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    background: 'rgba(8, 25, 46, 0.8)',
                    border: '1px solid var(--border-medium)',
                    color: '#FFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Password input (for login, signup, update_password) */}
          {authModalView !== 'reset' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {authModalView === 'update_password' ? 'New Password' : 'Password'}
                </label>
                {authModalView === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchView('reset')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '11px',
                      color: 'var(--gold-primary)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '8px',
                    background: 'rgba(8, 25, 46, 0.8)',
                    border: '1px solid var(--border-medium)',
                    color: '#FFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (for signup and update_password) */}
          {(authModalView === 'signup' || authModalView === 'update_password') && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-main)',
                }}
              >
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  minLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    background: 'rgba(8, 25, 46, 0.8)',
                    border: '1px solid var(--border-medium)',
                    color: '#FFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              marginTop: '8px',
              padding: '11px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {authModalView === 'login' && 'Sign In'}
                  {authModalView === 'signup' && 'Create Free Account'}
                  {authModalView === 'reset' && 'Send Reset Link'}
                  {authModalView === 'update_password' && 'Update Password & Log In'}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-dim)',
            borderTop: '1px solid rgba(201, 164, 92, 0.1)',
            paddingTop: '16px',
          }}
        >
          {authModalView === 'login' && (
            <div>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => switchView('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign up free
              </button>
            </div>
          )}

          {authModalView === 'signup' && (
            <div>
              Already have an account?{' '}
              <button
                onClick={() => switchView('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign in
              </button>
            </div>
          )}

          {(authModalView === 'reset' || authModalView === 'update_password') && (
            <div>
              Remember your password?{' '}
              <button
                onClick={() => switchView('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Back to Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
