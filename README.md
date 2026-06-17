# Ngowamix — Plateforme de Streaming Musical Africain

Plateforme web de streaming musical avec abonnement premium et vente d'albums, orientée Afrique francophone. PWA installable.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | Next.js 15 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS + class-variance-authority |
| **State** | Zustand |
| **Base de données** | PostgreSQL 16 + Prisma ORM |
| **Authentification** | JWT (jose) + cookies HTTPOnly sécurisés |
| **Paiements** | CinetPay (Mobile Money + Carte bancaire) |
| **PWA** | Service Worker custom + manifest.json |
| **Upload** | FormData + stockage local |

## Fonctionnalités MVP

### Auditeur gratuit
- Création de compte (email + mot de passe)
- Écoute en streaming du catalogue
- Recherche artistes, albums, titres
- Pages artistes et albums
- Ajout de favoris
- Navigation PWA installable

### Abonné Premium (5 000 XOF/mois)
- Écoute sans publicité
- Qualité audio supérieure
- 30 téléchargements par mois (quota configurable)
- Accès prioritaire aux nouveautés
- Quota reset automatique chaque mois

### Achat d'albums
- Achat à l'unité via Mobile Money ou carte bancaire
- Album ajouté à la bibliothèque après paiement
- Téléchargement permanent (MP3/ZIP)
- Disponible même après expiration du Premium

### Espace Artiste / Label
- Inscription compte professionnel
- Dashboard avec statistiques (écoutes, ventes, revenus)
- Création d'albums avec cover et métadonnées
- Upload de pistes audio (MP3, WAV, M4A, AAC, OGG)
- Définir le prix de vente et la disponibilité
- Workflow de validation (brouillon → soumis → publié)
- Suivi des ventes

### Back-office Admin
- Dashboard global (utilisateurs, revenus, contenus)
- Gestion des utilisateurs (liste, blocage, activation Premium)
- Validation du catalogue (accepter/rejeter les albums)
- Suivi des transactions et paiements
- Configuration plateforme (prix, quotas)
- Pages institutionnelles

## Prérequis

- **Node.js** >= 20
- **PostgreSQL** >= 15
- **npm** ou **yarn**

## Installation rapide

### 1. Cloner et installer

```bash
cd "PROJET SITE /MUSIQUE"
npm install
```

### 2. Base de données avec Docker

```bash
# Lancer PostgreSQL
docker compose up -d

# Attendre que la DB soit prête
docker compose ps
```

### 3. Configuration

Le fichier `.env` est pré-configuré pour le développement local :

```env
DATABASE_URL="postgresql://ngowamix:ngowamix_dev_2026@localhost:5432/ngowamix"
JWT_SECRET="ngowamix-dev-secret-key-change-in-production-2026-x7k9m2p4q8"
APP_URL="http://localhost:3000"
CINETPAY_API_KEY="your-cinetpay-api-key"
CINETPAY_SITE_ID="your-cinetpay-site-id"
PREMIUM_PRICE=5000
PREMIUM_CURRENCY="XOF"
PREMIUM_DOWNLOAD_QUOTA=30
```

### 4. Initialiser la base

```bash
npm run db:migrate    # Créer les tables
npm run db:seed       # Données de test
```

### 5. Lancer le serveur

```bash
npm run dev
# → http://localhost:3000
```

## Comptes de test

Après `npm run db:seed` :

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Admin** | admin@ngowamix.com | admin123 | /admin/dashboard |
| **Auditeur** | test@ngowamix.com | test123 | /user/dashboard |
| **Artiste** | artist@ngowamix.com | artist123 | /artist/dashboard |

## Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting
npm run db:generate  # Générer le client Prisma
npm run db:migrate   # Appliquer les migrations
npm run db:push      # Pousser le schéma (dev uniquement)
npm run db:studio    # Ouvrir Prisma Studio (UI de la DB)
npm run db:seed      # Peupler la base de données
```

## Structure du projet

```
├── prisma/
│   ├── schema.prisma       # Schéma de base de données (10 modèles)
│   └── seed.ts             # Données de test
├── public/
│   ├── icons/              # Icônes PWA (192x192, 512x512)
│   ├── uploads/            # Fichiers uploadés (audio, covers)
│   ├── sw.js               # Service Worker
│   └── manifest.json       # PWA manifest
├── src/
│   ├── app/
│   │   ├── (public)/       # Pages publiques (home, explore, search...)
│   │   ├── (auth)/         # Pages d'authentification
│   │   ├── api/            # API routes (33 endpoints)
│   │   ├── layout.tsx      # Layout racine + PWA + Toast
│   │   └── not-found.tsx   # Page 404
│   ├── components/
│   │   ├── ui/             # Composants de base (Button, Input, Card...)
│   │   ├── layout/         # Header, Footer
│   │   ├── player/         # Player audio persistant
│   │   ├── catalog/        # ArtistCard, AlbumCard, TrackRow
│   │   ├── auth/           # LoginForm, RegisterForm
│   │   ├── feedback/       # Toast notifications
│   │   └── pwa/            # Install prompt
│   ├── store/              # Zustand stores (auth, player)
│   ├── lib/                # Utilitaires (db, auth, cinetpay, utils)
│   ├── types/              # Types TypeScript
│   ├── styles/             # CSS global
│   └── middleware.ts       # Protection routes par rôle
├── docker-compose.yml      # PostgreSQL local
└── next.config.js          # Config Next.js (headers, images)
```

## API Endpoints

### Authentification
- `POST /api/auth/register` — Créer un compte
- `POST /api/auth/login` — Se connecter
- `POST /api/auth/logout` — Se déconnecter

### Catalogue public
- `GET /api/albums` — Lister les albums (filtres: genre, pays, page)
- `GET /api/artists` — Lister les artistes (filtres: genre, pays, page)
- `GET /api/tracks` — Lister les pistes (filtre: albumId)

### Espace Artiste
- `GET /api/artist/dashboard` — Stats artiste
- `GET|POST /api/artist/albums` — Gérer les albums
- `GET|PUT|DELETE /api/artist/albums/[id]` — CRUD album
- `GET|POST /api/artist/tracks` — Upload pistes
- `PUT /api/artist/profile` — Modifier profil

### Paiements
- `POST /api/payment/init` — Initier un paiement CinetPay
- `GET /api/payment/verify` — Vérifier le statut d'un paiement
- `POST /api/payment/webhook` — Webhook CinetPay

### Espace Utilisateur
- `GET /api/user/status` — Statut utilisateur (premium, quota)
- `GET /api/user/purchases` — Achats de l'utilisateur
- `GET /api/user/download` — Télécharger (avec vérification quota)
- `GET|POST /api/user/favorites` — Gérer les favoris

### Admin
- `GET /api/admin/dashboard` — Stats globales
- `GET|PUT /api/admin/users` — Gérer les utilisateurs
- `GET|PUT /api/admin/catalog` — Valider le catalogue
- `GET /api/admin/transactions` — Historique transactions
- `GET /api/cron/premium-expiry` — Cron expiration Premium

## Schéma de base de données

### 10 modèles principaux

```
User ─────┬── Subscription (abonnements)
          ├── Transaction (paiements)
          ├── Purchase (achats d'albums)
          ├── Download (téléchargements)
          ├── Favorite (favoris)
          └── Artist (profil artiste)

Artist ───┴── Album (catalogue)

Album ────┬── Track (pistes audio)
          ├── Purchase (achats)
          └── Favorite (favoris)

Track ────┴── Favorite (favoris)

Transaction ── Purchase (liaison)
```

### Rôles utilisateur
- **LISTENER** — Auditeur gratuit
- **ARTIST** — Artiste avec catalogue
- **LABEL** — Label/Producteur
- **ADMIN** — Administrateur plateforme

### Statuts album
`DRAFT → SUBMITTED → VALIDATED → PUBLISHED → ARCHIVED`

### Statuts transaction
`PENDING → PAID / FAILED / CANCELLED / REFUNDED`

## Modèle économique

| Offre | Prix | Avantages |
|-------|------|-----------|
| **Gratuit** | 0 | Streaming, recherche, favoris, publicités |
| **Premium** | 5 000 XOF/mois | Sans pub, qualité supérieure, 30 DL/mois |
| **Achat album** | Prix artiste | Téléchargement permanent, accessible hors Premium |

## PWA

La plateforme est installable comme application native :

- **Manifest** : `/manifest.json` avec icônes et thème
- **Service Worker** : Cache des assets statiques et API
- **Install prompt** : Bannière d'installation automatique
- **Offline** : Interface fonctionnelle hors connexion
- **Notifications** : Support push notifications

## SEO

- Sitemap dynamique généré automatiquement
- Robots.txt configuré
- Open Graph et Twitter Cards
- JSON-LD (Structured Data)
- URLs propres et descriptives
- Metadata par page

## Sécurité

- Mots de passe hashés avec bcrypt (12 rounds)
- Sessions JWT dans cookies HTTPOnly + Secure + SameSite=Strict
- Protection des routes par middleware (rôle-based)
- Headers de sécurité (X-Frame-Options, CSP, etc.)
- Liens de téléchargement avec expiration
- Validation des entrées avec Zod

## Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Variables d'environnement à configurer dans Vercel :
- `DATABASE_URL` — URL PostgreSQL (Neon, Supabase, etc.)
- `JWT_SECRET` — Clé secrète (32+ caractères)
- `APP_URL` — URL de production
- `CINETPAY_API_KEY` — Clé API CinetPay
- `CINETPAY_SITE_ID` — ID du site CinetPay

### Base de données production

Options recommandées :
- **Neon** (neon.tech) — PostgreSQL serverless gratuit
- **Supabase** (supabase.com) — PostgreSQL + dashboard
- **Railway** (railway.app) — PostgreSQL managé

### Migration production

```bash
npx prisma migrate deploy
```

### Stockage des fichiers

Pour la production, remplacer le stockage local par :
- **AWS S3** ou **Cloudflare R2** pour les fichiers audio
- **UploadThing** ou **Vercel Blob** pour les covers

## Prochaines étapes (V2)

- [ ] Recommandations IA personnalisées
- [ ] Playlists collaboratives
- [ ] Podcasts
- [ ] Livestream
- [ ] Chat communautaire
- [ ] Programme d'affiliation
- [ ] Abonnement famille
- [ ] Application mobile native (React Native)
- [ ] Royalties automatisées
- [ ] Intégration email (Resend/SendGrid)

## Licence

Propriétaire — Ngowamix © 2026
