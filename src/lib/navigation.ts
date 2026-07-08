import { ROUTES } from '@/lib/constants';
import type { LucideIcon } from 'lucide-react';
import {
  Compass, Crown, Download, Heart, Headphones,
  Home, Library, ListMusic, MessageSquare, Music,
  Podcast, Radio, Ticket, TrendingUp, Clock, Upload,
  Search,
  LayoutDashboard, Users, ShieldCheck, QrCode, DollarSign,
  Settings, Gift, Palette, Disc3, User, Mic2,
} from 'lucide-react';

export type { LucideIcon };

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
  isSearch?: boolean;
}

// Navigation principale (sidebar + header mobile)
export const menuLinks: NavLink[] = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/explore', label: 'Explorer', icon: Compass },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/feed', label: "Fil d'actu", icon: MessageSquare },
];

// Découvrir (sidebar + header mobile)
export const discoverLinks: NavLink[] = [
  { href: ROUTES.PREMIUM, label: 'Premium', icon: Crown },
  { href: ROUTES.PODCASTS, label: 'Podcasts', icon: Podcast },
  { href: ROUTES.LIVESTREAMS, label: 'En direct', icon: Radio, badge: true },
  { href: ROUTES.CHAT, label: 'Chat', icon: MessageSquare },
  { href: ROUTES.TICKETS, label: 'Tickets', icon: Ticket },
];

// Bibliothèque (sidebar)
export const libraryLinks: NavLink[] = [
  { href: ROUTES.USER_LIBRARY, label: 'Ma Bibliothèque', icon: Library },
  { href: '/user/library?tab=favorites', label: 'Favoris', icon: Heart },
  { href: '/user/library?tab=recent', label: 'Récemment écoutés', icon: Clock },
  { href: ROUTES.OFFLINE, label: 'Téléchargements', icon: Download },
];

// Navigation en-tête desktop
export const headerNav: NavLink[] = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home },
  { href: ROUTES.EXPLORE, label: 'Explorer', icon: Compass },
  { href: ROUTES.PLAYLISTS, label: 'Playlists', icon: ListMusic },
  { href: ROUTES.FEED, label: "Fil d'actu", icon: MessageSquare },
  { href: ROUTES.USER_LIBRARY, label: 'Ma Bibliothèque', icon: Headphones },
];

// Bottom nav mobile
export const bottomNavLinks: NavLink[] = [
  { href: ROUTES.HOME, label: 'Accueil', icon: Home },
  { href: '/search', label: 'Rechercher', icon: Search, isSearch: true },
  { href: ROUTES.EXPLORE, label: 'Explorer', icon: Compass },
  { href: ROUTES.PREMIUM, label: 'Premium', icon: Crown },
];

// Admin
export const adminLinks: NavLink[] = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_USERS, label: 'Utilisateurs', icon: Users },
  { href: ROUTES.ADMIN_CATALOG, label: 'Catalogue', icon: Music },
  { href: '/admin/verification', label: 'Vérifications', icon: ShieldCheck },
  { href: ROUTES.ADMIN_SCANNER, label: 'Scanner', icon: QrCode },
  { href: ROUTES.ADMIN_TRANSACTIONS, label: 'Transactions', icon: DollarSign },
  { href: ROUTES.ADMIN_SETTINGS, label: 'Paramètres', icon: Settings },
  { href: ROUTES.ADMIN_PROMO_CODES, label: 'Codes Promo', icon: Gift },
  { href: ROUTES.ADMIN_ADS, label: 'Publicités', icon: Radio },
  { href: ROUTES.ADMIN_ALBUM_COVERS, label: 'Pochettes album', icon: Palette },
];

// Artiste
export const artistLinks: NavLink[] = [
  { href: ROUTES.ARTIST_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ARTIST_CATALOG, label: 'Catalogue', icon: Disc3 },
  { href: ROUTES.ARTIST_PROFILE, label: 'Profil', icon: User },
  { href: ROUTES.ARTIST_LIVESTREAM, label: 'Live', icon: Radio },
  { href: ROUTES.ARTIST_ROYALTIES, label: 'Royalties', icon: TrendingUp },
  { href: ROUTES.ARTIST_SERVICES, label: 'Services', icon: Mic2 },
  { href: ROUTES.ARTIST_REFERRAL, label: 'Parrainage', icon: Gift },
];

export const ARTIST_ROUTES = [
  ROUTES.ARTIST_DASHBOARD,
  ROUTES.ARTIST_CATALOG,
  ROUTES.ARTIST_SERVICES,
  ROUTES.ARTIST_PROFILE,
  ROUTES.ARTIST_LIVESTREAM,
  ROUTES.ARTIST_ROYALTIES,
  ROUTES.ARTIST_REFERRAL,
  '/artist/upload',
];
