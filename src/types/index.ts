export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  username: string; // The primary/default username
  role: UserRole;
  roles: UserRole[];
  verified: boolean;
  verificationBadgeId: string;
  verificationIcon: string;
  verifiedBy: string;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  banned?: boolean;
}

export interface CustomThemeSettings {
  backgroundType: 'gradient' | 'solid' | 'image' | 'space';
  backgroundValue: string; // gradient formula, hex color, or image url
  cardBg: string; // rgba glass color
  cardBorder: string; // rgba border color
  textColor: string;
  accentColor: string; // neon glow color
  buttonStyle: 'glass' | 'neon' | 'glow' | 'solid' | 'retro';
  fontFamily: string; // Orbitron, Inter, etc.
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  threads?: string;
  whatsapp?: string;
  telegram?: string;
  discord?: string;
  linkedin?: string;
  github?: string;
  behance?: string;
  dribbble?: string;
  twitch?: string;
  spotify?: string;
  appleMusic?: string;
  pinterest?: string;
  snapchat?: string;
  website?: string;
  email?: string;
  phone?: string;
}

export interface ContentBlock {
  id: string;
  type:
    | 'text'
    | 'heading'
    | 'button'
    | 'gallery'
    | 'video'
    | 'music'
    | 'divider'
    | 'faq'
    | 'newsletter'
    | 'donation'
    | 'product'
    | 'countdown'
    | 'pdf'
    | 'contact'
    | 'html';
  order: number;
  data: any; // Block specific fields (e.g. videoUrl, buttonText, countdownDate, etc.)
  clicks?: number; // Click counter for button, products, etc.
}

export interface BioDoc {
  id: string; // Used as path: /[username]
  ownerId: string; // UserDoc.uid
  displayName: string;
  bioDescription: string;
  photoURL: string;
  coverURL: string;
  website: string;
  socialLinks: SocialLinks;
  musicUrl?: string; // profile music
  guestbookEnabled: boolean;
  messagesEnabled: boolean;
  viewsCount: number;
  themeId: string; // 'purple-galaxy', etc.
  customTheme?: CustomThemeSettings;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageDoc {
  id: string;
  bioId: string;
  messageText: string;
  createdAt: string;
  read: boolean;
}

export interface GuestbookDoc {
  id: string;
  bioId: string;
  signerName: string;
  messageText: string;
  createdAt: string;
}

export interface VerificationBadge {
  id: string;
  badgeName: string;
  iconURL: string; // PNG/SVG/ICO/WEBP base64 or storage link
  createdAt: string;
}

export interface VerificationLog {
  id: string;
  adminId: string;
  adminEmail: string;
  targetUserId: string;
  targetUsername: string;
  action: 'verify' | 'unverify' | 'assign_badge' | 'promote_role' | 'ban_user' | 'unban_user';
  badgeId?: string;
  details?: string;
  timestamp: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  category: 'Galaxy' | 'Atmosphere' | 'Cyber' | 'Glass' | 'Monochrome' | 'Custom';
  settings: CustomThemeSettings;
}
export interface SiteSettings {
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  defaultBadgeId: string;
}
