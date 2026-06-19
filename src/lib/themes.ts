import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'purple_galaxy',
    name: 'Purple Galaxy',
    bgClass: 'bg-[#09090F] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2e1065]/40 via-[#09090F] to-black',
    textColor: 'text-zinc-100',
    btnClass: 'bg-white/5 hover:bg-[#7C3AED]/20 border border-[#D946EF]/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] backdrop-blur-md rounded-2xl hover:scale-[1.02] transition-all duration-300',
    fontFamily: 'font-sans',
    accentColor: '#D946EF',
    tags: ['Cosmic', 'Space', 'Purple']
  },
  {
    id: 'deep_space',
    name: 'Deep Space',
    bgClass: 'bg-[#030303] bg-[radial-gradient(at_center,_var(--tw-gradient-stops))] from-[#0f172a]/30 via-[#030303] to-black',
    textColor: 'text-neutral-200',
    btnClass: 'bg-[#09090F]/80 hover:bg-[#1e1b4b]/80 border border-white/10 text-neutral-300 rounded-xl transition-all duration-300 hover:border-[#8B5CF6]/30 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]',
    fontFamily: 'font-sans',
    accentColor: '#8B5CF6',
    tags: ['Cosmic', 'Space', 'Dark']
  },
  {
    id: 'nebula_dust',
    name: 'Nebula',
    bgClass: 'bg-black bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#581c87]/35 via-[#020617] to-black',
    textColor: 'text-[#C084FC]',
    btnClass: 'bg-white/5 hover:bg-[#D946EF]/20 border border-[#a855f7]/30 text-[#C084FC] hover:text-white backdrop-blur-xl rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]',
    fontFamily: 'font-sans',
    accentColor: '#C084FC',
    tags: ['Cosmic', 'Nebula', 'Glow']
  },
  {
    id: 'cosmic_aurora',
    name: 'Cosmic Aurora',
    bgClass: 'bg-[#020617] bg-[radial-gradient(circle_at_30%_30%,rgba(13,148,136,0.2),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.2),transparent_50%)]',
    textColor: 'text-emerald-300',
    btnClass: 'bg-[#09090F]/70 hover:bg-neutral-900/80 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all duration-300',
    fontFamily: 'font-sans',
    accentColor: '#10b981',
    tags: ['Cosmic', 'Aurora', 'Emerald']
  },
  {
    id: 'black_hole',
    name: 'Black Hole',
    bgClass: 'bg-black bg-[radial-gradient(circle_at_center,rgba(0,0,0,1)_0%,rgba(9,9,15,1)_60%,rgba(46,16,101,0.3)_100%)]',
    textColor: 'text-zinc-400',
    btnClass: 'bg-black hover:bg-zinc-950 border border-zinc-800 hover:border-purple-500/40 text-zinc-400 hover:text-purple-300 rounded-lg transition-all duration-300 hover:scale-98 tracking-widest uppercase font-mono shadow-[0_0_15px_rgba(0,0,0,0.8)]',
    fontFamily: 'font-mono',
    accentColor: '#2E1065',
    tags: ['Cosmic', 'Minimal', 'Mysterious']
  },
  {
    id: 'star_dust',
    name: 'Star Dust',
    bgClass: 'bg-[#050508] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.25),rgba(255,255,255,0))]',
    textColor: 'text-neutral-300',
    btnClass: 'bg-white/5 hover:bg-white/10 border border-zinc-700/50 hover:border-purple-400/40 text-neutral-300 hover:text-white rounded-xl backdrop-blur-sm transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    fontFamily: 'font-sans',
    accentColor: '#a855f7',
    tags: ['Cosmic', 'Stars', 'Purple']
  },
  {
    id: 'cyber_space',
    name: 'Cyber Space',
    bgClass: 'bg-[#020205] bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80")] bg-cover bg-center',
    textColor: 'text-[#22D3EE]',
    btnClass: 'bg-black/75 hover:bg-[#7C3AED]/20 border border-[#22D3EE]/40 text-[#22D3EE] hover:text-white font-mono rounded-none uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]',
    fontFamily: 'font-mono',
    accentColor: '#22D3EE',
    tags: ['Cosmic', 'Cyber', 'Tech']
  },
  {
    id: 'neon_universe',
    name: 'Neon Universe',
    bgClass: 'bg-black bg-[radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.15),transparent_40%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_40%)]',
    textColor: 'text-zinc-100',
    btnClass: 'bg-gradient-to-r from-[#7C3AED]/20 via-[#D946EF]/20 to-[#22D3EE]/20 hover:from-[#7C3AED]/35 hover:to-[#22D3EE]/35 border border-[#D946EF]/30 text-white rounded-2xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all duration-300',
    fontFamily: 'font-sans',
    accentColor: '#D946EF',
    tags: ['Cosmic', 'Neon', 'Futuristic']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    bgClass: 'bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]',
    textColor: 'text-neutral-50',
    btnClass: 'border border-fuchsia-500 bg-fuchsia-950/40 text-fuchsia-200 hover:bg-fuchsia-900/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] backdrop-blur-md rounded-lg',
    fontFamily: 'font-mono',
    accentColor: '#f43f5e',
    tags: ['Gen Z', 'Neon', 'Dark']
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    bgClass: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    textColor: 'text-white',
    btnClass: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-lg shadow-lg hover:shadow-xl rounded-2xl transition-all',
    fontFamily: 'font-sans',
    accentColor: '#38bdf8',
    tags: ['Premium', 'Smooth', 'Modern']
  },
  {
    id: 'anime_tokyo',
    name: 'Anime Tokyo',
    bgClass: 'bg-gradient-to-bl from-rose-100 via-violet-100 to-cyan-100',
    textColor: 'text-zinc-800',
    btnClass: 'bg-white hover:bg-rose-50 border-2 border-zinc-800 text-zinc-900 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-xl',
    fontFamily: 'font-sans',
    accentColor: '#fb7185',
    tags: ['Kawaii', 'Illustration']
  },
  {
    id: 'gaming_rgb',
    name: 'Gaming RGB',
    bgClass: 'bg-zinc-950',
    textColor: 'text-emerald-400',
    btnClass: 'border-2 border-emerald-500 bg-zinc-900/80 text-emerald-400 hover:text-white hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-300 rounded-md uppercase tracking-wider',
    fontFamily: 'font-mono',
    accentColor: '#10b981',
    tags: ['Gamer', 'RGB']
  },
  {
    id: 'discord_style',
    name: 'Discord Style',
    bgClass: 'bg-[#313338]',
    textColor: 'text-white',
    btnClass: 'bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all',
    fontFamily: 'font-sans',
    accentColor: '#5865F2',
    tags: ['Cozy', 'Social']
  },
  {
    id: 'spotify_style',
    name: 'Spotify Style',
    bgClass: 'bg-[#121212]',
    textColor: 'text-white',
    btnClass: 'bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 text-zinc-950 font-bold tracking-tight rounded-full shadow-lg transition-transform',
    fontFamily: 'font-sans',
    accentColor: '#1DB954',
    tags: ['Music', 'Minimal']
  },
  {
    id: 'y2k',
    name: 'Y2K Sparkle',
    bgClass: 'bg-gradient-to-tr from-fuchsia-300 via-pink-300 to-indigo-300',
    textColor: 'text-pink-900',
    btnClass: 'bg-white hover:bg-neutral-50 border-2 border-pink-400 text-pink-700 shadow-[6px_6px_0px_rgba(244,114,182,0.4)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-xl font-bold transition-all',
    fontFamily: 'font-sans',
    accentColor: '#f472b6',
    tags: ['Retro', 'Y2K', 'Bright']
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave Sunset',
    bgClass: 'bg-gradient-to-b from-fuchsia-500 via-purple-600 to-cyan-500',
    textColor: 'text-yellow-200',
    btnClass: 'bg-cyan-900/60 hover:bg-cyan-800/70 border-b-4 border-cyan-400 text-yellow-300 hover:text-white rounded-none italic font-bold transition-all shadow-[0_5px_15px_rgba(0,0,0,0.35)]',
    fontFamily: 'font-mono',
    accentColor: '#e0f2fe',
    tags: ['Retro', 'Neon', 'Vapor']
  },
  {
    id: 'matrix',
    name: 'The Matrix',
    bgClass: 'bg-black bg-[linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)),url("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80")] bg-cover bg-center',
    textColor: 'text-green-500',
    btnClass: 'border border-green-500 bg-black/80 hover:bg-green-950/30 text-green-400 transition-all font-mono hover:shadow-[0_0_10px_#22c55e]',
    fontFamily: 'font-mono',
    accentColor: '#22c55e',
    tags: ['Hacker', 'Terminal']
  },
  {
    id: 'midnight',
    name: 'Midnight Black',
    bgClass: 'bg-neutral-950',
    textColor: 'text-neutral-100',
    btnClass: 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white rounded-xl shadow-lg hover:shadow-emerald-500/5',
    fontFamily: 'font-sans',
    accentColor: '#ffffff',
    tags: ['Dark', 'Elegant']
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Gold',
    bgClass: 'bg-gradient-to-b from-amber-950 via-stone-900 to-neutral-950',
    textColor: 'text-amber-200',
    btnClass: 'border border-amber-500 bg-gradient-to-r from-amber-600/20 to-yellow-600/10 text-amber-200 hover:from-amber-500/30 hover:to-yellow-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] rounded-lg font-serif tracking-wide',
    fontFamily: 'font-serif',
    accentColor: '#f59e0b',
    tags: ['Premium', 'Gold']
  },
  {
    id: 'kawaii',
    name: 'Kawaii Pastel',
    bgClass: 'bg-pink-100',
    textColor: 'text-rose-500',
    btnClass: 'bg-white hover:bg-rose-50 border-2 border-rose-300 text-rose-500 font-bold rounded-2xl shadow-[0_4px_10px_rgba(244,63,94,0.1)] transition-transform hover:scale-102',
    fontFamily: 'font-sans',
    accentColor: '#fda4af',
    tags: ['Kawaii', 'Soft']
  },
  {
    id: 'streetwear',
    name: 'Streetwear Cargo',
    bgClass: 'bg-zinc-900',
    textColor: 'text-zinc-100',
    btnClass: 'border-2 border-zinc-100 bg-transparent text-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 font-black rounded-none transition-colors uppercase tracking-widest',
    fontFamily: 'font-sans',
    accentColor: '#fafafa',
    tags: ['Minimal', 'Hypebeast']
  },
  {
    id: 'space_galaxy',
    name: 'Space Galaxy',
    bgClass: 'bg-gradient-to-br from-violet-950 via-neutral-950 to-indigo-950',
    textColor: 'text-purple-300',
    btnClass: 'bg-neutral-900/60 hover:bg-violet-900/60 border border-purple-500/30 text-purple-200 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    fontFamily: 'font-sans',
    accentColor: '#a855f7',
    tags: ['Modern', 'Dark']
  },
  {
    id: 'sunset_orange',
    name: 'Sunset Orange',
    bgClass: 'bg-gradient-to-t from-orange-600 via-rose-500 to-amber-400',
    textColor: 'text-white',
    btnClass: 'bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl shadow-md transition-all',
    fontFamily: 'font-sans',
    accentColor: '#f59e0b',
    tags: ['Warm', 'Gradient']
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    bgClass: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-sky-900',
    textColor: 'text-sky-100',
    btnClass: 'bg-sky-950/40 hover:bg-sky-900/50 border border-sky-400/40 text-sky-100 backdrop-blur-md rounded-xl hover:shadow-[0_0_15px_rgba(14,165,233,0.2)]',
    fontFamily: 'font-sans',
    accentColor: '#38bdf8',
    tags: ['Fresh', 'Gradient']
  },
  {
    id: 'creator_mode',
    name: 'Creator Mode',
    bgClass: 'bg-[#0f172a]',
    textColor: 'text-[#e2e8f0]',
    btnClass: 'bg-[#1e293b] hover:bg-[#334155] border border-[#475569] text-white rounded-lg p-4 font-medium transition-all shadow-md',
    fontFamily: 'font-sans',
    accentColor: '#3b82f6',
    tags: ['Minimal', 'Professional']
  },
  {
    id: 'tiktok_style',
    name: 'TikTok Dark',
    bgClass: 'bg-black',
    textColor: 'text-white',
    btnClass: 'bg-zinc-900 hover:bg-zinc-800 border-2 border-[#25F4EE] hover:border-[#FE2C55] text-white rounded-lg transition-transform hover:scale-102',
    fontFamily: 'font-sans',
    accentColor: '#FE2C55',
    tags: ['Social', 'Dark']
  },
  {
    id: 'instagram_style',
    name: 'Instagram Light',
    bgClass: 'bg-neutral-50',
    textColor: 'text-neutral-900',
    btnClass: 'bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-900 font-semibold rounded-lg shadow-sm transition-all',
    fontFamily: 'font-sans',
    accentColor: '#ec4899',
    tags: ['Social', 'Light']
  },
  {
    id: 'frosted_glass',
    name: 'Frosted Glass',
    bgClass: 'bg-gradient-to-tr from-cyan-300 via-emerald-200 to-lime-200',
    textColor: 'text-teal-950',
    btnClass: 'bg-white/30 hover:bg-white/40 border border-white/50 text-teal-900 rounded-2xl backdrop-blur-md shadow-md transition-all',
    fontFamily: 'font-sans',
    accentColor: '#14b8a6',
    tags: ['Glassmorphism']
  },
  {
    id: 'minimal_white',
    name: 'Minimal White',
    bgClass: 'bg-white',
    textColor: 'text-neutral-900',
    btnClass: 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-neutral-800 rounded-xl transition-all font-medium',
    fontFamily: 'font-sans',
    accentColor: '#171717',
    tags: ['Minimal', 'Light']
  },
  {
    id: 'minimal_dark',
    name: 'Minimal Dark',
    bgClass: 'bg-zinc-950',
    textColor: 'text-zinc-100',
    btnClass: 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-100 rounded-xl transition-all font-medium',
    fontFamily: 'font-sans',
    accentColor: '#f4f4f5',
    tags: ['Minimal', 'Dark']
  },
  {
    id: 'material_design',
    name: 'Material Blue',
    bgClass: 'bg-blue-50',
    textColor: 'text-blue-900',
    btnClass: 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg text-white rounded-full font-medium transition-all p-3 tracking-wide',
    fontFamily: 'font-sans',
    accentColor: '#2563eb',
    tags: ['Clean', 'Material']
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Chill',
    bgClass: 'bg-[#f4ebe1]',
    textColor: 'text-[#5d4037]',
    btnClass: 'bg-[#e0d4c3] hover:bg-[#d0c2ae] text-[#4e342e] rounded-xl border border-[#c4b59f] font-sans transition-all italic font-medium',
    fontFamily: 'font-sans',
    accentColor: '#8d6e63',
    tags: ['Soft', 'Lofi']
  },
  {
    id: 'hologram',
    name: 'Hologram Cyber',
    bgClass: 'bg-gradient-to-r from-[#9795ef] to-[#f9c5d1]',
    textColor: 'text-slate-900',
    btnClass: 'bg-white/20 hover:bg-white/30 border border-white/40 shadow-xl backdrop-blur-md text-slate-900 hover:text-slate-950 rounded-2xl transition-all',
    fontFamily: 'font-sans',
    accentColor: '#a18cd1',
    tags: ['Chic', 'Bright']
  },
  {
    id: 'pixel_gaming',
    name: 'Pixel Gaming',
    bgClass: 'bg-[#18122B]',
    textColor: 'text-yellow-400',
    btnClass: 'bg-zinc-900 hover:bg-zinc-800 border-4 border-double border-yellow-400 text-yellow-400 font-mono tracking-wider shadow-[0_4px_0_#ca8a04] hover:shadow-none hover:translate-y-1 rounded-none',
    fontFamily: 'font-mono',
    accentColor: '#facc15',
    tags: ['Gamer', 'Retro']
  },
  {
    id: 'graffiti',
    name: 'Street Graffiti',
    bgClass: 'bg-stone-900 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]',
    textColor: 'text-lime-400',
    btnClass: 'border-3 border-lime-400 bg-black text-lime-400 hover:bg-lime-400 hover:text-black font-black uppercase tracking-widest rounded-none shadow-[4px_4px_0px_#22c55e]',
    fontFamily: 'font-mono',
    accentColor: '#a3e635',
    tags: ['Brutalist', 'Street']
  },
  {
    id: 'metallic_silver',
    name: 'Metallic Silver',
    bgClass: 'bg-gradient-to-br from-neutral-350 via-neutral-200 to-neutral-400',
    textColor: 'text-neutral-900',
    btnClass: 'bg-neutral-900 hover:bg-black text-white hover:scale-102 transition-all rounded-lg font-semibold tracking-tight shadow-md',
    fontFamily: 'font-sans',
    accentColor: '#ffffff',
    tags: ['Premium', 'Luxury']
  },
  {
    id: 'aurora',
    name: 'Northern Aurora',
    bgClass: 'bg-gradient-to-bl from-teal-900 via-emerald-950 to-neutral-950',
    textColor: 'text-emerald-300',
    btnClass: 'bg-neutral-900/50 hover:bg-teal-900/40 border border-emerald-500/30 text-emerald-200 backdrop-blur-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    fontFamily: 'font-sans',
    accentColor: '#10b981',
    tags: ['Nature', 'Northern']
  },
  {
    id: 'chrome',
    name: 'Fluid Chrome',
    bgClass: 'bg-gradient-to-r from-neutral-800 via-neutral-600 to-neutral-800',
    textColor: 'text-white',
    btnClass: 'bg-white/10 hover:bg-white/20 border-t border-white/30 text-white rounded-none italic font-bold tracking-tight shadow-lg transition-all',
    fontFamily: 'font-sans',
    accentColor: '#d4d4d8',
    tags: ['Chrome', 'Dark']
  },
  {
    id: 'rainbow_gradient',
    name: 'Rainbow Gradient',
    bgClass: 'bg-gradient-to-tr from-red-500 via-pink-500 via-purple-500 via-blue-500 to-cyan-500',
    textColor: 'text-white',
    btnClass: 'bg-black/45 hover:bg-black/60 border border-white/20 text-white font-bold rounded-2xl shadow-xl backdrop-blur-md hover:scale-101 transition-transform',
    fontFamily: 'font-sans',
    accentColor: '#ec4899',
    tags: ['Bright', 'Modern']
  },
  {
    id: 'nft_theme',
    name: 'Solana Web3',
    bgClass: 'bg-gradient-to-tr from-[#9945FF] to-[#14F195]',
    textColor: 'text-zinc-950',
    btnClass: 'bg-zinc-950 hover:bg-zinc-900 text-white font-mono rounded-lg shadow-2xl transition-all border border-purple-500/50',
    fontFamily: 'font-mono',
    accentColor: '#14F195',
    tags: ['Web3', 'Tech']
  },
  {
    id: 'manga_theme',
    name: 'Manga Page',
    bgClass: 'bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
    textColor: 'text-black',
    btnClass: 'border-3 border-black bg-white text-black hover:bg-black hover:text-white font-bold rounded-none shadow-[8px_8px_0px_#000000] italic transition-all duration-150',
    fontFamily: 'font-mono',
    accentColor: '#111111',
    tags: ['Manga', 'Brutalist']
  },
  {
    id: 'liquid_glass',
    name: 'Liquid Glass',
    bgClass: 'bg-gradient-to-tr from-yellow-250 via-pink-200 to-indigo-200',
    textColor: 'text-neutral-800',
    btnClass: 'bg-white/20 hover:bg-white/30 border border-white/40 text-neutral-800 hover:text-black shadow-lg rounded-full backdrop-blur-xl',
    fontFamily: 'font-sans',
    accentColor: '#f43f5e',
    tags: ['Premium', 'Smooth']
  },
  {
    id: 'pastel_dream',
    name: 'Pastel Dream',
    bgClass: 'bg-gradient-to-br from-violet-200 via-pink-200 to-emerald-100',
    textColor: 'text-neutral-700',
    btnClass: 'bg-white/80 hover:bg-white border border-neutral-200 text-neutral-700 font-semibold rounded-2xl tracking-normal transition-all',
    fontFamily: 'font-sans',
    accentColor: '#c084fc',
    tags: ['Dreamy', 'Minimal']
  },
  {
    id: 'barbie_pink',
    name: 'Barbie Pink',
    bgClass: 'bg-pink-500',
    textColor: 'text-white',
    btnClass: 'bg-pink-700 hover:bg-pink-800 border-2 border-white text-white font-serif font-black tracking-widest rounded-full transition-all hover:scale-105',
    fontFamily: 'font-serif',
    accentColor: '#fb7185',
    tags: ['Aesthetic', 'Chic']
  },
  {
    id: 'terminal',
    name: 'Retro Terminal',
    bgClass: 'bg-[#0d1e10]',
    textColor: 'text-[#15eb37]',
    btnClass: 'border-2 border-[#15eb37] bg-black text-[#15eb37] hover:bg-[#15eb37] hover:text-black font-mono uppercase tracking-widest shadow-[0_4px_0_#15eb37] hover:shadow-none hover:translate-y-1',
    fontFamily: 'font-mono',
    accentColor: '#15eb37',
    tags: ['Hacker', 'Terminal']
  },
  {
    id: 'aesthetic_purple',
    name: 'Aesthetic Purple',
    bgClass: 'bg-gradient-to-tr from-indigo-950 via-purple-900 to-[#1e1b4b]',
    textColor: 'text-purple-100',
    btnClass: 'bg-purple-950/50 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    fontFamily: 'font-sans',
    accentColor: '#d8b4fe',
    tags: ['Aesthetic', 'Dark']
  },
  {
    id: 'dark_red',
    name: 'Vampire Red',
    bgClass: 'bg-gradient-to-b from-stone-950 via-neutral-900 to-red-950',
    textColor: 'text-red-400',
    btnClass: 'border border-red-700 bg-red-950/20 text-red-300 hover:bg-red-900/40 rounded-lg font-medium transition-all shadow-[0_0_10px_rgba(220,38,38,0.15)]',
    fontFamily: 'font-serif',
    accentColor: '#ef4444',
    tags: ['Dark', 'Vampire']
  },
  {
    id: 'neon_blue',
    name: 'Neon Blue Cyber',
    bgClass: 'bg-[#050b14]',
    textColor: 'text-cyan-400',
    btnClass: 'border border-cyan-500 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-900/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] backdrop-blur-md rounded-xl',
    fontFamily: 'font-mono',
    accentColor: '#06b6d4',
    tags: ['Neon', 'Dark']
  },
  {
    id: 'earth_tones',
    name: 'Earth Tones Forest',
    bgClass: 'bg-[#2d3a1a]',
    textColor: 'text-[#e6dfd3]',
    btnClass: 'bg-[#3b4c22] hover:bg-[#485d2a] text-[#ffffff] border border-[#5a7238]/40 rounded-xl font-sans transition-all shadow-md',
    fontFamily: 'font-sans',
    accentColor: '#e6dfd3',
    tags: ['Cozy', 'Warm']
  },
  {
    id: 'coffee',
    name: 'Coffee Cafe',
    bgClass: 'bg-[#ece0d1]',
    textColor: 'text-[#3d251d]',
    btnClass: 'bg-[#dbc1ac] hover:bg-[#967969] hover:text-white border border-[#967969]/30 text-[#3d251d] rounded-2xl font-semibold transition-colors shadow-sm',
    fontFamily: 'font-sans',
    accentColor: '#967969',
    tags: ['Coffee', 'Aesthetic']
  },
  {
    id: 'cartoon',
    name: 'Retro Cartoon',
    bgClass: 'bg-[#FFDE4D]',
    textColor: 'text-black',
    btnClass: 'border-3 border-black bg-[#FF4C4C] text-black hover:bg-[#ff5d5d] font-bold tracking-tight rounded-2xl shadow-[6px_6px_0px_#000],_0_0_0_2px_#ffffff_inset hover:shadow-[3px_3px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px]',
    fontFamily: 'font-sans',
    accentColor: '#FF4C4C',
    tags: ['Playful', 'Brutalist']
  },
  {
    id: 'memphis',
    name: 'Memphis Pop',
    bgClass: 'bg-[#ffffff] bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6),linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6)] [background-size:20px_20px] [background-position:0_0,10px_10px]',
    textColor: 'text-slate-900',
    btnClass: 'border-3 border-slate-900 bg-cyan-300 text-slate-900 hover:bg-fuchsia-300 font-extrabold rounded-none shadow-[8px_8px_0px_#1e293b] hover:shadow-none hover:translate-x-2 hover:translate-y-2 uppercase transition-all',
    fontFamily: 'font-mono',
    accentColor: '#22d3ee',
    tags: ['Retro', 'Playful']
  },
  {
    id: 'futuristic_ui',
    name: 'Futuristic HUD',
    bgClass: 'bg-slate-950 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]',
    textColor: 'text-sky-400',
    btnClass: 'border border-sky-500 bg-sky-950/20 text-sky-300 hover:bg-sky-500/20 hover:text-white transition-all font-mono tracking-wider shadow-[0_0_15px_rgba(14,165,233,0.15)] rounded-none',
    fontFamily: 'font-mono',
    accentColor: '#0ea5e9',
    tags: ['HUD', 'Tech']
  },
  {
    id: 'purple_dream',
    name: 'Purple Mist',
    bgClass: 'bg-gradient-to-br from-[#1e1e38] to-[#3b0a45]',
    textColor: 'text-purple-200',
    btnClass: 'bg-purple-900/35 hover:bg-purple-800/40 border border-purple-500/25 text-purple-200 hover:shadow-[0_0_12px_rgba(216,180,254,0.25)] rounded-xl transition-all',
    fontFamily: 'font-sans',
    accentColor: '#d8b4fe',
    tags: ['Aesthetic', 'Dark']
  },
  {
    id: 'black_gold',
    name: 'Piano Black & Gold',
    bgClass: 'bg-zinc-950',
    textColor: 'text-amber-300',
    btnClass: 'border-2 border-amber-400 bg-[#121212] text-amber-200 hover:text-zinc-950 hover:bg-amber-400 font-black rounded-lg hover:shadow-[0_0_15px_rgba(251,191,36,0.35)]',
    fontFamily: 'font-serif',
    accentColor: '#f59e0b',
    tags: ['Premium', 'Dark']
  },
  {
    id: 'white_luxury',
    name: 'White Alabaster',
    bgClass: 'bg-stone-50',
    textColor: 'text-stone-900',
    btnClass: 'bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-900 font-serif tracking-wide rounded-none shadow-md transition-colors',
    fontFamily: 'font-serif',
    accentColor: '#292524',
    tags: ['Premium', 'Light']
  },
  {
    id: 'sky_blue',
    name: 'Sky Cloud',
    bgClass: 'bg-gradient-to-b from-sky-400 to-sky-200',
    textColor: 'text-sky-900',
    btnClass: 'bg-white/80 hover:bg-white border border-sky-300/40 text-sky-800 font-bold rounded-2xl shadow-[0_4px_12px_rgba(14,165,233,0.1)] transition-transform hover:scale-101',
    fontFamily: 'font-sans',
    accentColor: '#38bdf8',
    tags: ['Aesthetic', 'Light']
  },
  {
    id: 'red_energy',
    name: 'Red Energy Burst',
    bgClass: 'bg-gradient-to-br from-red-650 via-red-900 to-black',
    textColor: 'text-white',
    btnClass: 'bg-red-600 hover:bg-red-500 border border-red-500 text-white font-extrabold uppercase rounded-lg shadow-lg hover:shadow-red-500/30 transition-shadow',
    fontFamily: 'font-sans',
    accentColor: '#ef4444',
    tags: ['Energy', 'Dark']
  },
  {
    id: 'creator_pro',
    name: 'Creator Black Edition',
    bgClass: 'bg-[#090d16]',
    textColor: 'text-slate-100',
    btnClass: 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white rounded-xl shadow-lg hover:shadow-cyan-400/5 hover:border-slate-700 font-semibold',
    fontFamily: 'font-sans',
    accentColor: '#06b6d4',
    tags: ['Professional', 'Dark']
  },
  {
    id: 'neon_green',
    name: 'Neon Toxic Green',
    bgClass: 'bg-black',
    textColor: 'text-green-400',
    btnClass: 'border-2 border-[#39FF14] bg-zinc-950/80 text-[#39FF14] hover:bg-[#39FF14] hover:text-black font-mono font-black tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.35)] rounded-none',
    fontFamily: 'font-mono',
    accentColor: '#39FF14',
    tags: ['Neon', 'Dark']
  },
  {
    id: 'dark_purple',
    name: 'Deep Purple Satin',
    bgClass: 'bg-gradient-to-tr from-purple-950 via-zinc-950 to-[#2e1065]',
    textColor: 'text-purple-300',
    btnClass: 'bg-[#1e152a] hover:bg-[#2b1e3c] border border-purple-800/30 text-purple-200 rounded-xl transition-all shadow-md',
    fontFamily: 'font-sans',
    accentColor: '#a855f7',
    tags: ['Dark', 'Aesthetic']
  },
  {
    id: 'cyan_dream',
    name: 'Teal & Cyan Dream',
    bgClass: 'bg-gradient-to-br from-teal-900 via-teal-950 to-neutral-900',
    textColor: 'text-cyan-300',
    btnClass: 'bg-cyan-950/50 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-200 rounded-full hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    fontFamily: 'font-sans',
    accentColor: '#06b6d4',
    tags: ['Modern', 'Aesthetic']
  },
  {
    id: 'premium_glass',
    name: 'Premium Glass Velvet',
    bgClass: 'bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b]',
    textColor: 'text-[#e2e8f0]',
    btnClass: 'bg-white/5 hover:bg-white/10 border border-white/10 text-[#f1f5f9] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl',
    fontFamily: 'font-sans',
    accentColor: '#38bdf8',
    tags: ['Glassmorphism', 'Premium']
  }
];

export function getTheme(id: string): ThemeConfig {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
export default THEMES;
