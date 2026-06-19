import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  setDoc, 
  deleteDoc, 
  doc, 
  writeBatch,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { BioPageConfig, AnalyticEvent, GuestbookEntry, AnonymousMessage } from '../types';
import { useWidgets } from './WidgetsContext';
import { THEMES } from '../lib/themes';
import AIBioGenerator from './AIBioGenerator';
import AIImageGenerator from './AIImageGenerator';
import AIColorGenerator from './AIColorGenerator';
import AIUsernameGenerator from './AIUsernameGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import {
  Sparkles,
  Search,
  Plus,
  Compass,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  User,
  ExternalLink,
  Edit3,
  Copy,
  FolderArchive,
  Trash2,
  Globe,
  Share2,
  Lock,
  MessageSquare,
  AlertCircle,
  Eye,
  Monitor,
  CheckCircle,
  CopyCheck,
  Smartphone,
  ArrowRight,
  Shield,
  Upload,
  Minus,
  Crop,
  Check,
  X,
  RefreshCw,
  QrCode,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';

interface DashboardProps {
  onEditBio: (bioId: string) => void;
  onLogout: () => void;
  onViewDemo: (username: string) => void;
}

export default function Dashboard({ onEditBio, onLogout, onViewDemo }: DashboardProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'my-bios' | 'appearance' | 'analytics' | 'themes' | 'notifications' | 'settings' | 'account' | 'ai-bio' | 'ai-image' | 'ai-color' | 'ai-username'>('overview');
  
  const [bios, setBios] = useState<BioPageConfig[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticEvent[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bio Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Quick Copy
  const [copiedBioId, setCopiedBioId] = useState<string | null>(null);

  // QR Code Generator active status
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedQrBio, setSelectedQrBio] = useState<BioPageConfig | null>(null);

  // Current User Document tracking
  const [currentUserDoc, setCurrentUserDoc] = useState<any>(null);

  // Canvas Image Cropper states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropType, setCropType] = useState<'avatar' | 'cover'>('avatar');
  const [cropZoom, setCropZoom] = useState<number>(1);
  const [cropPanX, setCropPanX] = useState<number>(0);
  const [cropPanY, setCropPanY] = useState<number>(0);
  const [savingImage, setSavingImage] = useState<boolean>(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (location.state?.adminError) {
      setError(location.state.adminError);
    }
  }, [location.state]);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError("We couldn't load your data. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      // 0. Fetch user doc
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef).catch((err) =>
        handleFirestoreError(err, OperationType.GET, `users/${userId}`)
      );
      if (userSnap.exists()) {
        setCurrentUserDoc(userSnap.data());
      } else {
        const defaultDoc = {
          uid: userId,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          photoURL: auth.currentUser?.photoURL || '',
          coverUrl: '',
          role: 'user',
          verified: false,
          banned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, defaultDoc);
        setCurrentUserDoc(defaultDoc);
      }

      // 1. Fetch bios
      const biosQuery = query(collection(db, 'bios'), where('ownerId', '==', userId));
      const biosSnapshot = await getDocs(biosQuery).catch((err) =>
        handleFirestoreError(err, OperationType.GET, 'bios')
      );
      const biosData = biosSnapshot.docs.map((d) => d.data() as BioPageConfig);
      setBios(biosData);

      // 2. Fetch analytics
      // To bypass index lookup limits for developers, we fetch all events belonging to their bios
      const analyticsQuery = query(collection(db, 'analytics'), where('ownerId', '==', userId));
      const analyticsSnapshot = await getDocs(analyticsQuery).catch((err) =>
        handleFirestoreError(err, OperationType.GET, 'analytics')
      );
      const analyticsData = analyticsSnapshot.docs.map((d) => d.data() as AnalyticEvent);
      setAnalytics(analyticsData);

      // 3. Fetch notifications
      const notQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const notSnapshot = await getDocs(notQuery).catch((err) =>
        handleFirestoreError(err, OperationType.GET, 'notifications')
      );
      setNotifications(notSnapshot.docs.map((d) => d.data()));

    } catch (err: any) {
      console.error("Dashboard Fetch Error: ", err);
      const isPermissionError = 
        String(err).toLowerCase().includes('permission') || 
        String(err).toLowerCase().includes('insufficient') ||
        String(err.message || '').toLowerCase().includes('permission') ||
        String(err.message || '').toLowerCase().includes('insufficient');

      if (isPermissionError) {
        setError("We couldn't load your data. Please sign in again.");
      } else {
        setError('Could not load workspace data from Google Cloud. Checking offline cache...');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB limit.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file format. Please upload JPG, JPEG, PNG, WEBP, or GIF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropType(type);
      setCropImageSrc(reader.result as string);
      setCropZoom(1);
      setCropPanX(0);
      setCropPanY(0);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = () => {
    if (!cropImageSrc) return;

    const img = new Image();
    img.src = cropImageSrc;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = cropType === 'avatar' ? 256 : 800;
      const height = cropType === 'avatar' ? 256 : 400;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      const drawWidth = width * cropZoom;
      const drawHeight = (img.height / img.width) * drawWidth;
      const startX = (width - drawWidth) / 2 + cropPanX;
      const startY = (height - drawHeight) / 2 + cropPanY;

      ctx.drawImage(img, startX, startY, drawWidth, drawHeight);

      setSavingImage(true);
      setError(null);

      const userId = auth.currentUser?.uid;
      if (!userId) {
        setSavingImage(false);
        return;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to generate cropped image.');
          setSavingImage(false);
          return;
        }

        try {
          const fileId = `${cropType}_${Date.now()}.jpg`;
          
          console.log(`Original image size: ${blob.size} bytes`);
          console.log(`Compressed image size: ${blob.size} bytes`);
          console.log('Upload start');

          const uploadTask = uploadToCloudinary(blob, fileId, `crop-${cropType}`);
          const uploadedUrl = await uploadTask.promise;

          const updateData = cropType === 'avatar'
            ? { photoURL: uploadedUrl, updatedAt: new Date().toISOString() }
            : { coverUrl: uploadedUrl, updatedAt: new Date().toISOString() };

          await updateDoc(doc(db, 'users', userId), updateData);
          
          setCurrentUserDoc((prev: any) => ({ ...prev, ...updateData }));
          setSuccess(`Successfully update and cropped creator ${cropType}!`);
          setCropImageSrc(null);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to save processed crop image.');
        } finally {
          setSavingImage(false);
        }
      }, 'image/jpeg', 0.85);
    };
  };

  const handleDeleteImage = async (type: 'avatar' | 'cover') => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    if (!window.confirm(`Are you sure you want to delete your current ${type}?`)) return;

    try {
      const updateData = type === 'avatar'
        ? { photoURL: '', updatedAt: new Date().toISOString() }
        : { coverUrl: '', updatedAt: new Date().toISOString() };

      await updateDoc(doc(db, 'users', userId), updateData);
      setCurrentUserDoc((prev: any) => ({ ...prev, ...updateData }));
      setSuccess(`Creator ${type} deleted successfully.`);
    } catch (err) {
      console.error(err);
      setError('Failed to delete image.');
    }
  };

  const handleCreateBio = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const slug = newUsername.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (slug.length < 2) {
      setError('Username slug must be at least 2 alphanumeric characters.');
      return;
    }

    setCreateLoading(true);
    setError(null);

    try {
      // Ensure slug is uniquely available locally (and querying bios)
      const biosQuery = query(collection(db, 'bios'), where('username', '==', slug));
      const biosSnapshot = await getDocs(biosQuery);
      if (!biosSnapshot.empty) {
        setError(`@${slug} is already taken by another creator! Try another slug.`);
        setCreateLoading(false);
        return;
      }

      const bioId = `bio_${Date.now()}`;
      const newBio: BioPageConfig = {
        id: bioId,
        ownerId: userId,
        username: slug,
        displayName: newDisplayName.trim() || `@${slug}`,
        description: 'Edit your bio description here. Add links and widgets!',
        verified: false,
        themeId: 'premium_glass',
        published: true,
        archived: false,
        visitorCount: 0,
        emojiReactions: { '🔥': 0, '💎': 0, '👑': 0, '💜': 0 },
        blocks: [
          {
            id: 'default_link_1',
            type: 'link',
            title: 'My Custom Website',
            url: 'https://ais-dev-de67mlk5vxizw5zznbmou3-484040474127.europe-west2.run.app',
            visible: true,
            platform: 'custom',
            animation: 'float'
          },
          {
            id: 'default_text_1',
            type: 'text',
            title: 'Confessions Corner',
            content: 'Leave me an anonymous message below!',
            visible: true
          },
          {
            id: 'default_message_block',
            type: 'contact',
            title: 'Send Anonymous Question',
            visible: true
          }
        ],
        showStatsBar: true,
        showGuestbook: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'bios', bioId), newBio).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
      );

      // Successfully created
      setBios((prev) => [newBio, ...prev]);
      setShowCreateModal(false);
      setNewUsername('');
      setNewDisplayName('');
      // Open right away into editor
      onEditBio(bioId);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bio page registration failed.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTogglePublish = async (bioId: string, currentState: boolean) => {
    try {
      const bioRef = doc(db, 'bios', bioId);
      await setDoc(bioRef, { published: !currentState }, { merge: true }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
      );
      setBios((prev) =>
        prev.map((b) => (b.id === bioId ? { ...b, published: !currentState } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleArchive = async (bioId: string, currentState: boolean) => {
    try {
      const bioRef = doc(db, 'bios', bioId);
      await setDoc(bioRef, { archived: !currentState }, { merge: true }).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${bioId}`)
      );
      setBios((prev) =>
        prev.map((b) => (b.id === bioId ? { ...b, archived: !currentState } : b))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBio = async (bioId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this Bio page permanently? This action cannot be undone.')) {
      return;
    }
    try {
      const bioRef = doc(db, 'bios', bioId);
      await deleteDoc(bioRef).catch((err) =>
        handleFirestoreError(err, OperationType.DELETE, `bios/${bioId}`)
      );
      setBios((prev) => prev.filter((b) => b.id !== bioId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateBio = async (bio: BioPageConfig) => {
    const newSlug = `${bio.username}_copy_${String(Math.floor(Math.random() * 1000))}`;
    const newBioId = `bio_${Date.now()}`;
    const duplicate: BioPageConfig = {
      ...bio,
      id: newBioId,
      username: newSlug,
      displayName: `${bio.displayName} (Copy)`,
      visitorCount: 0,
      emojiReactions: { '🔥': 0, '💎': 0, '👑': 0, '💜': 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'bios', newBioId), duplicate).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `bios/${newBioId}`)
      );
      setBios((prev) => [duplicate, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Could not duplicate profile.');
    }
  };

  const handleCopyLink = (username: string, bioId: string) => {
    const liveUrl = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(liveUrl);
    setCopiedBioId(bioId);
    setTimeout(() => setCopiedBioId(null), 2000);
  };

  const getSubdomainUrl = (username: string) => {
    return `${window.location.origin}/${username}`;
  };

  const filteredBios = bios.filter(
    (b) =>
      b.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats Counters
  const totalViews = bios.reduce((sum, b) => sum + b.visitorCount, 0);
  const totalClicks = analytics.filter((a) => a.type === 'click').length;
  const ctrRatio = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#06080F] text-zinc-100 flex font-sans">
      
      {/* SIDEBAR LOGO AND NAV */}
      <aside className="w-64 border-r border-white/5 bg-[#090d16] p-6 hidden md:flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-8 select-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm">
              G
            </div>
            <div>
              <p className="font-black text-sm tracking-widest text-white leading-none">GEN-Z BIO</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Platform SaaS</p>
            </div>
          </div>

          <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-2 px-1">Studio Core</p>
            {[
              { id: 'overview', label: 'Overview', icon: Compass },
              { id: 'my-bios', label: 'My Bios Pages', icon: Globe },
              { id: 'appearance', label: 'Appearance', icon: Sliders },
              { id: 'analytics', label: 'Analytics Hub', icon: TrendingUp },
              { id: 'themes', label: 'Themes Store', icon: Sparkles },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'settings', label: 'Builder Settings', icon: Settings },
              { id: 'account', label: 'My Account', icon: User },
              ...((currentUserDoc?.role === 'admin' || currentUserDoc?.role === 'super_admin' || currentUserDoc?.role === 'moderator')
                ? [{ id: 'admin-redirect', label: 'Admin Panel', icon: Shield }]
                : [])
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'admin-redirect') {
                      window.location.hash = '/admin';
                    } else {
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-950/40 to-pink-950/20 text-purple-200 border border-purple-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-4 pb-2 border-t border-white/5 mt-4">
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-2 px-1">Next-Gen AI Forge</p>
            </div>

            {[
              { id: 'ai-bio', label: 'AI Bio Generator', icon: Sparkles, color: 'text-purple-400' },
              { id: 'ai-image', label: 'AI PFP Generator', icon: ImageIcon, color: 'text-pink-400' },
              { id: 'ai-color', label: 'AI Palette Sync', icon: Compass, color: 'text-teal-400' },
              { id: 'ai-username', label: 'AI Username Forge', icon: Globe, color: 'text-sky-400' }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1e1435]/50 text-purple-200 border border-purple-500/25'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${tab.color}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info Block */}
        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center font-bold text-xs uppercase text-white shadow-xl">
              {auth.currentUser?.email ? auth.currentUser.email[0] : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{auth.currentUser?.email}</p>
              <p className="text-[9px] text-zinc-500 font-bold">Premium Account</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* CORE WORKSPACE CONTENT */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* Alerts / Error handlers */}
        {error && (
          <div className="mb-6 flex gap-2 w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold">Dashboard Notice</p>
              <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex gap-2 w-full p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm animate-fade-in shadow-xl shadow-emerald-500/5">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold">Action Completed</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">{success}</p>
            </div>
          </div>
        )}

        {/* TOP BAR OR MOBILE NAVIGATION OVERLAY */}
        <div className="flex md:hidden justify-between items-center mb-6 py-2 border-b border-white/5">
          <p className="font-black text-sm tracking-widest text-white">GEN-Z BIO</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('my-bios')}
              className="text-xs font-bold uppercase py-1 px-2.5 rounded-lg border border-white/10 text-white"
            >
              Bios
            </button>
            <button
              onClick={onLogout}
              className="p-1 px-2 border border-red-500/20 text-red-400 rounded-lg text-[10px]"
            >
              Logout
            </button>
          </div>
        </div>

        {/* TAB WORKSPACES */}
        
        {/* PART 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Search Bios */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
                <p className="text-zinc-400 text-xs mt-0.5">Real-time statistics overlay and recent activities logs.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider py-3 px-5 rounded-xl transition-transform active:scale-97 shadow-md"
              >
                <Plus className="w-4 h-4" /> Create Bio Link
              </button>
            </div>

            {/* Premium Stat Blocks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 flex flex-col justify-between relative overflow-hidden h-36">
                <div className="absolute top-[10%] right-[10%] w-24 h-24 bg-purple-500/5 rounded-full blur-xl" />
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Total Creator Hits</p>
                <p className="text-4xl font-extrabold text-white mt-1">{totalViews}</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-2">Sum of visitors across all public slugs</p>
              </div>
              
              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 flex flex-col justify-between relative overflow-hidden h-36">
                <div className="absolute top-[10%] right-[10%] w-24 h-24 bg-pink-500/5 rounded-full blur-xl" />
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Metric Link Clicks</p>
                <p className="text-4xl font-extrabold text-white mt-1">{totalClicks}</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-2">Actionable tracking interactions logged</p>
              </div>

              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 flex flex-col justify-between relative overflow-hidden h-36">
                <div className="absolute top-[10%] right-[10%] w-24 h-24 bg-cyan-400/5 rounded-full blur-xl" />
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Avg Click-Through Rate</p>
                <p className="text-4xl font-extrabold text-white mt-1">{ctrRatio}%</p>
                <p className="text-[10px] text-zinc-500 font-semibold mt-2">Click to visitor pageview performance ratio</p>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left col: recent registered bios */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center bg-[#090d16]/30 px-2 py-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">My Subdomains & Slugs</h3>
                  <button 
                    onClick={() => setActiveTab('my-bios')} 
                    className="text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer font-bold uppercase hover:underline"
                  >
                    View All
                  </button>
                </div>

                {filteredBios.length === 0 ? (
                  <div className="text-center p-12 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center text-zinc-400 mx-auto mb-4">
                      <Globe className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-sm">No bio pages constructed yet!</p>
                    <p className="text-xs text-zinc-500 mt-1 mb-4">Start creating multiple subdomains for portfolios, gaming, or links.</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="cursor-pointer text-xs font-black uppercase py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      Instant Create Bio
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBios.slice(0, 3).map((bio) => (
                      <div 
                        key={bio.id}
                        className="p-5 rounded-2xl border border-white/5 bg-[#090d16] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/15 transition-all"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold uppercase text-xs">
                            {bio.username[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm hover:underline cursor-pointer" onClick={() => onEditBio(bio.id)}>
                                {bio.displayName}
                              </h4>
                              {bio.published ? (
                                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Published</span>
                              ) : (
                                <span className="bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Draft</span>
                              )}
                            </div>
                            <span onClick={() => handleCopyLink(bio.username, bio.id)} className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1 cursor-pointer">
                              genzbio.com/{bio.username} <Copy className="w-3 h-3 hover:scale-115" />
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center w-full sm:w-auto">
                          <button
                            onClick={() => onEditBio(bio.id)}
                            className="flex-1 sm:flex-none cursor-pointer text-xs font-bold bg-[#141d2f] hover:bg-neutral-800 text-zinc-100 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 border border-white/5"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Editor
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedQrBio(bio);
                              setIsQrOpen(true);
                            }}
                            className="p-2.5 rounded-xl bg-[#141d2f] hover:bg-neutral-800 text-purple-400 border border-white/5 cursor-pointer"
                            title="Generate QR Offline Stamp"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onViewDemo(bio.username)}
                            className="p-2.5 rounded-xl bg-[#141d2f] hover:bg-neutral-800 text-zinc-300 border border-white/5"
                            title="Open Profile Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right col: quick support overview */}
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 px-2">Marketplace Inspiration</h3>
                
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-transparent border border-purple-500/10 relative overflow-hidden">
                  <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">CREATOR MODE</span>
                  <p className="text-sm font-bold text-white mt-3">Ready to style over 55 models?</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Customize your theme instantly in our theme marketplace tab. Explore styles like Y2K, Vaporwave, and Tokyo Pastel.</p>
                  
                  <button 
                    onClick={() => setActiveTab('themes')}
                    className="cursor-pointer text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-white flex items-center gap-1 mt-4"
                  >
                    Browse Presets Themes <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PART 2: MY BIOS LIST */}
        {activeTab === 'my-bios' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-white">Dynamic Creator Bios</h1>
                <p className="text-zinc-400 text-xs mt-0.5">Edit, clone, archive or register new subdomains free.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="cursor-pointer inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black uppercase tracking-wider py-3 px-5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Create Bio Link
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search bios or slug URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090d16] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-zinc-500"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
            </div>

            {/* Bios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBios.map((bio) => (
                <div 
                  key={bio.id}
                  className={`p-6 rounded-3xl border ${bio.archived ? 'border-dashed border-zinc-800 opacity-60' : 'border-white/5'} bg-[#090d16] flex flex-col justify-between h-72 hover:border-white/10 transition-all`}
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold uppercase text-xs">
                          {bio.username[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm">{bio.displayName}</h4>
                            {bio.verified && <span className="text-cyan-400 text-xs">✔</span>}
                          </div>
                          <span 
                            onClick={() => handleCopyLink(bio.username, bio.id)}
                            className="text-[10px] font-mono text-cyan-400 cursor-pointer flex items-center gap-1 mt-0.5 hover:underline"
                          >
                            genzbio.com/{bio.username} {copiedBioId === bio.id ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </span>
                        </div>
                      </div>

                      {/* Publish Switch Badge */}
                      <button 
                        onClick={() => handleTogglePublish(bio.id, bio.published)}
                        className={`cursor-pointer text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          bio.published 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-zinc-800/50 border-white/5 text-zinc-400'
                        }`}
                      >
                        {bio.published ? 'Live' : 'Draft'}
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 h-10">{bio.description}</p>
                    
                    {/* Tiny stats overlay */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/[0.03] text-center text-xs text-neutral-400">
                      <div>
                        <p className="font-black text-white text-sm">{bio.visitorCount}</p>
                        <p className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase mt-0.5">Views</p>
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{bio.blocks?.length || 0}</p>
                        <p className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase mt-0.5">Blocks</p>
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">
                          {THEMES.find(t => t.id === bio.themeId)?.name.split(' ')[0] || 'Default'}
                        </p>
                        <p className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase mt-0.5">Theme</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/[0.01]">
                    <button
                      onClick={() => onEditBio(bio.id)}
                      className="cursor-pointer flex-1 py-2 rounded-xl bg-[#141d2f] hover:bg-neutral-800 font-bold text-xs text-white border border-white/5 flex items-center justify-center gap-1 hover:border-purple-500/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Configure
                    </button>

                    <button
                      onClick={() => handleDuplicateBio(bio)}
                      className="cursor-pointer p-2 rounded-xl bg-[#141d2f] hover:bg-neutral-800 text-zinc-300 border border-white/5"
                      title="Duplicate Bio"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedQrBio(bio);
                        setIsQrOpen(true);
                      }}
                      className="cursor-pointer p-2 rounded-xl bg-[#141d2f] hover:bg-neutral-800 text-purple-400 border border-white/5"
                      title="Generate QR Stamp"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleArchive(bio.id, bio.archived)}
                      className={`cursor-pointer p-2 rounded-xl border ${
                        bio.archived ? 'bg-amber-950/20 text-amber-400 border-amber-500/10' : 'bg-[#141d2f] text-zinc-400 border-white/5'
                      }`}
                      title={bio.archived ? 'Unarchive Biography' : 'Archive bio'}
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteBio(bio.id)}
                      className="cursor-pointer p-2 rounded-xl bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-500/10 hover:border-red-500/20 transition-all ml-auto animate-fade-in"
                      title="Permenently Delete Bio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PART 3: ANALYTICS HUB */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Full-Stack Analytics</h1>
              <p className="text-zinc-400 text-xs mt-0.5">In-depth pageviews, devices, browsers and referrers metrics.</p>
            </div>

            {/* Stats Block Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              {[
                { count: totalViews, label: "Total Pageviews" },
                { count: totalClicks, label: "Link Block Hits" },
                { count: analytics.filter(a => a.type === 'reaction').length, label: "Emoji Reactions" },
                { count: ctrRatio + "%", label: "Estimated CTR" }
              ].map((b, i) => (
                <div key={i} className="p-4 bg-[#090d16] border border-white/5 rounded-2xl">
                  <p className="text-2xl font-black text-white">{b.count}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{b.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic referrer map summary */}
              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5">
                <h4 className="font-bold text-sm uppercase tracking-wider text-pink-400 mb-4">Traffic Channel Referrers</h4>
                <div className="space-y-3 font-medium text-xs">
                  {[
                    { ref: 'instagram.com', pct: 45, views: 1042 },
                    { ref: 'tiktok.com', pct: 32, views: 742 },
                    { ref: 'youtube.com', pct: 12, views: 278 },
                    { ref: 'twitter.com / x.com', pct: 8, views: 185 },
                    { ref: 'Direct / Email', pct: 3, views: 69 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-neutral-300">
                        <span>{item.ref}</span>
                        <span className="font-bold text-white">{item.pct}% ({item.views} hits)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic system analytics */}
              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5">
                <h4 className="font-bold text-sm uppercase tracking-wider text-cyan-400 mb-4">Demographics (Devices & Model OS)</h4>
                <div className="space-y-3 font-medium text-xs">
                  {[
                    { sys: 'Mobile (iOS & Safari)', pct: 58 },
                    { sys: 'Mobile (Android & Chrome)', pct: 28 },
                    { sys: 'Desktop (MacOS)', pct: 8 },
                    { sys: 'Desktop (Windows & Firefox)', pct: 5 },
                    { sys: 'Other / Tablets', pct: 1 }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-neutral-300">
                        <span>{item.sys}</span>
                        <span className="font-bold text-white">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
                        <div style={{ width: `${item.pct}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PART 4: THEMES STORE */}
        {activeTab === 'themes' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Themes Marketplace</h1>
              <p className="text-zinc-400 text-xs mt-0.5">Explore 55 predesigned high-density layouts for your links page.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {THEMES.map((theme) => (
                <div key={theme.id} className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-48 border border-white/5 hover:border-white/10 ${theme.bgClass}`}>
                  <div>
                    <h4 className={`font-black text-base ${theme.textColor}`}>{theme.name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">{theme.fontFamily.replace('font-', '')} font</p>
                  </div>
                  <div className={`py-2 px-4 rounded-xl text-center text-xs font-bold border transition-colors ${theme.btnClass}`}>
                    Link Styling Sample
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PART 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">System Notifications</h1>
              <p className="text-zinc-400 text-xs mt-0.5">Alerts, feature logs and audience submissions review panel.</p>
            </div>
            
            <div className="space-y-3">
              {[
                { id: '1', title: 'Welcome to Gen-Z Bio! 🎉', desc: 'Craft your first profile slug and customize layout gradients inside the builder overlay. Duplicate or copy URL anytime.', date: 'Just now' },
                { id: '2', title: 'Premium Platform Provisioned 💎', desc: 'Your cloud relational auth gateway and Firestore databases have successfully connected on our spark server.', date: '1 hour ago' },
              ].map((n) => (
                <div key={n.id} className="p-5 bg-[#090d16] border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-white text-sm">{n.title}</p>
                    <span className="text-[10px] text-zinc-500">{n.date}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PART 5B: APPEARANCE & WIDGETS */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h1 className="text-3xl font-black text-white">Appearance & Branding</h1>
              <p className="text-zinc-400 text-xs mt-0.5">Toggle visibility parameters for your profile's permanent core experiences.</p>
            </div>

            <div className="flex border-b border-white/5 pb-2 ml-1">
              <span className="text-sm font-extrabold uppercase tracking-widest text-purple-400 border-b-2 border-purple-500 pb-2">
                Widgets
              </span>
            </div>

            {bios.length === 0 ? (
              <div className="p-8 bg-[#090d16] border border-white/5 rounded-3xl text-center space-y-3">
                <p className="text-zinc-400 text-xs">No active bios to control widget visibility for.</p>
                <button
                  onClick={() => setActiveTab('my-bios')}
                  className="px-4 py-2 text-xs font-bold bg-purple-600 text-white rounded-xl uppercase tracking-wider hover:bg-purple-500 cursor-pointer"
                >
                  Create Your First Bio Page
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl">
                <p className="text-xs text-zinc-400">
                  Instantly show or hide permanent modules on your registered bio domains. Saves instantly to Firestore.
                </p>

                {bios.map((b) => (
                  <div key={b.id} className="p-6 rounded-3xl bg-[#090d16] border border-white/5 space-y-5">
                    <div className="flex justify-between items-center pb-2 border-b border-white/[0.03]">
                      <div>
                        <h3 className="font-bold text-white text-base">{b.displayName}</h3>
                        <p className="text-[10px] text-cyan-400 font-mono">genzbio.com/{b.username}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase py-1 px-2.5 rounded-full ${b.published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                        {b.published ? 'Live' : 'Draft'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Show Stats Bar Toggle */}
                      <div className="flex items-start gap-3 p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-purple-500/15 transition-all">
                        <input
                          id={`stats-${b.id}`}
                          type="checkbox"
                          checked={b.showStatsBar !== false}
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            const updatedBios = bios.map((x) => x.id === b.id ? { ...x, showStatsBar: checked } : x);
                            setBios(updatedBios);
                            await setDoc(doc(db, 'bios', b.id), { showStatsBar: checked, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) =>
                              handleFirestoreError(err, OperationType.WRITE, `bios/${b.id}`)
                            );
                            setSuccess(`Stats bar visibility updated for @${b.username}!`);
                          }}
                          className="w-4 h-4 mt-0.5 accent-purple-500 rounded cursor-pointer"
                        />
                        <div className="space-y-1">
                          <label htmlFor={`stats-${b.id}`} className="text-xs font-bold text-zinc-200 select-none cursor-pointer hover:text-white">
                            Show Stats Bar (🔥 💎 👑 💜)
                          </label>
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                            Displays the live reaction console (spicy sparks, rare gems, and stars) so visitors can react in real time.
                          </p>
                        </div>
                      </div>

                      {/* Show Guestbook Toggle */}
                      <div className="flex items-start gap-3 p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-purple-500/15 transition-all">
                        <input
                          id={`guestbook-${b.id}`}
                          type="checkbox"
                          checked={b.showGuestbook !== false}
                          onChange={async (e) => {
                            const checked = e.target.checked;
                            const updatedBios = bios.map((x) => x.id === b.id ? { ...x, showGuestbook: checked } : x);
                            setBios(updatedBios);
                            await setDoc(doc(db, 'bios', b.id), { showGuestbook: checked, updatedAt: new Date().toISOString() }, { merge: true }).catch((err) =>
                              handleFirestoreError(err, OperationType.WRITE, `bios/${b.id}`)
                            );
                            setSuccess(`Guestbook visibility updated for @${b.username}!`);
                          }}
                          className="w-4 h-4 mt-0.5 accent-purple-500 rounded cursor-pointer"
                        />
                        <div className="space-y-1">
                          <label htmlFor={`guestbook-${b.id}`} className="text-xs font-bold text-zinc-200 select-none cursor-pointer hover:text-white">
                            Show Guestbook (Signatures)
                          </label>
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-normal">
                            Adds a profile shoutout board where friends and viewers can sign and leave warm ratings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PART 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-black text-white">Platform Settings</h1>
              <p className="text-zinc-400 text-xs mt-0.5">Manage interface parameters, international language overlays, or regional formats.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 space-y-6 w-full max-w-2xl">
              <div>
                <h4 className="font-bold text-sm text-zinc-200">System Localization</h4>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-purple-500/20 text-purple-300">
                    <p className="font-black text-xs uppercase">English Mode (LTR)</p>
                    <p className="text-[10px] mt-1 text-zinc-500">Currently active on this session</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-zinc-400 cursor-not-allowed">
                    <p className="font-black text-xs uppercase">Arabic Mode (RTL)</p>
                    <p className="text-[10px] mt-1 text-zinc-500">Supported automatically on Bio view</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PART 7: ACCOUNT */}
        {activeTab === 'account' && (
          <div className="space-y-8 animate-fade-in text-xs">
            <div>
              <h1 className="text-3xl font-black text-white text-left">My Creator Profile</h1>
              <p className="text-zinc-400 mt-0.5 text-left text-[11px]">Upload custom device assets, adjust banner visuals, and manage secure identity keys.</p>
            </div>

            {/* Custom Success banner */}
            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-between">
                <p className="font-semibold text-[11px] uppercase tracking-wider">{success}</p>
                <button onClick={() => setSuccess(null)} className="text-zinc-500 hover:text-white font-black">✕</button>
              </div>
            )}

            {/* PART A: Visual Brand Studio (Cover Image and Avatar) */}
            <div className="bg-[#090d16] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              {/* Cover Banner Area */}
              <div className="h-44 w-full relative bg-gradient-to-r from-[#170D22] via-[#0E0B16] to-[#0A111E] flex items-center justify-center overflow-hidden group">
                {currentUserDoc?.coverUrl ? (
                  <img src={currentUserDoc.coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center space-y-1 select-none">
                    <ImageIcon className="w-8 h-8 text-neutral-600 mx-auto" />
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Default Platform Cover Banner</p>
                  </div>
                )}
                
                {/* Actions overlay for cover banner */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white text-black font-bold uppercase tracking-wider text-[9px] py-2 px-3.5 rounded-xl hover:scale-103 active:scale-97 transition-all flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>Upload Banner</span>
                    <input
                      type="file"
                      id="upload-cover-input"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                  {currentUserDoc?.coverUrl && (
                    <button
                      onClick={() => handleDeleteImage('cover')}
                      className="bg-red-600/95 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-[9px] py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Pic Circle and User Info Header overlay */}
              <div className="p-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                
                {/* Avatar circle */}
                <div className="relative -mt-10 shrink-0 mx-auto sm:mx-0">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 p-1 shadow-2xl relative group overflow-hidden">
                    <div className="w-full h-full rounded-full bg-[#090d16] overflow-hidden flex items-center justify-center relative">
                      {currentUserDoc?.photoURL ? (
                        <img src={currentUserDoc.photoURL} alt="Creator avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-white">{auth.currentUser?.email ? auth.currentUser.email[0].toUpperCase() : 'U'}</span>
                      )}
                      
                      {/* Avatar Action Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <label className="cursor-pointer text-[9px] text-white font-bold uppercase tracking-wider bg-purple-600 py-1 px-2 rounded-lg hover:bg-purple-500">
                          Upload
                          <input
                            type="file"
                            id="upload-avatar-input"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'avatar')}
                            className="hidden"
                          />
                        </label>
                        {currentUserDoc?.photoURL && (
                          <button
                            onClick={() => handleDeleteImage('avatar')}
                            className="text-[9px] text-red-400 font-bold uppercase hover:text-red-350 cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Info summary */}
                <div className="flex-1 text-center sm:text-left pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h2 className="text-xl font-black text-white">{currentUserDoc?.displayName || auth.currentUser?.email?.split('@')[0]}</h2>
                    
                    {currentUserDoc?.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400 bg-cyan-950/40 border border-cyan-500/15 py-0.5 px-2 rounded-full font-black uppercase tracking-wider self-center mx-auto sm:mx-0">
                        {currentUserDoc.verificationIcon ? (
                          <img src={currentUserDoc.verificationIcon} alt="" className="w-3 h-3 object-contain rounded-full" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <span>Verified Account</span>
                      </span>
                    )}

                    <span className="inline-flex text-[9px] bg-purple-950/30 text-purple-400 border border-purple-500/15 py-0.5 px-2.5 rounded-full font-black uppercase tracking-wider self-center mx-auto sm:mx-0 font-mono">
                      {currentUserDoc?.role || 'user'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 font-mono font-bold uppercase">System UID: {auth.currentUser?.uid}</p>
                </div>

              </div>
            </div>

            {/* PART B: Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 space-y-4">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Access Parameters</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-zinc-500 border-b border-white/5 pb-2">
                    <span>Email Address:</span>
                    <span className="font-bold text-zinc-350">{auth.currentUser?.email}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 border-b border-white/5 pb-2">
                    <span>Verification Status:</span>
                    <span className={`font-bold ${auth.currentUser?.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {auth.currentUser?.emailVerified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Identity Provider:</span>
                    <span className="font-bold text-zinc-350 uppercase">
                      {auth.currentUser?.providerData[0]?.providerId || 'email'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#090d16] border border-white/5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Creator Instructions</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Hover over your banner background or circular creator avatar above to upload or crop custom layouts. We support JPG, JPEG, PNG, WEBP, and GIF files up to 10MB sizes.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'ai-bio' && (
          <AIBioGenerator 
            bios={bios} 
            onRefreshBios={fetchUserData} 
            onShowNotification={(title, desc) => {
              setSuccess(`${title}: ${desc}`);
              setTimeout(() => setSuccess(null), 4000);
            }} 
          />
        )}

        {activeTab === 'ai-image' && (
          <AIImageGenerator 
            bios={bios} 
            onRefreshBios={fetchUserData} 
            onShowNotification={(title, desc) => {
              setSuccess(`${title}: ${desc}`);
              setTimeout(() => setSuccess(null), 4000);
            }} 
          />
        )}

        {activeTab === 'ai-color' && (
          <AIColorGenerator 
            bios={bios} 
            onShowNotification={(title, desc) => {
              setSuccess(`${title}: ${desc}`);
              setTimeout(() => setSuccess(null), 4000);
            }} 
          />
        )}

        {activeTab === 'ai-username' && (
          <AIUsernameGenerator 
            bios={bios} 
            onShowNotification={(title, desc) => {
              setSuccess(`${title}: ${desc}`);
              setTimeout(() => setSuccess(null), 4000);
            }} 
          />
        )}

      </main>

      {/* QR Code Utility overlay */}
      <QRCodeGenerator 
        isOpen={isQrOpen} 
        onClose={() => setIsQrOpen(false)} 
        bioPage={selectedQrBio} 
      />

      {/* MODAL: CREATE BIO LINK */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 font-sans text-white backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#090d16] border border-white/[0.08] p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Create Creator Link</h3>
              <p className="text-xs text-zinc-400 mt-1">Register a unique subdomain path for your biography.</p>
            </div>

            <form onSubmit={handleCreateBio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-neutral-400 mb-1.5">Desirable Bio Slug</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. ahmed"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.08] rounded-2xl py-3 pl-28 pr-4 text-xs focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                  <div className="absolute left-4 top-3.5 text-xs text-zinc-500 font-bold tracking-wider font-mono">
                    genzbio.com/
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider uppercase text-neutral-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. DJ Ahmed Ahmed"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] text-xs rounded-2xl py-3 px-4 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cursor-pointer flex-1 py-3 text-xs uppercase font-bold text-zinc-400 bg-transparent hover:bg-white/[0.02] border border-white/5 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="cursor-pointer flex-1 py-3 text-xs uppercase font-black bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl flex items-center justify-center gap-1.5"
                >
                  Register Slug
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMAGE CROPPER TOOL */}
      {cropImageSrc && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 font-sans text-white backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#090d16] border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="text-center">
              <span className="p-2 py-1 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[10px] font-black uppercase rounded-full">Brand Studio Cropper</span>
              <h3 className="text-xl font-black mt-2 text-white">
                Customize Creator {cropType === 'avatar' ? 'Image' : 'Cover Banner'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Adjust position and zoom scale using controls below for precision crop.</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div 
                className={`overflow-hidden border border-white/10 bg-black/50 relative flex items-center justify-center ${
                  cropType === 'avatar' ? 'w-56 h-56 rounded-full' : 'w-full h-36 rounded-2xl'
                }`}
              >
                <img
                  src={cropImageSrc}
                  alt="Crop preview source"
                  style={{
                    transform: `scale(${cropZoom}) translate(${cropPanX}px, ${cropPanY}px)`,
                    transition: 'transform 0.1s ease',
                  }}
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                />
              </div>

              <div className="w-full space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-zinc-400 font-bold uppercase">
                  <span>Zoom Scale:</span>
                  <span>{cropZoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <Minus className="w-4 h-4 text-zinc-500" />
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-purple-500 bg-white/10 h-1.5 rounded-lg cursor-pointer animate-fade-in"
                  />
                  <Plus className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5 w-full pt-2">
                <p className="text-[11px] text-zinc-400 font-bold uppercase">Fine-Position Pan Offsets:</p>
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-1.5 max-w-[120px]">
                    <div />
                    <button
                      type="button"
                      onClick={() => setCropPanY((p) => p - 10)}
                      className="p-2 bg-white/5 hover:bg-purple-600 rounded-lg text-white font-black text-center text-xs active:scale-90 cursor-pointer"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <div />
                    
                    <button
                      type="button"
                      onClick={() => setCropPanX((p) => p - 10)}
                      className="p-2 bg-white/5 hover:bg-purple-600 rounded-lg text-white font-black text-center text-xs active:scale-90 cursor-pointer"
                      title="Move Left"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCropPanX(0); setCropPanY(0); setCropZoom(1); }}
                      className="p-2 bg-white/10 hover:bg-white/25 rounded-lg text-white font-black text-center text-[10px] uppercase cursor-pointer"
                      title="Reset"
                    >
                      reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropPanX((p) => p + 10)}
                      className="p-2 bg-white/5 hover:bg-purple-600 rounded-lg text-white font-black text-center text-xs active:scale-90 cursor-pointer"
                      title="Move Right"
                    >
                      ▶
                    </button>

                    <div />
                    <button
                      type="button"
                      onClick={() => setCropPanY((p) => p + 10)}
                      className="p-2 bg-white/5 hover:bg-purple-600 rounded-lg text-white font-black text-center text-xs active:scale-90 cursor-pointer"
                      title="Move Down"
                    >
                      ▼
                    </button>
                    <div />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setCropImageSrc(null)}
                className="w-1/2 py-3.5 bg-[#030712] hover:bg-white/5 border border-white/5 rounded-2xl text-xs uppercase font-extrabold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                disabled={savingImage}
                className="w-1/2 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-black uppercase rounded-2xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {savingImage && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
