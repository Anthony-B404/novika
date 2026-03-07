# Novika

> Transformez vos enregistrements audio en documents structures grace a l'IA.

## Concept

Novika est une application web B2B2B qui transforme des enregistrements audio (reunions, dictees, appels) en documents ecrits parfaitement structures. Ce n'est pas juste un transcripteur, c'est un redacteur intelligent capable de s'adapter au metier de l'utilisateur (Avocat, Medecin, Commercial).

**L'objectif** : L'utilisateur depose un audio de 1 heure en desordre, et recupere en 2 minutes un document de synthese clair et pret a etre envoye.

## Modele de Distribution (B2B2B)

Novika utilise un modele de distribution via revendeurs :

```
Novika (Super Admin)
    | Gestion des revendeurs, attribution de credits
Revendeur (Reseller)
    | Creation d'organisations, distribution de credits, gestion des utilisateurs
Organisation (Client)
    | Pool de credits, utilisateurs
Utilisateur
    -> Consommation des credits via traitement audio
```

### Roles Systeme

| Role | Acces | Responsabilites |
|------|-------|-----------------|
| **Super Admin** | `/admin/*` | Gestion des revendeurs, attribution des credits au pool revendeur |
| **Reseller Admin** | `/reseller/*` | Creation d'organisations, distribution des credits, gestion des utilisateurs, abonnements |
| **Utilisateur** | `/dashboard/*` | Utilisation du service de transformation audio |

### Flux des Credits

```
Super Admin -> Reseller Pool -> Organization Pool -> Consommation
```

**Note** : L'inscription publique est desactivee. Tous les utilisateurs sont crees par les administrateurs revendeurs.

## Fonctionnalites

### Atelier Audio
- Upload de fichiers (27+ formats : MP3, WAV, M4A, OGG, FLAC, OPUS, WEBM, AAC, etc.)
- Enregistrement direct via microphone
- Interface drag & drop intuitive ("Drag, Drop, Done")
- Traitement automatique des fichiers longs via chunking

### Moteur de Transformation
- **Etape 1** : Transcription fidele de l'audio via Mistral AI `voxtral-mini-latest` (avec distinction des interlocuteurs via diarization)
- **Etape 2** : Restructuration intelligente via prompts utilisateur avec `mistral-large-latest`
- Adaptation au contexte metier de l'utilisateur
- Suivi du statut de traitement en temps reel

### Gestionnaire de Prompts
- Prompts organises par categories
- Creation de prompts personnalises
- Reordonnancement par drag & drop
- Prompts par defaut fournis a la creation d'organisation

### Versioning des Transcriptions
- Historique complet des versions d'analyse
- Comparaison diff entre versions
- Restauration de versions anterieures

### Chat sur Transcription
- Conversation multi-tour avec l'IA sur le contenu de la transcription
- Credits debites automatiquement par message
- Contexte conversationnel maintenu

### Text-to-Speech (TTS)
- Generation audio a partir du texte d'analyse via Inworld AI
- Lecture en streaming directe
- Cout suivi par audio

### Partage Audio
- Partage de transcriptions via liens publics UUID
- Acces en lecture seule sans authentification
- Export depuis la vue partagee

### Dashboard & Export
- Bibliotheque d'enregistrements organisee avec operations par lot
- Export PDF et Word formates professionnellement
- Historique et recherche

### Systeme de Credits
- Mode partage (pool organisation) ou individuel (par utilisateur)
- Distribution de credits Owner -> Membres
- Auto-refill mensuel configurable
- Demandes de credits (Membre -> Owner, Owner -> Reseller)

### Abonnements (Subscriptions)
- Distribution recurrente de credits aux organisations
- Types de renouvellement : premier du mois ou anniversaire
- Pause/reprise des abonnements
- Alertes pour les renouvellements a venir

### Notifications In-App
- Icone cloche avec badge de compteur dans le header
- Notifications temps reel (polling 60 secondes)
- Types : demandes de credits, credits bas, distribution, auto-refill insuffisant
- Navigation contextuelle au clic sur la notification

### GDPR
- Demande de suppression de compte avec delai de 30 jours
- Rappels automatiques a J-7 et J-1
- Export des donnees personnelles
- Blocage des ecritures pendant la periode de suppression

## Experience Utilisateur

- Interface **minimaliste** et **rassurante**
- Accent sur la **confidentialite** (sentiment de securite)
- Focus sur la **productivite**

---

## Stack Technique

### Frontend (Nuxt 4)

- **Framework**: Nuxt 4.2.1 (SPA mode, SSR disabled)
- **UI**: Nuxt UI 4.4.0
- **Styling**: Tailwind CSS 4.1.17 (via @tailwindcss/vite)
- **State**: Pinia 3.0.4
- **Validation**: Zod 4.1.12
- **i18n**: @nuxtjs/i18n 10.2.0 (francais par defaut)
- **AI**: Vercel AI SDK 6.0.78
- **Markdown**: marked + DOMPurify + Turndown
- **Utilities**: @vueuse/core, uuid

### Backend (AdonisJS v6)

