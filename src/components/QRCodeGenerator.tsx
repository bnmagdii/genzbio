import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Sparkles, 
  QrCode, 
  Check, 
  Instagram, 
  Chrome, 
  CheckCircle, 
  Printer, 
  Palette,
  Layout,
  Type
} from 'lucide-react';
import { BioPageConfig } from '../types';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  bioPage: BioPageConfig | null;
}

const PRESET_COLORS = [
  { name: 'Cosmic Purple', hex: '#a855f7' },
  { name: 'Neon Cyan', hex: '#06b6d4' },
  { name: 'Coral Rose', hex: '#f43f5e' },
  { name: 'Lime Venom', hex: '#84cc16' },
  { name: 'Saffron Sun', hex: '#eab308' },
  { name: 'Obsidian Night', hex: '#090d16' },
  { name: 'Classic Dark', hex: '#000000' }
];

export default function QRCodeGenerator({ isOpen, onClose, bioPage }: QRCodeGeneratorProps) {
  if (!bioPage) return null;

  const [colorDark, setColorDark] = useState('#a855f7');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [logoType, setLogoType] = useState<'none' | 'avatar' | 'verified' | 'gemini'>('avatar');
  const [includeLabel, setIncludeLabel] = useState(true);
  const [labelText, setLabelText] = useState(`@${bioPage.username}`);
  const [urlType, setUrlType] = useState<'live' | 'prod'>('live');
  const [downloading, setDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate the actual URL pointing to their page
  const liveUrl = `${window.location.protocol}//${window.location.host}/${bioPage.username}`;
  const prodUrl = `https://genzbio.com/${bioPage.username}`;
  const qrUrl = urlType === 'live' ? liveUrl : prodUrl;

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Clear Canvas first
    ctx.clearRect(0, 0, size, size);

    // Create a temporary canvas representing the pure QR code
    const tempCanvas = document.createElement('canvas');
    const marginSize = includeLabel ? 4 : 2;

    QRCode.toCanvas(tempCanvas, qrUrl, {
      width: size,
      margin: marginSize,
      color: {
        dark: colorDark,
        light: colorLight
      },
      errorCorrectionLevel: 'H' // High ECC is required to gracefully withstand logo blockage
    }, (error) => {
      if (error) {
        console.error('Error rendering QR base:', error);
        return;
      }

      // Draw the pure QR code onto our high-res 1024x1024 canvas
      ctx.drawImage(tempCanvas, 0, 0, size, size);

      // Define drawing function for Center Logo overlay
      const drawCenterLogo = () => {
        if (logoType === 'none') {
          drawCustomLabelText();
          return;
        }

        const logoSize = size * 0.22; // 22% of total canvas is maximum scannable block size
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        ctx.save();

        // 1. Draw smooth rounded backdrop padding for contrast against dots
        ctx.fillStyle = colorLight === 'transparent' ? '#ffffff' : colorLight;
        ctx.beginPath();
        const r = logoSize * 0.25; // corner radius 
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + logoSize, y, x + logoSize, y + logoSize, r);
        ctx.arcTo(x + logoSize, y + logoSize, x, y + logoSize, r);
        ctx.arcTo(x, y + logoSize, x, y, r);
        ctx.arcTo(x, y, x + logoSize, y, r);
        ctx.closePath();
        ctx.fill();

        // Stroke the logo container border slightly
        ctx.strokeStyle = colorDark;
        ctx.lineWidth = 10;
        ctx.stroke();

        // 2. Clip inside standard size to render source logo smoothly
        ctx.beginPath();
        const padding = logoSize * 0.08;
        const innerSize = logoSize - padding * 2;
        const ix = x + padding;
        const iy = y + padding;
        const ir = innerSize * 0.22;

        ctx.moveTo(ix + ir, iy);
        ctx.arcTo(ix + innerSize, iy, ix + innerSize, iy + innerSize, ir);
        ctx.arcTo(ix + innerSize, iy + innerSize, ix, iy + innerSize, ir);
        ctx.arcTo(ix, iy + innerSize, ix, iy, ir);
        ctx.arcTo(ix, iy, ix + innerSize, iy, ir);
        ctx.closePath();
        ctx.clip();

        // Render based on user preference
        if (logoType === 'avatar' && bioPage.avatarUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = bioPage.avatarUrl;
          img.onload = () => {
            ctx.drawImage(img, ix, iy, innerSize, innerSize);
            ctx.restore();
            drawCustomLabelText();
          };
          img.onerror = () => {
            // Draw graceful initials circle fallback if asset is offline or blocked by CORS
            ctx.fillStyle = colorDark;
            ctx.fillRect(ix, iy, innerSize, innerSize);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(bioPage.username[0].toUpperCase(), ix + innerSize / 2, iy + innerSize / 2);
            ctx.restore();
            drawCustomLabelText();
          };
        } else if (logoType === 'verified') {
          // Shiny verified check
          ctx.fillStyle = '#06b6d4'; // neon cyan background
          ctx.fillRect(ix, iy, innerSize, innerSize);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 14;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(ix + innerSize * 0.28, iy + innerSize * 0.48);
          ctx.lineTo(ix + innerSize * 0.44, iy + innerSize * 0.65);
          ctx.lineTo(ix + innerSize * 0.72, iy + innerSize * 0.35);
          ctx.stroke();
          ctx.restore();
          drawCustomLabelText();
        } else if (logoType === 'gemini') {
          // Gemini Sparkles icon
          ctx.fillStyle = '#a855f7'; // Purple star
          ctx.fillRect(ix, iy, innerSize, innerSize);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 110px "Inter", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✦', ix + innerSize / 2, iy + innerSize / 2);
          ctx.restore();
          drawCustomLabelText();
        } else {
          ctx.restore();
          drawCustomLabelText();
        }
      };

      // Define drawing function for custom caption labels at bottom
      const drawCustomLabelText = () => {
        if (!includeLabel || !labelText) return;

        ctx.save();
        // Clear a narrow strip at the bottom so dots don't clutter the signature label
        ctx.fillStyle = colorLight === 'transparent' ? '#ffffff' : colorLight;
        ctx.fillRect(size * 0.1, size - 110, size * 0.8, 80);

        ctx.fillStyle = colorDark;
        ctx.font = 'black 38px "Space Grotesk", "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw elegant high contrast caption text
        ctx.fillText(labelText.toUpperCase(), size / 2, size - 70);
        ctx.restore();
      };

      drawCenterLogo();
    });

  }, [isOpen, qrUrl, colorDark, colorLight, logoType, includeLabel, labelText, bioPage]);

  // Download high-resolution PNG file
  const handleDownload = () => {
    if (!canvasRef.current || !bioPage) return;
    setDownloading(true);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `genzbio-${bioPage.username}-qrcode.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed downloading QR:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/75 backdrop-blur-md"
            id="qr-overlay"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-3xl bg-[#090d16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row"
            id="qr-modal"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer z-20"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>

            {/* COLUMN 1: LIVE QR PREVIEW & ACTIONS (LEFT) */}
            <div className="w-full md:w-[42%] bg-zinc-950/50 p-6 flex flex-col justify-between items-center border-b md:border-b-0 md:border-r border-white/5 min-h-[380px]">
              <div className="space-y-4 w-full text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                  <QrCode className="w-3 h-3 text-purple-400" /> Offline Share Code
                </span>
                
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Preview</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                  Test and scan directly on your screen.
                </p>
              </div>

              {/* High precision interactive Canvas */}
              <div className="relative my-4 aspect-square max-w-[220px] w-full flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl overflow-hidden">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="w-full space-y-2.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="cursor-pointer w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15"
                >
                  {downloading ? (
                    'Generating...'
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Download PNG (HD)
                    </>
                  )}
                </button>

                <p className="text-[10px] text-zinc-500 font-mono text-center flex items-center justify-center gap-1.5 select-none uppercase tracking-wide">
                  <Printer className="w-3.5 h-3.5 text-zinc-600" /> Optimized for stickers & Merch
                </p>
              </div>
            </div>

            {/* COLUMN 2: CUSTOMIZER STYLING PANEL (RIGHT) */}
            <div className="flex-1 p-6 space-y-6 max-h-[90vh] md:max-h-[580px] overflow-y-auto">
              <div>
                <h4 className="text-xl font-bold text-white">QR Code Studio</h4>
                <p className="text-zinc-400 text-xs mt-0.5 font-normal leading-relaxed">
                  Design a unique stamp for merchandise, business cards, instagram stories, or posters to route fans instantly.
                </p>
              </div>

              {/* URL Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">Redirection Target URL</label>
                <div className="grid grid-cols-2 gap-2.5 bg-zinc-950/60 p-1 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setUrlType('live')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      urlType === 'live'
                        ? 'bg-purple-600/90 text-white shadow'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    ⚡ Active Server Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlType('prod')}
                    className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      urlType === 'prod'
                        ? 'bg-purple-600/90 text-white shadow'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    🌐 Production Domain
                  </button>
                </div>
                <p className="text-[9px] font-mono text-zinc-500 select-all truncate">
                  Target: {qrUrl}
                </p>
              </div>

              {/* Theme Foreground Color Presets */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 leading-none">
                  <Palette className="w-3.5 h-3.5 text-purple-400" /> Spot Color Palette (Foreground)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setColorDark(col.hex)}
                      className={`w-8 h-8 rounded-full cursor-pointer relative flex items-center justify-center border-2 transition-all ${
                        colorDark === col.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {colorDark === col.hex && (
                        <Check 
                          className="w-4 h-4 text-white" 
                          style={{ filter: col.hex === '#ffffff' ? 'invert(1)' : 'none' }} 
                        />
                      )}
                    </button>
                  ))}
                  {/* Custom Hex Picker */}
                  <div className="relative w-8 h-8 rounded-full border border-white/10 overflow-hidden cursor-pointer hover:scale-105 transition-transform flex items-center justify-center bg-zinc-900">
                    <input 
                      type="color" 
                      value={colorDark.startsWith('#') ? colorDark : '#000000'} 
                      onChange={(e) => setColorDark(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="text-[9px] font-black text-zinc-400">HEX</span>
                  </div>
                </div>
              </div>

              {/* Pattern Background style selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 leading-none">
                  <Layout className="w-3.5 h-3.5 text-purple-400" /> Background Matrix Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950/40 p-2 rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setColorLight('#ffffff')}
                    className={`py-2 px-3 text-left rounded-xl transition-all cursor-pointer ${
                      colorLight === '#ffffff' ? 'bg-white/5 border border-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider">Classic Solid</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5 leading-none font-normal">Pure white backing</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorLight('#f4f4f5')}
                    className={`py-2 px-3 text-left rounded-xl transition-all cursor-pointer ${
                      colorLight === '#f4f4f5' ? 'bg-white/5 border border-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider">Soft Cloud</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5 leading-none font-normal">Off-white backdrop</p>
                  </button>
                </div>
              </div>

              {/* Brand Logo Overlays */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 leading-none">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Core Center Graphic Badge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'none', label: 'No Logo', detail: 'Regular dots' },
                    { id: 'avatar', label: 'My Avatar', detail: 'Profile Photo' },
                    { id: 'verified', label: 'Verified', detail: 'Cyan Badge' },
                    { id: 'gemini', label: 'AI Sparkle', detail: 'Magic Star' }
                  ].map((logo) => (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => setLogoType(logo.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:scale-102 flex flex-col items-center justify-between h-20 ${
                        logoType === logo.id 
                          ? 'bg-purple-600/10 border-purple-500 text-white' 
                          : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{logo.label}</p>
                      <p className="text-[8.5px] text-zinc-500 font-normal leading-none mb-1">{logo.detail}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* BOTTOM LABEL AT bottom of QR */}
              <div className="space-y-3.5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 cursor-pointer leading-none">
                    <Type className="w-3.5 h-3.5 text-purple-400" /> Base Signature Subtitle Label
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setIncludeLabel(!includeLabel)}
                    className={`w-11 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 cursor-pointer ${
                      includeLabel ? 'bg-purple-600' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                        includeLabel ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {includeLabel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-purple-500 focus:outline-none font-bold placeholder-zinc-600"
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value.substring(0, 24))}
                      maxLength={24}
                      placeholder={`e.g. @${bioPage.username}`}
                    />
                    <p className="text-[9px] text-zinc-500 leading-normal">
                      Prints custom high-contrast subtitle text drawn directly below the scannable dot matrix. (Max 24 characters)
                    </p>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
