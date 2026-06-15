"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Rocket,
  Sparkles,
  Palette,
  Shield,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  Zap,
  Star,
  Users,
  Grid,
  Bot
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-bg-space relative overflow-hidden">
      {/* Top Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shadow-lg shadow-primary/25">
            <Rocket className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <span className="font-orbitron font-extrabold text-xl tracking-wider bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent">
            GEN-Z BIO
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Authorize Login
          </Link>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent hover:from-cyan-500 hover:to-primary text-xs font-orbitron font-bold tracking-wider rounded-xl transition-all hover:scale-103 shadow-lg shadow-primary/30"
          >
            {user ? "MISSION CONTROL" : "INITIALIZE PORTAL"}
          </Link>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-950/30 text-purple-300 text-[10px] font-semibold uppercase tracking-widest animate-bounce">
          <Sparkles className="w-3 h-3 text-accent" />
          The Link-in-Bio Universe is Expanding
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold font-orbitron tracking-tight text-white leading-tight">
          Create Your <br />
          <span className="bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent neon-glow-text">
            Digital Universe.
          </span>
        </h1>

        <p className="text-sm md:text-lg text-gray-400 max-w-2xl mt-2 leading-relaxed">
          Build your personalized space on the internet. Showcase links, embed media, custom design, launch AI tools, host interactive guestbooks, and project your Gen-Z identity across the galaxy.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="px-8 py-4 bg-gradient-to-r from-primary via-secondary to-accent hover:from-cyan-500 hover:to-primary font-orbitron font-extrabold text-sm tracking-widest text-white rounded-2xl shadow-xl shadow-primary/30 hover:shadow-cyan-400/20 hover:scale-105 active:scale-98 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            LAUNCH YOUR SECTOR
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="#explore"
            className="px-6 py-4 bg-slate-950/60 hover:bg-slate-950 border border-purple-900/40 hover:border-cyan-400/50 text-xs font-semibold tracking-wider text-gray-300 hover:text-white rounded-2xl transition-all"
          >
            SCAN TRANSMISSIONS
          </Link>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section id="explore" className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col gap-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-4xl font-bold font-orbitron tracking-wide text-white uppercase">
            HUDS & WIDGET MODULARS
          </h2>
          <p className="text-xs text-gray-400 tracking-wider">
            PREMIUM INSTRUMENT CARDS DESIGNED FOR HIGH IMPACT
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 border-purple-500/20 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary">
              <Grid className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold font-orbitron text-white">Dynamic Content Blocks</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Incorporate video embed hubs, countdown clocks, FAQ panels, custom donation channels, and raw HTML editors. Organize easily in a drag re-order stack.
            </p>
          </div>

          <div className="glass-panel p-6 border-purple-500/20 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/40 flex items-center justify-center text-accent">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-orbitron text-white">Interactive Guestbooks</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enable anonymous spaces for text submissions directly on your profile, or activate a signature guestbook to let fans drop message coordinates.
            </p>
          </div>

          <div className="glass-panel p-6 border-purple-500/20 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold font-orbitron text-white">Multi-Account Matrix</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deploy multiple dynamic portal pages using a single auth signature. Create pathways for your gaming profiles, storefronts, and brand networks.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Theme Showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col gap-12 text-center w-full">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-4xl font-bold font-orbitron tracking-wide text-white uppercase">
            55+ Stellar Themes
          </h2>
          <p className="text-xs text-gray-400 tracking-wider">
            SWAP AMONG PRE-LOADED CYBER GRADIENTS AND GLASSMORPHIC MODES
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Purple Galaxy", bg: "from-purple-950 via-slate-950 to-indigo-950", border: "border-purple-500/50" },
            { name: "Cyan Space", bg: "from-cyan-950 via-slate-950 to-slate-900", border: "border-cyan-400/50" },
            { name: "Aurora Green", bg: "from-emerald-950 via-slate-950 to-slate-900", border: "border-emerald-500/40" },
            { name: "Laser Fuchsia", bg: "from-fuchsia-950 via-slate-950 to-slate-950", border: "border-accent/40" },
            { name: "White Dwarf", bg: "from-zinc-900 via-zinc-950 to-zinc-900", border: "border-white/20" }
          ].map((theme, i) => (
            <div
              key={i}
              className={`glass-panel p-4 bg-gradient-to-tr ${theme.bg} ${theme.border} hover:scale-105 active:scale-98 transition-all flex flex-col items-center justify-between gap-6 cursor-pointer`}
            >
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-slate-950 text-[10px] text-white">
                🌌
              </div>
              <span className="text-xs font-bold text-gray-200">{theme.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI Tools Showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between gap-12 text-left">
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-400/20 bg-cyan-950/30 text-cyan-400 text-[10px] font-semibold uppercase tracking-widest w-fit">
            <Bot className="w-3 h-3 text-cyan-400 animate-pulse" />
            AI Co-Pilot Enabled
          </div>
          <h2 className="text-2xl md:text-5xl font-extrabold font-orbitron text-white leading-tight">
            INTELLIGENT CREATIVE MODULAR.
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Stuck creating your space avatar or formulating gradients? GEN-Z BIO incorporates client-side AI modules. Instantly generate bios, check coordinates for clean usernames, map glowing palettes, and draft custom space vector avatars. Apply results directly to your bio with one click.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              "AI Profile Avatar Creator",
              "AI Bio Generator",
              "AI Username Checker",
              "AI Color Palette Mapper"
            ].map((tool, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <Zap className="w-4 h-4 fill-cyan-400/20" />
                {tool}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-md glass-panel-glow border border-purple-500/20 p-6 flex flex-col gap-4 bg-slate-950/80">
          <div className="flex items-center justify-between border-b border-purple-900/30 pb-3">
            <span className="text-xs uppercase font-orbitron text-cyan-400 font-bold">AI Generation Sandbox</span>
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-left text-xs bg-slate-900 p-3 rounded-lg border border-purple-900/30">
              <span className="text-[10px] text-gray-500 block uppercase font-semibold">User prompt</span>
              "Generate a space cadet gamer description"
            </div>
            <div className="text-left text-xs bg-purple-950/30 p-3 rounded-lg border border-purple-500/30 relative">
              <span className="text-[10px] text-primary block uppercase font-semibold">AI Generated Bio</span>
              "Rocket cadet cruising the matrix. 🚀 APEX Champion | FPS Voyager. Building nodes under cyan lights. Transmit a signal!"
              <div className="absolute top-2 right-2 text-cyan-400 text-[10px] uppercase font-bold tracking-wider">APPLIED</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col gap-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-4xl font-bold font-orbitron tracking-wide text-white uppercase">
            CREATOR AUDITS
          </h2>
          <p className="text-xs text-gray-400 tracking-wider">
            TRANSMISSIONS RECEIVED FROM OUR ORBITING USERBASE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              name: "@AstroGamer",
              quote: "The cosmic visuals are insane! My fans love the anonymous message block. The glass design feels like it belongs in 2030.",
              role: "Twitch Streamer"
            },
            {
              name: "Zara Drake",
              quote: "Creating multiple bio links for my shop and portfolio under one account is a gamechanger. The AI palette maker hooked me up instantly.",
              role: "NFT Digital Artist"
            },
            {
              name: "@CyberBuilder",
              quote: "Fast loading speeds, PWA support, and full HTML integration. GEN-Z BIO is the most customizable link in bio ever made.",
              role: "Fullstack Creator"
            }
          ].map((test, i) => (
            <div key={i} className="glass-panel p-6 border-purple-500/20 flex flex-col justify-between gap-6 bg-slate-900/20">
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-xs font-bold text-white">
                  {test.name[1]?.toUpperCase() || "C"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{test.name}</span>
                  <span className="text-[10px] text-cyan-400">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 flex flex-col gap-12 text-center w-full">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl md:text-4xl font-bold font-orbitron tracking-wide text-white uppercase">
            SYSTEM FAQ
          </h2>
          <p className="text-xs text-gray-400 tracking-wider">
            FREQUENT QUESTIONS RELATING TO GEN-Z BIO SHUTTLE FLIGHT
          </p>
        </div>

        <div className="flex flex-col gap-4 text-left">
          {[
            {
              q: "Is GEN-Z BIO free to use?",
              a: "Yes! Creating bios, customizing themes, adding blocks, and utilizing our AI tool suite is completely free for all cosmic creators."
            },
            {
              q: "How many link pages can I create?",
              a: "You can create unlimited bio profiles under a single registered email. Manage them all from your Space Mission Control dashboard."
            },
            {
              q: "Can I use custom domain configurations?",
              a: "By default, your links exist under bio.space/username. Custom domain bindings can be requested via verification portals."
            },
            {
              q: "Who verifies user profiles?",
              a: "Verification is managed by Super Admins only. When verified, a custom verification badge will appear next to your spatial username."
            }
          ].map((faq, i) => (
            <details
              key={i}
              className="glass-panel p-5 bg-slate-950/50 border border-purple-900/35 hover:border-cyan-400/30 group cursor-pointer transition-all"
            >
              <summary className="font-orbitron font-semibold text-sm text-gray-200 hover:text-white flex items-center justify-between select-none">
                <span>{faq.q}</span>
                <HelpCircle className="w-4 h-4 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              </summary>
              <p className="mt-3 text-xs text-gray-400 leading-relaxed border-t border-purple-900/20 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="relative z-10 border-t border-purple-900/40 bg-slate-950/90 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <span className="font-orbitron font-bold text-white tracking-widest">GEN-Z BIO</span>
            </div>
            <p className="text-[10px] text-gray-500 max-w-sm">
              Deploying premium cosmic profiles since 2026. Custom built for gamers, influencers, and galactic creators.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Access Console</Link>
            <Link href="/signup" className="hover:text-cyan-400 transition-colors">Register Orbit</Link>
            <span className="text-purple-900">|</span>
            <span className="text-[10px] text-gray-600 font-mono">GENZ-BIO v1.0.0 SPACE CORE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