- **Framework**: AdonisJS 6.19.1
- **ORM**: Lucid ORM 21.8.1 avec PostgreSQL
- **Auth**: @adonisjs/auth 9.5.1 avec tokens API
- **Mail**: @adonisjs/mail 9.2.2 + Resend
- **Validation**: @vinejs/vine 4.1.0
- **Authorization**: @adonisjs/bouncer 3.1.6
- **i18n**: @adonisjs/i18n 2.2.3 (francais et anglais)
- **Job Queue**: BullMQ 5.66.2 + Redis (ioredis)
- **AI**: @mistralai/mistralai 1.14.0 (transcription, analyse, chat)
- **TTS**: Inworld AI API
- **Audio**: ffmpeg-static + ffprobe-static
- **Export**: pdfkit (PDF) + docx (Word) + archiver (ZIP)
- **Storage**: @adonisjs/drive (local ou S3)

---

## Structure du Projet

```
.
|-- frontend/              # Application Nuxt 4
|   |-- app/              # Nouvelle structure Nuxt 4
|   |   |-- components/   # Components Vue auto-importes
|   |   |   |-- admin/    # Composants Super Admin
|   |   |   |-- audio/    # Upload, prompt, resultat
|   |   |   |-- credits/  # Gestion des credits
|   |   |   |-- Library/  # Bibliotheque audio
|   |   |   |-- prompt/   # Gestion des prompts
|   |   |   |-- reseller/ # Composants Reseller
|   |   |   |-- settings/ # Parametres organisation
|   |   |   `-- workshop/ # Atelier audio (editeur, chat, TTS, export)
|   |   |-- composables/  # 25 composables (useAuth, useApi, useTranscriptChat, etc.)
|   |   |-- layouts/      # 5 layouts (app, admin, auth, default, reseller)
|   |   |-- middleware/    # 5 middlewares (admin, auth, org-status, pending-deletion, reseller)
|   |   |-- pages/        # Pages avec routing automatique
|   |   |-- plugins/      # auth, config.client
|   |   |-- stores/       # 9 stores Pinia (auth, audio, config, credits, etc.)
|   |   |-- types/        # Definitions TypeScript par domaine
|   |   |-- utils/        # Utilitaires (audio, errors)
|   |   `-- assets/
|   |       `-- css/      # Styles globaux
|   `-- nuxt.config.ts
|
`-- backend/              # API AdonisJS v6
    |-- app/
    |   |-- controllers/  # 29 controllers (core, admin/, reseller/)
    |   |-- jobs/         # 7 workers BullMQ (transcription, GDPR, subscription)
    |   |-- middleware/   # 9 middlewares
    |   |-- models/       # 20 modeles Lucid
    |   |-- policies/     # 14 policies Bouncer
    |   |-- services/     # 18 services metier (AI, audio, credits, export, GDPR)
    |   `-- validators/   # 16 validators VineJS
    |-- commands/         # 7 commandes Ace (CRON, migration)
    |-- config/
    |   `-- queue.ts      # Configuration Redis/BullMQ (4 queues)
    |-- database/
    |   `-- migrations/   # 66 migrations
    |-- resources/
    |   |-- lang/         # Fichiers de traduction (fr/, en/)
    |   `-- views/        # Templates Email Edge.js + MJML
    `-- start/
        |-- routes.ts
        |-- validator.ts
        `-- worker.ts     # Initialisation des workers BullMQ
```

---

## Demarrage Rapide

### Prerequis

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Redis >= 6.x (pour les jobs en arriere-plan)
- pnpm (recommande) ou npm

### Installation

1. **Cloner le repository**

```bash
git clone <your-repo-url>
cd Novika
```

2. **Configurer le Backend**

```bash
cd backend
pnpm install

# Copier et configurer .env
cp .env.example .env
# Editer .env avec vos configurations
```

3. **Configurer le Frontend**

```bash
cd frontend
pnpm install

# Copier et configurer .env
cp .env.example .env
# Editer .env avec votre URL API
```

### Configuration des Variables d'Environnement

#### Backend (.env)

```bash
# Application
PORT=3333
HOST=localhost
NODE_ENV=development
APP_KEY=<generer avec: node ace generate:key>

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=novika_db

# Mail (Resend)
RESEND_API_KEY=re_your_resend_api_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Mistral AI (transcription, analyse, chat)
MISTRAL_API_KEY=your_mistral_api_key

# Inworld TTS (text-to-speech)
INWORLD_API_KEY=your_inworld_api_key

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Storage
DRIVE_DISK=local
```

#### Frontend (.env)

```bash
# API URL
API_URL=http://localhost:3333
```

### Installer Redis

**macOS (Homebrew):**

```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

Verifier l'installation : `redis-cli ping` -> doit repondre `PONG`

### Initialiser la Base de Donnees

```bash
cd backend

# Creer la base de donnees
createdb novika_db

# Executer les migrations
node ace migration:run
```

### Creer un Super Admin (Premier Acces)

L'inscription publique etant desactivee, vous devez creer un Super Admin manuellement :

