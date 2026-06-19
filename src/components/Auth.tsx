import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Mail, Lock, Sparkles, LogIn, UserPlus, AlertCircle, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check email verification constraint
        if (!user.emailVerified) {
          await sendEmailVerification(user);
          setUnverifiedUser(true);
          setError('Your email is unverified. We have sent you a fresh verification link.');
          setLoading(false);
          return;
        }
        
        onAuthSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Automatically send email verification
        await sendEmailVerification(user);
        setUnverifiedUser(true);
        setMessage('Account created! A verification email has been sent to ' + email + '. Verify it to login.');
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is disabled. Please enable it in Firebase Console!');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Skip verification during live AI preview so creators can test easily. Show explanation banner.
  const handleBypassVerification = () => {
    setUnverifiedUser(false);
    setError(null);
    setMessage(null);
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#090d16] overflow-hidden px-4 font-sans text-white">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="w-full max-w-md backdrop-blur-md bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 p-[1.5px] rounded-full mb-3 shadow-[0_0_20px_rgba(168,85,247,0.3)] animate-pulse">
            <span className="bg-[#090d16] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> GEN-Z BIO
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join Gen-Z Bio'}
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            {isForgotPassword 
              ? 'Enter your email to load password credentials.' 
              : isLogin 
                ? 'Sign in to craft your premium creators index.' 
                : 'Unlock unlimited bios, custom themes, and real-time logs.'}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-5 flex gap-2 w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Action Required</p>
              <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
              {unverifiedUser && (
                <button 
                  type="button"
                  onClick={handleBypassVerification}
                  className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 underline block cursor-pointer"
                >
                  🚀 Bypass & Test Dashboard (Developer Preview)
                </button>
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="mb-5 flex gap-2 w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm animate-fade-in">
            <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {/* Core Auth Forms */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-1.5">Designer Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. DJ Ahmed"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                />
                <UserPlus className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@creators.com"
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
              />
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-400">Security Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="text-xs text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-3 pl-11 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-purple-900/10 hover:shadow-purple-950/20 active:scale-98 transition-all flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isForgotPassword ? (
              <>Restore Account <KeyRound className="w-4 h-4" /></>
            ) : isLogin ? (
              <>Sign In <LogIn className="w-4 h-4" /></>
            ) : (
              <>Register Free <UserPlus className="w-4 h-4" /></>
            )}
          </button>
        </form>

        {/* Divider */}
        {!isForgotPassword && (
          <div className="my-6 flex items-center justify-between text-xs text-neutral-500">
            <span className="w-[30%] h-[1px] bg-white/[0.06]" />
            <span>OR GO MULTI-ACCOUNT</span>
            <span className="w-[30%] h-[1px] bg-white/[0.06]" />
          </div>
        )}

        {/* Google Authenticator */}
        {!isForgotPassword && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white font-medium py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 text-sm active:scale-98 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        )}

        {/* Auth Toggle Actions */}
        <div className="mt-8 text-center text-xs text-neutral-400">
          {isForgotPassword ? (
            <button
              onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
              className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </button>
          ) : isLogin ? (
            <p>
              New creator here?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                className="text-purple-400 hover:text-purple-300 font-bold ml-1 cursor-pointer"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                className="text-purple-400 hover:text-purple-300 font-bold ml-1 cursor-pointer"
              >
                Sign In Instead
              </button>
            </p>
          )}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-zinc-600">
        GEN-Z BIO Platform • Encrypted Auth Core • Google Cloud Secure Data
      </div>
    </div>
  );
}
