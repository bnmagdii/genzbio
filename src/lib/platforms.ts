import React from 'react';
import { 
  FaInstagram, 
  FaFacebook, 
  FaTiktok, 
  FaYoutube, 
  FaXTwitter, 
  FaLinkedin, 
  FaGithub, 
  FaDiscord, 
  FaTelegram, 
  FaWhatsapp, 
  FaSpotify, 
  FaPinterest, 
  FaSnapchat, 
  FaThreads, 
  FaBehance, 
  FaDribbble, 
  FaTwitch, 
  FaReddit,
  FaMedium,
  FaKickstarter,
  FaSteam,
  FaGlobe 
} from 'react-icons/fa6';

export function detectPlatform(url: string | undefined): string {
  if (!url) return 'website';
  const lowercaseUrl = url.toLowerCase().trim();
  
  if (lowercaseUrl.includes('instagram.com')) return 'instagram';
  if (lowercaseUrl.includes('facebook.com')) return 'facebook';
  if (lowercaseUrl.includes('wa.me') || lowercaseUrl.includes('whatsapp.com')) return 'whatsapp';
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return 'youtube';
  if (lowercaseUrl.includes('tiktok.com')) return 'tiktok';
  if (lowercaseUrl.includes('x.com') || lowercaseUrl.includes('twitter.com')) return 'x';
  if (lowercaseUrl.includes('threads.net')) return 'threads';
  if (lowercaseUrl.includes('linkedin.com')) return 'linkedin';
  if (lowercaseUrl.includes('github.com')) return 'github';
  if (lowercaseUrl.includes('discord.gg') || lowercaseUrl.includes('discord.com')) return 'discord';
  if (lowercaseUrl.includes('t.me') || lowercaseUrl.includes('telegram.me')) return 'telegram';
  if (lowercaseUrl.includes('spotify.com')) return 'spotify';
  if (lowercaseUrl.includes('pinterest.com')) return 'pinterest';
  if (lowercaseUrl.includes('snapchat.com')) return 'snapchat';
  if (lowercaseUrl.includes('twitch.tv')) return 'twitch';
  if (lowercaseUrl.includes('behance.net')) return 'behance';
  if (lowercaseUrl.includes('dribbble.com')) return 'dribbble';
  if (lowercaseUrl.includes('reddit.com')) return 'reddit';
  if (lowercaseUrl.includes('medium.com')) return 'medium';
  if (lowercaseUrl.includes('kick.com')) return 'kick';
  if (lowercaseUrl.includes('steamcommunity.com')) return 'steam';
  
  return 'website';
}

export interface PlatformInfo {
  label: string;
  color: string;
  icon: React.ComponentType<any>;
  iconName: string;
}

export const PLATFORM_MAP: Record<string, PlatformInfo> = {
  instagram: { label: 'Instagram', color: '#E1306C', icon: FaInstagram, iconName: 'FaInstagram' },
  facebook: { label: 'Facebook', color: '#1877F2', icon: FaFacebook, iconName: 'FaFacebook' },
  whatsapp: { label: 'WhatsApp', color: '#25D366', icon: FaWhatsapp, iconName: 'FaWhatsapp' },
  youtube: { label: 'YouTube', color: '#FF0000', icon: FaYoutube, iconName: 'FaYoutube' },
  tiktok: { label: 'TikTok', color: '#25F4EE', icon: FaTiktok, iconName: 'FaTiktok' },
  x: { label: 'X (Twitter)', color: '#FFFFFF', icon: FaXTwitter, iconName: 'FaXTwitter' },
  threads: { label: 'Threads', color: '#FFFFFF', icon: FaThreads, iconName: 'FaThreads' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', icon: FaLinkedin, iconName: 'FaLinkedin' },
  github: { label: 'GitHub', color: '#FFFFFF', icon: FaGithub, iconName: 'FaGithub' },
  discord: { label: 'Discord', color: '#5865F2', icon: FaDiscord, iconName: 'FaDiscord' },
  telegram: { label: 'Telegram', color: '#229ED9', icon: FaTelegram, iconName: 'FaTelegram' },
  spotify: { label: 'Spotify', color: '#1DB954', icon: FaSpotify, iconName: 'FaSpotify' },
  pinterest: { label: 'Pinterest', color: '#E60023', icon: FaPinterest, iconName: 'FaPinterest' },
  snapchat: { label: 'Snapchat', color: '#FFFC00', icon: FaSnapchat, iconName: 'FaSnapchat' },
  twitch: { label: 'Twitch', color: '#9146FF', icon: FaTwitch, iconName: 'FaTwitch' },
  behance: { label: 'Behance', color: '#1769ff', icon: FaBehance, iconName: 'FaBehance' },
  dribbble: { label: 'Dribbble', color: '#ea4c89', icon: FaDribbble, iconName: 'FaDribbble' },
  reddit: { label: 'Reddit', color: '#FF4500', icon: FaReddit, iconName: 'FaReddit' },
  medium: { label: 'Medium', color: '#00AB6C', icon: FaMedium, iconName: 'FaMedium' },
  kick: { label: 'Kick', color: '#53FC18', icon: FaKickstarter, iconName: 'FaKickstarter' },
  steam: { label: 'Steam', color: '#66c0f4', icon: FaSteam, iconName: 'FaSteam' },
  website: { label: 'Website', color: '#E2E8F0', icon: FaGlobe, iconName: 'FaGlobe' }
};

export function getPlatformInfo(platform: string | undefined): PlatformInfo {
  const p = platform || 'website';
  return PLATFORM_MAP[p] || PLATFORM_MAP.website;
}
