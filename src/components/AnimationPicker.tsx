import React, { useState } from 'react';
import { Search, Sparkles, Activity, Play, Zap, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export interface AnimationDef {
  id: string;
  name: string;
  description: string;
  category: 'Entrances' | 'Loops' | 'Special FX';
  isContinuous: boolean;
  variants: any; // framer-motion variants
}

export const ANIMATION_LIST: AnimationDef[] = [
  {
    id: 'none',
    name: 'None',
    description: 'No movement. Solid state.',
    category: 'Entrances',
    isContinuous: false,
    variants: {}
  },
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Gradually and smoothly becomes opaque.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'fade-up',
    name: 'Fade Up',
    description: 'Fades in while floating upward from below.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { opacity: 0, y: 25 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'fade-down',
    name: 'Fade Down',
    description: 'Fades in while descending from above.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { opacity: 0, y: -25 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'fade-left',
    name: 'Fade Left',
    description: 'Slides in from the right with a soft fade.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { opacity: 0, x: 25 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'fade-right',
    name: 'Fade Right',
    description: 'Slides in from the left with a soft fade.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { opacity: 0, x: -25 },
      animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    description: 'Enters with a rapid springy upward slide.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { y: 70, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15, stiffness: 120 } }
    }
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    description: 'Enters with a rapid springy downward slide.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { y: -70, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: 'spring', damping: 15, stiffness: 120 } }
    }
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    description: 'Enters springy from the right margin.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { x: 70, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 15, stiffness: 120 } }
    }
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    description: 'Enters springy from the left margin.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { x: -70, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 15, stiffness: 120 } }
    }
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Pop reveal starting from 60% scale.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { scale: 0.6, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 12, stiffness: 120 } }
    }
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Shrink-fitting reveal starting from 140% scale.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { scale: 1.4, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 12, stiffness: 120 } }
    }
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Spins into position with slight springy angle.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { rotate: -15, scale: 0.8, opacity: 0 },
      animate: { rotate: 0, scale: 1, opacity: 1, transition: { type: 'spring', damping: 12, stiffness: 100 } }
    }
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bounces elastically on arrival.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { y: -60, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.52, duration: 0.8 } }
    }
  },
  {
    id: 'flip',
    name: 'Flip',
    description: 'Flips forward 3D on the X-axis.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { rotateX: 90, opacity: 0 },
      animate: { rotateX: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
    }
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'A futuristic typewriter-like clipping mask reveal.',
    category: 'Entrances',
    isContinuous: false,
    variants: {
      initial: { clipPath: 'inset(0 100% 0 0)' },
      animate: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.2, ease: 'linear' } }
    }
  },
  // Continuous Loops Category
  {
    id: 'float',
    name: 'Floating Ambient Loop',
    description: 'Continuously floats up and down gently.',
    category: 'Loops',
    isContinuous: true,
    variants: {
      animate: {
        y: [0, -6, 0],
        transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
      }
    }
  },
  {
    id: 'pulse-glow',
    name: 'Pulse Glow',
    description: 'Continuously pulses size and custom neon shadow.',
    category: 'Loops',
    isContinuous: true,
    variants: {
      animate: {
        scale: [1, 1.025, 1],
        boxShadow: [
          '0 0 0 rgba(168, 85, 247, 0)',
          '0 0 16px rgba(168, 85, 247, 0.45)',
          '0 0 0 rgba(168, 85, 247, 0)'
        ],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
      }
    }
  },
  {
    id: 'cosmic-drift',
    name: 'Cosmic Drift',
    description: 'Slow multi-axis floating rotation in space style.',
    category: 'Loops',
    isContinuous: true,
    variants: {
      animate: {
        y: [0, -7, 2, -4, 0],
        x: [0, 3, -2, 4, 0],
        rotate: [0, 1.2, -1, 0],
        transition: { repeat: Infinity, duration: 7, ease: 'easeInOut' }
      }
    }
  },
  {
    id: 'neon-pulse',
    name: 'Neon Pulse',
    description: 'Continuous intense dropping filter shadow pulse.',
    category: 'Loops',
    isContinuous: true,
    variants: {
      animate: {
        filter: [
          'drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))',
          'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))',
          'drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))'
        ],
        transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
      }
    }
  },
  {
    id: 'parallax-float',
    name: 'Parallax Float',
    description: 'Moves slightly with dual ambient-hover offsets.',
    category: 'Loops',
    isContinuous: true,
    variants: {
      animate: {
        x: [0, 5, -5, 0],
        y: [0, -5, 5, 0],
        transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
      }
    }
  },
  // Special Sci-fi FX Category
  {
    id: 'hologram-appear',
    name: 'Hologram Appear',
    description: 'Futuristic high-frequency flicker hologram appear.',
    category: 'Special FX',
    isContinuous: false,
    variants: {
      initial: { opacity: 0, scaleY: 0.1, filter: 'hue-rotate(90deg) brightness(2)' },
      animate: {
        opacity: [0, 1, 0.3, 0.9, 0.5, 1],
        scaleY: 1,
        filter: 'hue-rotate(0deg) brightness(1)',
        transition: { duration: 0.85, times: [0, 0.15, 0.3, 0.5, 0.7, 1] }
      }
    }
  },
  {
    id: 'meteor-slide',
    name: 'Meteor Slide',
    description: 'Fast glowing speedway swoop entry.',
    category: 'Special FX',
    isContinuous: false,
    variants: {
      initial: { x: -300, skewX: -25, opacity: 0 },
      animate: { x: 0, skewX: 0, opacity: 1, transition: { type: 'spring', damping: 11, stiffness: 140 } }
    }
  },
  {
    id: 'galaxy-spin',
    name: 'Galaxy Spin',
    description: 'Deep rotation vortex pop reveal.',
    category: 'Special FX',
    isContinuous: false,
    variants: {
      initial: { rotate: -230, scale: 0.1, opacity: 0 },
      animate: { rotate: 0, scale: 1, opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } }
    }
  }
];

