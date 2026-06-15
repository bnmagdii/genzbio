"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dbService } from "@/config/dbService";
import { BioDoc } from "@/types";
import {
  Rocket,
  PlusCircle,
  ExternalLink,
  Edit,
  Trash2,
  LogOut,
  Shield,
  Eye,
  MessageSquare,
  Users,
  Loader2,
  AlertTriangle
} from "lucide-react";
import confetti from "canvas-confetti";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [bios, setBios] = useState<BioDoc[]>([]);
  const [loadingBios, setLoadingBios] = useState(true);
  
  // Create Bio Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load User Bios
  const fetchBios = async () => {
    if (!user) return;
    try {
      const data = await dbService.getBiosByOwner(user.uid);
      setBios(data);
    } catch (e) {
      console.error("Error loading bios:", e);
    } finally {
      setLoadingBios(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBios();
    }
  }, [user]);

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Create Bio
  const handleCreateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    const cleanUsername = newUsername.toLowerCase().trim().replace(/\s+/g, "");
    
    // Validate reserved names list (shared with context)
    const { RESERVED_USERNAMES } = require("@/context/AuthContext");
    if (RESERVED_USERNAMES.has(cleanUsername)) {
      setCreateError("This username is reserved for system operations.");
      setCreating(false);
      return;
    }

    if (cleanUsername.length < 3) {
      setCreateError("Username must be at least 3 characters.");
      setCreating(false);
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      setCreateError("Username can only contain letters, numbers, dashes, and underscores.");
      setCreating(false);
      return;
    }

    try {
      const existing = await dbService.getBio(cleanUsername);
      if (existing) {
        setCreateError("This space sector is already claimed.");
        setCreating(false);
        return;
      }

      const defaultBio: BioDoc = {
        id: cleanUsername,
        ownerId: user!.uid,
        displayName: newDisplayName || user!.displayName,
        bioDescription: "Exploring the cosmos from my customized space portal. 🛸",
        photoURL: user!.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        coverURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
        website: "",
        socialLinks: {},
        guestbookEnabled: true,
        messagesEnabled: true,
        viewsCount: 0,
        themeId: "purple-galaxy",
        blocks: [
          {
            id: "heading-1",
            type: "heading",
            order: 0,
            data: { text: `${newDisplayName || user!.displayName}'s Sector`, level: "h2" }
          },
          {
            id: "text-1",
            type: "text",
            order: 1,
            data: { text: "Welcome to my portal! Customize these blocks in the admin page." }
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.createBio(defaultBio);
      
      // Celebrate
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#A855F7", "#D946EF", "#22D3EE"]
      });

      setShowCreateModal(false);
      setNewUsername("");
      setNewDisplayName("");
      fetchBios();
    } catch (err: any) {
      setCreateError(err.message || "Failed to establish space orbit.");
    } finally {
      setCreating(false);
    }
  };

  // Delete Bio
  const handleDeleteBio = async (bioId: string) => {
    if (!confirm(`Are you sure you want to decommission the orbit of bio.space/${bioId}? All page details will be lost forever.`)) return;
    try {
      await dbService.deleteBio(bioId);
      fetchBios();
    } catch (e) {
      console.error("Decommission error:", e);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-space">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-xs font-orbitron tracking-widest text-cyan-400">
          ENTERING YOUR UNIVERSE...
        </p>
      </div>
    );
  }

  // Calculate Cumulative Dashboard stats
  const totalViews = bios.reduce((sum, b) => sum + (b.viewsCount || 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg-space relative">
      {/* Top HUD Comm-Bar */}
      <header className="w-full border-b border-purple-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
            <Rocket className="w-4 h-4 animate-bounce" />
          </div>
          <span className="font-orbitron font-bold text-lg tracking-wider bg-gradient-to-r from-primary via-accent to-cyan-400 bg-clip-text text-transparent">
            GEN-Z BIO
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin panel redirect */}
          {(user.role === "admin" || user.role === "super_admin" || user.role === "moderator") && (
            <Link
              href="/dashboard/admin"
              className="px-3.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-xs font-semibold text-purple-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 border-l border-purple-900/50 pl-4">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName}`}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-cyan-400/50"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold">{user.displayName}</span>
              <span className="text-[9px] uppercase tracking-widest text-cyan-400 font-orbitron">
                {user.role.replace("_", " ")}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/60 text-red-400 transition-all cursor-pointer"
            title="Disconnect Comm-link"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Control Dashboard Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* User Status Welcome banner */}
        <div className="glass-panel p-6 border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-orbitron">
              Welcome, <span className="text-cyan-400">{user.displayName}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sector authorization active. You hold <span className="text-purple-300 font-semibold">{user.roles.join(", ")}</span> credentials.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-cyan-500 hover:to-primary text-xs font-orbitron font-bold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
          >
            <PlusCircle className="w-4 h-4" />
            CREATE BIO SPACE
          </button>
        </div>

        {/* Global Space Metrics HUD */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 bg-slate-900/40 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 tracking-wider">Accumulated Views</p>
              <h3 className="text-2xl font-bold font-orbitron mt-0.5">{totalViews}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 bg-slate-900/40 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 tracking-wider">Active Sectors</p>
              <h3 className="text-2xl font-bold font-orbitron mt-0.5">{bios.length}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 bg-slate-900/40 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-500 tracking-wider">Security State</p>
              <h3 className="text-xs font-bold font-orbitron mt-2 uppercase tracking-wide text-green-400">
                {user.verified ? "Verified Core" : "Standard Core"}
              </h3>
            </div>
          </div>
        </section>

        {/* Active Bios Sector List */}
        <section className="flex flex-col gap-4">
          <h3 className="text-sm uppercase font-semibold font-orbitron tracking-widest text-purple-300">
            REGISTERED GALACTIC ORBITS ({bios.length})
          </h3>

          {loadingBios ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : bios.length === 0 ? (
            <div className="glass-panel p-10 text-center border-dashed border-purple-500/20 text-gray-400 flex flex-col items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-purple-500" />
              <p className="text-xs">No active bio space orbits found. Setup your first link portal to project into space!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs font-bold text-cyan-400 hover:text-white underline cursor-pointer"
              >
                Launch Orbit Creator
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bios.map((bio) => (
                <div key={bio.id} className="glass-panel p-5 bg-slate-950/70 border-purple-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all flex flex-col justify-between gap-5 relative overflow-hidden group">
                  {/* Backdrop glowing card accent */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all" />

                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <img
                        src={bio.photoURL}
                        alt={bio.displayName}
                        className="w-12 h-12 rounded-full border border-purple-500/30 object-cover"
                      />
                      <div className="text-left">
                        <h4 className="font-bold text-sm text-white">{bio.displayName}</h4>
                        <span className="text-xs text-cyan-400 font-semibold tracking-wide">
                          bio.space/{bio.id}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded-full font-mono">
                      {bio.viewsCount || 0} views
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 h-8 text-left">
                    {bio.bioDescription}
                  </p>

                  <div className="flex items-center justify-between border-t border-purple-900/30 pt-4 relative z-10">
                    <button
                      onClick={() => handleDeleteBio(bio.id)}
                      className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 hover:border-red-500/60 text-red-400 transition-all cursor-pointer"
                      title="Decommission bio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/${bio.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-900 border border-purple-900/50 hover:border-cyan-400 text-gray-300 hover:text-cyan-400 transition-all cursor-pointer"
                        title="View portal layout"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      
                      <Link
                        href={`/dashboard/${bio.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-accent text-xs font-semibold text-white transition-all flex items-center gap-1 hover:shadow-[0_0_10px_rgba(124,58,237,0.5)] cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit portal</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Creator Modal Window */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel-glow border border-purple-500/40 p-6 md:p-8 flex flex-col gap-5 relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-orbitron text-white tracking-wide flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400 animate-pulse" />
              CREATE BIO PORTAL
            </h3>

            {createError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBio} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs uppercase font-semibold text-purple-300">
                  Portal Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Captain's Corner"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="px-4 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white placeholder:text-gray-700"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs uppercase font-semibold text-purple-300">
                  Choose Portal Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-cyan-400 text-sm font-semibold select-none">
                    bio.space/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="my-link"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full pl-22 pr-4 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-sm focus:outline-none focus:border-cyan-400 text-white font-semibold placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-purple-950 hover:bg-slate-950 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-xs font-bold text-white transition-all hover:scale-103 cursor-pointer flex items-center gap-1 shadow-lg shadow-primary/20"
                >
                  {creating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <span>Deploy Space Portal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
