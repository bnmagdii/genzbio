"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { KeyRound, ShieldAlert, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to dispatch recovery signal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md glass-panel-glow p-8 md:p-10 border border-purple-500/30 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow corner elements */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <KeyRound className="w-6 h-6 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-orbitron bg-gradient-to-r from-white via-purple-300 to-cyan-400 bg-clip-text text-transparent mt-2">
            RECOVER ORBIT
          </h1>
          <p className="text-xs text-gray-400 tracking-wider">
            TRANSMIT PASSWORD RESET SIGNAL
          </p>
        </div>

        {/* Message Boxes */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start gap-2 animate-bounce">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-950/40 border border-green-500/50 rounded-xl text-green-300 text-xs flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Galactic comm-link transmitted! Check your inbox for resetting instructions.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:from-cyan-500 hover:to-primary text-sm font-orbitron font-bold tracking-wider text-white shadow-lg shadow-primary/30 transition-all hover:scale-103 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "TRANSMIT RECOVERY SIGNAL"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-cyan-400 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Space Station Access
          </Link>
        </div>
      </div>
    </div>
  );
}
