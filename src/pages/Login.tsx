import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Rocket, Lock, Mail, ArrowLeft } from 'lucide-react';

const ADMIN_EMAIL = 'kirannreddyaero@gmail.com';

type Mode = 'login' | 'signup' | 'reset';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Successfully logged in');
      navigate('/results');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast.error('Sign-up is restricted to the authorised admin email.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + '/login' },
      });
      if (error) throw error;
      setDone(true);
      toast.success('Account created! Check your email to confirm.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      toast.error('Password reset is restricted to the authorised admin email.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
      setDone(true);
      toast.success('Password reset email sent — check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-heading">Check your email</CardTitle>
            <CardDescription>
              {mode === 'signup'
                ? 'Follow the link in your inbox to confirm your account.'
                : 'Follow the link in your inbox to reset your password.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => { setMode('login'); setDone(false); }}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[25%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[25%] -right-[25%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-border bg-card/50 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {mode === 'login' ? 'Admin Access' : mode === 'signup' ? 'Create Admin' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Sign in to access feedback results' : 'Enter your details below'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@kirann.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 border-border"
              />
            </div>
            {mode !== 'reset' && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full shadow-glow-primary hover:shadow-glow-primary/50 transition-all font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </div>
              )}
            </Button>
            
            <div className="flex flex-col gap-2 text-center w-full">
              {mode === 'login' && (
                <>
                  <button type="button" onClick={() => setMode('signup')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Admin Signup &rarr;
                  </button>
                  <button type="button" onClick={() => setMode('reset')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Forgot Password?
                  </button>
                </>
              )}
              {(mode === 'signup' || mode === 'reset') && (
                <button type="button" onClick={() => setMode('login')} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  &lt; Back to Sign In
                </button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
