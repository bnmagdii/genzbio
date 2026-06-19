export type BlockType =
  | 'link'
  | 'text'
  | 'heading'
  | 'divider'
  | 'gallery'
  | 'video'
  | 'music'
  | 'contact'
  | 'faq'
  | 'countdown'
  | 'product'
  | 'testimonial'
  | 'donation'
  | 'pdf'
  | 'slider'
  | 'map'
  | 'social_feed'
  | 'newsletter'
  | 'html';

export interface BioBlock {
  id: string;
  type: BlockType;
  title: string;
  content?: string;
  url?: string;
  image?: string;
  images?: string[];
  platform?: string;
  color?: string;
  icon?: string;
  iconType?: string;
  customIcon?: string;
  visible: boolean;
  scheduledStart?: string;
  scheduledEnd?: string;
  animation?: string;
  extraData?: any; // For FAQs, Countdown target, Product price, etc.
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  textColor: string;
  btnClass: string;
  fontFamily: string;
  accentColor: string;
  creator?: string;
  tags?: string[];
}

export interface BioPageConfig {
  id: string;
  ownerId: string;
  username: string; // url slug
  displayName: string;
  description: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  verified: boolean;
  profileMusic?: string; // Spotify/YT link
  themeId: string;
  customBg?: string; // custom gradient/image
  published: boolean;
  archived: boolean;
  visitorCount: number;
  emojiReactions?: { [emoji: string]: number };
  seoTitle?: string;
  seoDescription?: string;
  seoShareImage?: string;
  seoKeywords?: string;
  showStatsBar?: boolean;
  showGuestbook?: boolean;
  blocks: BioBlock[];
  createdAt: string;
  updatedAt: string | any;
  profileImage?: string;
  coverImage?: string;
  galleryImages?: string[];
  carouselImages?: string[];
}

export interface UserProfile {
  uid?: string;
  userId?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  coverUrl?: string;
  createdAt: string;
  verified?: boolean;
  verificationBadgeId?: string;
  verificationIcon?: string;
  role?: 'user' | 'moderator' | 'admin' | 'super_admin';
  roles?: string[];
  banned?: boolean;
}

export interface VerificationBadge {
  id: string;
  name: string;
  iconUrl: string;
  createdAt: string;
  createdBy: string;
}

export interface GuestbookEntry {
  id: string;
  bioId: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
  userId?: string;
}

export interface AnonymousMessage {
  id: string;
  bioId: string;
  ownerId: string; // receiver
  content: string;
  createdAt: string;
}

export interface CreatorStory {
  id: string;
  bioId: string;
  ownerId: string;
  mediaUrl: string;
  text?: string;
  createdAt: string;
  expiresAt: string;
}

export interface AnalyticEvent {
  id: string;
  bioId: string;
  linkId?: string; // block ID or link ID
  type: 'view' | 'click' | 'reaction' | 'anonymous_message' | 'guestbook_sign';
  country: string;
  device: string;
  browser: string;
  referrer: string;
  timestamp: string;
  ownerId: string; // so the dashboard owner can easily scan theirs
}

export interface UserSettings {
  language: 'en' | 'ar';
  rtl: boolean;
}

export interface AIGeneratedBio {
  id: string;
  userId: string;
  shortBio: string;
  mediumBio: string;
  longBio: string;
  emojiVersion: string;
  seoVersion: string;
  tone: string;
  createdAt: string;
  favorite?: boolean;
}

export interface AIGeneratedImage {
  id: string;
  userId: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  favorite?: boolean;
  gender?: string;
  style?: string;
  background?: string;
  colors?: string;
  accessories?: string;
}

export interface AIGeneratedPalette {
  id: string;
  userId: string;
  name: string;
  colors: string[];
  primary: string;
  description: string;
  createdAt: string;
  favorite?: boolean;
}

export interface AIGeneratedUsername {
  id: string;
  userId: string;
  usernames: string[];
  createdAt: string;
  favorite?: boolean;
}