```bash
cd backend

# Option 1: Via la console AdonisJS (si disponible)
node ace user:create-super-admin

# Option 2: Via SQL directement
# INSERT INTO users (email, is_super_admin, ...) VALUES ('admin@example.com', true, ...);
```

Une fois le Super Admin cree, vous pouvez :
1. Vous connecter a `/admin`
2. Creer des revendeurs
3. Les revendeurs peuvent ensuite creer des organisations et des utilisateurs

### Lancer l'Application

**Terminal 1 - Backend:**

```bash
cd backend
pnpm dev
# API disponible sur http://localhost:3333
# Workers BullMQ demarrent automatiquement
```

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm dev
# App disponible sur http://localhost:3000
```

---

## Scripts Utiles

### Backend

```bash
pnpm dev             # Mode developpement avec HMR
pnpm build           # Build pour production
pnpm start           # Demarrer en production
pnpm test            # Executer les tests
pnpm lint            # ESLint
pnpm format          # Prettier
pnpm typecheck       # TypeScript type checking
node ace migration:run       # Executer les migrations
node ace migration:rollback  # Rollback derniere migration
node ace gdpr:scheduler      # Traiter les suppressions GDPR dues
node ace subscription:renew  # Traiter les renouvellements d'abonnements
node ace cleanup:credit-requests   # Nettoyage des demandes de credits traitees (>90j)
node ace cleanup:notifications     # Nettoyage des notifications lues (>30j)
node ace check:auto-refill         # Verifier les auto-refills du lendemain
```

### Frontend

```bash
pnpm dev             # Mode developpement
pnpm build           # Build pour production
pnpm preview         # Preview du build
pnpm typecheck       # TypeScript type checking
```

---

## Architecture Multi-Tenant

Novika utilise une architecture multi-tenant hierarchique :

### Hierarchie des Donnees

```
Reseller (revendeur)
    `-- Organizations (clients)
            `-- Users (utilisateurs)
                    `-- Audios (donnees)
                            |-- Transcriptions (avec versioning)
                            |-- Documents (exports)
                            `-- AudioShares (partages)
```

### Isolation des Donnees

- **Niveau Reseller** : Les revendeurs ne peuvent acceder qu'aux organisations qu'ils ont creees
- **Niveau Organisation** : Les donnees sont isolees par `currentOrganizationId`
- **Utilisateurs** : Chaque utilisateur peut appartenir a **plusieurs organisations**

### Roles au Niveau Organisation

| Role | Permissions |
|------|-------------|
| **Owner** | Controle total de l'organisation |
| **Administrator** | Gestion des membres, certains parametres |
| **Member** | Acces basique aux ressources |

### Credits

Les credits sont geres au niveau **Organisation** (et non au niveau utilisateur) :

1. Le Super Admin ajoute des credits au pool du Reseller
2. Le Reseller distribue des credits aux Organisations (manuellement ou via abonnement)
3. Les utilisateurs consomment les credits de leur organisation lors du traitement audio

**Modes de credits** :
- **Partage** (defaut) : Tous les membres partagent le pool de l'organisation
- **Individuel** : Credits distribues individuellement aux membres avec auto-refill optionnel

---

## Jobs en Arriere-Plan (Redis & BullMQ)

Novika utilise **BullMQ** avec **Redis** pour gerer les taches asynchrones :

### Queues disponibles

| Queue | Description | Concurrence |
|-------|-------------|-------------|
| `audio-transcription` | Transcription et analyse audio via Mistral AI | 2 |
| `gdpr-deletion` | Suppression de compte GDPR | 1 |
| `gdpr-reminder` | Rappels avant suppression | 1 |
| `subscription-renewal` | Renouvellement d'abonnements credits | 2 |

### Workers

Les workers demarrent **automatiquement** avec le serveur backend (`pnpm dev` ou `pnpm start`).

Pour verifier que Redis fonctionne :

```bash
redis-cli ping
# Doit repondre: PONG
```

### Tous les Jobs CRON (Production)

| Horaire | Commande | Description |
|---------|----------|-------------|
| 0:05 | `node ace subscription:renew` | Renouvellements d'abonnements |
| 2:00 | `node ace gdpr:scheduler` | Suppressions GDPR et rappels |
| 3:00 (dim) | `node ace cleanup:credit-requests` | Nettoyage demandes de credits (hebdo) |
| 3:00 | `node ace cleanup:notifications` | Nettoyage notifications lues > 30 jours |
| 18:00 | `node ace check:auto-refill` | Avertissement auto-refill insuffisant (24h avant) |

**Configuration Production** (`docker/scheduler/crontab`) :
```bash
5 0 * * * node ace subscription:renew
0 2 * * * node ace gdpr:scheduler
0 3 * * 0 node ace cleanup:credit-requests
0 3 * * * node ace cleanup:notifications
0 18 * * * node ace check:auto-refill
```

#### Flow de suppression GDPR

```
Jour 0  -> Demande de suppression + Email de confirmation
Jour 23 -> Email de rappel (J-7)
Jour 29 -> Email de rappel (J-1)
Jour 30 -> Suppression automatique + Email de confirmation finale
```

---

## Licence

Ce projet est sous licence MIT.
