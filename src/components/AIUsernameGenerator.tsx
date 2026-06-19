import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Bookmark, 
  Trash2, 
  Globe,
  User,
  HelpCircle,
  FileText
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { BioPageConfig, AIGeneratedUsername } from '../types';

interface AIUsernameGeneratorProps {
  bios: BioPageConfig[];
  onShowNotification: (title: string, message: string) => void;
}

export default function AIUsernameGenerator({ bios, onShowNotification }: AIUsernameGeneratorProps) {
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('react development');
  const [vibe, setVibe] = useState('minimalist coding wizard');
  
  const [loading, setLoading] = useState(false);
  const [handlesList, setHandlesList] = useState<string[]>([]);
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  // Saved Handles
  const [savedUsernames, setSavedUsernames] = useState<string[]>([]);
  const [fetchingSaved, setFetchingSaved] = useState(true);

  useEffect(() => {
    fetchSavedUsernames();
  }, []);

  const fetchSavedUsernames = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setFetchingSaved(true);
    try {
      const q = query(collection(db, 'ai_usernames'), where('userId', '==', userId));
      const snap = await getDocs(q);
      
      const list: string[] = [];
      snap.docs.forEach(doc => {
        const arr = doc.data().usernames || [];
        list.push(...arr);
      });

      // Remove duplicates
      setSavedUsernames(Array.from(new Set(list)));
    } catch (err) {
      console.error("Error fetching saved usernames:", err);
    } finally {
      setFetchingSaved(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHandlesList([]);
    try {
      const res = await fetch('/api/ai/generate-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, niche, vibe })
      });

      if (!res.ok) {
        throw new Error("Failed to compile custom usernames.");
      }

      const data = await res.json();
      setHandlesList(data.usernames || []);
      onShowNotification("Handles Compiled", "8 premium aesthetic usernames generated!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Username generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHandle = (handleStr: string) => {
    navigator.clipboard.writeText(handleStr);
    setCopiedHandle(handleStr);
    setTimeout(() => setCopiedHandle(null), 2000);
  };

  const handleSaveToFavorites = async (singleHandle: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      if (savedUsernames.includes(singleHandle)) {
        onShowNotification("Already Saved", "Account handle already in Favorites.");
        return;
      }

      const newDoc = {
        userId,
        usernames: [singleHandle],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'ai_usernames'), newDoc);
      onShowNotification("Handle Saved", "Cool moniker saved to archives.");
      fetchSavedUsernames();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSavedHandle = async (singleHandle: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(collection(db, 'ai_usernames'), where('userId', '==', userId));
      const snap = await getDocs(q);
      
      // Look for the doc that contains this username and delete it
      for (const d of snap.docs) {
        const arr = d.data().usernames || [];
        if (arr.includes(singleHandle)) {
          await deleteDoc(doc(db, 'ai_usernames', d.id));
        }
      }

      setSavedUsernames(prev => prev.filter(u => u !== singleHandle));
      onShowNotification("Removed Handle", "Moniker removed from favorites.");
    } catch (err) {
      console.error("Error deleting saved username Doc:", err);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in text-white">
      {/* HEADER */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <Globe className="w-3 h-3 text-sky-400" />
          Moniker Identifier Forge
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-zinc-400 bg-clip-text text-transparent">
          AI Username Forge
        </h1>
        <p className="text-sm text-zinc-400">
          Sync premium aesthetic usernames and web handles constructed around exclusive tech, design, or gamer culture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS PANEL */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#090d16] border border-white/5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#06B6D4]">Vibe Specs</h2>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Your Base Name</label>
              <input
                type="text"
                placeholder="e.g. Zack"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-sky-550 outline-none transition-colors"
                id="ai-username-name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Professional Niche</label>
              <input
                type="text"
                placeholder="e.g. Streetwear Designer, 3D Animator"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                required
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-sky-550 outline-none transition-colors"
                id="ai-username-niche"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Aesthetic Vibe Description</label>
              <input
                type="text"
                placeholder="e.g. glitch cyberpunk minimal dark, coffee addict"
                value={vibe}
                onChange={e => setVibe(e.target.value)}
                required
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-sky-550 outline-none transition-colors"
                id="ai-username-vibe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3.5 mt-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-500 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow shadow-sky-500/10 flex items-center justify-center gap-2"
              id="btn-ai-username-generate"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Forging identities...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  Forge Usernames
                </>
              )}
            </button>
          </form>
        </div>

        {/* MONIKERS LIST OUTPUT */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[380px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
                  <Globe className="w-6 h-6 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-neutral-200">Forging Digital Codes...</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Compiling cultural buzzwords, suffixes, and custom monikers for platform handles.
                </p>
              </motion.div>
            )}

            {!loading && handlesList.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[380px]"
              >
                <div className="w-14 h-14 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-zinc-500">
                  <User className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-200 uppercase tracking-widest">Identities Cradle</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Provide credentials and style descriptions to assemble highly customizable, sleek handles.
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && handlesList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {handlesList.map((handleStr, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-[#090d16] border border-white/5 hover:border-sky-500/20 transition-all flex justify-between items-center group relative"
                  >
                    <span className="text-xs font-mono font-bold text-sky-200">@{handleStr}</span>

                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyHandle(handleStr)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                        title="Copy Handle"
                      >
                        {copiedHandle === handleStr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleSaveToFavorites(handleStr)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-pink-400 transition-colors"
                        title="Add to Favorites"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {copiedHandle === handleStr && (
                      <div className="absolute right-10 bottom-3 text-[8px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                        Copied!
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SAVED Monikers PANEL */}
      <div className="p-6 rounded-3xl bg-[#090d16] border border-white/5">
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 mb-4">Saved Monikers Vault</h3>

        {fetchingSaved ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold uppercase">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            Synchronizing monikers index...
          </div>
        ) : savedUsernames.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-semibold">
            No saved aesthetic handles discovered. Click the bookmark icon above to capture your brand identifiers.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {savedUsernames.map((u) => (
              <div 
                key={u}
                className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04] flex justify-between items-center group hover:border-[#06B6D4]/10 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-neutral-300">@{u}</span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyHandle(u)}
                    className="p-1 text-zinc-500 hover:text-white transition-colors"
                    title="Copy handle text"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteSavedHandle(u)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove handle"
                  >
                    <Trash2 className="w-3 h-3" />
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
