import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BioPageConfig, BioBlock, BlockType } from '../types';
import { detectPlatform, getPlatformInfo } from '../lib/platforms';
import { THEMES, getTheme } from '../lib/themes';
import BioPage from './BioPage';
import AnimationPicker from './AnimationPicker';
import { ImageProcessor } from '../lib/ImageProcessor';
import { uploadService } from '../lib/uploadService';
import { UploadProgressBar } from './UploadProgressBar';
import {
  Sparkles,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Smartphone,
  Monitor,
  CheckCircle,
  Save,
  ChevronLeft,
  X,
  Eye,
  EyeOff,
  Link,
  Heading,
  AlignLeft,
  SeparatorHorizontal,
  Image,
  Video,
  Music,
  HelpCircle,
  Timer,
  ShoppingBag,
  MessageSquare,
  Gift,
  FileText,
  Map,
  Grid,
  Mail,
  SquareCode,
  MapPin,
  RefreshCw,
  Sliders,
  Check,
  User,
  Search,
  Flame,
  Users,
  AlertTriangle
} from 'lucide-react';

interface BuilderProps {
  bioId: string;
  onBackToDashboard: () => void;
  onViewDemo: (username: string) => void;
}

export default function Builder({ bioId, onBackToDashboard, onViewDemo }: BuilderProps) {
  const [bio, setBio] = useState<BioPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Multi-step builder tabs
  const [builderTab, setBuilderTab] = useState<'blocks' | 'profile' | 'appearance' | 'seo' | 'integrations'>('blocks');
  const [activeSocialPlatform, setActiveSocialPlatform] = useState<'instagram' | 'x' | 'tiktok' | 'messages' | 'google'>('instagram');
  const [instagramStyle, setInstagramStyle] = useState<'dm' | 'story'>('dm');
  const [tiktokStyle, setTiktokStyle] = useState<'profile' | 'dm'>('profile');
  const [appearanceSubTab, setAppearanceSubTab] = useState<'themes' | 'widgets'>('themes');

  // Undo/Redo History Stacks
  const [history, setHistory] = useState<BioBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<BioBlock[][]>([]);

  // Block creation selector
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  
  // Custom theme editor states (under profile bg)
  const [selectedThemeId, setSelectedThemeId] = useState('premium_glass');
  const [themeCategory, setThemeCategory] = useState<'all' | 'glass' | 'neon' | 'dark' | 'custom'>('all');
  const [gColor1, setGColor1] = useState('#2e1065');
  const [gColor2, setGColor2] = useState('#d946ef');
  const [gAngle, setGAngle] = useState(135);
  const [gStop1, setGStop1] = useState(0);
  const [gStop2, setGStop2] = useState(100);

  // Custom widget editor states
  const [htmlPreviewMode, setHtmlPreviewMode] = useState<Record<string, 'code' | 'preview'>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null); // tracks block ID of active upload
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [uploadEta, setUploadEta] = useState<number | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const uploadWithRetry = (
    file: File | Blob,
    storagePath: string,
    onProgress: (progress: number) => void,
    blockId: string | null = null,
    fileName: string = 'file',
    maxAttempts = 3,
    timeoutMs = 30000
  ): Promise<string> => {
    let attempt = 0;
    
    const runAttempt = (): Promise<string> => {
      attempt++;
      console.log(`%c[Cloudinary] Upload Attempt ${attempt}/${maxAttempts} Started. Name: ${fileName}`, 'color: #3b82f6; font-weight: bold;');
      
      const uploadTask = uploadToCloudinary(file, fileName, blockId, onProgress);
      
      uploadService.startUpload(
        uploadTask,
        blockId,
        fileName,
        () => {
          console.log('[Builder] Upload cancelled via Service callback.');
          uploadTask.cancel();
          setUploadProgress(null);
          setUploadSpeed(null);
          setUploadEta(null);
          setUploadLoading(null);
          setUploading(false);
        }
      );

      const timeoutId = setTimeout(() => {
        console.warn(`%c[Cloudinary] Attempt ${attempt} Timed Out after ${timeoutMs / 1000}s. Cancelling task...`, 'color: #f59e0b; font-weight: bold;');
        try {
          uploadTask.cancel();
        } catch (cancelErr) {
          console.error('[Cloudinary] Failed to cancel upload task:', cancelErr);
        }
      }, timeoutMs);

      return uploadTask.promise.then((url) => {
        clearTimeout(timeoutId);
        return url;
      }).catch((error) => {
        clearTimeout(timeoutId);
        if (error.message === 'Upload cancelled by user.' || error.message === 'Upload cancelled.') {
          throw error;
        }
        if (attempt < maxAttempts) {
          console.log(`%c[Cloudinary] Retrying upload (attempt ${attempt + 1}/${maxAttempts})...`, 'color: #a855f7; font-weight: bold;');
          return runAttempt();
        } else {
          throw error;
        }
      });
    };

    return runAttempt();
  };

  const uploadFileHelper = (file: File, folder: string, blockId: string | null = null): Promise<string> => {
    setUploading(true);
    return new Promise(async (resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!allowed.includes(extension)) {
         setUploading(false);
         reject(new Error('Unsupported file format. Please upload JPG, JPEG, PNG, WEBP, or GIF.'));
         return;
      }

      console.log(`Original image size: ${file.size} bytes`);
      console.log(`%c[ImageProcessor] Original file size: ${(file.size / 1024).toFixed(2)} KB (${file.size} bytes)`, 'color: #ec4899; font-weight: bold;');
      setUploadProgress(0);
      setUploadSpeed(null);
      setUploadEta(null);

      try {
        console.log('[ImageProcessor] Running canvas-based WebP compression and resizing steps...');
        const processedFileOrBlob = await ImageProcessor.processImage(file, {
          maxDimension: 1600,
          quality: 0.82,
          maxSizeBytes: MAX_FILE_SIZE
        }).catch((err) => {
          console.warn("[ImageProcessor] Optimized conversion skipped, using raw file", err);
          return file;
        });

        console.log(`Compressed image size: ${processedFileOrBlob.size} bytes`);
        console.log(`%c[ImageProcessor] Compressed file size: ${(processedFileOrBlob.size / 1024).toFixed(2)} KB (${processedFileOrBlob.size} bytes)`, 'color: #10b981; font-weight: bold;');

        const uid = auth.currentUser?.uid || 'anonymous';
        const isWebp = processedFileOrBlob.type === 'image/webp';
        const finalName = isWebp 
          ? file.name.substring(0, file.name.lastIndexOf('.')) + '.webp'
          : file.name;
        const storagePath = `${folder}/${uid}/${Date.now()}-${finalName}`;

        const downloadUrl = await uploadWithRetry(
          processedFileOrBlob,
          storagePath,
          (progress) => setUploadProgress(progress),
          blockId,
          file.name
        );

        setUploadProgress(null);
        setUploadSpeed(null);
        setUploadEta(null);
        setSuccessToast("Image uploaded successfully!");
        setTimeout(() => setSuccessToast(null), 3000);
        resolve(downloadUrl);
      } catch (err: any) {
        setUploadProgress(null);
        setUploadSpeed(null);
        setUploadEta(null);
        console.error(`%c[ImageProcessor] Upload failure:`, 'color: #ef4444; font-weight: bold;', err);
        reject(err);
      } finally {
        setUploading(false);
      }
    });
  };

  const uploadPdfHelper = (file: File, blockId: string | null = null): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error('PDF file size is too large (max limit is 5 MB).'));
        return;
      }
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (extension !== 'pdf') {
        reject(new Error('Only PDF files are supported.'));
        return;
      }

      console.log(`[Firebase Storage] Starting PDF Upload for file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      setUploadProgress(0);
      try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const storagePath = `pdf-documents/${uid}/${Date.now()}-${file.name}`;
        
        const downloadUrl = await uploadWithRetry(
          file,
          storagePath,
          (progress) => setUploadProgress(progress),
          blockId,
          file.name
        );

        setUploadProgress(null);
        setSuccessToast("PDF uploaded successfully!");
        setTimeout(() => setSuccessToast(null), 3000);
        resolve(downloadUrl);
      } catch (err: any) {
        setUploadProgress(null);
        console.warn("[Firebase Storage] PDF upload failed, falling back to base64", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert PDF file.'));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const uploadVideoHelper = (file: File, blockId: string | null = null): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error('Video file size is too large (max limit is 5 MB).'));
        return;
      }
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      if (extension !== 'mp4') {
        reject(new Error('Only MP4 videos are supported.'));
        return;
      }

      console.log(`[Firebase Storage] Starting Video Upload for file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      setUploadProgress(0);
      try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const storagePath = `video-uploads/${uid}/${Date.now()}-${file.name}`;

        const downloadUrl = await uploadWithRetry(
          file,
          storagePath,
          (progress) => setUploadProgress(progress),
          blockId,
          file.name
        );

        setUploadProgress(null);
        setSuccessToast("Video uploaded successfully!");
        setTimeout(() => setSuccessToast(null), 3000);
        resolve(downloadUrl);
      } catch (err: any) {
        setUploadProgress(null);
        console.warn("[Firebase Storage] Video upload failed, falling back to base64", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert MP4.'));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const uploadIconHelper = (file: File, blockId: string | null = null): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const allowed = ['png', 'svg', 'ico', 'webp'];
      if (!allowed.includes(extension)) {
         reject(new Error('Unsupported file format. Please upload PNG, SVG, ICO, or WEBP.'));
         return;
      }

      console.log(`[Firebase Storage] Starting custom icon upload for file: ${file.name}`);
      setUploadProgress(0);
      try {
        const uid = auth.currentUser?.uid || 'anonymous';
        const storagePath = `link-icons/${uid}/${Date.now()}-${file.name}`;

        const downloadUrl = await uploadWithRetry(
          file,
          storagePath,
          (progress) => setUploadProgress(progress),
          blockId,
          file.name
        );

        setUploadProgress(null);
        setSuccessToast("Icon uploaded successfully!");
        setTimeout(() => setSuccessToast(null), 3000);
        resolve(downloadUrl);
      } catch (err: any) {
        setUploadProgress(null);
        console.warn("[Firebase Storage] Icon upload failed, falling back to base64", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert icon.'));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  useEffect(() => {
    fetchBioData();
  }, [bioId]);

  const fetchBioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bioRef = doc(db, 'bios', bioId);
      const bioSnap = await getDoc(bioRef).catch((err) =>
        handleFirestoreError(err, OperationType.GET, `bios/${bioId}`)
      );
      if (bioSnap.exists()) {
        const data = bioSnap.data() as BioPageConfig;
        setBio(data);
        setSelectedThemeId(data.themeId);
        // Initialize history stack
        setHistory([data.blocks || []]);

        if (data.customBg) {
          setThemeCategory('custom');
          try {
            const temp = data.customBg.toLowerCase();
            if (temp.startsWith('linear-gradient')) {
              const degMatch = temp.match(/(\d+)deg/);
              if (degMatch) setGAngle(parseInt(degMatch[1]));

              const hexMatch = temp.match(/#[0-9a-f]{3,8}/g);
              if (hexMatch && hexMatch.length >= 2) {
                setGColor1(hexMatch[0]);
                setGColor2(hexMatch[1]);
              }

              const pctMatch = temp.match(/(\d+)%/g);
              if (pctMatch && pctMatch.length >= 2) {
                setGStop1(parseInt(pctMatch[0]));
                setGStop2(parseInt(pctMatch[1]));
              }
            }
          } catch (e) {
            console.log("Could not parse customBackground linear-gradient on load:", e);
          }
        }
      } else {
        setError('Bio document not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not establish database connection.');
    } finally {
      setLoading(false);
    }
  };

  // Push state to history for Undo/Redo tracking
  const updateBlocksWithHistory = (newBlocks: BioBlock[]) => {
    if (!bio) return;
    
    // Save current blocks to history stack
    setHistory((prev) => [...prev, newBlocks]);
    // Clear redo stack on fresh edit
    setRedoStack([]);

    const updatedBio = { ...bio, blocks: newBlocks, updatedAt: new Date().toISOString() };
    setBio(updatedBio);
    triggerAutoSave(updatedBio);
  };

  // Trigger Save to cloud Firestore
  const triggerAutoSave = async (updatedBio: BioPageConfig) => {
    setSavingState('saving');
    try {
      const galleryBlocks = updatedBio.blocks.filter((b) => b.type === 'gallery');
      const galleryImages = galleryBlocks.flatMap((b) => b.images || []);

      const carouselBlocks = updatedBio.blocks.filter((b) => b.type === 'slider');
      const carouselImages = carouselBlocks.flatMap((b) => b.images || []);

      const bioToSave: BioPageConfig = {
        ...updatedBio,
        profileImage: updatedBio.avatarUrl || '',
        coverImage: updatedBio.coverUrl || '',
        galleryImages,
        carouselImages,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'bios', bioId), bioToSave).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
      );
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSavingState('idle');
    }
  };

  // Manual Save Changes Action
  const handleManualSave = async () => {
    if (!bio) return;
    setSavingState('saving');
    
    try {
      const galleryBlocks = bio.blocks.filter((b) => b.type === 'gallery');
      const galleryImages = galleryBlocks.flatMap((b) => b.images || []);

      const carouselBlocks = bio.blocks.filter((b) => b.type === 'slider');
      const carouselImages = carouselBlocks.flatMap((b) => b.images || []);

      const bioToSave: BioPageConfig = {
        ...bio,
        profileImage: bio.avatarUrl || '',
        coverImage: bio.coverUrl || '',
        galleryImages,
        carouselImages,
        updatedAt: serverTimestamp()
      };

      console.log('Upload start');
      await setDoc(doc(db, 'bios', bioId), bioToSave).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
      );
      
      // Refresh local state from database directly to verify
      const docSnap = await getDoc(doc(db, 'bios', bioId));
      if (docSnap.exists()) {
        const freshData = docSnap.data() as BioPageConfig;
        setBio(freshData);
        setHistory([freshData.blocks]);
        setRedoStack([]);
      }
      
      setIsDirty(false);
      setSavingState('saved');
      setSuccessToast('Changes saved successfully.');
      setTimeout(() => {
        setSavingState('idle');
        setSuccessToast(null);
      }, 3000);
    } catch (err: any) {
      console.error('Upload failure:', err);
      setSavingState('idle');
    }
  };

  // Unsaved changes detectors
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Do you want to save before leaving?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBackToDashboardAttempt = () => {
    if (isDirty) {
      setShowLeaveConfirm(true);
    } else {
      onBackToDashboard();
    }
  };

  const handleUpdateProfileInfo = (fields: Partial<BioPageConfig>) => {
    if (!bio) return;
    const updated = { ...bio, ...fields, updatedAt: new Date().toISOString() };
    setBio(updated);
    triggerAutoSave(updated);
    if ('avatarUrl' in fields || 'coverUrl' in fields || 'seoShareImage' in fields) {
      setIsDirty(true);
    }
  };

  const handleGradientUpdate = (color1: string, color2: string, angle: number, stop1: number, stop2: number) => {
    setGColor1(color1);
    setGColor2(color2);
    setGAngle(angle);
    setGStop1(stop1);
    setGStop2(stop2);

    const gradString = `linear-gradient(${angle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%)`;
    handleUpdateProfileInfo({ customBg: gradString });
  };

  // History Actions
  const handleUndo = () => {
    if (history.length <= 1 || !bio) return;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistory((prev) => prev.slice(0, prev.length - 1));

    const updatedBio = { ...bio, blocks: previous, updatedAt: new Date().toISOString() };
    setBio(updatedBio);
    triggerAutoSave(updatedBio);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !bio) return;
    const next = redoStack[redoStack.length - 1];

    setHistory((prev) => [...prev, next]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    const updatedBio = { ...bio, blocks: next, updatedAt: new Date().toISOString() };
    setBio(updatedBio);
    triggerAutoSave(updatedBio);
  };

  // Blocks actions
  const handleAddBlock = (type: BlockType) => {
    if (!bio) return;
    
    // Unique ID for the block
    const id = `block_${Date.now()}`;
    
    // Core attributes default setup
    const defaultBlock: BioBlock = {
      id,
      type,
      title: getBlockDefaultTitle(type),
      visible: true,
      animation: 'none'
    };

    // Configure block-specific fields
    if (type === 'link') {
      defaultBlock.url = 'https://instagram.com';
      defaultBlock.platform = 'instagram';
    } else if (type === 'text') {
      defaultBlock.content = 'Write some aesthetic descriptions here for fans.';
    } else if (type === 'heading') {
      defaultBlock.content = 'My Showcase Portfolio';
    } else if (type === 'video') {
      defaultBlock.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    } else if (type === 'music') {
      defaultBlock.url = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsyNa7T';
    } else if (type === 'countdown') {
      defaultBlock.extraData = { dateTime: '2026-12-31T00:00:00' };
    } else if (type === 'product') {
      defaultBlock.extraData = { price: '29.99', currency: 'USD', buyUrl: '#', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80' };
    } else if (type === 'testimonial') {
      defaultBlock.extraData = { quote: 'Ahmed is the most creative designer of Gen Z!', author: 'Clara Jenkins', tag: '@clara_design' };
    } else if (type === 'faq') {
      defaultBlock.extraData = { items: [{ q: 'Do you design custom merch?', a: 'Yes! Drop on dm.' }] };
    } else if (type === 'gallery' || type === 'slider') {
      defaultBlock.images = [
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80',
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80'
      ];
    } else if (type === 'html') {
      defaultBlock.content = '<p class="text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Custom HTML injected!</p>';
    }

    const newBlocks = [...bio.blocks, defaultBlock];
    updateBlocksWithHistory(newBlocks);
    setShowBlockSelector(false);
  };

  const handleEditBlockField = (blockId: string, fields: Partial<BioBlock>) => {
    if (!bio) return;
    const updated = bio.blocks.map((block) => {
      if (block.id === blockId) {
        return { ...block, ...fields };
      }
      return block;
    });
    updateBlocksWithHistory(updated);
    setIsDirty(true);
  };

  const handleDuplicateBlock = (block: BioBlock) => {
    if (!bio) return;
    const id = `block_${Date.now()}`;
    const duplicate: BioBlock = { ...block, id, title: `${block.title} (Copy)` };
    const idx = bio.blocks.findIndex((b) => b.id === block.id);
    
    const newBlocks = [...bio.blocks];
    newBlocks.splice(idx + 1, 0, duplicate);
    updateBlocksWithHistory(newBlocks);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!bio) return;
    const filtered = bio.blocks.filter((b) => b.id !== blockId);
    updateBlocksWithHistory(filtered);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!bio) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= bio.blocks.length) return;

    const newBlocks = [...bio.blocks];
    const item = newBlocks[index];
    newBlocks.splice(index, 1);
    newBlocks.splice(newIndex, 0, item);

    updateBlocksWithHistory(newBlocks);
  };

  const getBlockDefaultTitle = (type: BlockType): string => {
    const defaultTitles: Record<BlockType, string> = {
      link: 'My Website Link',
      text: 'Custom Text Block',
      heading: 'Section Title Heading',
      divider: 'Divider Line',
      gallery: 'Creator Image Grid',
      video: 'YouTube / video Embed',
      music: 'Spotify / Apple Music Track',
      contact: 'Anonymous Q&A inbox',
      faq: 'FAQ Accordion',
      countdown: 'Upcoming Event Countdown',
      product: 'Shop Merchandise Card',
      testimonial: 'Partner Testimonial Quote',
      donation: 'Donate / Support creators',
      pdf: 'Download PDF Guidebook',
      slider: 'Inspirational Image Carousel',
      map: 'Physical Event Map Location',
      social_feed: 'Mock Social Media Grid',
      newsletter: 'Subscribe Newsletter inbox',
      html: 'Custom Embedded HTML iframe',
    };
    return defaultTitles[type] || 'New Block';
  };

  const blockCategories: Array<{ type: BlockType; label: string; icon: any; color: string }> = [
    { type: 'link', label: 'Website Link', icon: Link, color: 'text-purple-400' },
    { type: 'heading', label: 'Headline Title', icon: Heading, color: 'text-pink-400' },
    { type: 'text', label: 'Paragraph text', icon: AlignLeft, color: 'text-cyan-400' },
    { type: 'divider', label: 'Section Divider', icon: SeparatorHorizontal, color: 'text-neutral-400' },
    { type: 'gallery', label: 'Gallery Grid', icon: Image, color: 'text-rose-400' },
    { type: 'video', label: 'Video Player', icon: Video, color: 'text-rose-500' },
    { type: 'music', label: 'Spotify Embed', icon: Music, color: 'text-emerald-500' },
    { type: 'faq', label: 'FAQ Accordion', icon: HelpCircle, color: 'text-amber-500' },
    { type: 'countdown', label: 'Countdown Clock', icon: Timer, color: 'text-indigo-400' },
    { type: 'product', label: 'Ecomm Product', icon: ShoppingBag, color: 'text-yellow-500' },
    { type: 'testimonial', label: 'Testimonial Review', icon: MessageSquare, color: 'text-teal-400' },
    { type: 'donation', label: 'Support Button', icon: Gift, color: 'text-pink-500' },
    { type: 'pdf', label: 'PDF Download', icon: FileText, color: 'text-emerald-400' },
    { type: 'slider', label: 'Image Carousel', icon: Sliders, color: 'text-blue-500' },
    { type: 'map', label: 'Map Location', icon: Map, color: 'text-cyan-400' },
    { type: 'social_feed', label: 'Social Feed', icon: Grid, color: 'text-indigo-500' },
    { type: 'newsletter', label: 'Newsletter inbox', icon: Mail, color: 'text-purple-500' },
    { type: 'html', label: 'Custom HTML', icon: SquareCode, color: 'text-zinc-400' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
          <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Loading Creator Editor...</p>
        </div>
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center font-sans">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mx-auto">
            <X className="w-6 h-6" />
          </div>
          <p className="font-bold text-white text-base">Workspace offline</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{error || 'Could not assemble details.'}</p>
          <button
            onClick={onBackToDashboard}
            className="cursor-pointer text-xs font-black uppercase py-2 px-4 rounded-xl bg-purple-600 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-zinc-100 flex flex-col font-sans">
      
      {/* Dynamic Toast Notifications */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-3 animate-fade-in shadow-lg backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="font-bold text-xs uppercase tracking-wider">{successToast}</p>
        </div>
      )}

      <UploadProgressBar isInline={false} />

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 font-sans text-white backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#090d16] border border-white/[0.08] p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Unsaved Image Changes</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                You have unsaved image changes. Save before leaving?
              </p>
            </div>
            
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={async () => {
                  await handleManualSave();
                  setShowLeaveConfirm(false);
                  onBackToDashboard();
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Save and Exit</span>
              </button>
              <button
                onClick={() => {
                  setIsDirty(false);
                  setShowLeaveConfirm(false);
                  onBackToDashboard();
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 px-4 rounded-xl text-xs border border-white/5 transition-all cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full bg-transparent hover:bg-white/5 text-zinc-500 hover:text-zinc-300 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* BUILDER HEADER CONTROL */}
      <header className="h-16 border-b border-white/5 bg-[#090d16] px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToDashboardAttempt}
            className="cursor-pointer p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.02] border border-white/5 transition-all flex items-center gap-1 text-xs uppercase font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white select-none">{bio.displayName}</h2>
              <span className="text-[9px] font-mono text-zinc-500 truncate">genzbio.com/{bio.username}</span>
            </div>
          </div>
        </div>

        {/* Live Undo/Redo & Autosave indicators */}
        <div className="flex items-center gap-3">
          
          {/* Save Changes Button */}
          <button
            onClick={handleManualSave}
            disabled={savingState === 'saving'}
            className={`cursor-pointer text-[10px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-xl border transition-all flex items-center gap-1.5 ${
              isDirty 
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse'
                : 'bg-zinc-900 text-zinc-500 border-white/5 cursor-not-allowed'
            }`}
            title="Save all changes permanently to database"
          >
            <span>💾 Save Changes</span>
            {savingState === 'saving' && <RefreshCw className="w-3 h-3 animate-spin" />}
          </button>

          {/* Saved notification badge */}
          {savingState === 'saving' && (
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide flex items-center gap-1 bg-white/[0.02] py-1.5 px-3 rounded-full border border-white/5">
              <RefreshCw className="w-3 h-3 animate-spin text-purple-400" /> Autosaving...
            </span>
          )}
          {savingState === 'saved' && (
            <span className="text-[10px] text-emerald-400 font-bold tracking-wide flex items-center gap-1 bg-[#10b981]/5 border border-emerald-500/10 py-1.5 px-3 rounded-full">
              <Check className="w-3.5 h-3.5" /> All Saved
            </span>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-2" />

          {/* Undo/Redo Buttons */}
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className={`cursor-pointer p-2 rounded-lg border border-white/5 ${
              history.length <= 1 ? 'text-zinc-600 cursor-not-allowed bg-transparent' : 'text-zinc-200 hover:bg-white/[0.02]'
            }`}
            title="Undo Change"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={`cursor-pointer p-2 rounded-lg border border-white/5 ${
              redoStack.length === 0 ? 'text-zinc-600 cursor-not-allowed bg-transparent' : 'text-zinc-200 hover:bg-white/[0.02]'
            }`}
            title="Redo Change"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDemo(bio.username)}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs py-2 px-4 rounded-xl shadow-lg shadow-purple-950/25 uppercase tracking-wider flex items-center gap-1"
          >
            Preview Live
          </button>
        </div>
      </header>

      {/* THREE-COLUMN WORKSPACE GRID */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* COLUMN 1: BUILDER STEP CONTROL ACTIONS */}
        <aside className="w-64 border-r border-white/5 bg-[#090d16] flex flex-col justify-between hidden lg:flex shrink-0">
          <div className="p-4 space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-3 mb-3">Customizer Tabs</p>
            {[
              { id: 'blocks', label: 'Content Blocks', icon: Sliders },
              { id: 'profile', label: 'Biography Stats', icon: User },
              { id: 'appearance', label: 'Appearance', icon: Sparkles },
              { id: 'seo', label: 'SEO Settings', icon: Search }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setBuilderTab(tab.id as any)}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    builderTab === tab.id
                      ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/10 to-transparent text-purple-200 border border-purple-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 border-t border-white/5">
            <div className="p-3 bg-white/[0.01] rounded-xl border border-white/5">
              <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">CREATOR TIP 💡</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                You can drag and reorder content panels with up/down controls. Changes auto-save in real-time.
              </p>
            </div>
          </div>
        </aside>

        {/* COLUMN 2: TAB EDITING WORKSPACE PANEL */}
        <div className="flex-1 p-6 overflow-y-auto max-w-2xl w-full border-r border-white/5 min-h-0 bg-[#06080F]">
          
          {/* TAB 1: BLOCKS EDITOR */}
          {builderTab === 'blocks' && (
            <div className="space-y-6 animate-fade-in pb-12">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Profile Content Blocks</h3>
                  <p className="text-zinc-400 text-xs mt-0.5">Manage details of buttons, embeds, count-down, products.</p>
                </div>
                
                <button
                  onClick={() => setShowBlockSelector(true)}
                  className="cursor-pointer inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Add Block
                </button>
              </div>

              {/* Collapsible/movable Blocks list */}
              {bio.blocks?.length === 0 ? (
                <div className="text-center p-12 bg-white/[0.01] border border-white/5 rounded-3xl">
                  <Plus className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <p className="font-bold text-zinc-300 text-sm">Your Links Page is Empty!</p>
                  <p className="text-xs text-zinc-500 mt-1 mb-4">Click "Add Block" above to register custom blocks like Q&A panels, maps, countdowns or social embeds.</p>
                  <button
                    onClick={() => setShowBlockSelector(true)}
                    className="cursor-pointer py-2 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider"
                  >
                    Select Blocks
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bio.blocks.map((block, index) => (
                    <div 
                      key={block.id}
                      className="p-5 rounded-2xl bg-[#090d16] border border-white/5 hover:border-white/10 transition-all space-y-4 shadow-sm"
                    >
                      {/* Block upper actions */}
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg text-neutral-300">
                            {block.type}
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">#{index + 1}</span>
                        </div>

                        {/* Order controls & visibility & deletion */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveBlock(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded ${index === 0 ? 'text-zinc-700' : 'text-zinc-300 hover:bg-white/[0.03]'}`}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleMoveBlock(index, 'down')}
                            disabled={index === bio.blocks.length - 1}
                            className={`p-1 rounded ${index === bio.blocks.length - 1 ? 'text-zinc-700' : 'text-zinc-300 hover:bg-white/[0.03]'}`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <div className="h-4 w-[1px] bg-white/10 mx-1.5" />

                          <button
                            onClick={() => handleEditBlockField(block.id, { visible: !block.visible })}
                            className="p-1 rounded text-zinc-300 hover:bg-white/[0.03]"
                            title={block.visible ? 'Hide from Profile' : 'Show on Profile'}
                          >
                            {block.visible ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                          </button>

                          <button
                            onClick={() => handleDuplicateBlock(block)}
                            className="p-1 rounded text-zinc-300 hover:bg-white/[0.03]"
                            title="Duplicate block"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-550/10 ml-1"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Inputs for each distinct block */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Header Title (Block Caption)</label>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => handleEditBlockField(block.id, { title: e.target.value })}
                            className="w-full bg-[#141d2f]/80 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                            placeholder="e.g. My Website / Portfolio Video"
                          />
                        </div>

                        {block.type === 'link' && (
                          <div className="space-y-3 p-4 rounded-xl bg-purple-950/20 border border-purple-500/10">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider mb-1">Destination Link (URL)</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={block.url || ''}
                                  onChange={(e) => {
                                    const urlVal = e.target.value;
                                    const detected = detectPlatform(urlVal);
                                    const pInfo = getPlatformInfo(detected);
                                    handleEditBlockField(block.id, { 
                                      url: urlVal,
                                      platform: detected,
                                      title: pInfo.label,
                                      icon: pInfo.iconName,
                                      iconType: block.iconType || 'default'
                                    });
                                  }}
                                  className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:border-purple-500/40 focus:outline-none"
                                  placeholder="e.g. https://instagram.com/username"
                                />
                                <span className="absolute right-3 top-2.5 bg-purple-900/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-purple-300 border border-purple-500/10">
                                  {block.platform || 'General URL'}
                                </span>
                              </div>
                              <span className="text-[8px] text-zinc-500 mt-1 block">
                                Enter any destination URL. The system automatically detects and brands the platform.
                              </span>
                            </div>

                            {/* Custom Icon & Icon Mode Control */}
                            <div className="pt-2 border-t border-white/[0.03] space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Icon Mode</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditBlockField(block.id, { iconType: 'default' })}
                                    className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                      (block.iconType || 'default') === 'default'
                                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                        : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                                    }`}
                                  >
                                    Official Brand Logo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditBlockField(block.id, { iconType: 'custom' })}
                                    className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition-all ${
                                      block.iconType === 'custom'
                                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                        : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                                    }`}
                                  >
                                    Custom Upload
                                  </button>
                                </div>
                              </div>

                              {block.iconType === 'custom' && (
                                <div className="mt-2 space-y-2 p-3 rounded-lg bg-zinc-950/60 border border-white/5">
                                  {block.customIcon ? (
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-white/10 flex items-center justify-center relative shrink-0">
                                        <img src={block.customIcon} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-[10px] block text-zinc-400 font-mono truncate">Custom icon active</span>
                                        <button
                                          type="button"
                                          onClick={() => handleEditBlockField(block.id, { customIcon: '', iconType: 'default' })}
                                          className="text-[10px] text-red-400 hover:text-red-300 font-bold underline"
                                        >
                                          Remove Icon
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <label className="flex flex-col items-center justify-center p-3 border border-dashed border-white/10 hover:border-purple-500/30 rounded-xl cursor-pointer transition-all bg-neutral-900/40">
                                        <span className="text-xs text-zinc-400 font-medium">Upload Icon</span>
                                        <span className="text-[8px] text-zinc-650 mt-1">PNG, SVG, ICO, or WEBP</span>
                                        <input
                                          type="file"
                                          accept=".png,.svg,.ico,.webp"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const files = e.target.files;
                                            if (!files || files.length === 0) return;
                                            try {
                                              setUploadLoading(block.id);
                                              const downloadUrl = await uploadIconHelper(files[0], block.id);
                                              handleEditBlockField(block.id, { 
                                                customIcon: downloadUrl,
                                                iconType: 'custom'
                                              });
                                            } catch (err: any) {
                                              setUploadError(err.message || 'Icon upload failed');
                                              setTimeout(() => setUploadError(null), 5000);
                                            } finally {
                                              setUploadLoading(null);
                                            }
                                          }}
                                        />
                                      </label>
                                      <UploadProgressBar blockId={block.id} isInline={true} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/[0.03]">
                              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Open in new tab</span>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={block.extraData?.openInNewTab !== false} // Default to true
                                  onChange={(e) => handleEditBlockField(block.id, {
                                    extraData: { ...block.extraData, openInNewTab: e.target.checked }
                                  })}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-zinc-850 rounded-full relative peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-zinc-300 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* ========================================================
                            1 & 13. GALLERY GRID & IMAGE CAROUSEL (SLIDER) WIDGETS
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
                                    const url = await uploadFileHelper(files[i], folderPath, block.id);
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
                                      const url = await uploadFileHelper(files[i], folderPath, block.id);
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

                            <UploadProgressBar blockId={block.id} isInline={true} />

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
                                          {/* Reorder control elements */}
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
                                            <X className="w-2.5 h-2.5 rotate-45" />
                                          </button>
                                        </div>
                                        <div className="flex gap-1.5">
                                          {/* Replace action */}
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
                                          {/* Delete action */}
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
                                  <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-1">
                                    <span>1col</span>
                                    <span>2col</span>
                                    <span>3col</span>
                                    <span>4col</span>
                                    <span>5col</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* CAROUSEL SLIDER EXTRAS (autoplay, navigateArrows, navigation dots, loop, speed) */}
                            {block.type === 'slider' && (
                              <div className="space-y-3 pt-2.5 border-t border-white/5 text-zinc-300 text-[11px]">
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
                            2. VIDEO PLAYER WIDGET (YouTube, Vimeo, MP4 file upload)
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

                            <div className="relative border-2 border-dashed border-white/10 p-4 rounded-xl text-center">
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
                                    const downloadUrl = await uploadVideoHelper(file, block.id);
                                    handleEditBlockField(block.id, { url: downloadUrl });
                                  } catch (err: any) {
                                    setUploadError(err.message || 'Video upload failed');
                                  }
                                  setUploadLoading(null);
                                }}
                              />
                              <Video className="w-6 h-6 text-zinc-500 mx-auto mb-1.5" />
                              <p className="text-xs font-bold text-zinc-300">Or Upload MP4 from device</p>
                              <p className="text-[9px] text-zinc-500 mt-0.5">Maximum size: 10 MB (MP4 format)</p>
                            </div>

                            <UploadProgressBar blockId={block.id} isInline={true} />

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
                            3. SPOTIFY / MUSIC EMBED WIDGET
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
                            4. MAP LOCATION WIDGET (Address, Coords, Paste direct URL)
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

                            {/* MAP URL ENVELOPE */}
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
                            5. SOCIAL FEED EMBED WIDGET
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
                            6. PDF DOWNLOAD WIDGET (PDF device upload, customized buttons)
                           ======================================================== */}
                        {block.type === 'pdf' && (
                          <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
                            <label className="block text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">PDF FILE LOADER (Offline Storage ready)</label>

                            <div className="relative border-2 border-dashed border-white/10 hover:border-emerald-500/30 p-5 rounded-2xl text-center cursor-pointer transition-colors">
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
                                    const pdfUrl = await uploadPdfHelper(file, block.id);
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

                            <UploadProgressBar blockId={block.id} isInline={true} />

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
                                  <span className="text-zinc-350 text-[11px] font-mono truncate">{block.extraData.fileName}</span>
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
                            7. CUSTOM HTML (syntax highlighting editor & preview modes)
                           ======================================================== */}
                        {block.type === 'html' && (
                          <div className="space-y-3.5 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">CUSTOM CODE COMPILER</label>
                              
                              <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-white/5">
                                {['code', 'preview'].map((pMode) => (
                                  <button
                                    key={pMode}
                                    type="button"
                                    onClick={() => setHtmlPreviewMode((prev) => ({ ...prev, [block.id]: pMode as any }))}
                                    className={`py-1 px-2.5 rounded-md text-[9px] font-bold uppercase transition-colors ${
                                      (htmlPreviewMode[block.id] || 'code') === pMode
                                        ? 'bg-purple-600 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    {pMode}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {(htmlPreviewMode[block.id] || 'code') === 'code' ? (
                              <div>
                                <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Embed HTML Text editor</label>
                                <textarea
                                  rows={5}
                                  value={block.content || ''}
                                  onChange={(e) => handleEditBlockField(block.id, { content: e.target.value })}
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl p-3 text-xs text-sky-300 font-mono focus:border-purple-500 focus:outline-none"
                                  placeholder='<div class="p-4 bg-purple-500 rounded-xl">Custom CSS & HTML tags!</div>'
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
                            8. FAQ ACCORDION MANAGER (Item structures, edits, sizes)
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
                                        className="w-full bg-[#141d2f] border border-white/5 px-2.5 py-1.5 rounded-xl text-xs text-white"
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
                                        className="w-full bg-[#141d2f] border border-white/5 px-2.5 py-1.5 rounded-xl text-xs text-white"
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
                              className="w-full py-2 bg-purple-950/40 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase text-purple-300 tracking-wider flex items-center justify-center gap-1 hover:bg-purple-900/40"
                            >
                              <Plus className="w-3 h-3" /> Add Question Item
                            </button>
                          </div>
                        )}

                        {/* ========================================================
                            9. TESTIMONIAL PANEL CUSTOMIZER
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl p-2 px-3 text-xs text-white"
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
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                                  placeholder="Ahmed Khan"
                                />
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Author Social Handle</span>
                                <input
                                  type="text"
                                  value={block.extraData?.tag || ''}
                                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, tag: e.target.value } })}
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white font-mono"
                                  placeholder="@ahmed_gfx"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================
                            10. NEWSLETTER WIRED INBOX
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Button Text Option</span>
                                <input
                                  type="text"
                                  value={block.extraData?.btnLabel || 'Join Crew'}
                                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, btnLabel: e.target.value } })}
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wide text-zinc-400 mb-1 font-bold">Placeholder Value</span>
                                <input
                                  type="text"
                                  value={block.extraData?.placeholder || 'Insert main email...'}
                                  onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, placeholder: e.target.value } })}
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ========================================================
                            11. SUPPORT & DONATION WIDGET
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2.5 px-3 text-xs text-white font-mono"
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
                                  className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-xs text-zinc-350"
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
                            12. DIVIDER SPACING AND THEME Accents
                           ======================================================== */}
                        {block.type === 'divider' && (
                          <div className="grid grid-cols-2 gap-3 bg-neutral-900/40 p-4 rounded-2xl border border-white/5">
                            <div>
                              <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Divider line style</label>
                              <select
                                value={block.extraData?.lineStyle || 'solid'}
                                onChange={(e) => handleEditBlockField(block.id, { extraData: { ...block.extraData, lineStyle: e.target.value } })}
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300"
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
                                className="w-full bg-zinc-950 border border-white/5 rounded-xl py-2 px-2 text-[11px] text-zinc-300"
                              >
                                <option value="sm">Small size margins (12px)</option>
                                <option value="md">Normal height margins (24px)</option>
                                <option value="lg">Grave spacious margins (45px)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* ========================================================
                            COMMON: INTERACTIVE COSMIC ANIMATION FX PICKER
                           ======================================================== */}
                        <div>
                          <AnimationPicker
                            currentValue={block.animation || 'none'}
                            onChange={(animId) => handleEditBlockField(block.id, { animation: animId })}
                            brandColor={block.color || '#a855f7'}
                          />
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE/BIOGRAPHY EDITOR */}
          {builderTab === 'profile' && (
            <div className="space-y-6 animate-fade-in pb-12">
              <div>
                <h3 className="text-xl font-bold text-white">Biography Statistics</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Customize your profile logo, display titles, location and verified highlights.</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Creator Display Title</label>
                    <input
                      type="text"
                      value={bio.displayName}
                      onChange={(e) => handleUpdateProfileInfo({ displayName: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-3 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Profile Photo URI</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Insert online image URL"
                        value={bio.avatarUrl || ''}
                        onChange={(e) => handleUpdateProfileInfo({ avatarUrl: e.target.value })}
                        className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-3 text-xs focus:border-purple-500 focus:outline-none text-white truncate"
                      />
                      <label className="bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/35 text-purple-300 py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center shrink-0">
                        Upload
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadFileHelper(file, 'avatars', 'avatar-upload');
                              handleUpdateProfileInfo({ avatarUrl: url });
                            } catch (err: any) {
                              setUploadError(err.message || 'Avatar upload failed');
                            }
                          }}
                        />
                      </label>
                    </div>
                    <UploadProgressBar blockId="avatar-upload" isInline={true} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Self Biography Description</label>
                  <textarea
                    rows={3}
                    value={bio.description}
                    onChange={(e) => handleUpdateProfileInfo({ description: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-3 text-xs focus:border-purple-500 focus:outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Geographic Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Dubai, UAE"
                        value={bio.location || ''}
                        onChange={(e) => handleUpdateProfileInfo({ location: e.target.value })}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs focus:border-purple-500 focus:outline-none"
                      />
                      <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Personal Website</label>
                    <input
                      type="text"
                      placeholder="e.g. https://ahmed.studio"
                      value={bio.website || ''}
                      onChange={(e) => handleUpdateProfileInfo({ website: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-xl py-2.5 px-3 text-xs focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Verified Creator Tag</p>
                    <p className="text-[10px] text-zinc-500">Enable an elegant verified checkmark badge on your profile screen.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdateProfileInfo({ verified: !bio.verified })}
                    className={`cursor-pointer text-[10px] font-black uppercase py-1.5 px-4 rounded-xl border ${
                      bio.verified 
                        ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {bio.verified ? 'Verified Active' : 'Unverified'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & WIDGETS SELECTOR */}
          {builderTab === 'appearance' && bio && (
            <div className="space-y-6 animate-fade-in pb-12">
              <div>
                <h3 className="text-xl font-bold text-white">Appearance Settings</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Pick premium designs, linear background gradients, and toggle permanent system widgets on your profile.</p>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex gap-1.5 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/5 max-w-sm">
                <button
                  type="button"
                  onClick={() => setAppearanceSubTab('themes')}
                  className={`flex-1 text-center py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    appearanceSubTab === 'themes'
                      ? 'bg-purple-600/90 text-white shadow-md border border-purple-500/20'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  🎨 Themes
                </button>
                <button
                  type="button"
                  onClick={() => setAppearanceSubTab('widgets')}
                  className={`flex-1 text-center py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    appearanceSubTab === 'widgets'
                      ? 'bg-purple-600/90 text-white shadow-md border border-purple-500/20'
                      : 'text-zinc-400 hover:text-white border border-transparent'
                  }`}
                >
                  🧩 Widgets
                </button>
              </div>

              {appearanceSubTab === 'themes' ? (
                <div className="space-y-6">
                  {/* Custom Selector Toggle pills */}
                  <div className="flex flex-wrap gap-2 p-1 bg-zinc-950/80 rounded-2xl border border-white/5">
                    {[
                      { id: 'all', label: '🌐 All Presets' },
                      { id: 'glass', label: '✨ Glass' },
                      { id: 'neon', label: '⚡ Neon' },
                      { id: 'dark', label: '🌌 Dark' },
                      { id: 'custom', label: '🎨 Custom Gradient' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setThemeCategory(cat.id as any)}
                        className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-250 ${
                          themeCategory === cat.id
                            ? 'bg-purple-600/90 text-white shadow-md shadow-purple-500/10 border border-purple-500'
                            : 'text-zinc-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {cat.label.split(' ')[1] || cat.label}
                      </button>
                    ))}
                  </div>

              {themeCategory !== 'custom' ? (
                /* Preset Grid */
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7]">
                      {themeCategory === 'all' && 'ALL PRESETS AVAILABLE'}
                      {themeCategory === 'glass' && 'GLASSMORPHISM PRESETS'}
                      {themeCategory === 'neon' && 'NEON GLOW PRESETS'}
                      {themeCategory === 'dark' && 'DEEP DARK PRESETS'}
                    </span>
                    {bio.customBg && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg animate-pulse">
                        ⚠️ Custom Gradient Override Active
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(() => {
                      const filteredList = THEMES.filter((th) => {
                        if (themeCategory === 'all') return true;
                        if (themeCategory === 'glass') {
                          return th.tags?.includes('Glassmorphism') || th.id.includes('glass') || th.name.toLowerCase().includes('glass');
                        }
                        if (themeCategory === 'neon') {
                          return th.tags?.includes('Neon') || th.tags?.includes('Vapor') || th.id.includes('neon') || th.id.includes('cyberpunk') || th.name.toLowerCase().includes('neon');
                        }
                        if (themeCategory === 'dark') {
                          return th.tags?.includes('Dark') || th.tags?.includes('Cosmic') || th.id.includes('dark') || th.id.includes('black') || th.id.includes('space') || th.id.includes('galaxy') || th.id.includes('midnight') || th.bgClass.includes('black') || th.bgClass.includes('slate-950') || th.bgClass.includes('zinc-950') || th.bgClass.includes('neutral-950');
                        }
                        return true;
                      });

                      return filteredList.map((th) => {
                        const isCur = bio.themeId === th.id;
                        return (
                          <div
                            key={th.id}
                            onClick={() => {
                              setSelectedThemeId(th.id);
                              handleUpdateProfileInfo({ themeId: th.id, customBg: '' });
                            }}
                            className={`p-4 rounded-2xl relative overflow-hidden h-28 cursor-pointer border flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                              isCur ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-white/5 hover:border-white/10'
                            } ${th.bgClass}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className={`font-black tracking-tight text-xs ${th.textColor}`}>{th.name}</span>
                              {isCur && <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                            </div>
                            
                            <div className={`p-1.5 rounded-lg border text-[8px] text-center font-bold truncate ${th.btnClass}`}>
                              Button Style Preview
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                /* Bespoke Gradient Studio UI */
                <div className="space-y-6 bg-white/[0.02] border border-white/5 p-5 rounded-2xl animate-fade-in text-zinc-300">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">Bespoke Gradient Studio</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Design a stunning dual-color linear background gradient.</p>
                    </div>
                    {bio.customBg && (
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateProfileInfo({ customBg: '' });
                        }}
                        className="cursor-pointer bg-red-950/30 hover:bg-red-900/40 border border-red-800/35 text-red-300 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        Reset Background
                      </button>
                    )}
                  </div>

                  {/* Preset Gradients Grid */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400">Handcrafted Preset Gradients</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'Space Aurora', colors: ['#020617', '#10b981'], deg: 135 },
                        { name: 'Galaxy Orchid', colors: ['#2e1065', '#d946ef'], deg: 135 },
                        { name: 'Neon Volcano', colors: ['#0f050d', '#f43f5e'], deg: 135 },
                        { name: 'Warm Dusk', colors: ['#2c0e12', '#f97316'], deg: 135 },
                        { name: 'Cosmic Candy', colors: ['#0f172a', '#ec4899'], deg: 135 },
                        { name: 'Emerald Zen', colors: ['#051410', '#059669'], deg: 135 },
                        { name: 'Nox Dark', colors: ['#030712', '#1f2937'], deg: 135 },
                        { name: 'Cyber Sky', colors: ['#020205', '#3b82f6'], deg: 135 }
                      ].map((g, idx) => {
                        const gradVal = `linear-gradient(${g.deg}deg, ${g.colors[0]} 0%, ${g.colors[1]} 100%)`;
                        const isSelected = bio.customBg === gradVal;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setGColor1(g.colors[0]);
                              setGColor2(g.colors[1]);
                              setGAngle(g.deg);
                              setGStop1(0);
                              setGStop2(100);
                              handleUpdateProfileInfo({ customBg: gradVal });
                            }}
                            className={`group p-2 rounded-xl border flex flex-col justify-end text-left h-16 cursor-pointer relative overflow-hidden transition-all duration-300 ${
                              isSelected ? 'border-purple-500 scale-95 ring-2 ring-purple-500/30' : 'border-white/5 hover:border-white/15'
                            }`}
                            style={{ background: gradVal }}
                          >
                            <span className="text-[8px] font-black text-white uppercase drop-shadow-md tracking-tight leading-tight select-none">
                              {g.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Mixer Control Sliders */}
                  <div className="space-y-4 pt-3 border-t border-white/5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400">Gradient Mixer Tool</label>
                    
                    <div className="flex items-center gap-4 bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                      <div 
                        className="w-16 h-16 rounded-full border border-white/10 shadow-inner flex items-center justify-center relative overflow-hidden shrink-0"
                        style={{ background: bio.customBg || `linear-gradient(${gAngle}deg, ${gColor1} ${gStop1}%, ${gColor2} ${gStop2}%)` }}
                      />
                      
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Start Color</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input 
                              type="color" 
                              value={gColor1} 
                              onChange={(e) => {
                                const newColor = e.target.value;
                                handleGradientUpdate(newColor, gColor2, gAngle, gStop1, gStop2);
                              }}
                              className="bg-transparent border-0 w-6 h-6 p-0 rounded cursor-pointer shrink-0"
                            />
                            <input 
                              type="text" 
                              value={gColor1} 
                              onChange={(e) => {
                                const newColor = e.target.value;
                                if (newColor.match(/^#[0-9a-fA-F]{3,8}$/)) {
                                  handleGradientUpdate(newColor, gColor2, gAngle, gStop1, gStop2);
                                } else {
                                  setGColor1(newColor);
                                }
                              }}
                              className="bg-transparent text-[11px] font-mono text-white tracking-widest w-16 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider">End Color</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <input 
                              type="color" 
                              value={gColor2} 
                              onChange={(e) => {
                                const newColor = e.target.value;
                                handleGradientUpdate(gColor1, newColor, gAngle, gStop1, gStop2);
                              }}
                              className="bg-transparent border-0 w-6 h-6 p-0 rounded cursor-pointer shrink-0"
                            />
                            <input 
                              type="text" 
                              value={gColor2} 
                              onChange={(e) => {
                                const newColor = e.target.value;
                                if (newColor.match(/^#[0-9a-fA-F]{3,8}$/)) {
                                  handleGradientUpdate(gColor1, newColor, gAngle, gStop1, gStop2);
                                } else {
                                  setGColor2(newColor);
                                }
                              }}
                              className="bg-transparent text-[11px] font-mono text-white tracking-widest w-16 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      <div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                          <span>Gradient Rotation Angle</span>
                          <span className="font-mono text-purple-400">{gAngle}°</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="360"
                          value={gAngle}
                          onChange={(e) => {
                            const ang = parseInt(e.target.value);
                            handleGradientUpdate(gColor1, gColor2, ang, gStop1, gStop2);
                          }}
                          className="w-full accent-purple-500 h-1 mt-1 rounded bg-zinc-800 cursor-ew-resize"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            <span>Start Stop Location</span>
                            <span className="font-mono text-purple-400">{gStop1}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={gStop1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              handleGradientUpdate(gColor1, gColor2, gAngle, val, gStop2);
                            }}
                            className="w-full accent-purple-500 h-1 mt-1 rounded bg-zinc-800 cursor-ew-resize"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            <span>End Stop Location</span>
                            <span className="font-mono text-purple-400">{gStop2}%</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            value={gStop2}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              handleGradientUpdate(gColor1, gColor2, gAngle, gStop1, val);
                            }}
                            className="w-full accent-purple-500 h-1 mt-1 rounded bg-zinc-800 cursor-ew-resize"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Output Code box */}
                    <div className="p-2.5 bg-black/60 rounded-xl border border-white/5 text-center">
                      <span className="text-[7.5px] uppercase font-black text-purple-500 tracking-wider block">Generated Background CSS Gradient String:</span>
                      <span className="text-[9.5px] font-mono text-zinc-400 break-all select-all font-semibold">
                        {bio.customBg || `linear-gradient(${gAngle}deg, ${gColor1} ${gStop1}%, ${gColor2} ${gStop2}%)`}
                      </span>
                    </div>

                  </div>
                </div>
              )}
              </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Permanent Profile Widgets</h4>
                    <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed font-normal">
                      The Stats Bar and Guestbook are built-in elements of your profile. They cannot be permanently deleted. However, you can toggle them on or off whenever you want.
                    </p>
                  </div>

                  {/* Toggle Options Card */}
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl space-y-5">
                    
                    {/* Show Stats Bar Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-purple-500/25 transition-all">
                      <div className="space-y-1 pr-4">
                        <label className="text-xs font-bold text-zinc-200 flex items-center gap-2 select-none cursor-pointer">
                          <Check className={`w-4 h-4 transition-colors ${bio.showStatsBar !== false ? 'text-purple-400 font-extrabold' : 'text-zinc-650'}`} />
                          Show Stats Bar (🔥 💎 👑 💜)
                        </label>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                          Displays the live emoji reaction console so viewers can send spicy sparks, rare gems, and crown reviews instantly.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="toggle-stats-bar"
                        onClick={() => handleUpdateProfileInfo({ showStatsBar: bio.showStatsBar !== false ? false : true })}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 cursor-pointer ${
                          bio.showStatsBar !== false ? 'bg-purple-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                            bio.showStatsBar !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show Guestbook Toggle */}
                    <div className="flex items-center justify-between p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-purple-500/25 transition-all">
                      <div className="space-y-1 pr-4">
                        <label className="text-xs font-bold text-zinc-200 flex items-center gap-2 select-none cursor-pointer">
                          <Check className={`w-4 h-4 transition-colors ${bio.showGuestbook !== false ? 'text-cyan-400 font-extrabold' : 'text-zinc-650'}`} />
                          Show Bio Guestbook (Signatures)
                        </label>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                          Renders a signature book for fans, friends, and visitors to leave profile shoutouts, comments, and ratings.
                        </p>
                      </div>
                      <button
                        type="button"
                        id="toggle-guestbook"
                        onClick={() => handleUpdateProfileInfo({ showGuestbook: bio.showGuestbook !== false ? false : true })}
                        className={`w-11 h-6 rounded-full p-1 transition-all duration-200 focus:outline-none shrink-0 cursor-pointer ${
                          bio.showGuestbook !== false ? 'bg-purple-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                            bio.showGuestbook !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {builderTab === 'seo' && bio && (
            <div className="space-y-6 animate-fade-in pb-12">
              <div>
                <h3 className="text-xl font-bold text-white">SEO & Social Settings</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Define custom meta titles, keywords, dynamic descriptions, and sharing adapters to stand out on search engines and social feeds.</p>
              </div>

              {/* SEO Inputs card */}
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400">Custom Search Title</label>
                    <span className="text-[9px] text-zinc-500 font-mono">{(bio.seoTitle || '').length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    value={bio.seoTitle || ''}
                    placeholder={`${bio.displayName} (@${bio.username}) | Gen-Z Bio`}
                    onChange={(e) => handleUpdateProfileInfo({ seoTitle: e.target.value })}
                    className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">
                    Appears as the main headline in search result tabs. Keep it crisp, descriptive, and under 60 characters.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400">Meta Description</label>
                    <span className="text-[9px] text-zinc-500 font-mono">{(bio.seoDescription || '').length}/160 chars</span>
                  </div>
                  <textarea
                    rows={3}
                    value={bio.seoDescription || ''}
                    placeholder={bio.description || `${bio.displayName}'s official link in bio.`}
                    onChange={(e) => handleUpdateProfileInfo({ seoDescription: e.target.value })}
                    className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">
                    Provides a summary of your page to search bots and social previews. Recommended length is between 50 and 160 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1">Search Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={bio.seoKeywords || ''}
                    placeholder="creator, link in bio, portfolio, social links, gen-z"
                    onChange={(e) => handleUpdateProfileInfo({ seoKeywords: e.target.value })}
                    className="w-full bg-zinc-950/80 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1 leading-relaxed">
                    Optional list of comma-separated search terms to describe your niche index.
                  </p>
                </div>

                {/* Social Share Image preview and upload */}
                <div className="pt-3 border-t border-white/5 space-y-3.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400">Social Share Thumbnail (OG Image)</label>
                  
                  <div className="flex items-center gap-4 bg-zinc-950/40 p-3.5 rounded-xl border border-white/5">
                    <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {bio.seoShareImage || bio.avatarUrl ? (
                        <img 
                          src={bio.seoShareImage || bio.avatarUrl} 
                          alt="SEO Card" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Image className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1.5">
                      <span className="block text-[10px] text-zinc-400 uppercase font-black tracking-wider w-full select-none">
                        {bio.seoShareImage ? '★ CUSTOM OPEN-GRAPH GRAPHIC ACTIVE' : '⚡ USING DEFAULT PROFILE AVATAR'}
                      </span>
                      
                      <div className="flex gap-2">
                        <label className="bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/35 text-purple-300 py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95">
                          Upload Thumbnail
                          <input 
                            type="file" 
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              try {
                                const url = await uploadFileHelper(file, 'seo-thumbnails', 'seo-thumbnail-upload');
                                handleUpdateProfileInfo({ seoShareImage: url });
                              } catch (err: any) {
                                console.error("SEO Thumbnail upload failed:", err);
                              }
                            }}
                          />
                        </label>

                        {bio.seoShareImage && (
                          <button
                            type="button"
                            onClick={() => handleUpdateProfileInfo({ seoShareImage: '' })}
                            className="bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white py-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Reset Default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <UploadProgressBar blockId="seo-thumbnail-upload" isInline={true} />
                  <p className="text-[8.5px] text-zinc-500 font-mono uppercase tracking-tight">
                    Optimized for 1.91:1 ratio cards on Google, Facebook, Twitter, and LinkedIn feeds.
                  </p>
                </div>
              </div>

              {/* LIVE SOCIAL FEED CARD PREVIEW MOCKUP */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">
                    Interactive Social Meta Previews
                  </label>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Toggle between real platforms to see exactly how your customized Gen-Z profile card and SEO settings appear across chat bubbles, feed posts, stories, or bios.
                  </p>
                </div>

                {/* Platform Selector Tabs */}
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-950/60 border border-white/5 rounded-xl">
                  {/* Instagram Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveSocialPlatform('instagram')}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeSocialPlatform === 'instagram'
                        ? 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg scale-[1.02]'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span>Instagram</span>
                  </button>

                  {/* X Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveSocialPlatform('x')}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeSocialPlatform === 'x'
                        ? 'bg-white text-black shadow-lg scale-[1.02]'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-1 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481ZM17.081 19.77H18.914L7.084 4.126H5.117Z" />
                    </svg>
                    <span>X Profile</span>
                  </button>

                  {/* TikTok Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveSocialPlatform('tiktok')}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeSocialPlatform === 'tiktok'
                        ? 'bg-zinc-100 text-black shadow-lg scale-[1.02] border border-[#25f4ee]/50'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-1 fill-current" viewBox="0 0 24 24">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.58-3.98-1.55-.1.08-.18.17-.27.25-.01 2.91.02 5.82-.01 8.73-.01.99-.18 2.02-.63 2.93-.86 1.79-2.73 3.06-4.7 3.39-2.02.34-4.22-.09-5.83-1.43-1.84-1.54-2.74-4.11-2.22-6.49.52-2.37 2.45-4.23 4.82-4.64.12-.02.24-.04.36-.06v4.13c-.64.1-1.3.43-1.68.96-.54.74-.53 1.83.05 2.51.52.61 1.41.83 2.16.53.72-.29 1.14-.99 1.15-1.76.04-3.15.01-6.3.02-9.45V.02z" />
                    </svg>
                    <span>TikTok</span>
                  </button>

                  {/* Messages / Discord Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveSocialPlatform('messages')}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeSocialPlatform === 'messages'
                        ? 'bg-[#5865F2] text-white shadow-lg scale-[1.02]'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-1 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.46-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
                    </svg>
                    <span>Discord</span>
                  </button>

                  {/* Google Tab */}
                  <button
                    type="button"
                    onClick={() => setActiveSocialPlatform('google')}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                      activeSocialPlatform === 'google'
                        ? 'bg-[#ea4335]/15 border border-[#ea4335]/30 text-[#ea4335] shadow-lg scale-[1.02]'
                        : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <svg className="w-4 h-4 mb-1 fill-current" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4H19.127C18.479 16.81 16.608 18.513 12.24 18.513C7.333 18.513 3.335 14.509 3.335 9.603C3.335 4.697 7.333 0.693 12.24 0.693C14.525 0.693 16.6 1.507 18.208 3.069L21.328 0C18.665 2.456 15.633 3.442 12.24 3.442C5.48 3.442 0 8.922 0 15.678C0 22.434 5.48 27.914 12.24 27.914C19.152 27.914 23.76 23.05 23.76 16.154C23.76 15.414 23.694 14.754 23.54 14.158H12.24Z" transform="scale(0.85) translate(2, 2)" />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                {/* Sub-toggles or options inside active platform block */}
                <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-4.5 space-y-4">
                  {activeSocialPlatform === 'instagram' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-zinc-950/40 p-1 border border-white/5 rounded-lg max-w-[220px] mx-auto text-[9.5px] font-black uppercase">
                        <button
                          type="button"
                          onClick={() => setInstagramStyle('dm')}
                          className={`flex-1 py-1 px-3 rounded text-center transition-all ${
                            instagramStyle === 'dm' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          Direct Message Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstagramStyle('story')}
                          className={`flex-1 py-1 px-3 rounded text-center transition-all ${
                            instagramStyle === 'story' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          Story Sticker
                        </button>
                      </div>

                      {instagramStyle === 'dm' ? (
                        <div className="bg-[#000000] border border-white/5 p-4 rounded-xl max-w-sm mx-auto space-y-3 font-sans text-left">
                          {/* DM Header */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center p-[1px]">
                                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-[10px] font-black text-white">🔥</div>
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-zinc-100">Best Friend ⚡</span>
                                <span className="block text-[8.5px] text-zinc-500 font-medium">Active 5m ago</span>
                              </div>
                            </div>
                            <div className="flex gap-2.5 text-zinc-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.827-1.725-5.111-4.009-6.836-6.836l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72"/></svg>
                            </div>
                          </div>

                          {/* Chat Logs */}
                          <div className="space-y-3 pt-1 text-[11px]">
                            <div className="bg-zinc-900 text-zinc-200 px-3 py-2 rounded-2xl rounded-bl-sm max-w-[75%] inline-block">
                              Yo! Send me the link to your bio page! 🔥
                            </div>

                            {/* Sent Link Preview Bubble */}
                            <div className="flex flex-col items-end gap-1.5 pl-8">
                              {/* Rich Preview bubble */}
                              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-w-xs text-left">
                                <div className="aspect-[1.91/1] w-full bg-zinc-950 relative overflow-hidden flex items-center justify-center">
                                  {bio.seoShareImage || bio.avatarUrl ? (
                                    <img
                                      src={bio.seoShareImage || bio.avatarUrl}
                                      alt="Instagram Card"
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="p-3 text-center">
                                      <Sparkles className="w-6 h-6 text-purple-500/20 mx-auto" />
                                    </div>
                                  )}
                                </div>
                                <div className="p-3 bg-[#111111] space-y-0.5 border-t border-zinc-850">
                                  <span className="block text-[8.5px] font-black uppercase text-zinc-500 tracking-wider">GENZBIO.ME</span>
                                  <h5 className="text-xs font-bold text-white truncate max-w-[220px]">
                                    {bio.seoTitle || `${bio.displayName} (@${bio.username}) | Gen-Z Bio`}
                                  </h5>
                                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                                    {bio.seoDescription || bio.description || `${bio.displayName}'s customized link collection on Gen-Z Bio.`}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[8px] text-zinc-600 mr-1">Seen · Just now</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Instagram Story Visual */
                        <div className="relative rounded-2xl overflow-hidden aspect-[9/16] max-w-[220px] mx-auto bg-gradient-to-b from-[#121421] to-[#04060b] border border-white/5 p-4.5 flex flex-col justify-between shadow-2xl">
                          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                          <div className="absolute bottom-24 right-4 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

                          {/* Story Head */}
                          <div className="flex items-center gap-2 relative z-10 select-none">
                            <div className="w-7 h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                              <img
                                src={bio.avatarUrl || 'https://via.placeholder.com/150'}
                                alt="Author"
                                className="w-full h-full object-cover rounded-full bg-neutral-900 border border-black"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <span className="block text-[9.5px] font-bold text-white leading-none">@{bio.username}</span>
                              <span className="text-[7.5px] text-white/50 font-medium">10h</span>
                            </div>
                          </div>

                          {/* Float Link Sticker */}
                          <div className="flex-1 flex flex-col items-center justify-center p-2 relative z-10">
                            {/* Sticker Bubble */}
                            <div className="bg-white/95 text-black py-2 px-4.5 rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.5)] font-black text-[10.5px] uppercase tracking-widest flex items-center justify-center gap-1.5 transform hover:scale-105 active:scale-95 transition-all select-none border border-white/20">
                              <svg className="w-3 h-3 text-purple-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>
                              <span>GENZBIO.ME</span>
                            </div>
                            <span className="text-[8px] text-white/60 font-semibold tracking-wider uppercase mt-2.5 drop-shadow">
                              Tap link sticker to view links ⚡
                            </span>
                          </div>

                          {/* Quick reply bar */}
                          <div className="flex gap-2 items-center relative z-10 pt-2 border-t border-white/5 text-white/60 text-[9px] select-none">
                            <div className="flex-1 bg-white/5 rounded-full border border-white/10 py-1.5 px-3">
                              Send message...
                            </div>
                            <svg className="w-4 h-4 text-white hover:scale-110 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSocialPlatform === 'x' && (
                    <div className="space-y-4">
                      {/* X Post mockup in Dark Mode */}
                      <div className="bg-[#000000] border border-white/5 p-4 rounded-xl max-w-sm mx-auto space-y-3 font-sans text-left">
                        <div className="flex gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                            {bio.avatarUrl ? (
                              <img
                                src={bio.avatarUrl}
                                alt="X sender"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                                {(bio.displayName || 'G').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-white truncate max-w-[124px] leading-tight">
                                {bio.displayName || 'Genz Creator'}
                              </span>
                              {/* Blue Checkmark */}
                              <svg className="w-3.5 h-3.5 text-[#1D9BF0] fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.354.273C14.75 2.52 13.5 1.5 12 1.5c-1.5 0-2.75 1.02-3.418 2.283-.413-.173-.874-.273-1.354-.273-2.109 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.354-.273C9.25 19.48 10.5 20.5 12 20.5c1.5 0 2.75-1.02 3.418-2.283.413.173.874.273 1.354.273 2.109 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-11.453 4.25l-3.327-3.43c-.293-.303-.293-.794 0-1.097.293-.303.77-.303 1.064 0l2.261 2.33 5.431-5.6c.293-.303.77-.303 1.064 0 .293.303.293.794 0 1.097l-5.964 6.15a.735.735 0 0 1-.529.25z"/>
                              </svg>
                              <span className="text-[10px] text-zinc-500 font-medium truncate">@{bio.username} · 2h</span>
                            </div>
                            <p className="text-[11.5px] text-zinc-200 mt-1 leading-normal">
                              Setup my customized link-pool! Virtual rooms, music decks and dynamic grids live now. Let me know what you think ⚡🔗 <span className="text-[#1d9bf0] hover:underline">genzbio.me/{bio.username}</span>
                            </p>
                          </div>
                        </div>

                        {/* X Card */}
                        <div className="border border-zinc-800 rounded-2xl overflow-hidden hover:bg-zinc-900/20 cursor-pointer">
                          <div className="aspect-[1.91/1] bg-black relative flex items-center justify-center border-b border-zinc-800 overflow-hidden">
                            {bio.seoShareImage || bio.avatarUrl ? (
                              <img
                                src={bio.seoShareImage || bio.avatarUrl}
                                alt="X Open-Graph"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-700 font-mono text-[9px] uppercase">OG Card Empty</div>
                            )}
                          </div>
                          
                          <div className="p-3 space-y-1 text-left text-[11px]">
                            <span className="text-[9px] uppercase tracking-wide text-zinc-500 font-mono leading-none">genzbio.me</span>
                            <h5 className="font-bold text-zinc-100 truncate mt-0.5">
                              {bio.seoTitle || `${bio.displayName} (@${bio.username}) | Gen-Z Bio`}
                            </h5>
                            <p className="text-[10.5px] text-zinc-400 font-normal line-clamp-1">
                              {bio.seoDescription || bio.description || `${bio.displayName}'s customized link collection on Gen-Z Bio.`}
                            </p>
                          </div>
                        </div>

                        {/* Twitter action icons */}
                        <div className="flex justify-between items-center text-zinc-500 text-[9px] px-2 pt-1 border-t border-zinc-900 select-none">
                          <span className="flex items-center gap-1 hover:text-[#1d9bf0]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> 3</span>
                          <span className="flex items-center gap-1 hover:text-[#00ba7c]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4m-12 5l-4-4 4-4m-1 9h15M20 5H5"/></svg> 18</span>
                          <span className="flex items-center gap-1 hover:text-[#f91880]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> 84</span>
                          <span className="flex items-center gap-1 hover:text-[#1d9bf0]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m6-3h4v4m-10 10L21 3"/></svg></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialPlatform === 'tiktok' && (
                    <div className="space-y-4">
                      {/* TikTok Sub Tabs Selector */}
                      <div className="flex justify-between items-center bg-zinc-950/40 p-1 border border-white/5 rounded-lg max-w-[220px] mx-auto text-[9.5px] font-black uppercase">
                        <button
                          type="button"
                          onClick={() => setTiktokStyle('profile')}
                          className={`flex-1 py-1 px-3 rounded text-center transition-all ${
                            tiktokStyle === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          User Profile Bio
                        </button>
                        <button
                          type="button"
                          onClick={() => setTiktokStyle('dm')}
                          className={`flex-1 py-1 px-3 rounded text-center transition-all ${
                            tiktokStyle === 'dm' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          Chat Message Card
                        </button>
                      </div>

                      {tiktokStyle === 'profile' ? (
                        <div className="bg-[#121212] p-4.5 border border-white/5 rounded-xl max-w-sm mx-auto space-y-4 font-sans text-center text-white">
                          {/* Top Header */}
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-900 select-none">
                            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 19l-7-7 7-7"/></svg>
                            <span className="text-[10.5px] font-black tracking-wide leading-none">{bio.displayName || 'Genz Creator'}</span>
                            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                          </div>

                          {/* Avatar block */}
                          <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-16 h-16 rounded-full p-[2px] bg-[#121212] ring-2 ring-[#e94335] inline-block relative">
                              <img
                                src={bio.avatarUrl || 'https://via.placeholder.com/150'}
                                alt="TikTok Profile"
                                className="w-full h-full object-cover rounded-full bg-zinc-900"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="block text-xs font-bold font-mono">@{bio.username}</span>
                          </div>

                          {/* Stat count */}
                          <div className="flex justify-center items-center gap-6 text-[10px] font-bold select-none py-0.5">
                            <div>
                              <span className="block text-[11px] font-black text-white">109</span>
                              <span className="text-zinc-500 font-medium text-[8px]">Following</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-black text-white">45.2K</span>
                              <span className="text-zinc-500 font-medium text-[8px]">Followers</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-black text-white">284.9K</span>
                              <span className="text-zinc-500 font-medium text-[8px]">Likes</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-center gap-1 text-[10px] select-none">
                            <span className="bg-[#fe2c55] text-white py-1 px-8 rounded font-black cursor-pointer hover:bg-[#e0244c]">
                              Follow
                            </span>
                            <span className="bg-zinc-800 border border-zinc-700 text-white p-1 rounded cursor-pointer flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                            </span>
                          </div>

                          {/* Bio copy & Direct clickable pool */}
                          <div className="space-y-1 px-3 text-xs">
                            <p className="text-[10.5px] leading-relaxed text-zinc-300">
                              {bio.description || 'Welcome to my TikTok channel! Custom cards, virtual drops, and direct folders live now below 👇'}
                            </p>
                            {/* Handled clickable anchor */}
                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#25f4ee] font-extrabold tracking-wide pt-1.5 cursor-pointer">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/></svg>
                              <span className="underline select-text">genzbio.me/{bio.username}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* TikTok DM block */
                        <div className="bg-[#121212] border border-white/5 p-4 rounded-xl max-w-sm mx-auto space-y-4 font-sans text-left text-white">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-900 select-none">
                            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
                            <span className="text-xs font-black">Direct Messages</span>
                            <div className="w-4 h-4" />
                          </div>

                          <div className="space-y-2 text-[10.5px]">
                            <div className="flex items-end gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-zinc-800" />
                              <div className="bg-zinc-800 text-zinc-100 p-2 py-1.5 rounded-xl rounded-bl-none">
                                Check this out!
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 pl-8">
                              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden max-w-[210px] shadow-lg">
                                <div className="p-3.5 space-y-2 text-left">
                                  <div className="flex items-center gap-1 pb-1.5 border-b border-zinc-850">
                                    <span className="text-[7.5px] uppercase font-black tracking-wide text-zinc-500">GENZLINK · genzbio.me</span>
                                  </div>
                                  <h5 className="text-[10px] font-bold text-white truncate max-w-[170px] leading-tight">
                                    {bio.seoTitle || `${bio.displayName} (@${bio.username})`}
                                  </h5>
                                  <p className="text-[9px] text-zinc-400 line-clamp-2 leading-snug">
                                    {bio.seoDescription || bio.description || `${bio.displayName}'s customized link collection on Gen-Z Bio.`}
                                  </p>
                                  
                                  <div className="aspect-[1.91/1] w-full bg-black/40 rounded overflow-hidden">
                                    {bio.seoShareImage || bio.avatarUrl ? (
                                      <img src={bio.seoShareImage || bio.avatarUrl} className="w-full h-full object-cover" alt="TikTok DM Preview" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-zinc-650 text-[9px] font-mono">NO IMAGE</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSocialPlatform === 'messages' && (
                    <div className="space-y-4">
                      {/* Discord dark theme preview */}
                      <div className="bg-[#313338] border border-white/5 p-4 rounded-xl max-w-sm mx-auto space-y-3 font-sans text-left">
                        {/* Sender details */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-xs select-none shrink-0">
                            G
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 select-none">
                              <span className="text-xs font-black text-white hover:underline cursor-pointer">Genz Explorer</span>
                              <span className="bg-[#5865F2] text-white text-[7.5px] px-1 py-0.2 rounded font-black uppercase tracking-wider">MEMBER</span>
                              <span className="text-[8.5px] text-zinc-500 font-semibold">Today at 3:15 PM</span>
                            </div>
                            
                            <p className="text-[11px] text-zinc-300 leading-normal">
                              Hey! I generated this customizable open-graph profile: <span className="text-[#00b0f4] hover:underline cursor-pointer">https://genzbio.me/{bio.username}</span>
                            </p>

                            {/* DISCORD EMBD CARD */}
                            <div className="bg-[#2B2D31] border-l-4 border-[#5865F2] rounded-r-lg max-w-xs overflow-hidden shadow-xl p-3 space-y-1 text-xs">
                              <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Gen-Z Bio Card</span>
                              <h5 className="text-[11.5px] font-bold text-[#00b0f4] hover:underline cursor-pointer truncate leading-tight">
                                {bio.seoTitle || `${bio.displayName} (@${bio.username})`}
                              </h5>
                              <p className="text-[10px] text-zinc-300 leading-normal line-clamp-2">
                                {bio.seoDescription || bio.description || `${bio.displayName}'s customized link collection on Gen-Z Bio.`}
                              </p>
                              
                              <div className="aspect-[1.91/1] w-full bg-zinc-950 rounded border border-white/[0.03] overflow-hidden mt-1.5">
                                {bio.seoShareImage || bio.avatarUrl ? (
                                  <img
                                    src={bio.seoShareImage || bio.avatarUrl}
                                    alt="Discord Embed"
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-750"><Sparkles className="w-6 h-6" /></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSocialPlatform === 'google' && (
                    <div className="space-y-4">
                      {/* Google Search Mockup in dark mode */}
                      <div className="bg-[#202124] border border-white/5 p-4 rounded-xl max-w-sm mx-auto space-y-2 font-sans text-left text-zinc-200">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 select-none">
                          <span className="truncate">https://genzbio.me › {bio.username}</span>
                          <svg className="w-2.5 h-2.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
                        </div>

                        <h4 className="text-[13px] font-semibold text-[#8ab4f8] hover:underline cursor-pointer leading-tight truncate">
                           {bio.seoTitle || `${bio.displayName} (@${bio.username}) | Gen-Z Bio`}
                        </h4>

                        <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2 font-normal">
                          {bio.seoDescription || bio.description || `${bio.displayName}'s personalized landing page. Links, embeds, virtual drops and live content.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* COLUMN 3: LIVE MOBILE SIMULATOR */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-6 bg-[#04060A] select-none min-h-0 relative">
          
          <div className="absolute top-4 left-4 flex gap-1 bg-[#090d16] p-1 border border-white/5 rounded-xl">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg ${previewDevice === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
              title="Mobile Mock Simulator"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg ${previewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white'}`}
              title="Desktop Mock Simulator"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute top-4 right-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Live Simulator Views
          </div>

          {/* Simulator Box Wrapper */}
          <div 
            className={`transition-all duration-300 ${
              previewDevice === 'mobile' 
                ? 'w-[320px] h-[580px] rounded-[36px] border-[8px] border-zinc-800 bg-neutral-950 shadow-[0_22px_70px_rgba(0,0,0,0.85)]' 
                : 'w-[85%] h-[80%] rounded-2xl border border-white/5 bg-neutral-950 shadow-2xl'
            } overflow-hidden flex flex-col relative`}
          >
            {/* If Mobile Simulator, show Notch */}
            {previewDevice === 'mobile' && (
              <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-zinc-800 z-50 flex items-center justify-center">
                <div className="w-12 h-1 bg-zinc-950 rounded-full" />
              </div>
            )}

            {/* Simulated Live Renderer Frame */}
            <div className="flex-1 overflow-y-auto w-full h-full min-h-0">
              <BioPage demoBio={bio} handleCountMetric={() => {}} />
            </div>
          </div>
        </div>

      </div>

      {/* SELECT BLOCK MODAL INTERFACE */}
      {showBlockSelector && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 font-sans text-white backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#090d16] border border-white/[0.08] p-8 rounded-3xl shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <h3 className="text-xl font-bold text-white">Insert Custom blocks</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Choose from 19 customizable creators widget templates.</p>
              </div>
              <button
                onClick={() => setShowBlockSelector(false)}
                className="p-1 rounded bg-[#141d2f] text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {blockCategories.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => handleAddBlock(item.type)}
                    className="cursor-pointer p-4 text-left rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-purple-500/20 flex gap-3.5 items-center transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-white/[0.02] flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">{item.type}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
