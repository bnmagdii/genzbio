import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Bookmark, 
  Trash2, 
  Compass,
  Palette,
  Eye,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { BioPageConfig, AIGeneratedPalette } from '../types';

interface AIColorGeneratorProps {
  bios: BioPageConfig[];
  onShowNotification: (title: string, message: string) => void;
}

export default function AIColorGenerator({ bios, onShowNotification }: AIColorGeneratorProps) {
  const [mood, setMood] = useState('hyperpop radioactive glow');
  const [loading, setLoading] = useState(false);
  const [colorsObj, setColorsObj] = useState<{
    name: string;
    colors: string[];
    primary: string;
    description: string;
  } | null>(null);

  const [savingToProfileId, setSavingToProfileId] = useState<string>('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Saved Palettes
  const [savedPalettes, setSavedPalettes] = useState<AIGeneratedPalette[]>([]);
  const [fetchingSaved, setFetchingSaved] = useState(true);

  useEffect(() => {
    fetchSavedPalettes();
    if (bios.length > 0) {
      setSavingToProfileId(bios[0].id);
    }
  }, [bios]);

  const fetchSavedPalettes = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setFetchingSaved(true);
    try {
      const q = query(collection(db, 'ai_palettes'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIGeneratedPalette[];
      setSavedPalettes(list);
    } catch (err) {
      console.error("Error fetching saved palettes:", err);
    } finally {
      setFetchingSaved(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setLoading(true);
    setColorsObj(null);
    try {
      const res = await fetch('/api/ai/generate-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      if (!res.ok) {
        throw new Error("Failed to compile color palette.");
      }

      const data = await res.json();
      setColorsObj(data);
      onShowNotification("Palette Formed", "Aesthetic neon palette assembled perfectly!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Palette generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSaveToFavorites = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !colorsObj) return;

    try {
      const isDuplicate = savedPalettes.some(p => p.name === colorsObj.name);
      if (isDuplicate) {
        onShowNotification("Already Saved", "This palette is already in your favorites archive!");
        return;
      }

      const newDoc = {
        userId,
        name: colorsObj.name,
        colors: colorsObj.colors,
        primary: colorsObj.primary,
        description: colorsObj.description,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'ai_palettes'), newDoc);
      onShowNotification("Palette Saved", "Palette coordinates logged in your local vault.");
      fetchSavedPalettes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSavedPalette = async (docId: string) => {
    try {
      await deleteDoc(doc(db, 'ai_palettes', docId));
      setSavedPalettes(prev => prev.filter(p => p.id !== docId));
      onShowNotification("Archive purged", "Palette removed.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in text-white">
      {/* HEADER */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <Palette className="w-3 h-3 text-teal-400" />
          Aesthetic Theme Blueprint
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-zinc-400 bg-clip-text text-transparent">
          AI Color Palette Generator
        </h1>
        <p className="text-sm text-zinc-400">
          Sync neon highlights, glassmorphic tints, and luxury dark shades to stylize your bio interface custom gradients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM PANEL */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#090d16] border border-white/5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#06B6D4]">Style Atmosphere</h2>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Aesthetic Mood Check</label>
              <textarea
                value={mood}
                onChange={e => setMood(e.target.value)}
                placeholder="e.g. vintage tokyo drift streetwear vibe or liquid neon pastel pink"
                className="w-full h-24 bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-cyan-550 outline-none resize-none font-semibold leading-relaxed"
                id="ai-color-mood"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Vaporwave', 'Cyberpunk', 'Luxury Gold', 'Matcha Mint', 'Space Void', 'Bubblegum'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMood(`Gen-Z premium ${preset.toLowerCase()} style`)}
                  className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] hover:border-white/12 text-[10px] text-zinc-400 font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer py-3.5 mt-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-600 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow shadow-teal-500/10 flex items-center justify-center gap-2"
              id="btn-ai-color-generate"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating spectrum...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Form Palette Blueprint
                </>
              )}
            </button>
          </form>
        </div>

        {/* OUTPUT SPECTRUM */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[380px]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-teal-500/20 border-t-teal-500 animate-spin" />
                  <Palette className="w-6 h-6 text-teal-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-neutral-200">Assembling Chromatics...</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Synthesizing compatible color coordinates for glassmorphic styling grids.
                </p>
              </motion.div>
            )}

            {!loading && !colorsObj && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[380px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-zinc-500">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-200 uppercase tracking-widest">Spectrum Playground</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Declare abstract atmospheres (e.g. "rainy streets in kyoto at night") to forge matching hex specs.
                  </p>
                </div>
              </motion.div>
            )}

            {!loading && colorsObj && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-[#090d16] border border-white/5 flex flex-col justify-between min-h-[380px]"
              >
                {/* Header info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                        AI Formulated theme
                      </span>
                      <h3 className="text-xl font-extrabold text-white mt-1.5">{colorsObj.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-semibold mt-1">
                        {colorsObj.description}
                      </p>
                    </div>

                    <button
                      onClick={handleSaveToFavorites}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-teal-400 transition-colors"
                      title="Save spectrum"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Palette Render row */}
                  <div className="grid grid-cols-5 h-28 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    {colorsObj.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleCopyHex(color)}
                        style={{ backgroundColor: color }}
                        className="h-full flex flex-col justify-end items-center p-2 text-[10px] font-mono font-bold tracking-tight text-black cursor-pointer group hover:-translate-y-1 transition-transform"
                        title={`Click to copy: ${color}`}
                      >
                        <span className="bg-white/80 backdrop-blur-md px-1 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-zinc-500 font-bold text-center">
                    💡 Click on any color slab above to copy its hex color code automatically.
                  </p>
                </div>

                {/* Copied highlight notification */}
                {copiedColor && (
                  <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-extrabold tracking-widest text-center uppercase">
                    Copied Hue Coordinates: {copiedColor}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SAVED SPECTRA */}
      <div className="p-6 rounded-3xl bg-[#090d16] border border-white/5">
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 mb-4">Saved Spectra Vault</h3>

        {fetchingSaved ? (
          <div className="py-6 flex items-center justify-center gap-2 text-zinc-500 text-xs font-bold uppercase">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            Loading vaults...
          </div>
        ) : savedPalettes.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-semibold">
            No saved palettes discovered yet. Click the bookmark icon above to capture your custom blueprints!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPalettes.map((saved) => (
              <div 
                key={saved.id}
                className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-3 relative group"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white">{saved.name}</h4>
                  <button
                    onClick={() => handleDeleteSavedPalette(saved.id)}
                    className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                    title="Purge palette"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Micro blocks render */}
                <div className="flex h-5 rounded-lg overflow-hidden border border-white/5">
                  {saved.colors.map((col, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyHex(col)}
                      style={{ backgroundColor: col }}
                      className="flex-1 cursor-pointer"
                      title={col}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center text-[9px] text-zinc-550 pt-2 border-t border-white/[0.03]">
                  <span>{saved.description.slice(0, 45)}...</span>
                  <span className="font-mono">{saved.primary}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
