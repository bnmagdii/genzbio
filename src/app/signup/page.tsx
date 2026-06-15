"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ShieldAlert, Rocket, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { signup, loginWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already logged in, navigate to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, displayName, username);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An orbital malfunction occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not connect to Google auth server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md glass-panel-glow p-8 md:p-10 border border-purple-500/30 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow corner elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />

        {/* Title / Cosmic Identity */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Rocket className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight font-orbitron bg-gradient-to-r from-white via-purple-300 to-cyan-400 bg-clip-text text-transparent mt-2">
            INITIALIZE ORBIT
          </h1>
          <p className="text-xs text-gray-400 tracking-wider">
            CLAIM YOUR DIGITIAL SECTOR IN SPACE
          </p>
        </div>

        {/* Error HUD indicator */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start gap-2 animate-bounce">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-semibold text-purple-300 tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Captain Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-semibold text-purple-300 tracking-wider">
              Choose Galactic Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-cyan-400 text-sm font-semibold select-none">
                bio.space/
              </span>
              <input
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                className="w-full pl-22 pr-4 py-2.5 bg-slate-950/80 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white font-semibold tracking-wide transition-all placeholder:text-gray-600"
              />
            </div>
            <p className="text-[10px] text-gray-500 italic mt-0.5">
              Only letters, numbers, dashes & underscores.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-semibold text-purple-300 tracking-wider">
              Comm-Link Email
            </label>
            <input
              type="email"
              required
              placeholder="name@sector.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase font-semibold text-purple-300 tracking-wider">
              Access Code (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white transition-all placeholder:text-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-purple-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:from-cyan-500 hover:to-primary text-sm font-orbitron font-bold tracking-wider text-white shadow-lg shadow-primary/30 transition-all hover:scale-103 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Star className="w-4 h-4 fill-white" />
                CREATE UNIVERSE
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-purple-950" />
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">
            OR COMMENCE MIGRATION
          </span>
          <div className="flex-1 h-px bg-purple-950" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || authLoading}
          className="w-full py-2.5 px-4 bg-slate-950/60 hover:bg-slate-950 border border-purple-800/40 hover:border-cyan-400/80 text-xs font-semibold text-gray-300 rounded-xl hover:text-white transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-inner hover:shadow-cyan-500/10"
        >
          {/* Custom colorful Google svg */}
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.477 0-6.3-2.823-6.3-6.3s2.823-6.3 6.3-6.3c1.63 0 3.107.623 4.22 1.636l3.125-3.125C19.23 2.56 15.937 1.5 12.24 1.5 6.368 1.5 1.5 6.368 1.5 12.24s4.868 10.74 10.74 10.74c6.14 0 10.74-4.32 10.74-10.74 0-.675-.06-1.32-.176-1.955H12.24z"
            />
          </svg>
          ENTER WITH GOOGLE ORBIT
        </button>

        {/* Bottom Link */}
        <div className="text-center text-xs text-gray-400">
          Already verified owner?{" "}
          <Link href="/login" className="text-cyan-400 hover:text-accent font-semibold underline transition-colors">
            Transmit Login
          </Link>
        </div>
      </div>
    </div>
  );
}
