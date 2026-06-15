"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { dbService } from "@/config/dbService";
import { ALL_THEMES } from "@/config/themes";
import { BioDoc, ContentBlock, UserDoc, GuestbookDoc, MessageDoc } from "@/types";
import {
  Sparkles,
  ExternalLink,
  MessageSquare,
  Send,
  User,
  Heart,
  ChevronDown,
  Check,
  AlertCircle,
  Copy,
  Clock,
  Mail,
  Loader2,
  Lock
} from "lucide-react";
import confetti from "canvas-confetti";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function PublicBioPage({ params }: PageProps) {
  const { username } = use(params);
  const searchParams = useSearchParams();
  
  const isPreview = searchParams.get("preview") === "true";
  const rawState = searchParams.get("state");

  const [bio, setBio] = useState<BioDoc | null>(null);
  const [owner, setOwner] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Widgets state
  const [anonMsg, setAnonMsg] = useState("");
  const [sendingAnon, setSendingAnon] = useState(false);
  const [anonStatus, setAnonStatus] = useState<"idle" | "sent" | "error">("idle");

  const [guestName, setGuestName] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [signingGuest, setSigningGuest] = useState(false);
  const [guestbookLogs, setGuestbookLogs] = useState<GuestbookDoc[]>([]);

  // Clipboard copies helper
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Countdown timers state
  const [timeLeft, setTimeLeft] = useState<{ [blockId: string]: string }>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (isPreview && rawState) {
          // Preview state parsed from URL
          const parsed = JSON.parse(decodeURIComponent(rawState)) as BioDoc;
          setBio(parsed);
          
          // Get mock/real owner details
          const ownerDoc = await dbService.getUser(parsed.ownerId);
          setOwner(ownerDoc);
          setLoading(false);
          return;
        }

        // Live Mode fetch
        const docData = await dbService.getBio(username);
        if (!docData) {
          setError("This planetary quadrant is vacant. Link-in-Bio portal offline.");
          setLoading(false);
          return;
        }

        setBio(docData);

        // Fetch owner details for role/verification check
        const ownerDoc = await dbService.getUser(docData.ownerId);
        setOwner(ownerDoc);

        // Fetch Guestbook signatures
        if (docData.guestbookEnabled) {
          const logs = await dbService.getGuestbook(docData.id);
          setGuestbookLogs(logs);
        }

        // Increment live views count (avoid increments in previews)
        if (!isPreview) {
          dbService.updateBio(docData.id, { viewsCount: (docData.viewsCount || 0) + 1 });
        }

      } catch (e) {
        console.error("Error fetching bio:", e);
        setError("System malfunction during orbital routing.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, isPreview, rawState]);

  // Handle countdown calculations
  useEffect(() => {
    if (!bio) return;
    const countdownBlocks = bio.blocks.filter((b) => b.type === "countdown");
    if (countdownBlocks.length === 0) return;

    const interval = setInterval(() => {
      const updated: { [blockId: string]: string } = {};
      countdownBlocks.forEach((block) => {
        const target = new Date(block.data.targetDate).getTime();
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0) {
          updated[block.id] = "MISSION ACCOMPLISHED / ACTIVE";
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          updated[block.id] = `${days}d ${hours}h ${mins}m ${secs}s`;
        }
      });
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [bio]);

  // Submit anonymous messages
  const handleSendAnonMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio || !anonMsg.trim()) return;

    setSendingAnon(true);
    setAnonStatus("idle");
    try {
      const newMsg: MessageDoc = {
        id: `msg-${Math.random().toString(36).substring(2, 9)}`,
        bioId: bio.id,
        messageText: anonMsg,
        createdAt: new Date().toISOString(),
        read: false
      };
      await dbService.addMessage(newMsg);
      setAnonMsg("");
      setAnonStatus("sent");
    } catch (e) {
      console.error(e);
      setAnonStatus("error");
    } finally {
      setSendingAnon(false);
    }
  };

  // Sign Guestbook
  const handleSignGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bio || !guestName.trim() || !guestMsg.trim()) return;

    setSigningGuest(true);
    try {
      const entry: GuestbookDoc = {
        id: `guest-${Math.random().toString(36).substring(2, 9)}`,
        bioId: bio.id,
        signerName: guestName,
        messageText: guestMsg,
        createdAt: new Date().toISOString()
      };
      await dbService.addGuestbookEntry(entry);
      
      confetti({
        particleCount: 30,
        spread: 30,
        colors: ["#7C3AED", "#22D3EE"]
      });

      setGuestName("");
      setGuestMsg("");
      
      // Reload logs
      const updatedLogs = await dbService.getGuestbook(bio.id);
      setGuestbookLogs(updatedLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setSigningGuest(false);
    }
  };

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 1500);
  };

  // Action clicks tracker
  const handleBlockClick = (block: ContentBlock) => {
    if (isPreview) return; // ignore previews
    if (block.type === "button" || block.type === "product") {
      const currentClicks = block.clicks || 0;
      const updatedBlocks = bio?.blocks.map((b) =>
        b.id === block.id ? { ...b, clicks: currentClicks + 1 } : b
      );
      if (updatedBlocks && bio) {
        dbService.updateBio(bio.id, { blocks: updatedBlocks });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#050816]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-xs font-orbitron tracking-widest text-cyan-400">
          BEAMING PORTAL SCANNER...
        </p>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#050816] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 animate-pulse" />
        <h3 className="text-lg font-orbitron font-bold text-white mt-4 uppercase">ORBITAL CORRUPTION</h3>
        <p className="text-xs text-gray-400 mt-2">{error}</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-purple-950 border border-purple-500/30 text-xs rounded-lg hover:bg-purple-900 transition-colors">
          Return to Galactic Core
        </Link>
      </div>
    );
  }

  // Lookup themes config styles
  const activePreset = ALL_THEMES.find((t) => t.id === bio.themeId) || ALL_THEMES[0];
  const theme = bio.themeId === "custom" && bio.customTheme ? bio.customTheme : activePreset.settings;

  // Custom Social Platform Icons matching Gen-Z brands
  const socialIcons: { [key: string]: string } = {
    instagram: "📸",
    youtube: "📺",
    tiktok: "🎵",
    x: "🐦",
    discord: "🎮",
    github: "💻",
    twitch: "👾",
    spotify: "🎧",
    website: "🌐",
    email: "✉️"
  };

  return (
    <div
      className="flex-1 flex flex-col items-center min-h-screen relative p-6 md:p-8"
      style={{ background: theme.backgroundValue }}
    >
      {/* Cover Image backdrop banner */}
      <div className="absolute top-0 left-0 w-full h-44 md:h-52 overflow-hidden -z-10 select-none">
        <img
          src={bio.coverURL || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200"}
          alt="Backdrop cover banner"
          className="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-slate-950/0 to-transparent" />
      </div>

      {/* Profile Container wrapper */}
      <div className="w-full max-w-lg mt-24 md:mt-28 flex flex-col gap-6 text-center">
        
        {/* Avatar, Username, description HUD card */}
        <div className="flex flex-col items-center">
          
          {/* Avatar sphere wrapper */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden p-1 bg-gradient-to-r relative shadow-[0_0_20px_var(--primary-glow)]"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.accentColor}, #d946ef, #22d3ee)`
            }}
          >
            <img
              src={bio.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=voyager"}
              alt={bio.displayName}
              className="w-full h-full rounded-full object-cover bg-slate-950"
            />
          </div>

          {/* User Display name and badges */}
          <h2
            className="text-xl md:text-2xl font-extrabold mt-4 font-orbitron flex items-center gap-1.5 justify-center tracking-wide"
            style={{ color: theme.textColor }}
          >
            {bio.displayName}
            {owner?.verified && (
              <span
                className="inline-flex items-center justify-center cursor-help animate-pulse"
                title={`Verified ${owner.role.replace("_", " ")} - ${owner.verificationBadgeId}`}
              >
                {owner.verificationIcon || "⚡"}
              </span>
            )}
          </h2>

          <p className="text-xs font-mono font-semibold tracking-widest mt-1 opacity-80" style={{ color: theme.accentColor }}>
            bio.space/{bio.id}
          </p>

          <p className="text-xs text-gray-300 mt-3 max-w-sm leading-relaxed whitespace-pre-wrap">
            {bio.bioDescription}
          </p>
        </div>

        {/* Dynamic Social Links strip */}
        {Object.keys(bio.socialLinks).length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            {Object.entries(bio.socialLinks).map(([key, url]) => {
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url.startsWith("http") ? url : `https://${url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-950/70 border border-white/10 hover:border-cyan-400 hover:scale-110 active:scale-95 transition-all text-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]"
                  style={{
                    boxShadow: `0 0 10px rgba(0, 0, 0, 0.4)`
                  }}
                  title={key.toUpperCase()}
                >
                  <span>{socialIcons[key] || "🔗"}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Content Block modular stack */}
        <div className="flex flex-col gap-4">
          {bio.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => {
              
              // CSS Styles based on custom settings button types
              const cardClass = "p-4 glass-panel border-purple-500/10 text-left transition-all relative overflow-hidden group";
              const buttonTextStyles = { color: theme.textColor };
              const accentBorder = { borderColor: theme.accentColor + "44" };

              return (
                <div
                  key={block.id}
                  onClick={() => handleBlockClick(block)}
                  className={cardClass}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderWidth: "1px",
                    borderColor: theme.cardBorder
                  }}
                >
                  {/* Backdrop subtle ambient beam */}
                  <div className="absolute top-0 left-0 w-1 h-full opacity-60" style={{ background: theme.accentColor }} />

                  {/* Heading Block */}
                  {block.type === "heading" && (
                    <div className="py-1">
                      {block.data.level === "h1" && <h1 className="text-xl font-bold font-orbitron text-white">{block.data.text}</h1>}
                      {block.data.level === "h2" && <h2 className="text-base font-bold font-orbitron text-gray-200">{block.data.text}</h2>}
                      {block.data.level === "h3" && <h3 className="text-sm font-bold font-orbitron text-purple-300">{block.data.text}</h3>}
                    </div>
                  )}

                  {/* Text Block */}
                  {block.type === "text" && (
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {block.data.text}
                    </p>
                  )}

                  {/* Link Button Block */}
                  {block.type === "button" && (
                    <a
                      href={block.data.url?.startsWith("http") ? block.data.url : `https://${block.data.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-between w-full font-orbitron font-bold text-xs tracking-wider uppercase py-2 cursor-pointer transition-all ${
                        block.data.animation === "pulse" ? "animate-pulse-glow" : ""
                      } ${block.data.animation === "float" ? "hover:-translate-y-1" : ""}`}
                      style={{ color: theme.textColor }}
                    >
                      <span>{block.data.label || "Beam link Destination"}</span>
                      <ExternalLink className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
                    </a>
                  )}

                  {/* Video block */}
                  {block.type === "video" && block.data.videoUrl && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/5">
                      <iframe
                        src={block.data.videoUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full border-none"
                        allowFullScreen
                        title="Embedded Video block"
                      />
                    </div>
                  )}

                  {/* Music block */}
                  {block.type === "music" && block.data.musicUrl && (
                    <div className="w-full h-[80px] rounded-xl overflow-hidden bg-black/40">
                      <iframe
                        src={block.data.musicUrl.replace("/track/", "/embed/track/")}
                        className="w-full h-full border-none"
                        allow="encrypted-media"
                        title="Embedded Spotify music track"
                      />
                    </div>
                  )}

                  {/* Countdown Clock Block */}
                  {block.type === "countdown" && (
                    <div className="flex flex-col gap-1.5 text-center py-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest">{block.data.label || "Time to launch"}</span>
                      <span className="font-orbitron font-extrabold text-lg text-cyan-400 tracking-wider">
                        {timeLeft[block.id] || "COMPUTING SYSTEM ORBIT..."}
                      </span>
                    </div>
                  )}

                  {/* Custom HTML Block */}
                  {block.type === "html" && block.data.code && (
                    <div dangerouslySetInnerHTML={{ __html: block.data.code }} />
                  )}

                  {/* FAQ Block */}
                  {block.type === "faq" && block.data.items && (
                    <details className="group cursor-pointer">
                      <summary className="font-semibold text-xs text-gray-200 flex items-center justify-between select-none">
                        <span>{block.data.items[0]?.q || "Query Payload"}</span>
                        <ChevronDown className="w-4 h-4 text-purple-400 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-2">
                        {block.data.items[0]?.a || "Answer Transmission"}
                      </p>
                    </details>
                  )}

                  {/* Divider Block */}
                  {block.type === "divider" && (
                    <div
                      className="h-0.5 w-full rounded"
                      style={{
                        background: `linear-gradient(to right, transparent, ${theme.accentColor}, transparent)`
                      }}
                    />
                  )}

                  {/* Newsletter subscription */}
                  {block.type === "newsletter" && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-orbitron font-bold text-white">{block.data.title || "Join Newsletter"}</h4>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          placeholder={block.data.placeholder || "Enter email..."}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Coordinates registered! Welcome to the loop.");
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ background: theme.accentColor }}
                        >
                          {block.data.buttonLabel || "Join"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Crypto address Donation Block */}
                  {block.type === "donation" && block.data.address && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-left">
                        <span className="text-[9px] uppercase text-gray-500 font-bold block">{block.data.platform?.toUpperCase() || "WALLET"}</span>
                        <span className="text-xs font-mono font-bold text-gray-300 break-all">{block.data.address}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyClipboard(block.data.address);
                        }}
                        className="p-2 rounded bg-slate-900 border border-white/10 text-gray-400 hover:text-cyan-400 cursor-pointer"
                        title="Copy Wallet coordinates"
                      >
                        {copiedText === block.data.address ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Store product card block */}
                  {block.type === "product" && (
                    <div className="flex gap-4">
                      {block.data.imageUrl && (
                        <img
                          src={block.data.imageUrl}
                          alt={block.data.title}
                          className="w-20 h-20 rounded-lg object-cover border border-white/10"
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-white">{block.data.title}</h4>
                            <span className="text-xs text-cyan-400 font-bold font-mono">{block.data.price}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-2 mt-1">{block.data.desc}</p>
                        </div>
                        <a
                          href={block.data.link?.startsWith("http") ? block.data.link : `https://${block.data.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 text-[10px] uppercase font-bold text-cyan-400 hover:text-white flex items-center gap-1"
                        >
                          Buy Product <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* PDF download block */}
                  {block.type === "pdf" && (
                    <a
                      href={block.data.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between w-full text-xs font-semibold"
                      style={{ color: theme.textColor }}
                    >
                      <span>{block.data.label || "Download Document Attachment"}</span>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-white/10 font-mono text-cyan-400">PDF</span>
                    </a>
                  )}

                  {/* Contact form block */}
                  {block.type === "contact" && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">Direct Comm-link Mailbox</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Your payload message..."
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert("Message signal sent directly to owner.");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                          style={{ background: theme.accentColor }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Photo gallery Grid block */}
                  {block.type === "gallery" && block.data.images && (
                    <div className="grid grid-cols-2 gap-2">
                      {block.data.images.map((imgUrl: string, i: number) => (
                        <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/5">
                          <img src={imgUrl} alt="Gallery item" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
        </div>

        {/* Dynamic Anonymous Messages Inbox Section */}
        {bio.messagesEnabled && (
          <div
            className="p-5 glass-panel text-left flex flex-col gap-4 bg-slate-950/40"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            <h4 className="text-xs uppercase font-orbitron font-bold text-white tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400 animate-pulse" />
              ANONYMOUS FREQUENCY TRANSMITTER
            </h4>
            <p className="text-[10px] text-gray-400">Send an anonymous signal straight to this profile's dashboard log.</p>

            {anonStatus === "sent" && (
              <div className="p-2 bg-green-950/40 border border-green-500/50 rounded-lg text-green-300 text-[10px] font-semibold flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>Frequency locked and signal dispatched!</span>
              </div>
            )}

            <form onSubmit={handleSendAnonMessage} className="flex flex-col gap-3">
              <textarea
                required
                rows={3}
                placeholder="Type your message payload..."
                value={anonMsg}
                onChange={(e) => setAnonMsg(e.target.value)}
                className="w-full p-3 bg-slate-950/70 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={sendingAnon || !anonMsg.trim()}
                className="w-full py-2 px-3 rounded-lg text-xs font-orbitron font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: theme.accentColor }}
              >
                {sendingAnon ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>DISPATCH ANONYMOUS BEAM</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Dynamic Guestbook Signature block */}
        {bio.guestbookEnabled && (
          <div
            className="p-5 glass-panel text-left flex flex-col gap-5 bg-slate-950/40"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder
            }}
          >
            <h4 className="text-xs uppercase font-orbitron font-bold text-white tracking-widest flex items-center gap-1.5">
              <User className="w-4 h-4 text-accent animate-pulse" />
              GUESTBOOK SIGNATURE CONSOLE
            </h4>

            {/* Signature entry form */}
            <form onSubmit={handleSignGuestbook} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Your Signature Name / Handle"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Your welcome transmission message..."
                  value={guestMsg}
                  onChange={(e) => setGuestMsg(e.target.value)}
                  className="p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={signingGuest}
                className="w-full py-2 px-3 rounded-lg text-xs font-orbitron font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: theme.accentColor }}
              >
                {signingGuest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-white/20" />
                    <span>SIGN PROFILE GUESTBOOK</span>
                  </>
                )}
              </button>
            </form>

            {/* Previous signs grid */}
            <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4">
              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Flight Log Registry</span>
              {guestbookLogs.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic">No signatures recorded yet. Sign first!</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {guestbookLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400">{log.signerName}</span>
                        <span className="text-[8px] text-gray-500 font-mono">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 mt-1 leading-relaxed text-[11px]">{log.messageText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
