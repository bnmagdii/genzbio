import React, { useState } from 'react';
import { 
  BioBlock, 
  BlockType 
} from '../types';
import { 
  Image, 
  Video, 
  Music, 
  Map, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sliders, 
  Link, 
  Heading, 
  HelpCircle, 
  Timer, 
  ShoppingBag, 
  MessageSquare, 
  Gift, 
  Mail, 
  SquareCode, 
  Dribbble, 
  Youtube, 
  Instagram, 
  Twitter, 
  Play, 
  Code
} from 'lucide-react';
import { detectPlatform, getPlatformInfo } from '../lib/platforms';

interface WidgetSettingsPanelProps {
  block: BioBlock;
  handleEditBlockField: (blockId: string, fields: Partial<BioBlock>) => void;
  uploadLoading: string | null;
  setUploadLoading: (loading: string | null) => void;
  uploadFileHelper: (file: File, folder: string) => Promise<string>;
  uploadVideoHelper: (file: File) => Promise<string>;
  uploadPdfHelper: (file: File) => Promise<string>;
  htmlPreviewMode: Record<string, 'code' | 'preview'>;
  setHtmlPreviewMode: React.Dispatch<React.SetStateAction<Record<string, 'code' | 'preview'>>>;
}

export default function WidgetSettingsPanel({
  block,
  handleEditBlockField,
  uploadLoading,
  setUploadLoading,
  uploadFileHelper,
  uploadVideoHelper,
  uploadPdfHelper,
  htmlPreviewMode,
  setHtmlPreviewMode
}: WidgetSettingsPanelProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* ========================================================
          1. WEBSITE LINK / SOCIAL LINK WIDGET
         ======================================================== */}
      {block.type === 'link' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">
            Link and Icon Attributes
          </label>
          
          <div className="space-y-2">
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 font-bold">Target link URL</span>
            <div className="relative">
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => {
                  const urlVal = e.target.value;
                  const detected = detectPlatform(urlVal);
                  handleEditBlockField(block.id, { 
                    url: urlVal,
                    platform: detected
                  });
                }}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                placeholder="Paste external target url, e.g. https://github.com/..."
              />
              <Link className="absolute right-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 font-bold">Auto-detected service</span>
              <select
                value={block.platform || 'external'}
                onChange={(e) => handleEditBlockField(block.id, { platform: e.target.value })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-xs text-zinc-300"
              >
                <option value="external">Generic Link</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">X / Twitter</option>
                <option value="spotify">Spotify</option>
                <option value="github">GitHub</option>
                <option value="tiktok">TikTok</option>
                <option value="dribbble">Dribbble</option>
                <option value="twitch">Twitch Stream</option>
                <option value="custom">Brand Specific Custom</option>
              </select>
            </div>

            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 font-bold">Accent Color (Optional)</span>
              <input
                type="color"
                value={block.color || '#a855f7'}
                onChange={(e) => handleEditBlockField(block.id, { color: e.target.value })}
                className="bg-transparent border-0 outline-none w-full h-8 cursor-pointer rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. PARAGRAPH TEXT WIDGET
         ======================================================== */}
      {block.type === 'text' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
            Paragraph Body Content
          </label>
          <div>
            <textarea
              rows={4}
              value={block.content || ''}
              onChange={(e) => handleEditBlockField(block.id, { content: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder="Write some aesthetic descriptions, career update, bio statement..."
            />
          </div>
        </div>
      )}

      {/* ========================================================
          3. HEADLINE TITLE WIDGET
         ======================================================== */}
      {block.type === 'heading' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-pink-400 uppercase tracking-widest">
            Headline Sub-Text Content
          </label>
          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Sub-headline Description (Optional)</span>
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => handleEditBlockField(block.id, { content: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
              placeholder="e.g. Creator / Sound Engineer / UAE Designer"
            />
          </div>

          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Heading Size Scale</span>
            <select
              value={block.extraData?.size || 'lg'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, size: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-xs text-zinc-300"
            >
              <option value="sm">Small Accent Divider Heading</option>
              <option value="md">Medium Section Headline</option>
              <option value="lg">Large Giga Master Branding Head</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================
          4. GALLERY GRID & IMAGE CAROUSEL (SLIDER) WIDGETS
         ======================================================== */}
      {(block.type === 'gallery' || block.type === 'slider') && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center pb-1">
            <label className="block text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">
              {block.type === 'gallery' ? 'GRID PORTFOLIO IMAGES' : 'CAROUSEL IMAGES'}
            </label>
            {uploadLoading === block.id && (
              <span className="text-[9px] text-pink-400 font-mono animate-pulse uppercase font-black flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Uploading device...
              </span>
            )}
          </div>

          {/* Dropzone area */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (!files || files.length === 0) return;
              setUploadLoading(block.id);
              setUploadError(null);
              const currentImages = block.images || [];
              const newUrls: string[] = [];
              for (let i = 0; i < files.length; i++) {
                try {
                  const folderPath = block.type === 'gallery' ? 'gallery-images' : 'carousel-images';
                  const url = await uploadFileHelper(files[i], folderPath);
                  newUrls.push(url);
                } catch (err: any) {
                  setUploadError(err.message || 'File upload failed');
                }
              }
              if (newUrls.length > 0) {
                handleEditBlockField(block.id, { images: [...currentImages, ...newUrls] });
              }
              setUploadLoading(null);
            }}
            className="border-2 border-dashed border-white/10 hover:border-purple-500/30 rounded-2xl p-5 text-center transition-colors cursor-pointer relative bg-zinc-950/20"
          >
            <input 
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setUploadLoading(block.id);
                setUploadError(null);
                const currentImages = block.images || [];
                const newUrls: string[] = [];
                for (let i = 0; i < files.length; i++) {
                  try {
                    const folderPath = block.type === 'gallery' ? 'gallery-images' : 'carousel-images';
                    const url = await uploadFileHelper(files[i], folderPath);
                    newUrls.push(url);
                  } catch (err: any) {
                    setUploadError(err.message || 'File upload failed');
                  }
                }
                if (newUrls.length > 0) {
                  handleEditBlockField(block.id, { images: [...currentImages, ...newUrls] });
                }
                setUploadLoading(null);
              }}
            />
            <Image className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs font-black text-zinc-300">Drag & Drop Images here</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Or click to browse device (GIF, PNG, JPG up to 10MB)</p>
          </div>

          {uploadError && (
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide bg-red-950/20 p-2.5 rounded-lg border border-red-500/10">
              ⚠ {uploadError}
            </p>
          )}

          {/* Images thumbnails list */}
          {block.images && block.images.length > 0 && (
            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Active Slides / Images ({block.images.length})</label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {block.images.map((imgUrl, imgIdx) => (
                  <div key={imgIdx} className="group relative rounded-xl bg-zinc-950 border border-white/5 overflow-hidden flex flex-col">
                    <img src={imgUrl} alt="Thumbnail" className="w-full h-20 object-cover" referrerPolicy="no-referrer" />
                    <div className="flex justify-between items-center p-1.5 bg-black/40 border-t border-white/5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={imgIdx === 0}
                          onClick={() => {
                            const copy = [...(block.images || [])];
                            [copy[imgIdx - 1], copy[imgIdx]] = [copy[imgIdx], copy[imgIdx - 1]];
                            handleEditBlockField(block.id, { images: copy });
                          }}
                          className="p-1 rounded bg-black/50 text-zinc-400 hover:text-white disabled:opacity-45"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={imgIdx === (block.images?.length || 0) - 1}
                          onClick={() => {
                            const copy = [...(block.images || [])];
                            [copy[imgIdx + 1], copy[imgIdx]] = [copy[imgIdx], copy[imgIdx + 1]];
                            handleEditBlockField(block.id, { images: copy });
                          }}
                          className="p-1 rounded bg-black/50 text-zinc-400 hover:text-white disabled:opacity-45"
                          title="Move Right"
                        >
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <label className="p-1 rounded bg-black/50 text-purple-400 hover:text-purple-200 cursor-pointer shrink-0" title="Replace File">
                          <RefreshCw className="w-2.5 h-2.5" />
                          <input 
                            type="file" 
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={async (e) => {
                              const repFile = e.target.files?.[0];
                              if (!repFile) return;
                              setUploadLoading(block.id);
                              setUploadError(null);
                              try {
                                const fld = block.type === 'gallery' ? 'gallery-images' : 'carousel-images';
                                const repsUrl = await uploadFileHelper(repFile, fld);
                                const copy = [...(block.images || [])];
                                copy[imgIdx] = repsUrl;
                                handleEditBlockField(block.id, { images: copy });
                              } catch (err: any) {
                                setUploadError(err.message || 'Replace file failed');
                              }
                              setUploadLoading(null);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const copy = [...(block.images || [])];
                            copy.splice(imgIdx, 1);
                            handleEditBlockField(block.id, { images: copy });
                          }}
                          className="p-1 rounded bg-black/50 text-red-400 hover:text-red-200"
                          title="Remove Image"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GALLERY GRID EXTRAS (Layout style, Columns, Spacing gap) */}
          {block.type === 'gallery' && (
            <div className="space-y-3 pt-2.5 border-t border-white/5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Grid Pattern Style</label>
                  <select
                    value={block.extraData?.layout || 'grid'}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, layout: e.target.value } })}
                    className="w-full bg-zinc-950/60 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300"
                  >
                    <option value="grid">Standard Block Grid</option>
                    <option value="masonry">Waterfalls Masonry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Visual Gap Spacing</label>
                  <select
                    value={block.extraData?.spacing || 'md'}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, spacing: e.target.value } })}
                    className="w-full bg-zinc-950/60 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300"
                  >
                    <option value="none">No gaps (0px)</option>
                    <option value="sm">Small tight (4px)</option>
                    <option value="md">Normal grid (8px)</option>
                    <option value="lg">Spacious gaps (14px)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Columns count ({block.extraData?.columns || 2})</label>
                <input 
                  type="range"
                  min="1"
                  max="5"
                  value={block.extraData?.columns || 2}
                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, columns: parseInt(e.target.value) } })}
                  className="w-full h-1 accent-purple-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-zinc-650 mt-1">
                  <span>1col</span>
                  <span>2col</span>
                  <span>3col</span>
                  <span>4col</span>
                  <span>5col</span>
                </div>
              </div>
            </div>
          )}

          {/* CAROUSEL SLIDER EXTRAS */}
          {block.type === 'slider' && (
            <div className="space-y-3 pt-2.5 border-t border-white/5 text-zinc-350 text-[11px]">
              <div className="grid grid-cols-2 gap-3.5">
                <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-zinc-950/20 rounded-xl border border-white/5">
                  <input 
                    type="checkbox"
                    checked={block.extraData?.autoplay !== false}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, autoplay: e.target.checked } })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Autoplay loop</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-zinc-950/20 rounded-xl border border-white/5">
                  <input 
                    type="checkbox"
                    checked={block.extraData?.loop !== false}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, loop: e.target.checked } })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Infinite loop</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-zinc-950/20 rounded-xl border border-white/5">
                  <input 
                    type="checkbox"
                    checked={block.extraData?.showArrows !== false}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, showArrows: e.target.checked } })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Show Arrow Nav</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-zinc-950/20 rounded-xl border border-white/5">
                  <input 
                    type="checkbox"
                    checked={block.extraData?.showDots !== false}
                    onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, showDots: e.target.checked } })}
                    className="accent-purple-500 rounded"
                  />
                  <span>Show Dot Indicators</span>
                </label>
              </div>

              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Slide delay: {block.extraData?.speed || 3000} ms</label>
                <input 
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={block.extraData?.speed || 3000}
                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, speed: parseInt(e.target.value) } })}
                  className="w-full h-1 accent-purple-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          5. VIDEO PLAYER WIDGET
         ======================================================== */}
      {block.type === 'video' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-pink-400 uppercase tracking-widest">VIDEO SOURCE CONTROLLER</label>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">External Link (YouTube / Vimeo / MP4)</label>
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleEditBlockField(block.id, { url: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="Paste e.g. https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="relative border-2 border-dashed border-white/10 p-4 rounded-xl text-center bg-zinc-950/10 hover:border-pink-500/30 transition-colors">
            <input 
              type="file"
              accept="video/mp4"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadLoading(block.id);
                setUploadError(null);
                try {
                  const downloadUrl = await uploadVideoHelper(file);
                  handleEditBlockField(block.id, { url: downloadUrl });
                } catch (err: any) {
                  setUploadError(err.message || 'Video upload failed');
                }
                setUploadLoading(null);
              }}
            />
            <Video className="w-6 h-6 text-zinc-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-zinc-350">Or Upload MP4 from device</p>
            <p className="text-[9px] text-zinc-500 mt-0.5">Maximum size: 10 MB (MP4 format)</p>
          </div>

          {uploadLoading === block.id && (
            <div className="text-center text-[10px] text-purple-400 font-bold tracking-wide animate-pulse uppercase">
              ⏳ Encoding and uploading MP4 video stream...
            </div>
          )}

          {uploadError && (
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide bg-red-950/20 p-2 text-center rounded-lg">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* ========================================================
          6. SPOTIFY / MUSIC EMBED WIDGET
         ======================================================== */}
      {block.type === 'music' && (
        <div className="space-y-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">SPOTIFY COMPONENT EMBEDDED</label>
          
          <div>
            <p className="text-[10px] text-zinc-500 mb-2">Paste Spotify Playlist, Album, or Track URL link. It will automatically construct standard responsive visual streaming frames.</p>
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleEditBlockField(block.id, { url: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white"
              placeholder="Paste e.g. https://open.spotify.com/playlist/..."
            />
          </div>
        </div>
      )}

      {/* ========================================================
          7. MAP LOCATION WIDGET
         ======================================================== */}
      {block.type === 'map' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">MAP LOCATION SETTINGS</label>

          <div className="grid grid-cols-3 gap-2">
            {['search', 'coordinates', 'url'].map((mType) => (
              <button
                key={mType}
                type="button"
                onClick={() => handleEditBlockField(block.id, { extraData: { ...block.extraData, type: mType } })}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors ${
                  (block.extraData?.type || 'search') === mType
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-zinc-950 border-white/5 text-zinc-500'
                }`}
              >
                {mType}
              </button>
            ))}
          </div>

          {/* SEARCH BAR TYPE */}
          {(block.extraData?.type || 'search') === 'search' && (
            <div>
              <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Search Natural Address Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={block.extraData?.searchQuery || ''}
                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, searchQuery: e.target.value } })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 pl-8 pr-3 text-xs text-white focus:outline-none"
                  placeholder="e.g. Dubai Mall, UAE"
                />
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              </div>
            </div>
          )}

          {/* COORDINATES TYPE */}
          {(block.extraData?.type) === 'coordinates' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Latitude</label>
                <input
                  type="text"
                  value={block.extraData?.latitude || ''}
                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, latitude: e.target.value } })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                  placeholder="e.g. 25.1972"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Longitude</label>
                <input
                  type="text"
                  value={block.extraData?.longitude || ''}
                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, longitude: e.target.value } })}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                  placeholder="e.g. 55.2744"
                />
              </div>
            </div>
          )}

          {/* MAP URL */}
          {(block.extraData?.type) === 'url' && (
            <div>
              <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Google Maps Direct URL Paste</label>
              <input
                type="text"
                value={block.url || ''}
                onChange={(e) => handleEditBlockField(block.id, { url: e.target.value })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white font-mono"
                placeholder="https://maps.google.com/..."
              />
            </div>
          )}

          <div>
            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Map Zoom factor: {block.extraData?.zoom || 13}</label>
            <input 
              type="range"
              min="6"
              max="19"
              value={block.extraData?.zoom || 13}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, zoom: parseInt(e.target.value) } })}
              className="w-full h-1 accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          8. SOCIAL FEED EMBED WIDGET
         ======================================================== */}
      {block.type === 'social_feed' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">SOCIAL EMBED FEED</label>

          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Feed Social Channel Type</label>
            <select
              value={block.extraData?.feedType || 'youtube'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, feedType: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-xs text-zinc-300"
            >
              <option value="youtube">YouTube Channel / Latest Videos Feed</option>
              <option value="tiktok">TikTok Post / TikTok Profile Widget</option>
              <option value="instagram">Instagram Grid Post / Bio Highlights</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Profile URL slug or Embed Link</label>
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleEditBlockField(block.id, { url: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
              placeholder={
                (block.extraData?.feedType === 'tiktok') ? 'https://www.tiktok.com/@username/video/...' : 
                (block.extraData?.feedType === 'instagram') ? 'https://www.instagram.com/p/...' : 
                'https://www.youtube.com/channel/...'
              }
            />
          </div>
        </div>
      )}

      {/* ========================================================
          9. PDF DOWNLOAD WIDGET
         ======================================================== */}
      {block.type === 'pdf' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <label className="block text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">PDF FILE LOADER</label>

          <div className="relative border-2 border-dashed border-white/10 hover:border-emerald-500/30 p-5 rounded-2xl text-center cursor-pointer transition-colors bg-zinc-950/10">
            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadLoading(block.id);
                setUploadError(null);
                try {
                  const pdfUrl = await uploadPdfHelper(file);
                  handleEditBlockField(block.id, { 
                    url: pdfUrl, 
                    extraData: { 
                      ...block.extraData, 
                      fileName: file.name,
                      fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
                    } 
                  });
                } catch (err: any) {
                  setUploadError(err.message || 'PDF upload failed');
                }
                setUploadLoading(null);
              }}
            />
            <FileText className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-300">Drag & Drop PDF or Click to Select</p>
            <p className="text-[9px] text-zinc-500 mt-0.5">Maximum size: 10 MB (Official raw PDF)</p>
          </div>

          {uploadLoading === block.id && (
            <p className="text-center text-[10px] text-emerald-400 font-bold animate-pulse uppercase">
              ⏳ Registering document with workspace storage...
            </p>
          )}

          {uploadError && (
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wide bg-red-950/20 p-2 text-center rounded-lg">
              {uploadError}
            </p>
          )}

          {block.extraData?.fileName && (
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-300 text-[11px] font-mono truncate">{block.extraData.fileName}</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold shrink-0">{block.extraData.fileSize}</span>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Download Label Action Text</label>
            <input
              type="text"
              value={block.extraData?.btnLabel || 'Download Official PDF file'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, btnLabel: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
              placeholder="Download PDF now"
            />
          </div>
        </div>
      )}

      {/* ========================================================
          10. CUSTOM HTML WIDGET
         ======================================================== */}
      {block.type === 'html' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">CUSTOM CODE COMPILER</label>
            
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-white/5">
              {['code', 'preview'].map((pMode) => (
                <button
                  key={pMode}
                  type="button"
                  onClick={() => setHtmlPreviewMode((prev) => ({ ...prev, [block.id]: pMode as any }))}
                  className={`py-1 px-2.5 rounded-md text-[9px] font-bold uppercase transition-colors ${
                    (htmlPreviewMode[block.id] || 'code') === pMode
                      ? 'bg-purple-650 text-white bg-purple-600'
                      : 'text-zinc-520 hover:text-zinc-300 text-zinc-500'
                  }`}
                >
                  {pMode}
                </button>
              ))}
            </div>
          </div>

          {(htmlPreviewMode[block.id] || 'code') === 'code' ? (
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-zinc-450 uppercase mb-1 flex items-center gap-1">
                <Code className="w-3 h-3 text-purple-400" /> Embed HTML Code Editor
              </label>
              <textarea
                rows={6}
                value={block.content || ''}
                onChange={(e) => handleEditBlockField(block.id, { content: e.target.value })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-sky-450 font-mono focus:border-purple-500 focus:outline-none text-sky-300"
                placeholder='<div class="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-center font-bold text-white">Interactive banner tags</div>'
              />
            </div>
          ) : (
            <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 min-h-[100px] overflow-x-auto">
              <div 
                className="text-xs text-white"
                dangerouslySetInnerHTML={{ __html: block.content || '<p class="text-zinc-500 italic">No html code compiled.</p>' }} 
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          11. FAQ ACCORDION MANAGER
         ======================================================== */}
      {block.type === 'faq' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">FAQ QUESTIONS ACCORDION</label>

          <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
            {((block.extraData?.items) || [{ q: 'FAQ question?', a: 'FAQ response' }]).map((item: any, id: number) => {
              const currentItems = [...(block.extraData?.items || [{ q: 'FAQ question?', a: 'FAQ response' }])];
              return (
                <div key={id} className="p-3.5 bg-zinc-950 border border-white/5 rounded-2xl space-y-2.5 relative">
                  <div className="absolute right-2 top-2">
                    <button
                      type="button"
                      onClick={() => {
                        const copy = [...currentItems];
                        copy.splice(id, 1);
                        handleEditBlockField(block.id, { extraData: { ...block.extraData, items: copy } });
                      }}
                      className="text-red-400 hover:text-red-300 p-0.5 rounded transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-zinc-500 font-bold font-mono text-[9px] uppercase">FAQ ITEM #{id + 1}</div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Question:</span>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => {
                        const copy = [...currentItems];
                        copy[id] = { ...copy[id], q: e.target.value };
                        handleEditBlockField(block.id, { extraData: { ...block.extraData, items: copy } });
                      }}
                      className="w-full bg-[#141d2f] border border-white/5 px-2.5 py-1.5 rounded-xl text-xs text-white focus:outline-none"
                      placeholder="Add Question text..."
                    />
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Answer:</span>
                    <textarea
                      rows={2}
                      value={item.a}
                      onChange={(e) => {
                        const copy = [...currentItems];
                        copy[id] = { ...copy[id], a: e.target.value };
                        handleEditBlockField(block.id, { extraData: { ...block.extraData, items: copy } });
                      }}
                      className="w-full bg-[#141d2f] border border-white/5 px-2.5 py-1.5 rounded-xl text-xs text-white focus:outline-none"
                      placeholder="Give answers here..."
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              const current = block.extraData?.items || [{ q: 'FAQ question?', a: 'FAQ response' }];
              handleEditBlockField(block.id, { 
                extraData: { 
                  ...block.extraData, 
                  items: [...current, { q: 'New Question?', a: 'Fresh answer here...' }] 
                } 
              });
            }}
            className="w-full py-2 bg-purple-900/20 border border-purple-500/20 hover:bg-purple-900/40 rounded-xl text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Question Item
          </button>
        </div>
      )}

      {/* ========================================================
          12. TESTIMONIAL PANEL CUSTOMIZER
         ======================================================== */}
      {block.type === 'testimonial' && (
        <div className="space-y-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-teal-400 uppercase tracking-widest">PARTNER TESTIMONIAL / STATEMENT</label>
          
          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Review Quote Statement</span>
            <textarea
              rows={2.5}
              value={block.extraData?.quote || ''}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, quote: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl p-2 px-3 text-xs text-white focus:outline-none"
              placeholder="'Best beat productions ever!'"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Author Name</span>
              <input
                type="text"
                value={block.extraData?.author || ''}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, author: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                placeholder="Ahmed Khan"
              />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Author Social Handle</span>
              <input
                type="text"
                value={block.extraData?.tag || ''}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, tag: e.target.value } })}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none"
                placeholder="@ahmed_gfx"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          13. NEWSLETTER WIRED INBOX
         ======================================================== */}
      {block.type === 'newsletter' && (
        <div className="space-y-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-purple-400 uppercase tracking-widest">NEWSLETTER SUBSCRIPTION PANEL</label>
          
          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Description Captions</span>
            <input
              type="text"
              value={block.extraData?.caption || 'Lock in to download weekly designs and free templates.'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, caption: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Button Text Option</span>
              <input
                type="text"
                value={block.extraData?.btnLabel || 'Join Crew'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, btnLabel: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Placeholder Value</span>
              <input
                type="text"
                value={block.extraData?.placeholder || 'Insert main email...'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, placeholder: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          14. SUPPORT & DONATION WIDGET
         ======================================================== */}
      {block.type === 'donation' && (
        <div className="space-y-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-pink-500 uppercase tracking-widest">DONATION & CREATORS SUPPORT</label>
          
          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Payment Target URL link</span>
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleEditBlockField(block.id, { url: e.target.value })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none"
              placeholder="Paste e.g. https://www.paypal.me/username"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Button Accent color</span>
              <input
                type="color"
                value={block.extraData?.btnColor || '#db2777'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, btnColor: e.target.value } })}
                className="bg-transparent border-0 outline-none w-full h-8 cursor-pointer rounded-lg"
              />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Payment Platform</span>
              <select
                value={block.extraData?.platform || 'paypal'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, platform: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-xs text-zinc-300"
              >
                <option value="paypal">PayPal Link</option>
                <option value="buymeacoffee">Buy Me A Coffee</option>
                <option value="kofi">Ko-Fi widget</option>
                <option value="patreon">Patreon link</option>
                <option value="custom">Generic Custom support link</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          15. COUTDOWN TIMER CLOCK WIDGET
         ======================================================== */}
      {block.type === 'countdown' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">
            Countdown Target Date Time
          </label>
          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Select Target Deadline</span>
            <input
              type="datetime-local"
              value={block.extraData?.dateTime || '2026-12-31T00:00:00'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, dateTime: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-zinc-500 italic">
            This clock automatically calculates and counts down the months, days, hours, and minutes remaining live.
          </p>
        </div>
      )}

      {/* ========================================================
          16. E-COMMERCE PRODUCT WIDGET
         ======================================================== */}
      {block.type === 'product' && (
        <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5 text-[11px]">
          <label className="block text-[10px] font-extrabold text-yellow-500 uppercase tracking-widest">
            E-Commerce Product Design
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Price Amount</span>
              <input
                type="text"
                value={block.extraData?.price || '29.99'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, price: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                placeholder="29.99"
              />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Currency</span>
              <input
                type="text"
                value={block.extraData?.currency || 'USD'}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, currency: e.target.value } })}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Buy Now Target Link URL</span>
            <input
              type="text"
              value={block.extraData?.buyUrl || ''}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, buyUrl: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
              placeholder="e.g. https://stripe.com/... or gumroad.com/..."
            />
          </div>

          <div className="space-y-2">
            <span className="block text-[8px] uppercase tracking-wide text-zinc-400 font-bold">Product Hero Image URL</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={block.extraData?.image || ''}
                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, image: e.target.value } })}
                className="flex-1 bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-[11px] text-white focus:outline-none font-mono"
                placeholder="Paste Image URL..."
              />
              <label className="p-2 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/10 cursor-pointer text-xs flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4" />
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadLoading(block.id);
                    setUploadError(null);
                    try {
                      const url = await uploadFileHelper(file, 'product-images');
                      handleEditBlockField(block.id, { extraData: { ...block.extraData, image: url } });
                    } catch (err: any) {
                      setUploadError(err.message || 'Product image upload failed');
                    }
                    setUploadLoading(null);
                  }}
                />
              </label>
            </div>
            {block.extraData?.image && (
              <img 
                src={block.extraData.image} 
                alt="Product Preview" 
                className="w-16 h-16 object-cover rounded-xl border border-white/5" 
                referrerPolicy="no-referrer" 
              />
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          17. DIVIDER ROW LINE WIDGET
         ======================================================== */}
      {block.type === 'divider' && (
        <div className="grid grid-cols-2 gap-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
          <div>
            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Divider line style</label>
            <select
              value={block.extraData?.lineStyle || 'solid'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, lineStyle: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="solid">Solid continuous line</option>
              <option value="dashed">Dashed gap lines</option>
              <option value="dotted">Dotted rounded lines</option>
            </select>
          </div>
          <div>
            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Row height margins</label>
            <select
              value={block.extraData?.spacing || 'md'}
              onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, spacing: e.target.value } })}
              className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300 focus:outline-none"
            >
              <option value="sm">Small size margins (12px)</option>
              <option value="md">Normal height margins (24px)</option>
              <option value="lg">Grave spacious margins (45px)</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================
          18. PRIVATE Q&A ANONYMOUS CONTACT INBOX
         ======================================================== */}
      {block.type === 'contact' && (
        <div className="p-4 rounded-2xl bg-zinc-950/25 border border-white/[0.04] text-[11px] leading-relaxed text-zinc-400">
          <label className="block text-[10px] font-extrabold text-pink-400 uppercase tracking-widest mb-1">
            ANONYMOUS Q&A CONTACT INBOX
          </label>
          <p>
            This widget provides your profile with an active, functional private form. Visitors can type anonymous questions or confessions directly.
          </p>
          <p className="mt-2 text-zinc-500">
            Messages are preserved in your inbox and can be reviewed inside the inbox panel. No extra config is required!
          </p>
        </div>
      )}

      {/* ========================================================
          COMMON: INTERACTIVE ANIMATION FX CONTROLS
         ======================================================== */}
      <div className="pt-2 border-t border-white/5">
        <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1">Motion Entry Effects</label>
        <select
          value={block.animation || 'none'}
          onChange={(e) => handleEditBlockField(block.id, { animation: e.target.value })}
          className="w-full bg-zinc-955 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white"
        >
          <option value="none">Solid (Static Style)</option>
          <option value="fade">Smooth Fade In</option>
          <option value="bounce">Vibrant bounce Loop</option>
          <option value="pop">Aesthetic hover pop</option>
          <option value="float">Floating Ambient Loop</option>
        </select>
      </div>
    </div>
  );
}
