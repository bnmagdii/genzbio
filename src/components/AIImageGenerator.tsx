import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  User, 
  RefreshCw, 
  Bookmark, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ImageIcon, 
  HelpCircle,
  FileImage,
  Layers,
  Palette,
  Pocket
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BioPageConfig, AIGeneratedImage } from '../types';

interface AIImageGeneratorProps {
  bios: BioPageConfig[];
  onRefreshBios: () => Promise<void>;
  onShowNotification: (title: string, message: string) => void;
}

export default function AIImageGenerator({ bios, onRefreshBios, onShowNotification }: AIImageGeneratorProps) {
  const [gender, setGender] = useState('Androgynous');
  const [style, setStyle] = useState('3D Style');
  const [background, setBackground] = useState('Cyberpunk neon glow');
  const [colors, setColors] = useState('Vibrant premium dark');
  const [accessories, setAccessories] = useState('Cyber spectacles');

  const [generating, setGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<AIGeneratedImage | null>(null);
  const [activeBase64, setActiveBase64] = useState<string | null>(null);

  const [savingToProfileId, setSavingToProfileId] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);

  // Saved Generations
  const [savedImages, setSavedImages] = useState<AIGeneratedImage[]>([]);
  const [fetchingSaved, setFetchingSaved] = useState(true);

  const genderOptions = ['Masculine', 'Feminine', 'Androgynous', 'None / Abstract'];
  const styleOptions = [
    'Profile Picture', 'Avatar', 'Anime Style', 'Cartoon Style', 
    '3D Style', 'Gaming Avatar', 'Professional Portrait', 'Gradient Portrait'
  ];

  useEffect(() => {
    fetchSavedImages();
    if (bios.length > 0) {
      setSavingToProfileId(bios[0].id);
    }
  }, [bios]);

  const fetchSavedImages = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setFetchingSaved(true);
    try {
      const q = query(collection(db, 'ai_images'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIGeneratedImage[];
      
      list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSavedImages(list);
    } catch (err) {
      console.error("Error fetching saved images:", err);
    } finally {
      setFetchingSaved(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setGenerating(true);
    setActiveImage(null);
    setActiveBase64(null);

    try {
      // 1. Fetch base64 from server-side proxy
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, style, background, colors, accessories })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to generate image.");
      }

      const data = await res.json();
      const base64Str = data.base64;
      setActiveBase64(base64Str);

      // 2. Upload to Cloudinary
      const fileId = `ai_${Date.now()}`;
      const fileStringData = `data:image/png;base64,${base64Str}`;
      const uploadTask = uploadToCloudinary(fileStringData, `${fileId}.png`, 'ai-portrait-gen');
      const downloadUrl = await uploadTask.promise;

      // 3. Save reference in firestore
      const promptText = `Style: ${style}, Gender: ${gender}, Background: ${background}, Colors: ${colors}, Accessories: ${accessories}`;
      
      const newImageDoc = {
        userId,
        imageUrl: downloadUrl,
        prompt: promptText,
        createdAt: new Date().toISOString(),
        gender,
        style,
        background,
        colors,
        accessories,
        favorite: false
      };

      const docRef = await addDoc(collection(db, 'ai_images'), newImageDoc);
      
      const fullAsset = {
        id: docRef.id,
        ...newImageDoc
      } as AIGeneratedImage;

      setActiveImage(fullAsset);
      onShowNotification("Portrait Generated", "Your custom high-fidelity avatar is uploaded to Cloud Storage!");
      fetchSavedImages();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyToProfile = async (specificUrl?: string) => {
    const urlToApply = specificUrl || activeImage?.imageUrl;
    if (!savingToProfileId || !urlToApply) return;

    setIsApplying(true);
    try {
      const bioRef = doc(db, 'bios', savingToProfileId);
      await updateDoc(bioRef, {
        avatarUrl: urlToApply,
        updatedAt: new Date().toISOString()
      });

      await onRefreshBios();
      onShowNotification("Avatar Installed", "Successfully mapped your AI masterpiece as your profile picture!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign avatar.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownload = (imageUrl: string, filename = "genz-profile.png") => {
    // Open in separate window or trigger clean fetch-blob download
    onShowNotification("Downloading Image", "Opening target high-definition artwork...");
    window.open(imageUrl, '_blank');
  };

  const handleDeleteImage = async (imgId: string) => {
    try {
      await deleteDoc(doc(db, 'ai_images', imgId));
      setSavedImages(prev => prev.filter(img => img.id !== imgId));
      if (activeImage?.id === imgId) {
        setActiveImage(null);
        setActiveBase64(null);
      }
      onShowNotification("Removed Artwork", "Image logs deleted safely.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in text-white">
      {/* HEADER */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/5 text-pink-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <ImageIcon className="w-3 h-3 text-pink-400" />
          Creative Image Generator
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-zinc-400 bg-clip-text text-transparent">
          AI Profile PFP Generator
        </h1>
        <p className="text-sm text-zinc-400">
          Inimitable custom vectors, cartoons, anime avatars, and gaming personas styled to suit Gen-Z aesthetics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR FOR INPUT */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerate} className="p-6 rounded-3xl bg-[#090d16] border border-white/5 backdrop-blur-md space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-pink-300">Avatar Specifications</h2>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gender / Representation</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-pink-500/50 outline-none"
                id="ai-image-gender"
              >
                {genderOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Artist Style Vibe</label>
              <select
                value={style}
                onChange={e => setStyle(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-pink-500/50 outline-none"
                id="ai-image-style"
              >
                {styleOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Overlay Background Vibe</label>
              <input
                type="text"
                value={background}
                onChange={e => setBackground(e.target.value)}
                placeholder="e.g. frosted glassmorphism, vaporwave neon"
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-pink-500/50 outline-none"
                id="ai-image-bg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Custom Colors Palette</label>
              <input
                type="text"
                value={colors}
                onChange={e => setColors(e.target.value)}
                placeholder="e.g. violet accent, radioactive slime green"
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-pink-500/50 outline-none"
                id="ai-image-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Accessories / Accents</label>
              <input
                type="text"
                value={accessories}
                onChange={e => setAccessories(e.target.value)}
                placeholder="e.g. over-ear headphones, glowing neon eyes"
                className="w-full bg-[#030712] border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-pink-500/50 outline-none"
                id="ai-image-accessories"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full cursor-pointer py-3.5 mt-2 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 text-xs font-black uppercase tracking-widest text-white rounded-xl shadow shadow-pink-600/10 flex items-center justify-center gap-2"
              id="btn-ai-image-generate"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Drawing masterpiece...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  Compile Custom PFP
                </>
              )}
            </button>
          </form>
        </div>

        {/* ARTWORK RENDER SECTION */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {generating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[420px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
                  <ImageIcon className="w-8 h-8 text-pink-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="font-bold text-sm text-neutral-200">Processing Pixels...</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Synthesizing lighting, vectors, and rendering details into a premium output.
                </p>
              </motion.div>
            )}

            {!generating && !activeImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center rounded-3xl bg-[#090d16] border border-white/5 flex flex-col items-center justify-center gap-4 min-h-[420px]"
              >
                <div className="w-16 h-16 rounded-full bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-zinc-500">
                  <FileImage className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-neutral-200 uppercase tracking-widest">Masterpiece Sandbox</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Adjust gender, color gradient overlays, accessories, and click generate to forge premium custom avatars.
                  </p>
                </div>
              </motion.div>
            )}

            {!generating && activeImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-[#090d16] border border-white/5 flex flex-col md:flex-row gap-6 items-center min-h-[420px]"
              >
                {/* Image output */}
                <div className="relative group shrink-0">
                  <img 
                    src={activeBase64 ? `data:image/png;base64,${activeBase64}` : activeImage.imageUrl} 
                    alt="AI Generated Output" 
                    referrerPolicy="no-referrer"
                    className="w-56 h-56 rounded-2xl object-cover border border-white/10 shadow-2xl transition-transform duration-300 group-hover:scale-102"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[9px] font-mono">
                    Aspect 1:1
                  </div>
                </div>

                {/* Meta & actions */}
                <div className="flex-1 space-y-5 text-left w-full">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-400">Successfully Rendered</span>
                    <h3 className="text-lg font-extrabold text-white mt-0.5">{activeImage.style}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 italic font-semibold leading-relaxed">
                      "{activeImage.prompt}"
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(activeImage.imageUrl)}
                      className="cursor-pointer flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> High-Res URL
                    </button>
                  </div>

                  {/* Direct Profile Linker */}
                  {bios.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.04] space-y-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Deploy directly as Avatar</span>
                      
                      <div className="flex gap-2">
                        <select
                          value={savingToProfileId}
                          onChange={e => setSavingToProfileId(e.target.value)}
                          className="flex-1 bg-[#030712] border border-white/5 rounded-xl px-3 py-2 text-xs focus:border-pink-500 outline-none"
                          id="ai-image-subdomain-select"
                        >
                          {bios.map(b => (
                            <option key={b.id} value={b.id}>/{b.username} ({b.displayName})</option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleApplyToProfile()}
                          disabled={isApplying}
                          className="cursor-pointer shrink-0 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 px-4 py-2 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1"
                          id="btn-ai-image-apply"
                        >
                          {isApplying ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              Install <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* GALLERY OF PAST GENERATIONS */}
      <div className="p-6 rounded-3xl bg-[#090d16] border border-white/5">
        <h3 className="text-sm font-black uppercase tracking-wider text-purple-300 mb-4">Historic Creations Gallery</h3>

        {fetchingSaved ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-zinc-500 font-bold tracking-wider">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            Synchronizing gallery index...
          </div>
        ) : savedImages.length === 0 ? (
          <div className="text-center py-10 text-xs text-zinc-500 font-semibold">
            Your gallery is empty. Create your first compiled masterpiece to begin building your AI portfolio archives!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {savedImages.map((saved) => (
              <div 
                key={saved.id}
                className="group relative rounded-2xl overflow-hidden border border-white/[0.04] bg-white/[0.01] flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={saved.imageUrl} 
                    alt="Historic representation" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(saved.imageUrl)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Open Image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(saved.id)}
                      className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Delete artwork file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-2 text-left bg-[#030712]/50">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#06B6D4] truncate">
                    {saved.style}
                  </p>
                  
                  {bios.length > 0 && (
                    <button
                      onClick={() => handleApplyToProfile(saved.imageUrl)}
                      className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/10 text-purple-300 font-bold text-[8px] uppercase tracking-wider rounded-lg transition-colors"
                    >
                      Use as Active PFP
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