interface AnimationPickerProps {
  currentValue: string;
  onChange: (animId: string) => void;
  brandColor?: string;
}

export default function AnimationPicker({ currentValue, onChange, brandColor = '#a855f7' }: AnimationPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Entrances' | 'Loops' | 'Special FX'>('All');
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Normalize legacy values
  const normalizedValue = 
    currentValue === 'fade' ? 'fade-in' :
    currentValue === 'pop' ? 'zoom-in' :
    currentValue === 'float' ? 'float' : 
    currentValue || 'none';

  const filteredAnimations = ANIMATION_LIST.filter((anim) => {
    const matchesSearch = anim.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      anim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || anim.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-3 bg-zinc-950/40 p-4 rounded-2xl border border-purple-500/10 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-[#d8b4fe] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          Motion Entry Generator
        </label>
        <div className="bg-zinc-900/80 px-2 py-0.5 rounded text-[8px] font-bold text-zinc-500 uppercase">
          Cosmic Specs
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter effects (e.g. Bounce, Pulsing, Glow...)"
          className="w-full bg-zinc-950/60 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/40"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2 text-[10px] text-purple-400 hover:text-purple-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-950/80 rounded-xl border border-white/[0.03]">
        {(['All', 'Entrances', 'Loops', 'Special FX'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
              activeCategory === cat
                ? 'bg-purple-900/30 border border-purple-500/20 text-purple-300 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Picker Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1 customize-scrollbar">
        {filteredAnimations.map((anim) => {
          const isSelected = normalizedValue === anim.id;
          const isHovered = previewId === anim.id;

          // Compute a small preview animation based on definition
          const getMiniVariant = () => {
            if (!isHovered) return {};
            if (anim.id === 'none') return {};
            return anim.variants.animate || anim.variants;
          };

          return (
            <div
              key={anim.id}
              role="button"
              className={`group flex flex-col p-2.5 rounded-xl border text-left transition-all relative overflow-hidden select-none cursor-pointer ${
                isSelected
                  ? 'bg-purple-950/45 border-purple-500/40 text-purple-200'
                  : 'bg-zinc-950/40 border-white/[0.04] text-zinc-400 hover:border-purple-500/20 hover:bg-neutral-900/30'
              }`}
              onClick={() => onChange(anim.id)}
              onMouseEnter={() => setPreviewId(anim.id)}
              onMouseLeave={() => setPreviewId(null)}
            >
              {/* Background gradient on hover/select */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
              )}

              <div className="flex items-center justify-between mb-1 z-10">
                <span className={`text-[10px] font-black tracking-wide ${isSelected ? 'text-purple-300' : 'text-zinc-300 font-bold'}`}>
                  {anim.name}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  {anim.isContinuous ? (
                    <span className="text-[7px] bg-cyan-950/60 text-cyan-400 border border-cyan-800/30 px-1 py-0.2 rounded font-black uppercase tracking-wider scale-90" title="Continuous Loop">
                      Loop
                    </span>
                  ) : (
                    <span className="text-[7px] bg-purple-950/60 text-purple-400 border border-purple-800/20 px-1 py-0.2 rounded font-black uppercase tracking-wider scale-90" title="One-time entrance">
                      Once
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  )}
                </div>
              </div>

              <span className="text-[8px] text-zinc-500 leading-normal line-clamp-2 z-10 select-none">
                {anim.description}
              </span>

              {/* Hover Miniature Animated State Simulator */}
              <div className="mt-1.5 h-3 bg-zinc-950/80 rounded border border-white/[0.02] flex items-center justify-center overflow-hidden z-10">
                <motion.div
                  className="w-14 h-1 bg-purple-500 rounded-full"
                  animate={getMiniVariant() as any}
                  initial={anim.variants.initial || {}}
                  style={{ backgroundColor: isSelected ? brandColor : '#8d56e2' }}
                  key={isHovered ? `hover-${anim.id}` : `static-${anim.id}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[8px] text-zinc-500 pt-1 border-t border-white/[0.02]">
        <span className="flex items-center gap-1">
          <Activity className="w-2.5 h-2.5 text-purple-500" />
          Realtime synced
        </span>
        <span>Hover grid element to run mini-simulation</span>
      </div>
    </div>
  );
}
