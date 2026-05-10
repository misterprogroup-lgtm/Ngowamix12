export const PREMIUM_PRICE = parseInt(process.env.PREMIUM_PRICE || '5000', 10);
export const PREMIUM_CURRENCY = process.env.PREMIUM_CURRENCY || 'XOF';
export const FREE_DOWNLOAD_QUOTA = 10;
export const PREMIUM_DOWNLOAD_QUOTA = parseInt(process.env.PREMIUM_DOWNLOAD_QUOTA || '30', 10);
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Ngowamix';

export const GENRES = [
  'Afrobeats',
  'Amapiano',
  'Coupé-décalé',
  'Bongo Flava',
  'Rumba',
  'Hip-Hop',
  'R&B',
  'Gospel',
  'Zouk',
  'Makossa',
  'Soukous',
  'Ndombolo',
  'Afro-jazz',
  'Reggae',
  'Pop',
  'Traditionnel',
  'Autre',
];

export const COUNTRIES = [
  "Côte d'Ivoire",
  'Sénégal',
  'Mali',
  'Burkina Faso',
  'Cameroun',
  'Gabon',
  'Congo',
  'RDC',
  'Guinée',
  'Bénin',
  'Togo',
  'Tchad',
  'Niger',
  'France',
  'Autre',
];

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  TICKETS: '/tickets',
  SEARCH: '/search',
  PREMIUM: '/premium',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_DASHBOARD: '/user/dashboard',
  USER_LIBRARY: '/user/library',
  USER_SUBSCRIPTION: '/user/subscription',
  USER_PURCHASES: '/user/purchases',
  USER_TICKETS: '/user/tickets',
  USER_PROFILE: '/user/profile',
  ARTIST_DASHBOARD: '/artist/dashboard',
  ARTIST_CATALOG: '/artist/catalog',
  ARTIST_PROFILE: '/artist/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATALOG: '/admin/catalog',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_SCANNER: '/admin/scanner',
  MY_PLAYLIST: '/my-playlist',
} as const;
