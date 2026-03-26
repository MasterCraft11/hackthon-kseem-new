import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, BookOpen } from 'lucide-react';

export const LoginPage: React.FC<{ onMockLogin?: (email: string) => void }> = ({ onMockLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleDemoLogin = () => {
    if (onMockLogin) {
      onMockLogin(email || 'demo@example.com');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Mock login for demo purposes as requested
      if (onMockLogin) {
        onMockLogin(email || 'demo@example.com');
        return;
      }

      const supabase = getSupabase();
      if (isRegistering) {
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setIsSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Your email is not confirmed yet. Please check your inbox or click below to resend the link.');
          } else {
            throw error;
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      alert('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="max-w-md w-full glass-card p-12 rounded-[2.5rem] border border-white/5 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto shadow-xl shadow-indigo-500/10">
            <Mail size={48} />
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-on-surface font-headline tracking-tight">Check your email</h2>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
              We've sent a confirmation link to <br/>
              <span className="font-black text-on-surface">{email}</span>. 
            </p>
          </div>
          <button
            onClick={() => {
              setIsSuccess(false);
              setIsRegistering(false);
            }}
            className="w-full py-5 bg-surface-container-low hover:bg-surface-container text-on-surface font-black rounded-2xl transition-all border border-white/5 shadow-lg active:scale-95"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setError(null);
    if (onMockLogin) {
      onMockLogin('google-demo@example.com');
      return;
    }
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      if (err.message?.includes('provider is not enabled')) {
        setError('Google login is not enabled in your Supabase project. Please enable it in Authentication > Providers > Google in your Supabase dashboard.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-12">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 primary-gradient rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <BookOpen className="text-white" size={32} />
            </div>
            <span className="text-3xl font-black font-headline tracking-tighter text-on-surface">FlashFlow</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-black font-headline text-on-surface tracking-tight leading-none">
              {isRegistering ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-on-surface-variant font-medium text-lg">
              {isRegistering ? 'Join thousands of learners mastering new skills.' : 'Enter to get unlimited access to your learning materials.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-on-surface-variant uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container-low border border-white/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30 font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-on-surface-variant uppercase tracking-widest block">
                  Password
                </label>
                {!isRegistering && (
                  <button type="button" className="text-xs font-black text-primary hover:text-primary/80 uppercase tracking-widest">
                    Forgot ?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container-low border border-white/5 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm rounded-2xl space-y-2 font-bold animate-in slide-in-from-top-2">
                <p>{error}</p>
                {error.includes('not confirmed') && (
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="text-primary font-black hover:underline block uppercase tracking-widest text-xs"
                  >
                    {resendLoading ? 'Resending...' : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 primary-gradient text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-6 bg-surface text-on-surface-variant font-black uppercase tracking-[0.2em]">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-surface-container-low border border-white/5 rounded-2xl flex items-center justify-center gap-4 hover:bg-surface-container transition-all font-black text-on-surface shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Google Account
          </button>

          <p className="text-center text-on-surface-variant font-bold">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary font-black hover:underline"
            >
              {isRegistering ? 'Sign in here' : 'Create one here'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side: Illustration (Geometric Pattern) */}
      <div className="hidden lg:block lg:w-1/2 bg-surface relative overflow-hidden border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-surface to-surface"></div>
        
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 grid-rows-6 h-full w-full">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="border border-white/5 flex items-center justify-center">
                {i % 7 === 0 && <div className="w-16 h-16 rounded-3xl border-2 border-white/10 rotate-12"></div>}
                {i % 4 === 0 && <div className="w-20 h-20 bg-white/5 rounded-full"></div>}
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [12, 15, 12] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-40 h-40 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10 shadow-2xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]"
        />
        
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="max-w-lg text-center space-y-8">
            <h2 className="text-6xl font-black font-headline text-white leading-[1.1] tracking-tighter">
              Master any subject with AI.
            </h2>
            <p className="text-indigo-200/70 text-xl font-medium leading-relaxed">
              Upload documents, paste text, or use images to generate smart study materials in seconds.
            </p>
            <div className="flex justify-center gap-4">
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-white font-bold text-sm">
                Smart Spaced Repetition
              </div>
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm text-white font-bold text-sm">
                AI Powered Generation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
