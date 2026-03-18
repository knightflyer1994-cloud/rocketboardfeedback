import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'kirannreddyaero@gmail.com';

type Mode = 'login' | 'signup' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [done, setDone] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/results');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast.error('Sign-up is restricted to the authorised admin email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/login' },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success('Account created! Check your email to confirm, then sign in.');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast.error('Password reset is restricted to the authorised admin email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    if (error) {
      toast.error(error.message);
    } else {
      setDone(true);
      toast.success('Password reset email sent — check your inbox.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 animate-slide-in-up relative z-10">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-2">
            🚀 Admin Access
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Insights Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' && 'Sign in to access feedback results'}
            {mode === 'signup' && 'Create your admin account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        {done ? (
          <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-3">
            <p className="text-2xl">📬</p>
            <p className="text-foreground font-medium">Check your email</p>
            <p className="text-sm text-muted-foreground">
              {mode === 'signup'
                ? 'Confirm your email address, then come back here to sign in.'
                : 'Follow the link in the email to set a new password.'}
            </p>
            <button
              onClick={() => { setMode('login'); setDone(false); }}
              className="text-primary text-sm underline underline-offset-2"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form
            onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset}
            className="space-y-4 p-6 rounded-2xl border border-border bg-card"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-button text-primary-foreground font-heading font-bold text-base shadow-glow-primary hover:shadow-glow-accent transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In →'
                : mode === 'signup' ? 'Create Account →'
                : 'Send Reset Email →'}
            </button>

            {/* Mode switcher */}
            <div className="pt-1 flex flex-col gap-1.5 text-center">
              {mode === 'login' && (
                <>
                  <button type="button" onClick={() => setMode('reset')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot password?
                  </button>
                  <button type="button" onClick={() => setMode('signup')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    First time? Create your admin account
                  </button>
                </>
              )}
              {(mode === 'signup' || mode === 'reset') && (
                <button type="button" onClick={() => setMode('login')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Access restricted to authorised administrators only.
        </p>
      </div>
    </div>
  );
}
