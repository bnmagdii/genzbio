import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  increment,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { BioPageConfig, BioBlock, GuestbookEntry, AnalyticEvent, UserProfile } from '../types';
import { THEMES, getTheme } from '../lib/themes';
import { detectPlatform, getPlatformInfo } from '../lib/platforms';
import { 
  Sparkles, 
  MapPin, 
  Link as LinkIcon, 
  TrendingUp, 
  CheckCircle, 
  Heart, 
  Globe, 
  MessageSquare, 
  Send, 
  Share2, 
  User, 
  Users, 
  ShoppingCart, 
  Download, 
  Map as MapIcon, 
  Mail, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  Flame, 
  Gem, 
  Crown, 
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  ExternalLink,
  Youtube,
  Copy,
  Check,
  Instagram,
  Smartphone
} from 'lucide-react';

interface BioPageProps {
  demoBio?: BioPageConfig | null; // For Builder Simulator
  handleCountMetric?: (type: 'view' | 'click', blockId?: string) => void;
}

const ANIMATION_VARIANTS: Record<string, any> = {
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'fade-up': {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'fade-down': {
    initial: { opacity: 0, y: -25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'fade-left': {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'fade-right': {
    initial: { opacity: 0, x: -25 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'slide-up': {
    initial: { y: 70, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15, stiffness: 120 }
  },
  'slide-down': {
    initial: { y: -70, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15, stiffness: 120 }
  },
  'slide-left': {
    initial: { x: 70, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15, stiffness: 120 }
  },
  'slide-right': {
    initial: { x: -70, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { type: 'spring', damping: 15, stiffness: 120 }
  },
  'zoom-in': {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', damping: 12, stiffness: 120 }
  },
  'zoom-out': {
    initial: { scale: 1.4, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', damping: 12, stiffness: 120 }
  },
  'rotate-in': {
    initial: { rotate: -15, scale: 0.8, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    transition: { type: 'spring', damping: 12, stiffness: 100 }
  },
  'bounce': {
    initial: { y: -60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: 'spring', bounce: 0.52, duration: 0.8 }
  },
  'flip': {
    initial: { rotateX: 90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  'typewriter': {
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0% 0 0)' },
    transition: { duration: 1.2, ease: 'easeInOut' }
  },
  // Loops
  'float': {
    animate: { y: [0, -6, 0] },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
  },
  'pulse-glow': {
    animate: { scale: [1, 1.025, 1], boxShadow: ['0 0 0 rgba(168, 85, 247, 0)', '0 0 16px rgba(168, 85, 247, 0.45)', '0 0 0 rgba(168, 85, 247, 0)'] },
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
  },
  'cosmic-drift': {
    animate: {
      y: [0, -7, 2, -4, 0],
      x: [0, 3, -2, 4, 0],
      rotate: [0, 1.2, -1, 0]
    },
    transition: { repeat: Infinity, duration: 7, ease: 'easeInOut' }
  },
  'neon-pulse': {
    animate: {
      filter: [
        'drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))',
        'drop-shadow(0 0 10px rgba(168, 85, 247, 0.8))',
        'drop-shadow(0 0 2px rgba(168, 85, 247, 0.3))'
      ]
    },
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
  },
  'parallax-float': {
    animate: { x: [0, 5, -5, 0], y: [0, -5, 5, 0] },
    transition: { repeat: Infinity, duration: 6, ease: 'easeInOut' }
  },
  'hologram-appear': {
    initial: { opacity: 0, scaleY: 0.1, filter: 'hue-rotate(90deg) brightness(2)' },
    animate: {
      opacity: [0, 1, 0.3, 0.9, 0.5, 1],
      scaleY: 1,
      filter: 'hue-rotate(0deg) brightness(1)'
    },
    transition: { duration: 0.85, times: [0, 0.15, 0.3, 0.5, 0.7, 1] }
  },
  'meteor-slide': {
    initial: { x: -300, skewX: -25, opacity: 0 },
    animate: { x: 0, skewX: 0, opacity: 1 },
    transition: { type: 'spring', damping: 11, stiffness: 140 }
  },
  'galaxy-spin': {
    initial: { rotate: -230, scale: 0.1, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    transition: { duration: 0.9, ease: 'easeOut' }
  }
};

function BlockAnimationWrapper({ block, children }: { block: any; children: React.ReactNode; key?: string }) {
  const animKey = block.animation || 'none';
  
  // Normalize legacy values
  const normalizedKey = 
    animKey === 'fade' ? 'fade-in' :
    animKey === 'pop' ? 'zoom-in' :
    animKey === 'float' ? 'float' :
    animKey;

  const effect = ANIMATION_VARIANTS[normalizedKey];

  if (!effect || normalizedKey === 'none') {
    return <div className="w-full">{children}</div>;
  }

  return (
    <motion.div
      initial={effect.initial || {}}
      animate={effect.animate || {}}
      transition={effect.transition || {}}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

export default function BioPage({ demoBio, handleCountMetric }: BioPageProps) {
  const { username } = useParams<{ username: string }>();
  const [bio, setBio] = useState<BioPageConfig | null>(null);
  const [ownerUser, setOwnerUser] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Visitors Interactions State
  const [anonymousText, setAnonymousText] = useState('');
  const [anonSuccess, setAnonSuccess] = useState(false);
  const [anonLoading, setAnonLoading] = useState(false);

  // Guestbook State
  const [guestName, setGuestName] = useState('');
  const [guestMsg, setGuestMsg] = useState('');
  const [guestbookList, setGuestbookList] = useState<GuestbookEntry[]>([]);
  const [guestSuccess, setGuestSuccess] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // FAQ Expanded State
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Active Interactive states
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>({});
  const [newsletterEmail, setNewsletterEmail] = useState<Record<string, string>>({});
  const [newsletterStatus, setNewsletterStatus] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});
  const [supportPaid, setSupportPaid] = useState<Record<string, boolean>>({});

  // Slide carousel autoplay loop
  useEffect(() => {
    if (!bio?.blocks) return;
    const activeSliders = bio.blocks.filter(b => b.type === 'slider' && b.visible && b.extraData?.autoplay !== false);
    if (activeSliders.length === 0) return;

    const timers = activeSliders.map(slide => {
      const intervalDelay = slide.extraData?.speed || 3000;
      return setInterval(() => {
        setCarouselIndex(prev => {
          const maxIdx = slide.images?.length || 0;
          if (maxIdx <= 1) return prev;
          const currentIdx = prev[slide.id] || 0;
          let newIdx = currentIdx + 1;
          if (newIdx >= maxIdx) {
            if (slide.extraData?.loop === false) return prev;
            newIdx = 0;
          }
          return { ...prev, [slide.id]: newIdx };
        });
      }, intervalDelay);
    });

    return () => {
      timers.forEach(t => clearInterval(t));
    };
  }, [bio?.blocks]);

  // Story Status State
  const [showStoryDetail, setShowStoryDetail] = useState(false);

  // Social Sharing State
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingPoster, setGeneratingPoster] = useState(false);
  const [activeShareChannel, setActiveShareChannel] = useState<'instagram' | 'tiktok'>('instagram');

  const generateAndDownloadStoryPoster = async () => {
    if (!bio) return;
    setGeneratingPoster(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background gradient (vertical)
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#121226');
      grad.addColorStop(1, '#020205');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw decorative neon radial glows for aesthetic feel
      const gradGlow1 = ctx.createRadialGradient(200, 300, 10, 200, 300, 600);
      gradGlow1.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      gradGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradGlow1;
      ctx.beginPath();
      ctx.arc(200, 300, 600, 0, Math.PI * 2);
      ctx.fill();

      const gradGlow2 = ctx.createRadialGradient(880, 1600, 10, 880, 1600, 600);
      gradGlow2.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
      gradGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradGlow2;
      ctx.beginPath();
      ctx.arc(880, 1600, 600, 0, Math.PI * 2);
      ctx.fill();

      // Draw beautiful cards floating in the center
      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 4;
      
      const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      };

      ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
      drawRoundRect(140, 380, 800, 1140, 60);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Load avatar image
      let avatarLoaded = false;
      if (bio.avatarUrl) {
        try {
          const avatarImg = new Image();
          avatarImg.crossOrigin = 'anonymous';
          const avatarPromise = new Promise((resolve, reject) => {
            avatarImg.onload = resolve;
            avatarImg.onerror = reject;
            avatarImg.src = bio.avatarUrl + (bio.avatarUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          });
          await avatarPromise;
          avatarLoaded = true;

          ctx.save();
          drawRoundRect(415, 460, 250, 250, 125);
          ctx.clip();
          ctx.drawImage(avatarImg, 415, 460, 250, 250);
          ctx.restore();

          // Outer Ring Glow
          ctx.strokeStyle = '#d946ef';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(540, 585, 128, 0, Math.PI * 2);
          ctx.stroke();
        } catch (err) {
          console.warn("Could not load avatar for story cover:", err);
        }
      }

      if (!avatarLoaded) {
        const gradInit = ctx.createLinearGradient(415, 460, 665, 710);
        gradInit.addColorStop(0, '#a855f7');
        gradInit.addColorStop(1, '#06b6d4');
        ctx.fillStyle = gradInit;

        ctx.beginPath();
        ctx.arc(540, 585, 125, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 90px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((bio.displayName || 'G').slice(0, 1).toUpperCase(), 540, 585);
      }

      ctx.textBaseline = 'alphabetic';

      // Draw Creator Name
      ctx.fillStyle = '#ffffff';
      let txtSize = 62;
      ctx.font = `600 ${txtSize}px sans-serif`;
      if (ctx.measureText) {
        while (ctx.measureText(bio.displayName || 'Gen-Z Creator').width > 700 && txtSize > 35) {
          txtSize -= 2;
          ctx.font = `600 ${txtSize}px sans-serif`;
        }
      }
      ctx.textAlign = 'center';
      ctx.fillText(bio.displayName || 'Gen-Z Creator', 540, 785);

      // `@username`
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 40px monospace';
      ctx.fillText(`@${bio.username}`, 540, 845);

      // Brief description or sticker text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'normal 32px sans-serif';
      const descText = bio.description && bio.description.length > 70 
        ? bio.description.substring(0, 67) + '...'
        : bio.description || 'Check out my latest content and blocks!';
      ctx.fillText(descText, 540, 910);

      // Get high-res QR code
      let qrLoaded = false;
      const shareUrl = window.location.origin + '/#/' + bio.username;
      try {
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}&color=ffffff&bgcolor=0a0f1e&qzone=1`;
        const qrPromise = new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrUrl;
        });
        await qrPromise;
        qrLoaded = true;

        ctx.fillStyle = '#0a0f1e';
        drawRoundRect(365, 1000, 350, 350, 40);
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.drawImage(qrImg, 390, 1025, 300, 300);
      } catch (err) {
        console.warn("Could not render QR code for story background:", err);
      }

      if (!qrLoaded) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        drawRoundRect(365, 1000, 350, 350, 40);
        ctx.fill();
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('🔗 LINK IN BIO', 540, 1180);
      }

      // Add a scan callout
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('SCAN QR TO OPEN PROFILE', 540, 1405);

      // Bottom Call-to-actions
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('🔥 LIVE LINKS IN STICKER', 540, 1640);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`GENZBIO.ME/#/${bio.username.toUpperCase()}`, 540, 1710);

      const dataUrl = canvas.toDataURL('image/png');
      const dlLink = document.createElement('a');
      dlLink.download = `${bio.username}_story_poster.png`;
      dlLink.href = dataUrl;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);

    } catch (err) {
      console.error("Poster creation failure:", err);
    } finally {
      setGeneratingPoster(false);
    }
  };

  // Reactions count locally
  const [emojiCounts, setEmojiCounts] = useState<{ [emoji: string]: number }>({
    '🔥': 0, '💎': 0, '👑': 0, '💜': 0
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeGuestbook: (() => void) | undefined;

    if (demoBio) {
      setBio(demoBio);
      setEmojiCounts(demoBio.emojiReactions || { '🔥': 0, '💎': 0, '👑': 0, '💜': 0 });
      setLoading(false);
      unsubscribeGuestbook = loadGuestbook(demoBio.id);
      if (demoBio.ownerId) {
        getDoc(doc(db, 'users', demoBio.ownerId)).then((uSnap) => {
          if (uSnap.exists()) {
            setOwnerUser(uSnap.data() as UserProfile);
          }
        }).catch(err => console.warn("Error fetching demoBio owner profile:", err));
      }
    } else if (username) {
      unsubscribeProfile = loadPublicProfileBySlug();
    }

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeGuestbook) unsubscribeGuestbook();
    };
  }, [demoBio, username]);

  useEffect(() => {
    if (bio) {
      // 1. Dynamic document title
      const pageTitle = bio.seoTitle || `${bio.displayName} (@${bio.username}) | Gen-Z Bio`;
      document.title = pageTitle;

      // 2. Dynamic description tag
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', bio.seoDescription || bio.description || `${bio.displayName}'s link in bio on Gen-Z Bio.`);

      // 3. Dynamic keywords tag
      if (bio.seoKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.setAttribute('content', bio.seoKeywords);
      }

      // 4. OpenGraph SEO and Social Sharing Adapter meta tags
      const ogTitle = bio.seoTitle || bio.displayName;
      const ogDesc = bio.seoDescription || bio.description || `${bio.displayName}'s official link in bio.`;
      const ogImg = bio.seoShareImage || bio.avatarUrl || '';

      const tagsToSync = [
        { key: 'og:title', isProperty: true, value: ogTitle },
        { key: 'og:description', isProperty: true, value: ogDesc },
        { key: 'og:image', isProperty: true, value: ogImg },
        { key: 'og:type', isProperty: true, value: 'profile' },
        { key: 'twitter:card', isProperty: false, value: 'summary_large_image' },
        { key: 'twitter:title', isProperty: false, value: ogTitle },
        { key: 'twitter:description', isProperty: false, value: ogDesc },
        { key: 'twitter:image', isProperty: false, value: ogImg }
      ];

      tagsToSync.forEach(({ key, isProperty, value }) => {
        const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          if (isProperty) {
            element.setAttribute('property', key);
          } else {
            element.setAttribute('name', key);
          }
          document.head.appendChild(element);
        }
        if (value) {
          element.setAttribute('content', value);
        }
      });
    }
  }, [bio]);

  const loadPublicProfileBySlug = () => {
    setLoading(true);
    setError(null);
    const qry = query(collection(db, 'bios'), where('username', '==', username.toLowerCase()));
    let guestbookUnsubscribe: (() => void) | undefined;
    
    const unsubscribe = onSnapshot(qry, (snap) => {
      if (snap.empty) {
        // Fallback demo preset if visiting direct fallback
        if (username === 'demo' || username === 'ahmed') {
          const defaultDemo: BioPageConfig = {
            id: 'demo_page',
            ownerId: 'demo_owner_id',
            username: username,
            displayName: 'DJ Ahmed Studio',
            description: 'Gen-Z EDM Mix creator • Dynamic audio sets • Join the community guestbook below!',
            verified: true,
            themeId: 'cyberpunk',
            published: true,
            archived: false,
            visitorCount: 1482,
            emojiReactions: { '🔥': 142, '💎': 84, '👑': 95, '💜': 118 },
            blocks: [
              { id: '1', type: 'heading', title: 'Stream Latest Beats', visible: true },
              { id: '2', type: 'music', title: 'Listen on Spotify', url: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGsyNa7T', visible: true },
              { id: '3', type: 'countdown', title: 'Next Virtual Drop', visible: true, extraData: { dateTime: '2026-10-31T20:00:00' } },
              { id: '4', type: 'product', title: 'Oversized Streetwear Hoodie', visible: true, extraData: { price: '59.00', currency: 'USD', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&q=80', buyUrl: '#' } },
              { id: '5', type: 'faq', title: 'FAQs & Bookings', visible: true, extraData: { items: [{ q: 'Do you play international venues?', a: 'Yes! Slide into our custom Q&A form inbox below with contract details.' }] } },
              { id: '6', type: 'contact', title: 'Submit Anonymous Question', visible: true }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setBio(defaultDemo);
          setEmojiCounts(defaultDemo.emojiReactions || { '🔥': 0, '💎': 0, '👑': 0, '💜': 0 });
          setOwnerUser({
            userId: 'demo_owner_id',
            email: 'demo@genzbio.me',
            displayName: 'DJ Ahmed Studio',
            verified: true,
            createdAt: new Date().toISOString()
          });
          trackPageview('demo_page', 'demo_owner_id');
        } else {
          setError(`Creator profile @${username} does not exist on our SaaS server yet!`);
        }
        setLoading(false);
      } else {
        const publicBioData = snap.docs[0].data() as BioPageConfig;
        if (!publicBioData.published || publicBioData.archived) {
          setError('This creator bio has been archived or put back into draft.');
        } else {
          setBio(publicBioData);
          setEmojiCounts(publicBioData.emojiReactions || { '🔥': 0, '💎': 0, '👑': 0, '💜': 0 });
          
          if (window.sessionStorage.getItem(`viewed_${publicBioData.id}`) !== 'true') {
            trackPageview(publicBioData.id, publicBioData.ownerId);
            window.sessionStorage.setItem(`viewed_${publicBioData.id}`, 'true');
          }

          if (!guestbookUnsubscribe) {
            guestbookUnsubscribe = loadGuestbook(publicBioData.id);
          }

          if (publicBioData.ownerId) {
            getDoc(doc(db, 'users', publicBioData.ownerId)).then((uSnap) => {
              if (uSnap.exists()) {
                setOwnerUser(uSnap.data() as UserProfile);
              }
            }).catch(err => console.warn("Error fetching owner profile:", err));
          }
        }
        setLoading(false);
      }
    }, (err) => {
      console.error(err);
      setError('Could not establish cloud run connection to loading bio.');
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (guestbookUnsubscribe) guestbookUnsubscribe();
    };
  };

  const loadGuestbook = (bioId: string) => {
    const qry = query(collection(db, 'guestbook'), where('bioId', '==', bioId));
    const unsubscribe = onSnapshot(qry, (snap) => {
      const data = snap.docs.map(doc => doc.data() as GuestbookEntry);
      setGuestbookList(data.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
    }, (err) => {
      console.error(err);
    });
    return unsubscribe;
  };

  // Log demographic stats and impressions views
  const trackPageview = async (profileId: string, ownerId: string) => {
    try {
      // 1. Increment visitor count block in background
      const bioRef = doc(db, 'bios', profileId);
      await setDoc(bioRef, { visitorCount: increment(1) }, { merge: true });

      // 2. Fetch browser/device descriptors
      const ua = navigator.userAgent;
      let browser = 'Chrome';
      if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';

      let device = 'Mobile (Smartphone)';
      if (!ua.includes('Mobi')) device = 'Desktop Computer';

      const analyticId = `view_${Date.now()}_${Math.floor(Math.random() * 100)}`;
      const trackingPayload: AnalyticEvent = {
        id: analyticId,
        bioId: profileId,
        type: 'view',
        country: 'United Arab Emirates', // mock geo coordinates
        device,
        browser,
        referrer: document.referrer || 'Direct Link',
        timestamp: new Date().toISOString(),
        ownerId
      };
      await addDoc(collection(db, 'analytics'), trackingPayload);

    } catch (err) {
      console.error(err);
    }
  };

  const trackClick = async (blockId: string) => {
    if (demoBio) {
      if (handleCountMetric) handleCountMetric('click', blockId);
      return;
    }
    if (!bio) return;

    try {
      // Fetch browser descriptors
      const ua = navigator.userAgent;
      let browser = 'Chrome';
      if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';

      let device = 'Mobile (Smartphone)';
      if (!ua.includes('Mobi')) device = 'Desktop Computer';

      const analyticId = `click_${Date.now()}`;
      const trackingPayload: AnalyticEvent = {
        id: analyticId,
        bioId: bio.id,
        linkId: blockId,
        type: 'click',
        country: 'United Arab Emirates',
        device,
        browser,
        referrer: document.referrer || 'Direct Link',
        timestamp: new Date().toISOString(),
        ownerId: bio.ownerId
      };
      await addDoc(collection(db, 'analytics'), trackingPayload);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Anonymous Question Messages
  const handleSendAnonymousMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousText.trim() || !bio) return;
    setAnonLoading(true);

    try {
      const msgId = `msg_${Date.now()}`;
      const payload = {
        id: msgId,
        bioId: bio.id,
        ownerId: bio.ownerId, // receiver creator
        content: anonymousText.trim(),
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'messages'), payload).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `messages/${msgId}`)
      );

      setAnonSuccess(true);
      setAnonymousText('');
      setTimeout(() => setAnonSuccess(false), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setAnonLoading(false);
    }
  };

  // Submit Guestbook Greeting
  const handleSignGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestMsg.trim() || !bio) return;
    setGuestLoading(true);

    try {
      const entryId = `gb_${Date.now()}`;
      const payload: GuestbookEntry = {
        id: entryId,
        bioId: bio.id,
        name: guestName.trim(),
        message: guestMsg.trim(),
        approved: true, // Auto approve for instant demo pleasure
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'guestbook'), payload).catch((err) =>
        handleFirestoreError(err, OperationType.WRITE, `guestbook/${entryId}`)
      );

      setGuestSuccess(true);
      setGuestName('');
      setGuestMsg('');
      setGuestbookList((prev) => [payload, ...prev]);
      setTimeout(() => setGuestSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setGuestLoading(false);
    }
  };

  // Click increment emoji reaction
  const handleEmojiReact = async (em: string) => {
    if (demoBio) {
      setEmojiCounts((prev) => ({ ...prev, [em]: (prev[em] || 0) + 1 }));
      return;
    }
    if (!bio) return;

    // Fast local prediction UI increment
    setEmojiCounts((prev) => ({ ...prev, [em]: (prev[em] || 0) + 1 }));

    try {
      const bioRef = doc(db, 'bios', bio.id);
      await setDoc(bioRef, {
        emojiReactions: {
          [em]: increment(1)
        }
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12 text-zinc-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-purple-400" /> Connecting to Google Cloud...
      </div>
    );
  }

  if (error || !bio) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#04060A] text-center font-sans">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-400 font-black">
            !
          </div>
          <p className="font-bold text-white text-sm">Bio Offline</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">{error || 'Something went wrong.'}</p>
          <Link to="/" className="text-xs font-bold text-cyan-400 inline-block hover:underline">
            ← Registry free Bio
          </Link>
        </div>
      </div>
    );
  }

  const thConfig = getTheme(bio.themeId);

  return (
    <div 
      className={`min-h-screen py-10 px-4 flex flex-col items-center relative select-none w-full max-w-full overflow-hidden transition-all text-sm pb-16 ${bio.customBg ? '' : thConfig.bgClass} ${thConfig.fontFamily}`}
      style={bio.customBg ? { background: bio.customBg } : undefined}
    >
      
      {/* Dynamic Background subtle overlay to enhance depth */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none -z-10" />

      {/* Profile Card Container (Mobile viewport friendly) */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Story status bubble (Simulated preview) */}
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setShowStoryDetail(!showStoryDetail)}
            className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 cursor-pointer hover:scale-103 active:scale-97 transition-transform shadow-lg relative"
          >
            {bio.avatarUrl ? (
              <img 
                src={bio.avatarUrl} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full border-[3px] border-black bg-neutral-900"
              />
            ) : (
              <div className="w-full h-full rounded-full border-[3px] border-black bg-gradient-to-tr from-[#111827] to-[#1f2937] flex items-center justify-center text-white font-extrabold text-2xl">
                {bio.displayName[0].toUpperCase()}
              </div>
            )}
            
            {/* Pulsating live visual dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full animate-ping" />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full" />
          </button>

          {/* Collapsible Story Update View */}
          {showStoryDetail && (
            <div className="mt-4 p-4 rounded-3xl backdrop-blur-md bg-white/5 border border-white/10 text-center space-y-2.5 animate-fade-in text-xs text-white max-w-xs">
              <span className="bg-pink-500 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 mx-auto w-fit">
                <Clock className="w-3 h-3" /> Live Creator Story (24h)
              </span>
              <p className="font-semibold leading-relaxed">"Getting coffee before dj mixing session. Big drop announcement tomorrow in bio link!"</p>
              <button 
                onClick={() => setShowStoryDetail(false)}
                className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-wider block mx-auto cursor-pointer"
              >
                Close Bubble
              </button>
            </div>
          )}
        </div>

        {/* Profile Details Block */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center gap-1.5">
            <h2 className={`text-2xl font-black tracking-tight ${thConfig.textColor}`}>
              {bio.displayName}
            </h2>
            {(ownerUser?.verified || bio.verified) && (
              ownerUser?.verificationIcon ? (
                <img 
                  src={ownerUser.verificationIcon} 
                  alt="Verified Badge" 
                  className="w-5 h-5 object-contain shrink-0 animate-[pulse_2s_infinite]" 
                  title="SaaS Verified Creator"
                />
              ) : (
                <CheckCircle className="w-4 h-4 text-cyan-400 fill-cyan-400 shrink-0 animate-pulse" title="SaaS Verified Creator" />
              )
            )}
          </div>

          <div className="flex justify-center items-center gap-3.5 text-xs text-neutral-450 opacity-80">
            {bio.location && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-pink-400" /> {bio.location}
              </span>
            )}
            {bio.website && (
              <a 
                href={bio.website} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:underline font-mono text-[10px] text-cyan-300 flex items-center gap-1"
              >
                <LinkIcon className="w-3 h-3" /> Website
              </a>
            )}
          </div>

          {/* Quick Share Button */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => setShowShareDrawer(true)}
              className="cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-full text-xs font-bold text-purple-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Share Profile</span>
            </button>
          </div>

          <p className="text-center px-4 leading-relaxed font-normal opacity-90 text-[13px] text-zinc-200">
            {bio.description}
          </p>
        </div>

        {/* EMOJI REACTIONS BAR PANEL */}
        <AnimatePresence initial={false}>
          {bio.showStatsBar !== false && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex justify-center gap-3.5 py-3.5 px-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                {[
                  { em: '🔥', label: 'Spicy' },
                  { em: '💎', label: 'Rare' },
                  { em: '👑', label: 'Leader' },
                  { em: '💜', label: 'Love' }
                ].map((item) => (
                  <button
                    key={item.em}
                    onClick={() => handleEmojiReact(item.em)}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-92 border border-white/5 transition-transform text-white shadow-sm"
                    title={item.label}
                  >
                    <span className="text-base">{item.em}</span>
                    <span className="text-xs font-black font-mono">{emojiCounts[item.em] || 0}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 19 CONTENT BLOCKS RENDERER */}
        <div className="space-y-4">
          {bio.blocks?.filter(b => b.visible).map((block) => {
            const renderBlockContent = () => {
              // Link block design (1)
              if (block.type === 'link') {
                const detectedPlatform = block.platform || detectPlatform(block.url);
                const platformInfo = getPlatformInfo(detectedPlatform);
                const brandColor = platformInfo.color;
                const openNewTab = block.extraData?.openInNewTab !== false;

                return (
                  <a
                    key={block.id}
                    href={block.url || '#'}
                    target={openNewTab ? '_blank' : '_self'}
                    rel="noreferrer"
                    onClick={() => trackClick(block.id)}
                    className={`group w-full flex items-center justify-center transition-all duration-300 select-none hover:scale-[1.03] active:scale-[0.98] py-4.5 px-6 font-bold tracking-wide rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/10 hover:border-white/20 text-white ${thConfig.btnClass}`}
                    style={{
                      gap: '12px',
                      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.45), 0 0 6px ${brandColor}22`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 12px 28px rgba(0, 0, 0, 0.65), 0 0 16px ${brandColor}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 4px 12px rgba(0, 0, 0, 0.45), 0 0 6px ${brandColor}22`;
                    }}
                  >
                    <div className="flex items-center justify-center shrink-0 transition-all duration-300 transform group-hover:scale-115 group-hover:rotate-3">
                      {block.iconType === 'custom' && block.customIcon ? (
                        <div className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] overflow-hidden rounded-md shrink-0 flex items-center justify-center">
                          <img 
                            src={block.customIcon} 
                            alt="" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        React.createElement(platformInfo.icon, {
                          className: "w-[20px] h-[20px] md:w-[22px] md:h-[22px] shrink-0",
                          style: { 
                            color: brandColor,
                            filter: `drop-shadow(0 0 6px ${brandColor}aa)`
                          }
                        })
                      )}
                    </div>
                    <span className="truncate">{block.title}</span>
                  </a>
                );
              }

            // Heading design (2)
            if (block.type === 'heading') {
              return (
                <h3 key={block.id} className={`text-base font-extrabold tracking-tight pt-4 text-center ${thConfig.textColor}`}>
                  {block.title}
                </h3>
              );
            }

            // Text tag design (3)
            if (block.type === 'text') {
              return (
                <p key={block.id} className="text-xs text-center leading-relaxed text-zinc-300 px-4 opacity-80 italic">
                  {block.content || block.title}
                </p>
              );
            }

            // Divider design (4)
            if (block.type === 'divider') {
              return (
                <div key={block.id} className="h-[1px] bg-white/10 my-4" />
              );
            }

            // Music card player embed (5)
            if (block.type === 'music') {
              let cleanUrl = block.url || "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGsyNa7T";
              cleanUrl = cleanUrl.split('?')[0];
              if (!cleanUrl.includes('/embed/')) {
                cleanUrl = cleanUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
              }
              return (
                <div key={block.id} className="p-1 rounded-3xl bg-neutral-900/60 overflow-hidden shadow-lg border border-white/5">
                  <iframe 
                    src={`${cleanUrl}?utm_source=generator&theme=0`} 
                    width="100%" 
                    height="152" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    title={block.title}
                    className="rounded-2xl border-none block"
                  />
                </div>
              );
            }

            // Image Carousel (Slider) Block (5.5)
            if (block.type === 'slider') {
              const sliderImgs = block.images && block.images.length > 0 ? block.images : [
                'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80',
                'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80'
              ];
              const activeIdx = carouselIndex[block.id] || 0;
              const hasArrows = block.extraData?.showArrows !== false;
              const hasDots = block.extraData?.showDots !== false;

              const handlePrev = () => {
                setCarouselIndex(prev => {
                  const current = prev[block.id] || 0;
                  const newIdx = current === 0 ? sliderImgs.length - 1 : current - 1;
                  return { ...prev, [block.id]: newIdx };
                });
              };

              const handleNext = () => {
                setCarouselIndex(prev => {
                  const current = prev[block.id] || 0;
                  const newIdx = current === sliderImgs.length - 1 ? 0 : current + 1;
                  return { ...prev, [block.id]: newIdx };
                });
              };

              return (
                <div key={block.id} className="space-y-1.5">
                  {block.title && (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">{block.title}</p>
                  )}
                  <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-zinc-950/45 group aspect-video">
                    {/* Slide Image */}
                    <img 
                      src={sliderImgs[activeIdx]} 
                      alt={`Slide ${activeIdx + 1}`} 
                      className="w-full h-full object-cover transition-all duration-500 cursor-zoom-in" 
                      referrerPolicy="no-referrer"
                      onClick={() => {
                        trackClick(block.id);
                        setLightboxImg(sliderImgs[activeIdx]);
                      }}
                    />

                    {/* Navigation Arrows */}
                    {hasArrows && sliderImgs.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-90"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleNext(); }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-transform active:scale-90"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Navigation Dots */}
                    {hasDots && sliderImgs.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-sm z-10">
                        {sliderImgs.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCarouselIndex(prev => ({ ...prev, [block.id]: i })); }}
                            className={`w-2 h-2 rounded-full transition-all ${activeIdx === i ? 'bg-purple-400 scale-110' : 'bg-white/40 hover:bg-white/60'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Video Player Block (5.6)
            if (block.type === 'video') {
              const urlStr = block.url || '';
              const isDirectMp4 = urlStr.endsWith('.mp4') || urlStr.startsWith('data:video/mp4');
              
              let embedUrl = '';
              if (!isDirectMp4) {
                if (urlStr.includes('youtube.com/watch') || urlStr.includes('youtube.com/v/')) {
                  const match = urlStr.match(/[?&]v=([^&#]*)/);
                  const id = match ? match[1] : '';
                  embedUrl = `https://www.youtube.com/embed/${id}`;
                } else if (urlStr.includes('youtu.be/')) {
                  const id = urlStr.split('youtu.be/').pop()?.split('?')[0] || '';
                  embedUrl = `https://www.youtube.com/embed/${id}`;
                } else if (urlStr.includes('vimeo.com/')) {
                  const id = urlStr.split('vimeo.com/').pop()?.split('?')[0] || '';
                  embedUrl = `https://player.vimeo.com/video/${id}`;
                } else {
                  embedUrl = urlStr;
                }
              }

              return (
                <div key={block.id} className="space-y-1.5">
                  {block.title && (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">{block.title}</p>
                  )}
                  <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-950 shadow-md aspect-video">
                    {isDirectMp4 ? (
                      <video 
                        src={urlStr} 
                        controls 
                        className="w-full h-full object-cover" 
                        onPlay={() => trackClick(block.id)}
                      />
                    ) : (
                      <iframe 
                        src={embedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                        width="100%" 
                        height="100%" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        loading="lazy"
                        title={block.title}
                        className="w-full h-full border-none"
                      />
                    )}
                  </div>
                </div>
              );
            }

            // Map Embed block (5.7)
            if (block.type === 'map') {
              const mapType = block.extraData?.type || 'search';
              const zoom = block.extraData?.zoom || 13;
              let embedUrl = '';

              if (mapType === 'coordinates' && block.extraData?.latitude && block.extraData?.longitude) {
                embedUrl = `https://maps.google.com/maps?q=${block.extraData.latitude},${block.extraData.longitude}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
              } else if (mapType === 'url' && block.url) {
                embedUrl = block.url;
                if (!embedUrl.includes('output=embed')) {
                  embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedUrl)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
                }
              } else {
                const search = block.extraData?.searchQuery || block.url || 'New York';
                embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(search)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
              }

              return (
                <div key={block.id} className="space-y-1.5">
                  {block.title && (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">{block.title}</p>
                  )}
                  <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-950 aspect-video shadow-md">
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      allowFullScreen
                      title={block.title || "Map Location"}
                      className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              );
            }

            // PDF Download block (5.8)
            if (block.type === 'pdf') {
              const fileName = block.extraData?.fileName || 'Portfolio.pdf';
              const fileSize = block.extraData?.fileSize || '1.8 MB';
              const btnVal = block.extraData?.btnLabel || 'Download PDF';
              return (
                <div key={block.id} className="p-4.5 rounded-3xl bg-[#090d16] border border-white/5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-tight">{block.title || 'PDF Document'}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[150px]">{fileName} • {fileSize}</p>
                    </div>
                  </div>
                  <a
                    href={block.url || '#'}
                    download={fileName}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackClick(block.id)}
                    className="cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-black py-2 px-3.5 rounded-xl text-[10px] uppercase font-black tracking-wide flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> {btnVal}
                  </a>
                </div>
              );
            }

            // Social Feed Highlights block (5.9)
            if (block.type === 'social_feed') {
              const feedType = block.extraData?.feedType || 'youtube';
              let embedUrl = block.url || '';
              
              if (feedType === 'youtube') {
                return (
                  <div key={block.id} className="p-4 rounded-3xl bg-[#090d16] border border-white/5 space-y-3 shadow-md">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Channel Feed
                    </p>
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center shrink-0">
                        <Youtube className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{block.title || 'Official Channel'}</p>
                        <p className="text-[10px] text-zinc-500 italic truncate">{block.url || 'Subscribe for new drops'}</p>
                      </div>
                      <a
                        href={block.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackClick(block.id)}
                        className="bg-red-600 hover:bg-red-500 text-white rounded-xl py-1.5 px-3 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Subscribe
                      </a>
                    </div>
                  </div>
                );
              }

              if (feedType === 'tiktok') {
                return (
                  <div key={block.id} className="p-4 rounded-3xl bg-[#090d16]/80 border border-white/5 space-y-2.5 shadow-md">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> TikTok Highlight
                    </p>
                    <a 
                      href={block.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackClick(block.id)}
                      className="block p-3 rounded-2xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm">🎵</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{block.title || 'Watch on TikTok'}</p>
                          <p className="text-[9px] text-cyan-400 truncate mt-0.5">@tiktok_creator</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    </a>
                  </div>
                );
              }

              // Instagram custom card highlight feed mockup representation
              return (
                <div key={block.id} className="p-4 rounded-3xl bg-[#090d16] border border-white/5 space-y-3.5 shadow-md">
                  <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                    <span className="text-pink-500">📸</span> {block.title || 'Instagram highlights'}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'
                    ].map((mUrl, mIdx) => (
                      <div key={mIdx} className="aspect-square rounded-xl overflow-hidden relative group">
                        <img src={mUrl} alt="IG Highlight" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <a 
                    href={block.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackClick(block.id)}
                    className="w-full block text-center py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-2xl text-[10px] font-black uppercase text-pink-300 tracking-wider"
                  >
                    View Official Feed Profile
                  </a>
                </div>
              );
            }

            // Newsletter Subscription Feed block (5.95)
            if (block.type === 'newsletter') {
              const cap = block.extraData?.caption || 'Zero spam, unsubscribe anytime.';
              const btn = block.extraData?.btnLabel || 'Subscribe';
              const hold = block.extraData?.placeholder || 'Insert main email...';
              const isSubscribed = newsletterStatus[block.id] === 'success';
              const isLoading = newsletterStatus[block.id] === 'loading';

              return (
                <div key={block.id} className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-3.5 shadow-md">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-cyan-400" /> {block.title || 'Join the Newsletter'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{cap}</p>
                  </div>

                  {isSubscribed ? (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center text-xs font-bold rounded-xl">
                      Welcome to the crew! 🎉
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={newsletterEmail[block.id] || ''}
                        onChange={(e) => setNewsletterEmail(prev => ({ ...prev, [block.id]: e.target.value }))}
                        placeholder={hold}
                        className="flex-1 bg-[#141d2f]/50 border border-white/5 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          if (!newsletterEmail[block.id]) return;
                          setNewsletterStatus(prev => ({ ...prev, [block.id]: 'loading' }));
                          setTimeout(() => {
                            setNewsletterStatus(prev => ({ ...prev, [block.id]: 'success' }));
                            trackClick(block.id);
                          }, 1200);
                        }}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl py-2 px-4 text-xs font-bold uppercase transition-colors shrink-0 flex items-center justify-center min-w-[70px]"
                      >
                        {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : btn}
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Creator Donation/Support Support widget (5.97)
            if (block.type === 'donation') {
              const accentColor = block.extraData?.btnColor || '#db2777';
              const pType = block.extraData?.platform || 'paypal';
              const isPaid = supportPaid[block.id] === true;

              return (
                <div key={block.id} className="p-5 rounded-3xl bg-[#090d16] border border-white/5 text-center space-y-3.5 shadow-md">
                  <p className="text-xs font-extrabold text-white uppercase tracking-wider">{block.title || 'Support my creations'}</p>
                  
                  {isPaid ? (
                    <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold rounded-xl animate-bounce">
                      Shoutout! Thank you so much for the support! 💖
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex justify-center gap-2">
                        {[5, 10, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              trackClick(block.id);
                              setSupportPaid(prev => ({ ...prev, [block.id]: true }));
                              if (block.url) {
                                setTimeout(() => {
                                  window.open(block.url, '_blank');
                                }, 500);
                              }
                            }}
                            className="bg-white/5 hover:bg-white/10 text-white font-black text-xs py-1.5 px-3.5 rounded-xl border border-white/5 transition-transform"
                          >
                            ${num}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          trackClick(block.id);
                          setSupportPaid(prev => ({ ...prev, [block.id]: true }));
                          if (block.url) {
                            setTimeout(() => {
                              window.open(block.url, '_blank');
                            }, 500);
                          }
                        }}
                        className="w-full py-3 rounded-xl font-bold uppercase text-xs text-white tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                        style={{ backgroundColor: accentColor }}
                      >
                        <span>💝 Support Creator with {pType.toUpperCase()}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Countdown timer block (6)
            if (block.type === 'countdown') {
              const target = block.extraData?.dateTime ? new Date(block.extraData.dateTime).getTime() : Date.now();
              return (
                <div key={block.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md text-center animate-pulse">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pink-400" /> {block.title}
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-2.5 max-w-xs mx-auto text-white">
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-base font-black">12</p>
                      <p className="text-[8px] uppercase font-bold text-zinc-500">Days</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-base font-black">20</p>
                      <p className="text-[8px] uppercase font-bold text-zinc-500">Hours</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl">
                      <p className="text-base font-black">45</p>
                      <p className="text-[8px] uppercase font-bold text-zinc-500">Mins</p>
                    </div>
                  </div>
                </div>
              );
            }

            // Product catalogue widget card (7)
            if (block.type === 'product') {
              const price = block.extraData?.price || '29.00';
              const cur = block.extraData?.currency || 'USD';
              const imgUrl = block.extraData?.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80';
              return (
                <div key={block.id} className="p-4 rounded-3xl bg-[#090d16] border border-white/5 flex gap-4 shadow-md items-center">
                  <img 
                    src={imgUrl} 
                    alt="Logo" 
                    className="w-16 h-16 object-cover rounded-2xl shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{block.title}</p>
                    <p className="text-[11px] text-pink-400 font-extrabold mt-0.5">{cur} {price}</p>
                    <a 
                      href={block.extraData?.buyUrl || '#'} 
                      onClick={() => trackClick(block.id)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-black uppercase text-cyan-400 underline tracking-wide mt-2 block"
                    >
                      <ShoppingCart className="w-3 h-3" /> Checkout Now
                    </a>
                  </div>
                </div>
              );
            }

            // Testimonial designer statement quote (8)
            if (block.type === 'testimonial') {
              const quote = block.extraData?.quote || 'Amazing beat creations. Totally recommend!';
              const author = block.extraData?.author || 'Alex Croft';
              const tag = block.extraData?.tag || '@alexcroft';
              return (
                <div key={block.id} className="p-5 rounded-3xl bg-neutral-900/40 border border-white/5 italic space-y-3.5 shadow-md">
                  <p className="text-xs leading-relaxed text-zinc-300">"{quote}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                      {author[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-[10px] leading-none">{author}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{tag}</p>
                    </div>
                  </div>
                </div>
              );
            }

            // Question Box (Anonymous Inbox form) (9)
            if (block.type === 'contact') {
              return (
                <div key={block.id} className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-4 shadow-md">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{block.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Send private confessions or feedback. Kept 100% private to bio owners.</p>
                  </div>

                  {anonSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center text-xs font-bold animate-fade-in">
                      Confession Sent Successfully! 🤫
                    </div>
                  ) : (
                    <form onSubmit={handleSendAnonymousMsg} className="space-y-2.5">
                      <textarea
                        required
                        rows={2}
                        value={anonymousText}
                        onChange={(e) => setAnonymousText(e.target.value)}
                        placeholder="Type anything anonymously..."
                        className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-3 text-xs focus:border-purple-500 focus:outline-none focus:border-purple-500 text-white"
                      />
                      <button
                        type="submit"
                        disabled={anonLoading}
                        className="cursor-pointer w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        {anonLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <>Confess Privately <Send className="w-3.5 h-3.5" /></>}
                      </button>
                    </form>
                  )}
                </div>
              );
            }

            // Collapsible FAQs block (10)
            if (block.type === 'faq') {
              const items = block.extraData?.items || [{ q: 'Support bookings?', a: 'Slide into anonymous box.' }];
              return (
                <div key={block.id} className="space-y-2.5">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">{block.title}</p>
                  {items.map((item: any, id: number) => {
                    const key = `${block.id}_${id}`;
                    const isExp = expandedFaq === key;
                    return (
                      <div key={id} className="rounded-2xl bg-[#090d16] border border-white/5 overflow-hidden shadow-sm">
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExp ? null : key)}
                          className="w-full flex justify-between items-center p-4 text-left text-xs font-bold text-white"
                        >
                          <span>{item.q}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-purple-400 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                        </button>
                        {isExp && (
                          <p className="p-4 border-t border-white/5 text-[11px] text-zinc-400 leading-relaxed bg-black/10">
                            {item.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Image Gallery Portfolio Grid/Masonry block (11)
            if (block.type === 'gallery') {
              const galleryImages = block.images && block.images.length > 0 ? block.images : [
                'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=300&q=80',
                'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&q=80'
              ];
              const layout = block.extraData?.layout || 'grid';
              const cols = block.extraData?.columns || 2;
              const spacing = block.extraData?.spacing || 'md';

              const colClass = 
                cols === 1 ? 'grid-cols-1' :
                cols === 3 ? 'grid-cols-3' :
                cols === 4 ? 'grid-cols-4' :
                cols === 5 ? 'grid-cols-5' : 'grid-cols-2';

              const gapClass = 
                spacing === 'none' ? 'gap-0' :
                spacing === 'sm' ? 'gap-1' :
                spacing === 'lg' ? 'gap-3.5' : 'gap-2';

              return (
                <div key={block.id} className="space-y-2">
                  {block.title && (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2">{block.title}</p>
                  )}

                  {layout === 'masonry' ? (
                    <div 
                      className={`columns-${cols} ${gapClass} space-y-2`}
                      style={{ columnGap: spacing === 'none' ? '0px' : spacing === 'sm' ? '4px' : spacing === 'lg' ? '14px' : '8px' }}
                    >
                      {galleryImages.map((img, id) => (
                        <div 
                          key={id} 
                          className="break-inside-avoid relative rounded-2xl overflow-hidden border border-white/5 cursor-zoom-in hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm"
                          onClick={() => {
                            trackClick(block.id);
                            setLightboxImg(img);
                          }}
                        >
                          <img src={img} alt="Gallery Portfolio element" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`grid ${colClass} ${gapClass}`}>
                      {galleryImages.map((img, id) => (
                        <div 
                          key={id} 
                          className="aspect-square relative rounded-2xl overflow-hidden border border-white/5 cursor-zoom-in hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm"
                          onClick={() => {
                            trackClick(block.id);
                            setLightboxImg(img);
                          }}
                        >
                          <img src={img} alt="Gallery Grid element" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Divider design (4 - Custom spacing & line style)
            if (block.type === 'divider') {
              const lineStyle = block.extraData?.lineStyle || 'solid';
              const spacing = block.extraData?.spacing || 'md';

              const marginClass = 
                spacing === 'sm' ? 'my-3' :
                spacing === 'lg' ? 'my-8' : 'my-5';

              const borderStyle = 
                lineStyle === 'dashed' ? 'border-dashed' :
                lineStyle === 'dotted' ? 'border-dotted' : 'border-solid';

              return (
                <div 
                  key={block.id} 
                  className={`border-t border-white/10 ${marginClass} ${borderStyle}`} 
                  style={{ borderWidth: lineStyle === 'dotted' ? '2px' : '1px' }}
                />
              );
            }

            // Custom raw HTML Block render (12)
            if (block.type === 'html') {
              return (
                <div 
                  key={block.id} 
                  className="p-4 rounded-3xl bg-white/[0.01] border border-white/5 overflow-hidden shadow-sm"
                  dangerouslySetInnerHTML={{ __html: block.content || block.title }}
                />
              );
            }

            return null;
          };

          const rawContent = renderBlockContent();
          if (!rawContent) return null;

          return (
            <BlockAnimationWrapper key={block.id + '-' + (block.animation || 'none')} block={block}>
              {rawContent}
            </BlockAnimationWrapper>
          );
        })}
      </div>

        {/* DEMO PROFILE: ACTIVE VISITOR GUESTBOOK GREETER */}
        <AnimatePresence initial={false}>
          {(bio.id === 'demo_page' || username) && bio.showGuestbook !== false && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-4">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" /> Bio Guestbook (Signatures)
                  </p>
                  <p className="text-[10px] text-zinc-550 mt-0.5">Leave a profile shoutout or greet viewers! Approved in real-time.</p>
                </div>

                {guestSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center text-xs font-bold rounded-xl">
                    Guestbook Signed! 🎉
                  </div>
                ) : (
                  <form onSubmit={handleSignGuestbook} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        required
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your Name / Handle"
                        className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500 text-white"
                      />
                      <input
                        required
                        type="text"
                        value={guestMsg}
                        onChange={(e) => setGuestMsg(e.target.value)}
                        placeholder="Nice Greetings..."
                        className="w-full bg-white/[0.01] border border-white/5 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500 text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={guestLoading}
                      className="cursor-pointer w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 font-bold text-xs"
                    >
                      {guestLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Leave Shoutout'}
                    </button>
                  </form>
                )}

                {/* Guestbook Greetings Feed */}
                <div className="space-y-2 pt-2 border-t border-white/5 max-h-40 overflow-y-auto">
                  {guestbookList.length === 0 ? (
                    <div className="text-center p-4 text-[10px] text-zinc-500 italic font-mono">
                      Guestbook is clean and fresh. Leave the very first shoutout!
                    </div>
                  ) : (
                    guestbookList.map((g) => (
                      <div key={g.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] space-y-0.5">
                        <p className="font-bold text-white leading-none">{g.name}</p>
                        <p className="text-zinc-300 italic">"{g.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Credit */}
        <div className="text-center text-[10px] tracking-wide text-zinc-500 opacity-80 pt-10">
          <Link to="/" className="font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase font-mono">
            Powered by GEN-Z BIO
          </Link>
          <p className="mt-1">Design unlimited profiles free.</p>
        </div>

        {/* Lightbox Modal Overlay */}
        <AnimatePresence>
          {lightboxImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
            >
              <motion.img
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                src={lightboxImg}
                alt="Lightbox Full Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button 
                type="button" 
                onClick={() => setLightboxImg(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-transform active:scale-95"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sleek Instagram / TikTok Social Share Drawer Modal */}
        <AnimatePresence>
          {showShareDrawer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
            >
              {/* Tap backdrop to close */}
              <div className="absolute inset-0" onClick={() => setShowShareDrawer(false)} />

              <motion.div
                initial={{ y: '100%', scale: 1 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 180 }}
                className="relative w-full sm:max-w-md bg-[#090d16] border-t sm:border border-white/[0.08] p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl space-y-5 overflow-y-auto max-h-[90vh] text-left z-10"
              >
                {/* Header detail */}
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" /> Share to Stories
                    </h3>
                    <p className="text-[10px] text-zinc-400">Promote your custom Bio on social apps in 5s</p>
                  </div>
                  <button
                    onClick={() => setShowShareDrawer(false)}
                    className="p-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs font-bold text-zinc-400"
                  >
                    ✕
                  </button>
                </div>

                {/* VISUAL MINI WALLPAPER PREVIEW CARD */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#0f111a] to-[#06080e] p-4 border border-white/5 overflow-hidden text-center space-y-3.5">
                  {/* Decorative glowing blobs */}
                  <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-purple-500/20 blur-xl pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-cyan-500/20 blur-xl pointer-events-none" />
                  
                  <span className="relative z-10 mx-auto text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block">
                    Live Wallpaper design (1080x1920)
                  </span>

                  {/* Tiny mockup avatar */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    {bio.avatarUrl ? (
                      <img
                        src={bio.avatarUrl}
                        alt="Mini Avatar"
                        className="w-12 h-12 rounded-full border border-purple-500/40 object-cover bg-neutral-900"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {(bio.displayName || 'G').slice(0, 1)}
                      </div>
                    )}
                    <h4 className="text-xs font-black text-white">{bio.displayName}</h4>
                    <p className="text-[9px] text-purple-300 font-mono">@{bio.username}</p>
                  </div>

                  {/* Mini QR design */}
                  <div className="relative z-10 w-20 h-20 bg-white/5 border border-white/10 rounded-xl mx-auto flex items-center justify-center p-1.5">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/#/' + bio.username)}&color=ffffff&bgcolor=0a0f1e&qzone=1`}
                      alt="Mini QR"
                      className="w-full h-full object-contain filter max-w-full"
                    />
                  </div>
                  <span className="relative z-10 text-[8px] font-mono text-zinc-500 uppercase block tracking-wider">
                    Scan card to view links
                  </span>

                  {/* Trigger Background Download Poster */}
                  <button
                    onClick={generateAndDownloadStoryPoster}
                    disabled={generatingPoster}
                    className="relative z-10 cursor-pointer w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-103 active:scale-97 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {generatingPoster ? 'Generating Asset...' : 'Download Story Wallpaper'}
                  </button>
                </div>

                {/* SOCIAL CHANNEL TAB BAR */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
                  <button
                    onClick={() => setActiveShareChannel('instagram')}
                    className={`cursor-pointer py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeShareChannel === 'instagram'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram Story</span>
                  </button>
                  <button
                    onClick={() => setActiveShareChannel('tiktok')}
                    className={`cursor-pointer py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      activeShareChannel === 'tiktok'
                        ? 'bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-[#25F4EE]'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* SVG inline Custom sleek TikTok logo */}
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2a1 1 0 0 0-1 1v11.5a2.5 2.5 0 1 1-3-2.45v2.54A4.5 4.5 0 1 0 13 18V9.05A9.01 9.01 0 0 0 19 12a1 1 0 0 0 2 0 7 7 0 0 0-7-7H13V3a1 1 0 0 0-1-1z" />
                    </svg>
                    <span>TikTok Bio</span>
                  </button>
                </div>

                {/* ACTIVE CHANNEL DETAILS PANEL */}
                {activeShareChannel === 'instagram' ? (
                  <div className="space-y-4 animate-fade-in text-xs">
                    {/* Actions Row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Copy Link */}
                      <button
                        onClick={() => {
                          const canonicalUrl = window.location.origin + '/#/' + bio.username;
                          navigator.clipboard.writeText(canonicalUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2500);
                        }}
                        className="cursor-pointer py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-purple-400" />
                            <span>Copy Bio URL</span>
                          </>
                        )}
                      </button>

                      {/* Open App */}
                      <button
                        onClick={() => {
                          window.open('instagram-stories://share', '_blank');
                          setTimeout(() => {
                            window.open('https://instagram.com', '_blank');
                          }, 500);
                        }}
                        className="cursor-pointer py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Launch App</span>
                      </button>
                    </div>

                    {/* Step by step info */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2.5 text-[11px] text-zinc-300">
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center shrink-0">1</span>
                        <p>Download the high-quality vertical <strong>Story Wallpaper</strong> above.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center shrink-0">2</span>
                        <p>Press the <strong>Copy Bio URL</strong> button to copy your custom profile link.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-extrabold flex items-center justify-center shrink-0">3</span>
                        <p>Open Instagram Stories, select your downloaded wallpaper, select <strong>Link Sticker</strong>, paste URL and share!</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in text-xs">
                    {/* Actions Row */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Copy Link */}
                      <button
                        onClick={() => {
                          const canonicalUrl = window.location.origin + '/#/' + bio.username;
                          navigator.clipboard.writeText(canonicalUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2500);
                        }}
                        className="cursor-pointer py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#25F4EE]" />
                            <span>Copy Bio URL</span>
                          </>
                        )}
                      </button>

                      {/* Open App */}
                      <button
                        onClick={() => {
                          window.open('snssdk1128://', '_blank');
                          setTimeout(() => {
                            window.open('https://tiktok.com', '_blank');
                          }, 500);
                        }}
                        className="cursor-pointer py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition-all border border-white/5 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        <span>Launch TikTok</span>
                      </button>
                    </div>

                    {/* Step by step info */}
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2.5 text-[11px] text-zinc-300">
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] font-extrabold flex items-center justify-center shrink-0">1</span>
                        <p>Copy your custom profile link to clipboards via <strong>Copy Bio URL</strong>.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] font-extrabold flex items-center justify-center shrink-0">2</span>
                        <p>Open TikTok, tap <strong>Edit Profile</strong> on your account page.</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="w-5 h-5 rounded-full bg-[#25F4EE]/20 text-[#25F4EE] font-extrabold flex items-center justify-center shrink-0">3</span>
                        <p>Paste your Gen-Z link into the <strong>Website</strong> bio input field so your visitors can access your blocks with 1-click!</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
