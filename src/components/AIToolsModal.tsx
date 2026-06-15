"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Bot,
  RefreshCw,
  Copy,
  Check,
  UserCheck,
  Palette,
  Image,
  Text,
  User,
  Zap,
  Download
} from "lucide-react";

interface AIToolsModalProps {
  onClose: () => void;
  onApplyBio: (bio: string) => void;
  onApplyPhoto: (photoBase64: string) => void;
  onApplyPalette: (colors: {
    backgroundValue: string;
    textColor: string;
    accentColor: string;
    cardBg: string;
  }) => void;
  currentUsername: string;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  onClose,
  onApplyBio,
  onApplyPhoto,
  onApplyPalette,
  currentUsername
}) => {
  const [activeTab, setActiveTab] = useState<"bio" | "username" | "avatar" | "palette">("bio");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // === BIO GENERATOR STATE ===
  const [bioNiche, setBioNiche] = useState("gamer");
  const [bioVibe, setBioVibe] = useState("cosmic");
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [copiedBioIdx, setCopiedBioIdx] = useState<number | null>(null);

  // === USERNAME GENERATOR STATE ===
  const [usernameKeyword, setUsernameKeyword] = useState("");
  const [generatedUsernames, setGeneratedUsernames] = useState<string[]>([]);
  const [copiedUserIdx, setCopiedUserIdx] = useState<number | null>(null);

  // === AVATAR GENERATOR STATE ===
  const [avatarStyle, setAvatarStyle] = useState<"planet" | "nebula" | "grid" | "supernova">("planet");
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // === PALETTE GENERATOR STATE ===
  const [paletteStyle, setPaletteStyle] = useState<"neon" | "pastel" | "deep-void" | "synth">("neon");
  const [generatedPalette, setGeneratedPalette] = useState<{
    bg: string;
    text: string;
    accent: string;
    cardBg: string;
  } | null>(null);

  // Trigger bio generator simulation
  const generateBio = () => {
    const spaceEmojis = ["🌌", "🚀", "🪐", "👽", "✨", "☄️", "🛸", "👾", "⚡", "🔮"];
    const quotes = {
      gamer: [
        "cruising through spatial lobbies. APEX Hunter | Warzone Voyager.",
        "orbiting the leaderboards. Retro retro grids & speedruns.",
        "leveling up inside the dark sector. Building codes and slaying bosses."
      ],
      creator: [
        "sketching digital stars. Capturing nebula beams on canvas.",
        "broadcasting interstellar waves. Creating cosmic soundscapes.",
        "crafting galaxies one frame at a time. Visual voyager."
      ],
      developer: [
        "assembling quantum portals using typescript. Star programmer.",
        "compiling galactic protocols. Space core engineer.",
        "rendering planetary systems. Converting caffeinated star dust into code."
      ],
      influencer: [
        "collecting coordinates & glowing memories. Sharing space dust.",
        "curating intergalactic trends. Fashion explorer under purple auroras.",
        "casting stellar signals. Building a community of astro voyagers."
      ]
    };

    const vibes = {
      cosmic: ["Voyaging through dark matter. 🌌", "Stardust runs in my code. 🪐", "Just a cadet in search of a new orbit. 🚀"],
      hype: ["NO TIME FOR TIME WARPS. ⚡", "Locked into hyperdrive mode! 🛸", "Commanding the grid. Join the alliance! ☄️"],
      chill: ["Floating along the cosmic tide. ✨", "Quiet orbit. Listening to lo-fi nebulas. 🔮", "Drifting somewhere near Andromeda. 👽"]
    };

    const targetQuotes = quotes[bioNiche as keyof typeof quotes] || quotes.gamer;
    const targetVibes = vibes[bioVibe as keyof typeof vibes] || vibes.cosmic;

    const list = targetQuotes.map((q, idx) => {
      const emoji1 = spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)];
      const emoji2 = spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)];
      const prefix = targetVibes[idx] || "Exploring space. ✨";
      return `${prefix} ${emoji1} ${q.charAt(0).toUpperCase() + q.slice(1)} Transmit comm-signals! ${emoji2}`;
    });

    setGeneratedBios(list);
  };

  // Trigger username suggestions
  const generateUsernames = () => {
    const prefixes = ["astro", "nova", "nebula", "void", "cosmic", "solar", "cyber", "stellar", "lunar", "orbit", "quantum", "hyper"];
    const suffixes = ["dev", "gaming", "builds", "live", "space", "core", "cadet", "voyager", "zone", "portal", "link", "net"];
    
    const word = usernameKeyword.trim().toLowerCase() || currentUsername || "voyager";
    const cleanWord = word.replace(/\s+/g, "");

    const results: string[] = [];
    for (let i = 0; i < 8; i++) {
      const type = i % 3;
      let suggestion = "";
      if (type === 0) {
        suggestion = `${prefixes[Math.floor(Math.random() * prefixes.length)]}_${cleanWord}`;
      } else if (type === 1) {
        suggestion = `${cleanWord}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
      } else {
        suggestion = `${prefixes[Math.floor(Math.random() * prefixes.length)]}.${cleanWord}.${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
      }
      results.push(suggestion.substring(0, 20));
    }
    setGeneratedUsernames(results);
  };

  // Procedural canvas avatar generator
  const drawAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setGeneratingAvatar(true);
    const size = canvas.width = canvas.height = 300;

    // Draw void background
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, size, size);

    // Dynamic color sets
    const colors = {
      planet: { base: "#7C3AED", rings: "#22D3EE", accent: "#D946EF" },
      nebula: { base: "#D946EF", rings: "#A855F7", accent: "#7C3AED" },
      grid: { base: "#06B6D4", rings: "#22D3EE", accent: "#0F172A" },
      supernova: { base: "#EF4444", rings: "#F59E0B", accent: "#7C3AED" }
    };
    
    const set = colors[avatarStyle];

    if (avatarStyle === "planet") {
      // Draw Stars
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
        ctx.fillRect(Math.random() * size, Math.random() * size, Math.random() * 2, Math.random() * 2);
      }

      // Planet Orbit Rings (back half)
      ctx.strokeStyle = set.rings;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = set.rings;
      ctx.beginPath();
      ctx.ellipse(size / 2, size / 2, 85, 30, Math.PI / 6, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Planet Sphere
      const grad = ctx.createRadialGradient(size / 2 - 20, size / 2 - 20, 10, size / 2, size / 2, 60);
      grad.addColorStop(0, "#c084fc");
      grad.addColorStop(0.5, set.base);
      grad.addColorStop(1, "#050010");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 50, 0, Math.PI * 2);
      ctx.fill();

      // Planet Orbit Rings (front half)
      ctx.strokeStyle = set.rings;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 10;
      ctx.shadowColor = set.rings;
      ctx.beginPath();
      ctx.ellipse(size / 2, size / 2, 85, 30, Math.PI / 6, 0, Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0;

    } else if (avatarStyle === "nebula") {
      // Nebula cloud dust
      for (let i = 0; i < 15; i++) {
        const x = size / 2 + (Math.random() - 0.5) * 80;
        const y = size / 2 + (Math.random() - 0.5) * 80;
        const rad = Math.random() * 60 + 40;
        const cloudGrad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        cloudGrad.addColorStop(0, set.base + "44"); // 25% opacity
        cloudGrad.addColorStop(0.5, set.rings + "22");
        cloudGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      // Glowing Core Star
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 20;
      ctx.shadowColor = set.rings;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

    } else if (avatarStyle === "grid") {
      // Grid Perspective Lines
      ctx.strokeStyle = set.base;
      ctx.lineWidth = 1.5;
      
      // Draw horizon
      ctx.beginPath();
      ctx.moveTo(0, size / 2);
      ctx.lineTo(size, size / 2);
      ctx.stroke();

      // Perspective grid lines
      for (let i = -10; i <= 20; i++) {
        ctx.beginPath();
        ctx.moveTo(size / 2 + i * 20, size / 2);
        ctx.lineTo(size / 2 + i * 80, size);
        ctx.stroke();
      }
      // Horizontal grid lines
      for (let i = 0; i < 6; i++) {
        const y = size / 2 + Math.pow(i / 5, 1.8) * (size / 2);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }

      // Neon horizon sun
      const sunGrad = ctx.createLinearGradient(0, size / 2 - 50, 0, size / 2);
      sunGrad.addColorStop(0, "#D946EF");
      sunGrad.addColorStop(1, "#7C3AED");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 40, Math.PI, 0); // half circle
      ctx.fill();

    } else {
      // Supernova Burst lines
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 110 + 20;
        const ex = size / 2 + Math.cos(angle) * length;
        const ey = size / 2 + Math.sin(angle) * length;

        ctx.strokeStyle = i % 2 === 0 ? set.base : set.rings;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      // Core white flash
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    const dataUrl = canvas.toDataURL("image/png");
    setAvatarUrl(dataUrl);
    setGeneratingAvatar(false);
  };

  // Generate color palette combinations
  const generatePaletteData = () => {
    // Generate lovely cosmic palettes
    const palettes = {
      neon: { bg: "linear-gradient(135deg, #050816, #0d001a, #001f1f)", text: "#ffffff", accent: "#22D3EE", cardBg: "rgba(15, 23, 42, 0.75)" },
      pastel: { bg: "linear-gradient(135deg, #0f172a, #1e1b4b, #2b124d)", text: "#fed7aa", accent: "#f472b6", cardBg: "rgba(30, 41, 59, 0.65)" },
      "deep-void": { bg: "linear-gradient(180deg, #000000, #04020a, #080314)", text: "#9ca3af", accent: "#8b5cf6", cardBg: "rgba(15, 15, 20, 0.9)" },
      synth: { bg: "linear-gradient(135deg, #120024, #050014, #2b001a)", text: "#ffe5ff", accent: "#D946EF", cardBg: "rgba(17, 0, 28, 0.8)" }
    };

    setGeneratedPalette(palettes[paletteStyle]);
  };

  // Run automatically when active tabs change
  useEffect(() => {
    if (activeTab === "bio") {
      generateBio();
    } else if (activeTab === "username") {
      generateUsernames();
    } else if (activeTab === "avatar") {
      drawAvatar();
    } else if (activeTab === "palette") {
      generatePaletteData();
    }
  }, [activeTab, bioNiche, bioVibe, avatarStyle, paletteStyle]);

  const handleCopyBio = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBioIdx(idx);
    setTimeout(() => setCopiedBioIdx(null), 1500);
  };

  const handleCopyUsername = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedUserIdx(idx);
    setTimeout(() => setCopiedUserIdx(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl glass-panel-glow border border-purple-500/40 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header HUD panel */}
        <div className="p-4 bg-slate-950/90 border-b border-purple-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <h3 className="font-orbitron font-extrabold text-sm tracking-widest bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
              AI CREATIVE CO-PILOT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase text-gray-500 hover:text-white font-bold cursor-pointer"
          >
            Close HUD
          </button>
        </div>

        {/* HUD Tab List selectors */}
        <div className="flex border-b border-purple-950 bg-slate-900/30 overflow-x-auto">
          {[
            { id: "bio", label: "Bio Generator", icon: Text },
            { id: "username", label: "Astro Tag Generator", icon: User },
            { id: "avatar", label: "Sphere Graphic Maker", icon: Image },
            { id: "palette", label: "Luminous Palette Mapper", icon: Palette }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3 text-xs font-semibold font-orbitron tracking-wider flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "border-cyan-400 text-cyan-400 bg-slate-950/40"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel contents */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-left">
          
          {/* TAB 1: BIO GENERATOR */}
          {activeTab === "bio" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-purple-300">Creator Vocation</label>
                  <select
                    value={bioNiche}
                    onChange={(e) => setBioNiche(e.target.value)}
                    className="p-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="gamer">Gaming / Esports</option>
                    <option value="creator">Creative / Designer</option>
                    <option value="developer">Developer / Coder</option>
                    <option value="influencer">Influencer / Travel</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-purple-300">Galactic Aura Vibe</label>
                  <select
                    value={bioVibe}
                    onChange={(e) => setBioVibe(e.target.value)}
                    className="p-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="cosmic">Cosmic Mystery</option>
                    <option value="hype">Neon Hype Speed</option>
                    <option value="chill">Zero Gravity Chill</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">AI PROJECTIONS</span>
                <button
                  onClick={generateBio}
                  className="text-xs font-semibold text-cyan-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Re-Draft
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {generatedBios.map((bio, idx) => (
                  <div
                    key={idx}
                    className="glass-panel p-4 bg-slate-950/60 border border-purple-900/40 flex items-center justify-between gap-4 group"
                  >
                    <p className="text-xs text-gray-200 leading-relaxed max-w-[80%]">{bio}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyBio(bio, idx)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedBioIdx === idx ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          onApplyBio(bio);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_10px_rgba(124,58,237,0.5)] text-[10px] font-bold text-white transition-all cursor-pointer"
                      >
                        Apply Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: USERNAME GENERATOR */}
          {activeTab === "username" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-purple-300">Identity Concept Keyword</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. apex, voyager, glitch"
                    value={usernameKeyword}
                    onChange={(e) => setUsernameKeyword(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs focus:outline-none"
                  />
                  <button
                    onClick={generateUsernames}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-accent text-xs font-bold font-orbitron tracking-wider cursor-pointer"
                  >
                    SCAN ORBITS
                  </button>
                </div>
              </div>

              <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mt-2">SUGGESTED SPATIAL TAGS</div>
              <div className="grid grid-cols-2 gap-3">
                {generatedUsernames.map((u, idx) => (
                  <div
                    key={idx}
                    className="glass-panel px-4 py-3 bg-slate-950/40 border border-purple-900/30 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs font-mono text-cyan-400 font-semibold">{u}</span>
                    <button
                      onClick={() => handleCopyUsername(u, idx)}
                      className="p-1.5 rounded-lg bg-slate-900 text-gray-400 hover:text-white cursor-pointer"
                    >
                      {copiedUserIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPHERE GRAPHIC GENERATOR */}
          {activeTab === "avatar" && (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-purple-300">Select Render Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "planet", label: "Orbiting Planet Core" },
                      { id: "nebula", label: "Glowing Nebula Cloud" },
                      { id: "grid", label: "Synthwave Grid Field" },
                      { id: "supernova", label: "Supernova Explosion" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setAvatarStyle(mode.id as any)}
                        className={`p-2.5 rounded-xl border text-[10px] font-semibold text-center tracking-wider transition-all cursor-pointer ${
                          avatarStyle === mode.id
                            ? "bg-purple-950/60 border-cyan-400 text-cyan-300"
                            : "bg-slate-950 border-purple-900/50 text-gray-400 hover:text-white"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={drawAvatar}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] text-xs font-orbitron font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> SYNTHESIZE ORBIT MATRIX
                  </button>
                  <button
                    onClick={() => {
                      if (avatarUrl) {
                        onApplyPhoto(avatarUrl);
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-purple-800/40 text-xs font-orbitron font-bold text-cyan-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> APPLY TO PROFILE PIC
                  </button>
                </div>
              </div>

              {/* Render Preview Frame */}
              <div className="w-full md:w-1/2 flex flex-col items-center gap-3">
                <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">HUD PREVIEW MATRIX</span>
                <div className="w-56 h-56 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.25)] bg-slate-950 relative flex items-center justify-center">
                  <canvas ref={canvasRef} className="w-full h-full" style={{ display: "none" }} />
                  {avatarUrl && <img src={avatarUrl} alt="Procedural Space graphic" className="w-full h-full object-cover" />}
                </div>
                {avatarUrl && (
                  <a
                    href={avatarUrl}
                    download={`${avatarStyle}-avatar.png`}
                    className="text-[10px] text-purple-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Download Artifact
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PALETTE MAPPER */}
          {activeTab === "palette" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-purple-300">Select Harmony Tone</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "neon", label: "Hyper Neon" },
                    { id: "pastel", label: "Warm Galaxy" },
                    { id: "deep-void", label: "Absolute Void" },
                    { id: "synth", label: "Synth Pulse" }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setPaletteStyle(style.id as any)}
                      className={`p-2 rounded-lg border text-[10px] font-semibold text-center transition-all cursor-pointer ${
                        paletteStyle === style.id
                          ? "bg-purple-950/60 border-cyan-400 text-cyan-300"
                          : "bg-slate-950 border-purple-900/50 text-gray-400 hover:text-white"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {generatedPalette && (
                <div className="glass-panel p-5 border-purple-500/20 bg-slate-950/80 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PROPOSED SPACE SCHEME</span>
                    <button
                      onClick={() => {
                        onApplyPalette({
                          backgroundValue: generatedPalette.bg,
                          textColor: generatedPalette.text,
                          accentColor: generatedPalette.accent,
                          cardBg: generatedPalette.cardBg
                        });
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-xs font-bold text-white transition-all hover:scale-103 cursor-pointer"
                    >
                      Apply Colors to Theme
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="flex flex-col gap-1.5">
                      <div
                        className="h-10 rounded-lg border border-white/10"
                        style={{ background: generatedPalette.accent }}
                      />
                      <span className="text-[9px] font-mono text-gray-400">Accent ({generatedPalette.accent})</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div
                        className="h-10 rounded-lg border border-white/10"
                        style={{ background: generatedPalette.text }}
                      />
                      <span className="text-[9px] font-mono text-gray-400">Text ({generatedPalette.text})</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div
                        className="h-10 rounded-lg border border-white/10"
                        style={{ background: generatedPalette.cardBg }}
                      />
                      <span className="text-[9px] font-mono text-gray-400">Card Glass</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div
                        className="h-10 rounded-lg border border-white/10"
                        style={{ background: generatedPalette.bg.includes("gradient") ? "#0c0a0f" : generatedPalette.bg }}
                      />
                      <span className="text-[9px] font-mono text-gray-400">Gradient Void</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
