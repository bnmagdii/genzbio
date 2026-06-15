"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { dbService } from "@/config/dbService";
import { ALL_THEMES } from "@/config/themes";
import { AIToolsModal } from "@/components/AIToolsModal";
import { BioDoc, ContentBlock, SocialLinks, CustomThemeSettings } from "@/types";
import {
  ArrowLeft,
  Settings,
  Palette,
  Grid,
  MessageSquare,
  Sparkles,
  Smartphone,
  Eye,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  ExternalLink,
  Loader2,
  AlertTriangle,
  User,
  Music,
  Video,
  List,
  Mail,
  HelpCircle,
  Code,
  Sliders,
  CheckCircle,
  Copy,
  Clock,
  LayoutGrid
} from "lucide-react";
import confetti from "canvas-confetti";

export default function BioEditorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bioId = params.bioId as string;

  const [bio, setBio] = useState<BioDoc | null>(null);
  const [loadingBio, setLoadingBio] = useState(true);
  const [activeTab, setActiveTab] = useState<"blocks" | "socials" | "style" | "widgets">("blocks");
  
  // AI Modal
  const [showAIModal, setShowAIModal] = useState(false);

  // Messages/Guestbook States
  const [messages, setMessages] = useState<any[]>([]);
  const [guestbook, setGuestbook] = useState<any[]>([]);

  // Page States
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "modified" | "saving">("saved");
  const [error, setError] = useState("");

  // Block creation states
  const [selectedBlockType, setSelectedBlockType] = useState<string>("text");

  // Load Bio Data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchBioData = async () => {
      try {
        const docData = await dbService.getBio(bioId);
        if (!docData) {
          setError("Portal orbit coordinates not found.");
          setLoadingBio(false);
          return;
        }

        // Security check: Only owner or admin roles can edit
        const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "moderator";
        if (docData.ownerId !== user?.uid && !isAdmin) {
          setError("Access Denied: You do not possess credentials for this space sector.");
          setLoadingBio(false);
          return;
        }

        setBio(docData);
        
        // Fetch inbox / guestbook records
        const msgs = await dbService.getMessages(bioId);
        const signs = await dbService.getGuestbook(bioId);
        setMessages(msgs);
        setGuestbook(signs);

      } catch (e) {
        console.error("Error loading bio data:", e);
        setError("Error loading space portal data.");
      } finally {
        setLoadingBio(false);
      }
    };

    if (user) {
      fetchBioData();
    }
  }, [user, authLoading, bioId, router]);

  // Handle Updates
  const updateBioState = (fields: Partial<BioDoc>) => {
    if (!bio) return;
    setBio({ ...bio, ...fields });
    setSaveStatus("modified");
  };

  const updateCustomThemeState = (fields: Partial<CustomThemeSettings>) => {
    if (!bio) return;
    const currentTheme = bio.customTheme || {
      backgroundType: "space",
      backgroundValue: "#050816",
      cardBg: "rgba(15, 23, 42, 0.65)",
      cardBorder: "rgba(124, 58, 237, 0.3)",
      textColor: "#f3f4f6",
      accentColor: "#7c3aed",
      buttonStyle: "neon",
      fontFamily: "var(--font-orbitron)"
    };
    setBio({
      ...bio,
      customTheme: { ...currentTheme, ...fields },
      themeId: "custom"
    });
    setSaveStatus("modified");
  };

  // Save Portal Data
  const handleSaveBio = async () => {
    if (!bio) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      await dbService.updateBio(bio.id, bio);
      setSaveStatus("saved");
      
      confetti({
        particleCount: 50,
        spread: 40,
        colors: ["#7C3AED", "#22D3EE", "#D946EF"]
      });
    } catch (e) {
      console.error(e);
      setError("Failed to transmit changes to satellite database.");
      setSaveStatus("modified");
    } finally {
      setSaving(false);
    }
  };

  // Content Blocks Modifiers
  const handleAddBlock = () => {
    if (!bio) return;
    const newBlock: ContentBlock = {
      id: `block-${Math.random().toString(36).substring(2, 9)}`,
      type: selectedBlockType as any,
      order: bio.blocks.length,
      clicks: 0,
      data: getInitialBlockData(selectedBlockType)
    };
    updateBioState({ blocks: [...bio.blocks, newBlock] });
  };

  const getInitialBlockData = (type: string) => {
    switch (type) {
      case "heading":
        return { text: "Stellar Title", level: "h2" };
      case "text":
        return { text: "Custom paragraph text displayed in the cyber hub layout." };
      case "button":
        return { label: "Beam to Destination", url: "https://google.com", animation: "pulse" };
      case "video":
        return { videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" };
      case "music":
        return { musicUrl: "https://open.spotify.com/embed/track/4PTG3Z6ehGkBF3zIqYQGSy" };
      case "divider":
        return { style: "neon" };
      case "faq":
        return { items: [{ q: "Sector Query?", a: "Transmission Answer" }] };
      case "countdown":
        return { targetDate: new Date(Date.now() + 86400000 * 7).toISOString().substring(0, 16), label: "Hyper Launch Event" };
      case "newsletter":
        return { placeholder: "Email coordinates...", buttonLabel: "Subscribe Hub", title: "Galactic Newsletter" };
      case "donation":
        return { address: "0x123...abc", label: "Support with Crypto Ether", platform: "ethereum" };
      case "product":
        return { title: "Cosmic Hooded Jacket", price: "$49.99", desc: "Cyberpunk winter thermal shielding.", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=300", link: "https://store.com" };
      case "pdf":
        return { pdfUrl: "https://example.com/map.pdf", label: "Download Flight Plan Map" };
      case "contact":
        return { email: user?.email || "", placeholder: "Write message payload..." };
      case "html":
        return { code: "<div style='color: #22d3ee; font-weight: bold; text-shadow: 0 0 10px #22d3ee;'>HTML CUSTOM GRID</div>" };
      case "gallery":
        return { images: ["https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400"] };
      default:
        return {};
    }
  };

  const handleUpdateBlockData = (blockId: string, dataFields: any) => {
    if (!bio) return;
    const updated = bio.blocks.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, ...dataFields } } : b));
    updateBioState({ blocks: updated });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!bio) return;
    const filtered = bio.blocks.filter((b) => b.id !== blockId);
    // Re-index orders
    const reordered = filtered.map((b, idx) => ({ ...b, order: idx }));
    updateBioState({ blocks: reordered });
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    if (!bio) return;
    const blocksCopy = [...bio.blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocksCopy.length) return;

    // Swap elements
    const temp = blocksCopy[index];
    blocksCopy[index] = blocksCopy[targetIdx];
    blocksCopy[targetIdx] = temp;

    // Fix index order fields
    const updated = blocksCopy.map((b, idx) => ({ ...b, order: idx }));
    updateBioState({ blocks: updated });
  };

  // Messages Manager
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await dbService.updateMessage(msgId, { read: true }); // Mock/Actual delete logic (mark as read or remove)
      setMessages(messages.filter((m) => m.id !== msgId));
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading || loadingBio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-space">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-xs font-orbitron tracking-widest text-cyan-400">
          SECURE SECTOR COMMUNICATOR ONLINE...
        </p>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-bg-space p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
        <h3 className="text-lg font-orbitron font-bold text-white mt-4 uppercase">MALFUNCTION DETECTED</h3>
        <p className="text-xs text-gray-400 mt-2">{error}</p>
        <Link href="/dashboard" className="mt-6 px-4 py-2 bg-purple-950 border border-purple-500/30 text-xs rounded-lg hover:bg-purple-900 transition-colors">
          Return to Mission Control
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-bg-space relative">
      {/* Editor top comms panel */}
      <header className="w-full border-b border-purple-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-slate-900 border border-purple-950 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <h1 className="text-sm font-bold font-orbitron text-white">ORBITAL MATRIX EDITOR</h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wide">
              bio.space/{bio.id}
            </span>
          </div>
        </div>

        {/* Save/Status HUD indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest">
            <span>SIGNAL STATS:</span>
            {saveStatus === "saved" && <span className="text-green-400 font-bold">● ONLINE (SAVED)</span>}
            {saveStatus === "modified" && <span className="text-amber-400 font-bold animate-pulse">● MODIFIED (PENDING)</span>}
            {saveStatus === "saving" && <span className="text-cyan-400 font-bold animate-spin">● TRANSMITTING...</span>}
          </div>

          <button
            onClick={handleSaveBio}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-cyan-500 hover:to-primary text-xs font-orbitron font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>PUBLISH SIGNAL</span>
          </button>
        </div>
      </header>

      {/* Editor Grid: Left HUD Control, Right Simulator Preview */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: HUDS controls (width 60%) */}
        <div className="flex-1 lg:max-w-[55%] border-r border-purple-900/30 flex flex-col min-h-0 bg-slate-950/40">
          
          {/* Navigation Control Tabs */}
          <div className="flex border-b border-purple-950 bg-slate-950/60 p-2 gap-2">
            {[
              { id: "blocks", label: "Blocks", icon: Grid },
              { id: "socials", label: "Socials", icon: Sliders },
              { id: "style", label: "Styling", icon: Palette },
              { id: "widgets", label: "Inbox & Feed", icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-lg text-xs font-orbitron font-bold tracking-wider flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary border-purple-400/50 text-white shadow-inner"
                      : "bg-slate-900/60 border-purple-950 text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Display Panel Area */}
          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            
            {/* AI Generator floating badge */}
            <div className="glass-panel p-4 bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold font-orbitron text-white">AI CO-PILOT MODULE</h4>
                  <p className="text-[10px] text-gray-400">Generate creative bios, images, and neon palettes instantly.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-[10px] font-orbitron font-bold text-cyan-400 hover:text-white border border-cyan-400/30 transition-all cursor-pointer"
              >
                OPEN HUD LAB
              </button>
            </div>

            {/* TAB 1: BLOCKS CONFIGURATION */}
            {activeTab === "blocks" && (
              <div className="flex flex-col gap-6">
                
                {/* Block Creator Hub */}
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-purple-300">ADD PORTAL BLOCK</span>
                    <select
                      value={selectedBlockType}
                      onChange={(e) => setSelectedBlockType(e.target.value)}
                      className="p-1.5 bg-slate-900 border border-purple-950 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="text">Paragraph Text</option>
                      <option value="heading">Heading Title</option>
                      <option value="button">Link Button</option>
                      <option value="gallery">Photo Gallery</option>
                      <option value="video">Video Embed</option>
                      <option value="music">Spotify Music</option>
                      <option value="divider">Visual Divider</option>
                      <option value="faq">FAQ Accordion</option>
                      <option value="countdown">Countdown Clock</option>
                      <option value="newsletter">Newsletter Capture</option>
                      <option value="donation">Crypto Wallet Block</option>
                      <option value="product">Store Product Card</option>
                      <option value="pdf">PDF Download Block</option>
                      <option value="contact">Contact Mail Hub</option>
                      <option value="html">Custom HTML Sandbox</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleAddBlock}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-accent text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-102"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Beam Block</span>
                  </button>
                </div>

                {/* Blocks List */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs uppercase font-orbitron font-bold text-purple-300 tracking-wider text-left">
                    Portal Block Stack ({bio.blocks.length})
                  </h3>

                  {bio.blocks.length === 0 ? (
                    <p className="text-xs text-gray-500 italic text-center py-6">This orbit portal is empty. Beam down a block!</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {bio.blocks
                        .sort((a, b) => a.order - b.order)
                        .map((block, idx) => (
                          <div
                            key={block.id}
                            className="glass-panel p-4 bg-slate-950/70 border-purple-950 hover:border-purple-800/60 transition-all flex flex-col gap-4 text-left"
                          >
                            {/* Block Header controls */}
                            <div className="flex items-center justify-between border-b border-purple-950 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-900/40 text-purple-300 border border-purple-800/30 rounded-md">
                                  {block.type.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveBlock(idx, "up")}
                                  disabled={idx === 0}
                                  className="p-1 rounded bg-slate-900 border border-purple-950 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveBlock(idx, "down")}
                                  disabled={idx === bio.blocks.length - 1}
                                  className="p-1 rounded bg-slate-900 border border-purple-950 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlock(block.id)}
                                  className="p-1 rounded bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/60 transition-colors ml-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Block Inputs Form */}
                            <div className="grid grid-cols-1 gap-3 text-xs">
                              {block.type === "heading" && (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Heading Text"
                                    value={block.data.text || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { text: e.target.value })}
                                    className="flex-1 p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  />
                                  <select
                                    value={block.data.level || "h2"}
                                    onChange={(e) => handleUpdateBlockData(block.id, { level: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  >
                                    <option value="h1">H1 Large</option>
                                    <option value="h2">H2 Medium</option>
                                    <option value="h3">H3 Small</option>
                                  </select>
                                </div>
                              )}

                              {block.type === "text" && (
                                <textarea
                                  placeholder="Type paragraph text..."
                                  value={block.data.text || ""}
                                  onChange={(e) => handleUpdateBlockData(block.id, { text: e.target.value })}
                                  rows={3}
                                  className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg text-white resize-none"
                                />
                              )}

                              {block.type === "button" && (
                                <div className="flex flex-col gap-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Button Label"
                                      value={block.data.label || ""}
                                      onChange={(e) => handleUpdateBlockData(block.id, { label: e.target.value })}
                                      className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Target URL (https://...)"
                                      value={block.data.url || ""}
                                      onChange={(e) => handleUpdateBlockData(block.id, { url: e.target.value })}
                                      className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                    />
                                  </div>
                                  <select
                                    value={block.data.animation || "none"}
                                    onChange={(e) => handleUpdateBlockData(block.id, { animation: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  >
                                    <option value="none">No Animation</option>
                                    <option value="pulse">Pulse Glow</option>
                                    <option value="float">Hover Float</option>
                                  </select>
                                </div>
                              )}

                              {block.type === "video" && (
                                <input
                                  type="text"
                                  placeholder="YouTube/Vimeo Embed URL (https://...)"
                                  value={block.data.videoUrl || ""}
                                  onChange={(e) => handleUpdateBlockData(block.id, { videoUrl: e.target.value })}
                                  className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                />
                              )}

                              {block.type === "music" && (
                                <input
                                  type="text"
                                  placeholder="Spotify/Apple Embed Track URL (https://...)"
                                  value={block.data.musicUrl || ""}
                                  onChange={(e) => handleUpdateBlockData(block.id, { musicUrl: e.target.value })}
                                  className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                />
                              )}

                              {block.type === "countdown" && (
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Countdown Label (e.g. Flight Departure)"
                                    value={block.data.label || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { label: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  />
                                  <input
                                    type="datetime-local"
                                    value={block.data.targetDate || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { targetDate: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  />
                                </div>
                              )}

                              {block.type === "html" && (
                                <textarea
                                  placeholder="Write custom HTML/embed code..."
                                  value={block.data.code || ""}
                                  onChange={(e) => handleUpdateBlockData(block.id, { code: e.target.value })}
                                  rows={3}
                                  className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg font-mono text-cyan-300 resize-none"
                                />
                              )}

                              {block.type === "faq" && (
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="text"
                                    placeholder="Question Payload"
                                    value={block.data.items?.[0]?.q || ""}
                                    onChange={(e) => {
                                      const updatedItems = [{ q: e.target.value, a: block.data.items?.[0]?.a || "" }];
                                      handleUpdateBlockData(block.id, { items: updatedItems });
                                    }}
                                    className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  />
                                  <textarea
                                    placeholder="Answer Payload"
                                    value={block.data.items?.[0]?.a || ""}
                                    onChange={(e) => {
                                      const updatedItems = [{ q: block.data.items?.[0]?.q || "", a: e.target.value }];
                                      handleUpdateBlockData(block.id, { items: updatedItems });
                                    }}
                                    rows={2}
                                    className="w-full p-2 bg-slate-900 border border-purple-950 rounded-lg text-white resize-none"
                                  />
                                </div>
                              )}

                              {block.type === "newsletter" && (
                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Newsletter Title"
                                    value={block.data.title || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white col-span-1"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Placeholder text"
                                    value={block.data.placeholder || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { placeholder: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white col-span-1"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Button Label"
                                    value={block.data.buttonLabel || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { buttonLabel: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white col-span-1"
                                  />
                                </div>
                              )}

                              {block.type === "product" && (
                                <div className="flex flex-col gap-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Product Name"
                                      value={block.data.title || ""}
                                      onChange={(e) => handleUpdateBlockData(block.id, { title: e.target.value })}
                                      className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Price (e.g. $19)"
                                      value={block.data.price || ""}
                                      onChange={(e) => handleUpdateBlockData(block.id, { price: e.target.value })}
                                      className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Purchase URL"
                                      value={block.data.link || ""}
                                      onChange={(e) => handleUpdateBlockData(block.id, { link: e.target.value })}
                                      className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Product Image URL (Unsplash or web)"
                                    value={block.data.imageUrl || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { imageUrl: e.target.value })}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white"
                                  />
                                  <textarea
                                    placeholder="Short description"
                                    value={block.data.desc || ""}
                                    onChange={(e) => handleUpdateBlockData(block.id, { desc: e.target.value })}
                                    rows={1}
                                    className="p-2 bg-slate-900 border border-purple-950 rounded-lg text-white resize-none"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SOCIAL LINKS */}
            {activeTab === "socials" && (
              <div className="flex flex-col gap-5 text-left">
                <h3 className="text-xs uppercase font-orbitron font-bold text-purple-300 tracking-wider">
                  GALACTIC COMM-CHANNELS CONSOLE
                </h3>
                <p className="text-[10px] text-gray-500">Provide direct sector URLs to hook your portal buttons.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "instagram", label: "Instagram Link" },
                    { key: "youtube", label: "YouTube Portal" },
                    { key: "tiktok", label: "TikTok Channel" },
                    { key: "x", label: "X Transmission" },
                    { key: "discord", label: "Discord Sector" },
                    { key: "github", label: "GitHub Codespace" },
                    { key: "twitch", label: "Twitch Broadcast" },
                    { key: "spotify", label: "Spotify Playlist" },
                    { key: "website", label: "Custom Website URL" },
                    { key: "email", label: "Email Destination" }
                  ].map((chan) => (
                    <div key={chan.key} className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-semibold text-gray-400">{chan.label}</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={(bio.socialLinks as any)[chan.key] || ""}
                        onChange={(e) => {
                          const updatedSocials = { ...bio.socialLinks, [chan.key]: e.target.value };
                          updateBioState({ socialLinks: updatedSocials });
                        }}
                        className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: AESTHETICS & PRESETS */}
            {activeTab === "style" && (
              <div className="flex flex-col gap-6 text-left">
                
                {/* Profile detail section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">CORE METADATA</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Avatar Picture Link</label>
                      <input
                        type="text"
                        value={bio.photoURL || ""}
                        onChange={(e) => updateBioState({ photoURL: e.target.value })}
                        className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400 uppercase">Display Portal Title</label>
                      <input
                        type="text"
                        value={bio.displayName || ""}
                        onChange={(e) => updateBioState({ displayName: e.target.value })}
                        className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase">Vector Cover Art Image</label>
                    <input
                      type="text"
                      value={bio.coverURL || ""}
                      onChange={(e) => updateBioState({ coverURL: e.target.value })}
                      className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase">Bio Description</label>
                    <textarea
                      value={bio.bioDescription || ""}
                      onChange={(e) => updateBioState({ bioDescription: e.target.value })}
                      rows={2}
                      className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white resize-none"
                    />
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">SYSTEM PRESET THEMES</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ALL_THEMES.slice(0, 12).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setBio({
                            ...bio,
                            themeId: t.id,
                            customTheme: undefined // reset custom adjustments
                          });
                          setSaveStatus("modified");
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                          bio.themeId === t.id
                            ? "bg-purple-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                            : "bg-slate-950 border-purple-950 text-gray-400 hover:text-white"
                        }`}
                      >
                        <span className="text-[10px] font-bold font-orbitron">{t.name}</span>
                        <div className="h-1 w-full rounded" style={{ background: t.settings.accentColor }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom theme settings */}
                <div className="flex flex-col gap-4 border-t border-purple-950 pt-5">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">CUSTOM ORBIT ADJUSTMENTS</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Background Gradient Formula</label>
                      <input
                        type="text"
                        placeholder="linear-gradient(...)"
                        value={bio.customTheme?.backgroundValue || ""}
                        onChange={(e) => updateCustomThemeState({ backgroundValue: e.target.value, backgroundType: "gradient" })}
                        className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Luminous Glow Hex Color</label>
                      <input
                        type="text"
                        placeholder="#7c3aed"
                        value={bio.customTheme?.accentColor || ""}
                        onChange={(e) => updateCustomThemeState({ accentColor: e.target.value })}
                        className="p-2.5 bg-slate-950 border border-purple-950 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: WIDGET INBOX AND FEEDS */}
            {activeTab === "widgets" && (
              <div className="flex flex-col gap-6 text-left">
                
                {/* Control switches */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-purple-950 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">ANONYMOUS COMM inbox</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Toggled State</span>
                      <button
                        onClick={() => updateBioState({ messagesEnabled: !bio.messagesEnabled })}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          bio.messagesEnabled ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-slate-900 text-gray-400 border border-transparent"
                        }`}
                      >
                        {bio.messagesEnabled ? "Active" : "Offline"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-purple-950 flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">GUESTBOOK signatures</span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Toggled State</span>
                      <button
                        onClick={() => updateBioState({ guestbookEnabled: !bio.guestbookEnabled })}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          bio.guestbookEnabled ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" : "bg-slate-900 text-gray-400 border border-transparent"
                        }`}
                      >
                        {bio.guestbookEnabled ? "Active" : "Offline"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Anonymous messages lists */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">ANONYMOUS PAYLOADS ({messages.length})</h4>
                  {messages.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4">No incoming anonymous transmissions logged.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {messages.map((m) => (
                        <div key={m.id} className="glass-panel p-3 bg-slate-950/50 border-purple-950 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-xs text-gray-200">{m.messageText}</p>
                            <span className="text-[9px] text-gray-500 block mt-1 font-mono">{new Date(m.createdAt).toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1 rounded bg-slate-900 border border-purple-950 hover:border-red-500 text-gray-400 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Guestbook Signatures list */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs uppercase font-orbitron font-bold text-purple-300">GUESTBOOK REGISTRY ({guestbook.length})</h4>
                  {guestbook.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4">No signatures recorded in the flight log.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {guestbook.map((g) => (
                        <div key={g.id} className="glass-panel p-3 bg-slate-950/50 border-purple-950 flex items-start justify-between gap-3">
                          <div className="flex-1 text-left">
                            <h5 className="text-xs font-bold text-cyan-400">{g.signerName}</h5>
                            <p className="text-xs text-gray-300 mt-1">{g.messageText}</p>
                            <span className="text-[9px] text-gray-500 block mt-1 font-mono">{new Date(g.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Side: Mock Simulator view (width 45%) */}
        <div className="hidden lg:flex flex-1 max-w-[45%] flex-col items-center justify-center p-6 bg-slate-900/10 border-l border-purple-900/10 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>REAL-TIME PORTAL BEAM SCAN</span>
          </div>

          {/* Smartphone mockup frame wrapper */}
          <div className="w-[310px] h-[610px] rounded-[36px] bg-slate-950 border-[10px] border-slate-900 shadow-[0_0_50px_rgba(124,58,237,0.15)] overflow-hidden relative flex flex-col select-none">
            
            {/* Phone speaker notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-xl z-20 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-950 rounded-full" />
            </div>

            {/* Simulating public view */}
            <iframe
              src={`/${bio.id}?preview=true&state=${encodeURIComponent(JSON.stringify(bio))}`}
              className="w-full h-full border-none pointer-events-auto"
              title="Live Simulator Frame"
              key={`${JSON.stringify(bio.themeId)}-${bio.blocks.length}`}
            />
          </div>
        </div>

      </div>

      {/* AI Tool labs Modal overlay */}
      {showAIModal && (
        <AIToolsModal
          onClose={() => setShowAIModal(false)}
          currentUsername={bio.id}
          onApplyBio={(text) => updateBioState({ bioDescription: text })}
          onApplyPhoto={(base64) => updateBioState({ photoURL: base64 })}
          onApplyPalette={(colors) => {
            updateCustomThemeState({
              backgroundValue: colors.backgroundValue,
              textColor: colors.textColor,
              accentColor: colors.accentColor,
              cardBg: colors.cardBg
            });
          }}
        />
      )}
    </div>
  );
}
