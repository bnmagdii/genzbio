import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Bookmark, 
  BookmarkCheck, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { BioPageConfig, AIGeneratedBio } from '../types';

interface AIBioGeneratorProps {
  bios: BioPageConfig[];
  onRefreshBios: () => Promise<void>;
  onShowNotification: (title: string, message: string) => void;
}

export default function AIBioGenerator({ bios, onRefreshBios, onShowNotification }: AIBioGeneratorProps) {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [niche, setNiche] = useState('');
  const [interests, setInterests] = useState('');
  const [tone, setTone] = useState('Creator');
  
  const [loading, setLoading] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{
    shortBio: string;
    mediumBio: string;
    longBio: string;
    emojiVersion: string;
    seoVersion: string;
  } | null>(null);

  const [savingToProfileId, setSavingToProfileId] = useState<string>('');
  const [applyingBioKey, setApplyingBioKey] = useState<string>('mediumBio'); // which generated bio to apply
  const [isApplying, setIsApplying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Saved Generations
  const [savedBios, setSavedBios] = useState<AIGeneratedBio[]>([]);
  const [fetchingSaved, setFetchingSaved] = useState(true);

  const toneOptions = [
    { value: 'Professional', label: '💼 Professional' },
    { value: 'Creator', label: '✨ Creator' },
    { value: 'Funny', label: '🤪 Funny' },
    { value: 'Gamer', label: '👾 Gamer' },
    { value: 'Minimal', label: '📐 Minimal' },
    { value: 'Business', label: '🚀 Business' },
    { value: 'Luxury', label: '👑 Luxury' },
    { value: 'Personal Brand', label: '🔥 Personal Brand' }
  ];

  useEffect(() => {
    fetchSavedBios();
    if (bios.length > 0) {
      setSavingToProfileId(bios[0].id);
    }
  }, [bios]);

  const fetchSavedBios = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setFetchingSaved(true);
    try {
      const q = query(collection(db, 'ai_bios'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIGeneratedBio[];
      
      // Sort newest first
      list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedBios(list);
    } catch (err) {
      console.error("Error fetching saved bios:", err);
    } finally {
      setFetchingSaved(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !profession) {
      alert("Please provide at least Name and Profession.");
      return;
    }

    setLoading(true);
    setGeneratedResults(null);
    try {
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, profession, niche, interests, tone })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to generate bios.");
      }

      const data = await res.json();
      setGeneratedResults(data);
      onShowNotification("Generation Successful", "Your premium aesthetic bios are generated perfectly!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToFavorites = async (bioType: string, bioText: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const isDuplicate = savedBios.some(item => item.shortBio === bioText || item.mediumBio === bioText);
      if (isDuplicate) {
        onShowNotification("Already Saved", "This bio is already saved in your favorites list.");
        return;
      }

      const newBioDoc = {
        userId,
        shortBio: bioText,
        mediumBio: bioText,
        longBio: bioText,
        emojiVersion: bioText,
        seoVersion: bioText,
        tone: `${tone} (${bioType})`,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'ai_bios'), newBioDoc);
      onShowNotification("Saved to Favorites", "Saved to your local Gen-Z AI archives.");
      fetchSavedBios();
    } catch (err) {
      console.error(err);
      alert("Failed to save generation.");
    }
  };

  const handleDeleteSavedBio = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'ai_bios', docId));
      setSavedBios(prev => prev.filter(b => b.id !== docId));
      onShowNotification("Deleted Archive", "AI biography record removed successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyToProfile = async () => {
    if (!savingToProfileId || !generatedResults) return;
    
    const textToApply = (generatedResults as any)[applyingBioKey];
    if (!textToApply) return;

    setIsApplying(true);
    try {
      const bioRef = doc(db, 'bios', savingToProfileId);
      await updateDoc(bioRef, {
        description: textToApply,
        updatedAt: new Date().toISOString()
      });

      await onRefreshBios();
      onShowNotification("Bio Synced", "Successfully applied the active AI bio to your profile details.");
    } catch (err) {
      console.error(err);
      alert("Failed to apply bio to profile.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in text-white">
      {/* HEADER SECTION */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Neural Bio Generator
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-zinc-400 bg-clip-text text-transparent">
          AI Bio Accelerator
        </h1>
        <p className="text-sm text-zinc-400">
          Transform your credentials into high-retention, digital profiles optimized for Gen-Z engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT FORM SIDE */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#090d16] border border-white/5 backdrop-blur-md relative space-y-5">
            <div className="absolute top-[5%] right-[5%] w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            
            <h2 className="text-base font-black uppercase tracking-wider text-purple-300">Bio Specifications</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Name / Handle</label>
              <input
                type="text"
                placeholder="e.g. Zack"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-purple-500/50 outline-none transition-colors"
                id="ai-bio-name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Primary Profession</label>
              <input
                type="text"
                placeholder="e.g. UI Designer, Indie Hacker, Streamer"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                required
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-purple-500/50 outline-none transition-colors"
                id="ai-bio-profession"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Niche</label>
              <input
                type="text"
                placeholder="e.g. Tech wear fashion, Solopreneur, React development"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-purple-500/50 outline-none transition-colors"
                id="ai-bio-niche"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Specific Interests / Buzzwords</label>
              <input
                type="text"
                placeholder="e.g. coffee, mechanical keyboards, generative design"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-purple-500/50 outline-none transition-colors"
                id="ai-bio-interests"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Vibe Tone / Dialect Check</label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTone(opt.value)}
                    className={`text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      tone === opt.value
                        ? 'border-purple-500/50 bg-purple-500/10 text-white'
                        : 'border-white/5 bg-[#030712] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-90 active:scale-98 transition-all text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
              id="btn-ai-bio-generate"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating copy...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Bio Copies
                </>
              )}
            </button>
          </form>
        </div>

        {/* RESULTS RENDER SIDE */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[400px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-neutral-200">Assembling Aesthetics...</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Analyzing vibe preferences and constructing tailored copies using Generative intelligence.
                </p>
                <div className="w-full max-w-xs bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-2/3 animate-pulse" />
                </div>
              </motion.div>
            )}

            {!loading && !generatedResults && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[400px]"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-500">
                  <FileText className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-200 uppercase tracking-widest">Awaiting Generator</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Provide credentials and select tone options in the panel to generate premium digital bios.
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && generatedResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Result Items */}
                <div className="space-y-4">
                  {[
                    { id: 'shortBio', label: '⚡ Short Dialect', value: generatedResults.shortBio },
                    { id: 'mediumBio', label: '✨ Medium Accent (Standard)', value: generatedResults.mediumBio },
                    { id: 'longBio', label: '📖 Custom Long Bio', value: generatedResults.longBio },
                    { id: 'emojiVersion', label: '👾 Emoji Cluster', value: generatedResults.emojiVersion },
                    { id: 'seoVersion', label: '🔍 Discoverability (SEO)', value: generatedResults.seoVersion },
                  ].map((block) => (
                    <div 
                      key={block.id}
                      className="p-5 rounded-2xl bg-[#090d16] border border-white/5 hover:border-purple-500/20 transition-colors group relative"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#06B6D4]">{block.label}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyToClipboard(block.value, block.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                            title="Copy Copy text"
                          >
                            {copiedKey === block.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleSaveToFavorites(block.label, block.value)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-pink-400 transition-colors"
                            title="Save to Favorites list"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-white leading-relaxed font-semibold pr-10">
                        {block.value}
                      </p>
                      
                      {copiedKey === block.id && (
                        <div className="absolute bottom-2.5 right-4 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                          Copied!
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Direct Action Hub */}
                {bios.length > 0 && (
                  <div className="p-6 rounded-3xl bg-[#0F172A] border border-[#7C3AED]/20 relative">
                    <div className="absolute top-[10%] right-[10%] w-16 h-16 bg-[#7C3AED]/5 rounded-full blur-xl pointer-events-none" />
                    
                    <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct profile synchronization
                    </h3>
                    <p className="text-[11px] text-zinc-400 mb-4 font-semibold">
                      Directly sync a choice of these generated bios as the active header description of any of your link-in-bios.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-zinc-500">Selected Bio Version</span>
                        <select
                          value={applyingBioKey}
                          onChange={e => setApplyingBioKey(e.target.value)}
                          className="w-full bg-[#030712] border border-white/5 rounded-xl px-3 py-2 text-xs focus:border-purple-500 outline-none"
                          id="ai-bio-version-select"
                        >
                          <option value="shortBio">Short Dialect</option>
                          <option value="mediumBio">Medium Accent (Standard)</option>
                          <option value="longBio">Custom Long Bio</option>
                          <option value="emojiVersion">Emoji Cluster</option>
                          <option value="seoVersion">Discoverability (SEO)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase text-zinc-500">Destination Subdomain</span>
                        <select
                          value={savingToProfileId}
                          onChange={e => setSavingToProfileId(e.target.value)}
                          className="w-full bg-[#030712] border border-white/5 rounded-xl px-3 py-2 text-xs focus:border-purple-500 outline-none"
                          id="ai-bio-subdomain-select"
                        >
                          {bios.map(b => (
                            <option key={b.id} value={b.id}>/{b.username} ({b.displayName})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleApplyToProfile}
                      disabled={isApplying}
                      className="w-full cursor-pointer mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow shadow-purple-600/10 flex items-center justify-center gap-2"
                      id="btn-ai-bio-apply"
                    >
                      {isApplying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Syncing profile...
                        </>
                      ) : (
                        <>
                          Apply Selected Copy Directly <ChevronRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FA VORITES / LOGS OVERLAY */}
      <div className="p-6 rounded-3xl bg-[#090d16] border border-white/5 relative">
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 mb-4">Saved Creations</h3>

        {fetchingSaved ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            Loading saved configurations...
          </div>
        ) : savedBios.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-semibold">
             No registered bios saved in favorites. Click the bookmark icon above to save your favorite gems!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedBios.map((saved) => (
              <div 
                key={saved.id}
                className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/25 px-2 py-0.5 rounded-full">
                      {saved.tone}
                    </span>
                    <button
                      onClick={() => handleDeleteSavedBio(saved.id)}
                      className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                      title="Remove generation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                    {saved.shortBio}
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/[0.03]">
                  <span className="text-[9px] text-zinc-650 font-mono">
                    {new Date(saved.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(saved.shortBio, saved.id)}
                    className="text-[9px] font-black uppercase tracking-wider text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1"
                  >
                    {copiedKey === saved.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Quick Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
