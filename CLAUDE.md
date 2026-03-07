# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Novika is a B2B2B SaaS application that transforms audio recordings (meetings, dictations, calls) into structured written documents using AI. Built with Nuxt 4 frontend and AdonisJS v6 backend with multi-tenant architecture and a reseller distribution model.

### Core Features
- **Audio Workshop**: Upload or record via microphone, with automatic transcription and AI analysis
- **Transformation Engine**: AI-powered transcription (Mistral voxtral-mini) + intelligent restructuring via prompts (Mistral large)
- **Prompt Manager**: Customizable prompts organized by categories for different use cases
- **Transcription Versioning**: Full version history with diff comparison and restore
- **Audio Sharing**: Share audio transcriptions via public UUID links
- **Chat on Transcription**: Multi-turn AI conversation about transcription content
- **Text-to-Speech**: AI-powered audio generation from analysis text (Inworld AI)
- **Export**: PDF and Word document generation with professional formatting
- **Dashboard & Library**: Audio library with batch operations and search
- **Subscription System**: Reseller-managed recurring credit distribution to organizations

### Business Context
- **Business Model**: B2B2B (Novika -> Resellers -> Client Organizations -> Users)
- **Target users**: Professionals (Lawyers, Doctors, Salespeople) via reseller partners
- **Value proposition**: "1-hour messy audio -> 2-minute structured document"
- **UX principles**: Minimalist, reassuring, "Drag, Drop, Done"
- **Distribution**: No public signup - all users created by Reseller admins

## Technology Stack

### Frontend (Nuxt 4)

- **Framework**: Nuxt 4.2.1 (SSR disabled, SPA mode)
- **UI Library**: Nuxt UI 4.4.0 (primary UI components)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **State Management**: Pinia 3.0.4
- **Validation**: Zod 4.1.12
- **i18n**: @nuxtjs/i18n 10.2.0 with French as default locale (prefix_and_default strategy)
- **AI Integration**: ai 6.0.78 (Vercel AI SDK)
- **Markdown**: marked 17.0.1 + DOMPurify 3.3.1 + Turndown 7.2.2
- **Utilities**: @vueuse/core 14.0.0, uuid 11.0.3
- **Animation**: @formkit/auto-animate
- **Directory Structure**: New Nuxt 4 `app/` directory instead of root-level components/pages

### Backend (AdonisJS v6)

- **Framework**: AdonisJS 6.19.1
- **ORM**: Lucid ORM 21.8.1 with PostgreSQL (pg 8.16.3)
- **Auth**: @adonisjs/auth v9.5.1 with API tokens
- **Authorization**: @adonisjs/bouncer v3.1.6 with policies
- **Validation**: VineJS (@vinejs/vine 4.1.0)
- **Email**: @adonisjs/mail 9.2.2 with Resend integration
- **i18n**: @adonisjs/i18n v2.2.3 with French and English support
- **Templating**: Edge.js for email templates, MJML 4.16.1 for email layouts
- **File Storage**: @adonisjs/drive 3.4.1 (local or S3)
- **Job Queue**: BullMQ 5.66.2 with Redis (ioredis 5.8.2)
- **AI**: @mistralai/mistralai 1.14.0 (transcription, analysis, chat)
- **Audio Processing**: ffmpeg-static 5.3.0, ffprobe-static 3.1.0
- **Document Export**: pdfkit 0.17.2 (PDF), docx 9.5.1 (Word), archiver 7.0.1 (ZIP)
- **DateTime**: Luxon 3.7.2

## Development Commands

### Frontend (`/frontend`)

```bash
pnpm dev              # Development server (http://localhost:3000)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm typecheck        # TypeScript type checking
```

### Backend (`/backend`)

```bash
pnpm dev              # Development server with HMR (http://localhost:3333)
pnpm build            # Production build
pnpm start            # Start production server
pnpm test             # Run Japa tests
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm typecheck        # TypeScript type checking

# AdonisJS Ace commands
node ace migration:run              # Run migrations
node ace migration:rollback         # Rollback last migration
node ace make:controller Name       # Generate controller
node ace make:model Name            # Generate model
node ace make:migration name        # Generate migration
node ace generate:key               # Generate APP_KEY

# Scheduled tasks (CRON)
node ace gdpr:scheduler             # Process GDPR deletions and reminders
node ace subscription:renew         # Process subscription renewals
node ace cleanup:credit-requests    # Cleanup old processed credit requests (90 days)
node ace cleanup:notifications      # Cleanup old read notifications (30 days)
node ace check:auto-refill          # Check auto-refills due tomorrow, warn if insufficient

# Data migration helpers
node ace backfill:initial-versions  # Backfill transcription version history
node ace migrate:opus-to-aac       # Migrate opus audio files to AAC
```

## Architecture Patterns

### Multi-Tenant Architecture

**System Hierarchy (B2B2B Model)**:
```
Super Admin (Novika staff)    -> Access: /admin/*
    |
Reseller (Business partner)    -> Access: /reseller/*
    |
Organization (Client company)  -> Credits pool, users, audios
    |
User (End user)                -> Access: /dashboard/*
```

**Credit Flow**: Super Admin -> Reseller (pool) -> Organization (pool) -> Usage

- **Tenant Isolation**: All data is scoped by `currentOrganizationId` (user's active organization)
- **Critical Rule**: ALWAYS filter database queries by `currentOrganizationId` to prevent data leaks
- **Reseller Scope**: Reseller admins can only access organizations belonging to their reseller
- **User-Organization Relationship**: Users can belong to MULTIPLE organizations
- **Organization Context**: Users have a "current organization" that determines which data they see
- **Organization-Level Roles**: Owner (1), Administrator (2), and Member (3) - stored per-organization in `organization_user` pivot table
- **Role Verification**: Use `user.isOwnerOf(orgId)` and `user.hasOrganization(orgId)` methods
- **Organization Switching**: Users can switch between their organizations via `/api/organizations/:id/switch`
- **Public Signup Disabled**: All users are created by Reseller admins, no public registration

### Authentication & Authorization Flow

1. **User Creation**: Users are created by Reseller admins (no public signup)
   - Reseller creates organization -> creates users within organization
   - Users receive magic link to complete setup
2. **Login**: Returns API token for Bearer auth (`/login/request-magic-link`)
3. **Role-Based Redirection**: After login, redirect based on `user.roleType`:
   - `super_admin` -> `/admin`
   - `reseller_admin` -> `/reseller`
   - `organization_user` -> `/dashboard`
4. **Protected Routes**:
   - `/api/*` - All authenticated users
   - `/admin/*` - Super Admin only (`superAdmin` middleware)
   - `/reseller/*` - Reseller Admin only (`reseller` middleware)
5. **Middleware**: `auth_middleware.ts` validates tokens, `super_admin_middleware.ts` and `reseller_middleware.ts` check role access
6. **Policies**: Located in `backend/app/policies/` - always check tenant isolation in policies

### Invitation System

- **UUID-based**: Invitations use `identifier` (UUID) for secure public links
- **Expiration**: Invitations expire after set period (`expiresAt`)
- **Flow**: Create -> Check validity -> Accept
  - **New Users**: Creates user + links to organization with specified role
  - **Existing Users**: Adds organization to user's organizations (user can belong to multiple orgs)
- **Email Notifications**: Automatically sent via Resend when invitation created

### Credits System

**Credit Flow**: Super Admin -> Reseller pool -> Organization pool -> User pool (individual mode) or Usage (shared mode)

**Credit Modes** (Owner configurable):
| Mode | Description | Credit Source |
|------|-------------|---------------|
| `shared` (default) | All members share organization pool | `organization.credits` |
| `individual` | Credits distributed to members individually | `user_credits.balance` |

**Organization-Level Credits** (both modes):
- `organization.credits` - Organization's pool
- `organization.creditMode` - 'shared' or 'individual'
- `credit_transactions` - Audit trail of organization-level usage
- **Organization Methods**: `hasEnoughCredits(amount)`, `deductCredits(amount, description, userId, audioId?)`, `addCredits(amount, type, description, userId)`

**User-Level Credits** (individual mode only):
- `user_credits` table - Per-user balances with auto-refill config
- `user_credit_transactions` - User-level audit trail
- **UserCredit model methods**: `hasEnoughCredits()`, `canReceiveCredits()`, `getCreditsNeededForRefill()`

**CreditService Methods**:
- `switchCreditMode()` - Change between shared/individual (recovers credits when switching to shared)
- `distributeToUser()` - Owner distributes credits to member
- `recoverFromUser()` - Owner recovers credits from member
- `configureAutoRefill()` / `disableAutoRefill()` - Per-user auto-refill config
- `enableGlobalAutoRefill()` / `disableGlobalAutoRefill()` - Org-level auto-refill settings
- `processAutoRefill()` - Called by CRON for monthly refills
- `hasEnoughCreditsForProcessing()` / `deductForAudioProcessing()` - Audio integration (handles both modes)

**Reseller Methods**: `hasEnoughCredits(amount)`, `distributeCredits(amount, orgId, description, userId)`, `addCredits(amount, description, userId)`

### Credit Requests System

**Overview**: Members can request credits from their organization Owner. Owners can request credits from their Reseller.

**Request Flow**:
```
Member -> CreditRequest -> Owner (approve/reject) -> Credits distributed
Owner  -> CreditRequest -> Reseller (approve/reject) -> Credits distributed
```

**Backend Components**:
- **Model**: `backend/app/models/credit_request.ts`
- **Service**: `backend/app/services/credit_request_service.ts`
- **Controller**: `backend/app/controllers/credit_requests_controller.ts`
- **Reseller Controller**: `backend/app/controllers/reseller/reseller_credit_requests_controller.ts`

**Request Statuses**: `pending`, `approved`, `rejected`

**API Endpoints (Users)**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/credit-requests` | List my requests |
| GET | `/credit-requests/pending` | Pending requests for Owner |
| POST | `/credit-requests` | Create request (to Owner) |
| POST | `/credit-requests/to-reseller` | Create request (to Reseller) |
| POST | `/credit-requests/:id/approve` | Owner approves request |
| POST | `/credit-requests/:id/reject` | Owner rejects request |

**API Endpoints (Reseller)**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reseller/credit-requests` | List all requests |
| GET | `/reseller/credit-requests/pending` | Pending requests from Owners |
| POST | `/reseller/credit-requests/:id/approve` | Approve request |
| POST | `/reseller/credit-requests/:id/reject` | Reject request |

### Subscription System

**Overview**: Resellers can configure recurring credit distributions to organizations.

**Backend Components**:
- **Controller**: `backend/app/controllers/reseller/reseller_subscriptions_controller.ts`
- **Validator**: `backend/app/validators/subscription.ts`
- **Job**: `backend/app/jobs/subscription_renewal_job.ts`
- **Command**: `backend/commands/run_subscription_renewals.ts`
- **Queue**: `subscription-renewal` (concurrency: 2)

**Organization Subscription Fields**:
- `subscriptionEnabled` - Boolean toggle
- `monthlyCreditsTarget` - Target credit amount per renewal
- `renewalType` - `'first_of_month'` or `'anniversary'`
- `renewalDay` - Day 1-28 for anniversary renewals
- `subscriptionCreatedAt`, `subscriptionPausedAt`, `lastRenewalAt`, `nextRenewalAt` - Lifecycle timestamps

**API Endpoints (Reseller)**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reseller/organizations/:id/subscription` | Get subscription status |
| POST | `/reseller/organizations/:id/subscription` | Configure subscription |
| POST | `/reseller/organizations/:id/subscription/pause` | Pause subscription |
| POST | `/reseller/organizations/:id/subscription/resume` | Resume subscription |
| GET | `/reseller/subscriptions/upcoming-renewals` | Upcoming renewals list |

**Frontend Components**:
- `reseller/SubscriptionConfigForm.vue` - Subscription settings form
- `reseller/SubscriptionStatusBadge.vue` - Status indicator
- `reseller/UpcomingRenewalsAlert.vue` - Renewal warning alert
- **Composable**: `useResellerSubscriptions.ts`

### Notifications System (In-App)

**Overview**: Persistent in-app notification system with real-time polling (60s) for credit-related events.

**Notification Types**:
| Type | Recipient | Trigger |
|------|-----------|---------|
| `credit_request` | Organization Owner | Member requests credits |
| `owner_credit_request` | Reseller Admins | Owner requests credits from reseller |
| `low_credits` | Organization Owner | Organization pool < 100 credits (24h deduplication) |
| `insufficient_refill` | Organization Owner | Auto-refill due tomorrow but insufficient credits |
| `reseller_distribution` | Organization Owner | Reseller distributes credits to organization |
| `credits_received` | Member | Owner distributes credits to member |

**Backend Components**:
- **Model**: `backend/app/models/notification.ts`
- **Service**: `backend/app/services/notification_service.ts`
- **Controller**: `backend/app/controllers/notifications_controller.ts`
- **Reseller Controller**: `backend/app/controllers/reseller/reseller_notifications_controller.ts`
- **Policy**: `backend/app/policies/notification_policy.ts`

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Paginated list |
| GET | `/notifications/unread-count` | Badge counter |
| POST | `/notifications/:id/read` | Mark single as read |
| POST | `/notifications/read-all` | Mark all as read |

**Frontend Components**:
- **Composable**: `frontend/app/composables/useNotifications.ts` - Shared state, polling, actions
- **Slideover**: `frontend/app/components/NotificationsSlideover.vue` - Notification list UI
- **Bell Icon**: In `default.vue` and `reseller.vue` layouts with unread badge

**Frontend Usage**:
```typescript
const {
  notifications,    // Notification list
  unreadCount,      // Badge counter
  markAsRead,       // Mark single notification read
  markAllAsRead,    // Mark all notifications read
  refresh,          // Manual refresh
  getNotificationIcon,   // Type -> icon mapping
  getNotificationLink,   // Type -> navigation link
} = useNotifications()
```

### Audio Processing Pipeline

**Transcription Flow**:
1. User uploads audio file (max 512MB, 27+ formats supported via ffmpeg conversion)
2. Backend validates and converts to AAC via `AudioConverterService`
3. Long files are automatically chunked via `AudioChunkingService` (sets `isChunked` flag)
4. Job queued in BullMQ `audio-transcription` queue
5. `TranscriptionJob` processes: upload to Mistral -> transcribe with `voxtral-mini-latest` (speaker diarization) -> analyze with `mistral-large-latest`
6. Credits deducted from organization/user pool
7. Frontend polls status via `/audio/status/:jobId` or SSE events

**Mistral AI Models**:
| Purpose | Model | Notes |
|---------|-------|-------|
| Transcription | `voxtral-mini-latest` | With speaker diarization support |
| Analysis | `mistral-large-latest` | User prompt-driven restructuring |
| Speaker ID | `mistral-small-2506` | Lightweight speaker identification |
| Chat | `mistral-large-latest` | Multi-turn conversation on transcript |
| Speech reformulation | `mistral-large-latest` | Converts analysis to natural oral text (for TTS) |

**Audio Chunking** (long files):
- `AudioChunkingService` splits files exceeding duration threshold
- Diarization disabled during chunked processing
- Chunks processed sequentially, results merged

**Cost Tracking**:
- `chatCostAccumulated` - Tokens used for chat interactions on an audio
- `ttsCostAccumulated` - Characters billed for TTS generation

### Transcription Versioning

**Overview**: Full version history for transcription edits with diff comparison and restore capability.

**Backend Components**:
- **Model**: `backend/app/models/transcription_version.ts`
- **Service**: `backend/app/services/transcription_version_service.ts`

**API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audios/:id/transcription/history` | Get version history |
| POST | `/audios/:id/transcription/restore/:versionId` | Restore a version |

**Frontend Components**:
- `workshop/VersionHistoryModal.vue` - Browse version list
- `workshop/VersionDiffModal.vue` - Side-by-side diff comparison

### Audio Sharing

**Overview**: Share audio transcriptions via public UUID-based links.

**Backend Components**:
- **Model**: `backend/app/models/audio_share.ts`
- **Controller**: `backend/app/controllers/audio_shares_controller.ts` (authenticated)
- **Public Controller**: `backend/app/controllers/shared_audio_controller.ts` (public access)
- **Policy**: `backend/app/policies/audio_share_policy.ts`

**Frontend**:
- `workshop/ShareModal.vue` - Create/manage share links
- `/shared/[identifier].vue` - Public shared audio page
- `workshop/SharedExportDropdown.vue` - Export from shared view

### Chat on Transcription

**Overview**: Multi-turn AI conversation about transcription content using Mistral large.

**API Endpoint**: `POST /audios/:id/chat`

**Frontend Components**:
- `workshop/TranscriptChat.vue` - Chat UI
- **Composable**: `useTranscriptChat.ts` - Message state, send/clear actions

**Credits**: Each chat message costs credits, deducted automatically. Credits store refreshed after each message.

### Text-to-Speech (TTS)

**Overview**: Generate spoken audio from analysis text using Inworld AI TTS API.

**Backend**: `backend/app/services/tts_service.ts`
- Provider: Inworld AI (`https://api.inworld.ai/tts/v1/voice:stream`)
- Text chunked to max 1900 chars, French-aware sentence splitting
- Streams audio directly to HTTP response
- Default voice: 'Alain', rate 1.25, temperature 1.15
- Cost tracked in `ttsCostAccumulated`

**Frontend**: `workshop/AnalysisTtsPlayer.vue` - Audio playback for generated speech

### Prompt System

**Overview**: Users can create, organize, and reuse custom prompts for audio analysis.

**Backend Components**:
- **Models**: `prompt.ts`, `prompt_category.ts`
- **Controllers**: `prompts_controller.ts`, `prompt_categories_controller.ts`
- **Policies**: `prompt_policy.ts`, `prompt_category_policy.ts`
- **Service**: `default_prompts_service.ts` - Seeds default prompts

**Frontend**:
- Page: `/dashboard/prompts.vue`
- Components: `prompt/CategoryManager.vue`, `prompt/CategoryTabs.vue`, `prompt/PromptCard.vue`, `prompt/PromptForm.vue`, `prompt/PromptQuickSelect.vue`
- Store: `prompts.ts` (Pinia)

### Export System

**Overview**: Generate professional PDF and Word documents from audio analyses.

**Backend Services**:
- `pdf_generator_service.ts` - PDF generation via pdfkit
- `docx_generator_service.ts` - Word document generation via docx
- `export_service.ts` - Export orchestration

**Frontend**: `workshop/ExportDropdown.vue` - Format selection dropdown

### Organization Status Management

**Statuses**: `active`, `suspended`, `deleted`

**Reseller can**:
- Suspend organizations (blocks access, shows `organization-unavailable` page)
- Restore suspended/soft-deleted organizations
- Delete organizations (soft delete)

**Frontend Components**:
- `reseller/OrganizationSuspendModal.vue`
- `reseller/OrganizationRestoreModal.vue`
- `reseller/OrganizationDeleteModal.vue`
- `reseller/OrganizationStatusBadge.vue`

### Role-Based Access Control (RBAC)

**System-Level Access** (based on `user.roleType`):
| Role | Routes | Middleware |
|------|--------|------------|
| Super Admin | `/admin/*` | `superAdmin` middleware |
| Reseller Admin | `/reseller/*` | `reseller` middleware |
| Organization User | `/dashboard/*` | `auth` middleware |

**Frontend Permissions** (`useSettingsPermissions` composable):
```typescript
canAccessOrganization  // Owner only
canManageMembers       // Owner + Administrator
```

**Backend Policies** (`MemberPolicy`):
- `manageMember()`: Owner can manage anyone; Admin can only manage Members
- `changeRole()`: Owner can change any role (except to Owner); Admin can only change Members
- `deleteMember()`: Same rules as `manageMember()`

**Settings Page Access (Organization Users)**:
| Page | Access |
|------|--------|
| `/dashboard/settings/organization` | Owner only |
| `/dashboard/settings/members` | Owner + Administrator |
| `/dashboard/settings/privacy` | All authenticated users |
| `/dashboard/credits` | All authenticated users |
| `/dashboard/prompts` | All authenticated users |

**Admin Page Access (Super Admin)**:
| Page | Access |
|------|--------|
| `/admin` | Dashboard with global stats |
| `/admin/resellers` | Manage resellers |
| `/admin/resellers/create` | Create new reseller |
| `/admin/resellers/:id` | Reseller details & credits |

**Reseller Page Access (Reseller Admin)**:
| Page | Access |
|------|--------|
| `/reseller` | Dashboard |
| `/reseller/profile` | Reseller profile |
| `/reseller/credits` | Credit balance & transactions |
| `/reseller/organizations` | Manage client organizations |
| `/reseller/organizations/create` | Create new organization |
| `/reseller/organizations/:id` | Organization details & subscription |
| `/reseller/organizations/:id/users` | Manage organization users |
| `/reseller/organizations/:id/credits` | Distribute credits |

### Internationalization (i18n)

- **Auto-detection**: Middleware `detect_user_locale_middleware.ts` reads `Accept-Language` header
- **Supported Languages**: French (default) and English
- **Frontend Strategy**: `prefix_and_default` (routes get language prefix e.g. `/fr/dashboard`)
- **Translation Files (Backend)**: Located in `backend/resources/lang/{locale}/`
  - `messages.json`: Application messages (auth, errors, success messages)
  - `emails.json`: Email content and subjects
  - `validation.json`: VineJS validation error messages
  - `notifications.json`: In-app notification titles and messages
- **Translation Files (Frontend)**: Located in `frontend/locales/` (`fr.json`, `en.json`)
- **Usage in Controllers**: Access via `i18n` from HttpContext: `i18n.t('messages.auth.invalid_credentials')`
- **Usage in Templates**: Pass `i18n` to Edge templates and use: `{{ i18n.t('emails.verification.subject') }}`
- **Validation Integration**: VineJS automatically uses i18n messages via `start/validator.ts`
- **Critical Rule**: ALWAYS use `i18n.t()` for user-facing messages, never hardcode strings

### Frontend Architecture (Nuxt 4 Structure)

- **New Directory**: Everything in `frontend/app/` instead of root
- **Layouts** (5): `app.vue` (authenticated), `admin.vue`, `auth.vue`, `default.vue` (public), `reseller.vue`
- **Pages**: `app/pages/` with file-based routing
- **Components**: `app/components/` organized by domain (`audio/`, `admin/`, `credits/`, `Library/`, `prompt/`, `reseller/`, `settings/`, `workshop/`)
- **Composables** (25): `app/composables/` for reusable composition functions
- **Stores** (9 Pinia stores): `app/stores/` - `auth`, `audio`, `config`, `creditRequestsStore`, `creditsStore`, `gdpr`, `organization`, `prompts`, `theme`
- **Types**: `app/types/` - TypeScript type definitions per domain
- **Middleware** (5): `app/middleware/` - `admin`, `auth`, `organization-status`, `pending-deletion`, `reseller`
- **Plugins** (2): `app/plugins/` - `auth.ts`, `config.client.ts`
- **Utils**: `app/utils/` - `audio.ts`, `errors.ts`, `index.ts`
- **Assets**: `app/assets/css/main.css` for global styles

### API Communication Pattern

- **Critical Rule**: ALWAYS use `useApi()` composable for API calls, NEVER use `$fetch` directly
- **Automatic i18n**: `useApi()` automatically adds `Accept-Language` header based on current locale
- **Reactive**: Header updates when user changes language during session
- **Location**: `frontend/app/composables/useApi.ts`

**Usage**:
```typescript
// In components/pages - Public API calls
const api = useApi()
const data = await api('/endpoint', {
  method: 'POST',
  body: {...}
})

// For authenticated requests
const { authenticatedFetch } = useAuth()
const data = await authenticatedFetch('/protected-endpoint')
```

**Why not `$fetch` directly?**
- Missing automatic `Accept-Language` header
- Not reactive to locale changes
- Backend requires locale for i18n responses
- Inconsistent with project patterns

### Backend Architecture (AdonisJS)

- **Controllers**: Thin controllers in `app/controllers/`:
  - Core: `AuthController`, `UsersController`, `OrganizationsController`, `MembersController`, `InvitationsController`, `AudiosController`, `AudioController`, `AudioSharesController`, `SharedAudioController`, `TranscriptionsController`, `PromptsController`, `PromptCategoriesController`, `CreditsController`, `CreditRequestsController`, `NotificationsController`, `GdprController`, `ContactController`, `ConfigController`
  - Admin: `app/controllers/admin/` - `ResellersController`, `ResellerCreditsController`, `AdminStatsController`
  - Reseller: `app/controllers/reseller/` - `ResellerProfileController`, `ResellerCreditsController`, `ResellerOrganizationsController`, `ResellerUsersController`, `ResellerSubscriptionsController`, `ResellerCreditRequestsController`, `ResellerNotificationsController`
- **Validators** (16): VineJS schemas in `app/validators/` - always validate user input
- **Models** (20): Lucid models in `app/models/` - User, Organization, OrganizationUser, Reseller, ResellerTransaction, CreditTransaction, UserCredit, UserCreditTransaction, CreditRequest, Notification, Audio, Transcription, TranscriptionVersion, Prompt, PromptCategory, Document, Template, AudioShare, DeletionRequest, Invitation
- **Services** (18): Business logic in `app/services/`:
  - AI: `MistralService` (transcription, analysis, chat, speaker ID), `TtsService` (Inworld AI TTS)
  - Audio: `AudioChunkingService`, `AudioConverterService`
  - Credits: `CreditService`, `CreditRequestService`
  - Export: `ExportService`, `PdfGeneratorService`, `DocxGeneratorService`
  - Storage: `StorageService`, `QueueService`
  - Notifications: `NotificationService`
  - GDPR: `GdprService`, `GdprExportService`
  - Other: `TranscriptionVersionService`, `ShareService`, `DefaultPromptsService`, `BusinessSectorService`
- **Policies** (14): Bouncer policies in `app/policies/` - OrganizationPolicy, MemberPolicy, InvitationPolicy, AudioPolicy, AudioSharePolicy, CreditPolicy, CreditRequestPolicy, NotificationPolicy, PromptPolicy, PromptCategoryPolicy, ResellerPolicy, ResellerOrganizationPolicy, GdprPolicy
- **Middleware** (9): Custom middleware in `app/middleware/`:
  - `auth` - Token validation
  - `superAdmin` - Super Admin access check
  - `reseller` - Reseller Admin access check
  - `pendingDeletion` - Block writes during GDPR deletion
  - `organizationStatus` - Block access for suspended/deleted organizations
  - `detect_user_locale` - i18n detection
  - `initialize_bouncer` - Bouncer setup
  - `container_bindings` - Dependency injection
  - `force_json_response` - JSON response formatting
- **Jobs** (7): BullMQ jobs in `app/jobs/` - TranscriptionJob, DeletionJob, DeletionReminderJob, SubscriptionRenewalJob, NotificationCleanupJob, CreditRequestCleanupJob, AutoRefillCheckJob
- **Commands** (7): Ace commands in `commands/` - gdpr_scheduler, run_subscription_renewals, cleanup_credit_requests, cleanup_notifications, check_auto_refill, backfill_initial_versions, migrate_opus_to_aac
- **Import Aliases**: Use `#controllers/*`, `#models/*`, `#validators/*`, etc. (defined in package.json)

### Job Queue System (BullMQ + Redis)

**Queues**:
| Queue | Name | Concurrency | Purpose |
|-------|------|-------------|---------|
| transcription | `audio-transcription` | 2 | Audio processing (transcription + analysis) |
| gdprDeletion | `gdpr-deletion` | 1 | GDPR data deletion |
| gdprReminder | `gdpr-reminder` | 1 | GDPR reminder emails |
| subscriptionRenewal | `subscription-renewal` | 2 | Recurring credit distribution |

**Configuration**: 2 retry attempts, exponential backoff (30s initial delay for Mistral 429 rate limits)

**Workers**: Start automatically with backend server (`start/worker.ts`), graceful shutdown on SIGTERM/SIGINT.

### CRON Jobs (Production)

| Schedule | Command | Description |
|----------|---------|-------------|
| 0:05 daily | `node ace subscription:renew` | Process subscription renewals |
| 2:00 daily | `node ace gdpr:scheduler` | GDPR deletions and reminders |
| 3:00 weekly (Sun) | `node ace cleanup:credit-requests` | Remove processed requests > 90 days |
| 3:00 daily | `node ace cleanup:notifications` | Remove read notifications > 30 days |
| 18:00 daily | `node ace check:auto-refill` | Warn owners of insufficient auto-refill |

**Docker config**: `docker/scheduler/crontab`

## Database Schema

### Core Tables

- **resellers**: Reseller entities with `name`, `email`, `company`, `siret`, `creditBalance`, `isActive`
- **reseller_transactions**: Reseller credit transactions (`resellerId`, `amount`, `type` including `subscription_renewal`, `targetOrganizationId`, `performedByUserId` nullable)
- **users**: Users with `currentOrganizationId`, `isSuperAdmin` (boolean), `resellerId` (FK for reseller admins)
- **organizations**: Organization entities with `name`, `logo`, `email`, `resellerId` (FK), `credits`, `creditMode` ('shared'|'individual'), `status` ('active'|'suspended'|'deleted'), `deletedAt`, `suspendedAt`, `suspensionReason`, `autoRefillEnabled`, `autoRefillAmount`, `autoRefillDay`, `subscriptionEnabled`, `monthlyCreditsTarget`, `renewalType`, `renewalDay`, subscription lifecycle timestamps
- **organization_user**: Pivot table linking users to organizations with `role` per organization (1=Owner, 2=Administrator, 3=Member)
- **invitations**: Pending invitations with `identifier` (UUID), `organizationId`, `role`, `expiresAt`
- **audios**: Audio files with `title`, `fileName`, `filePath`, `fileSize`, `mimeType`, `duration`, `status` (pending/processing/completed/failed), `errorMessage`, `currentJobId`, `isChunked`, `chatCostAccumulated`, `ttsCostAccumulated`
- **transcriptions**: Audio transcription data with version tracking fields
- **transcription_versions**: Version history for transcription edits with `prompt` field
- **prompts**: Custom user prompts (`userId`, `organizationId`, `categoryId`, `title`, `content`, `order`)
- **prompt_categories**: Prompt categories (`userId`, `organizationId`, `name`, `order`)
- **documents**: Generated documents from audio analysis
- **templates**: Document templates
- **audio_shares**: Audio sharing records with UUID `identifier` for public links
- **credit_transactions**: Credit usage history (`userId` nullable, `organizationId`, `amount`, `balanceAfter`, `type`, `audioId`)
- **user_credits**: Per-user credit balances for individual mode (`userId`, `organizationId`, `balance`, `creditCap`, `autoRefillEnabled`, `autoRefillAmount`, `autoRefillDay`, `lastRefillAt`)
- **user_credit_transactions**: User-level credit transaction history
- **credit_requests**: Credit requests (`requesterId`, `organizationId`, `targetType` ('owner'|'reseller'), `amount`, `message`, `status`, `processedById`, `processedAt`, `responseMessage`)
- **notifications**: In-app notifications (`userId`, `organizationId`, `type`, `title`, `message`, `data` JSON, `isRead`, `readAt`)
- **deletion_requests**: GDPR deletion tracking with `scheduledFor`, reminder flags
- **access_tokens**: API authentication tokens managed by AdonisJS Auth

### Key Relationships

- Reseller -> Organizations (has many)
- Reseller -> ResellerTransactions (has many)
- Reseller -> Admin Users (has many via `user.resellerId`)
- User <-> Organization (many-to-many via `organization_user` pivot)
- User -> Current Organization (belongs to via `currentOrganizationId`)
- User -> Reseller (belongs to via `resellerId` for reseller admins)
- User -> UserCredits (has many, one per organization in individual mode)
- Organization -> Reseller (belongs to via `resellerId`)
- Organization -> CreditTransactions (has many)
- Organization -> UserCredits (has many, for individual credit mode)
- Organization -> Audios (has many)
- Organization -> Prompts (has many)
- Organization -> PromptCategories (has many)
- UserCredit -> UserCreditTransactions (has many)
- Audio -> Organization (belongs to, multi-tenant)
- Audio -> User (belongs to)
- Audio -> Transcription (has one)
- Audio -> Documents (has many)
- Audio -> AudioShares (has many)
- Transcription -> TranscriptionVersions (has many)
- Prompt -> PromptCategory (belongs to)
- Invitation -> Organization (many-to-one)
- Notification -> User (belongs to)
- Notification -> Organization (belongs to, multi-tenant)
- CreditRequest -> User (requester, belongs to)
- CreditRequest -> Organization (belongs to, multi-tenant)
- CreditRequest -> User (processedBy, belongs to)
- Access Token -> User (tokenable polymorphic)

### User Roles

**System-Level Roles** (determined by `user.roleType` getter):
```typescript
export type UserRoleType = 'super_admin' | 'reseller_admin' | 'organization_user'
// - isSuperAdmin = true -> 'super_admin'
// - resellerId != null -> 'reseller_admin'
// - otherwise -> 'organization_user'
```

**Organization-Level Roles** (per organization in pivot table):
```typescript
export enum UserRole {
  Owner = 1,         // Full control of organization
  Administrator = 2, // Can manage users and settings
  Member = 3         // Basic access to organization resources
}
```

## Configuration & Environment

### Backend `.env` Requirements

```bash
# Application
APP_KEY=                    # Generate with: node ace generate:key
PORT=3333
HOST=localhost
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_DATABASE=novika_db

# Email (Resend)
RESEND_API_KEY=            # From resend.com for emails

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Mistral AI
MISTRAL_API_KEY=           # From mistral.ai for transcription/analysis/chat

# Inworld TTS
INWORLD_API_KEY=           # From inworld.ai for text-to-speech

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# File Storage
DRIVE_DISK=local           # 'local' or 's3'
```

### Frontend `.env` Requirements

```bash
API_URL=http://localhost:3333
```

## Code Style & Conventions

### TypeScript

- Strict mode enabled in both frontend and backend
- Use type imports: `import type { User } from '#models/user'`
- AdonisJS import aliases for backend paths

### Formatting

- **Backend**: AdonisJS Prettier config (`@adonisjs/prettier-config`)
- **Frontend**: Custom Prettier with Tailwind plugin
- Run `pnpm format` to auto-format

## Common Pitfalls

### Public Signup Disabled

- **IMPORTANT**: Public registration is disabled - all users are created by Reseller admins
- Don't expect `/signup` endpoint to exist (the page is a redirect stub)
- Users receive magic link to complete account setup after being created by reseller

### Credits at Organization Level (Not User Level)

```typescript
// Wrong - Old user-level credits
if (!user.hasEnoughCredits(amount)) { ... }

// Correct - Organization-level credits
const org = await Organization.findOrFail(user.currentOrganizationId)
if (!org.hasEnoughCredits(amount)) { ... }
```

### Reseller Scope Isolation

- **Always** verify organization belongs to reseller before operations in `/reseller/*` routes
- Use `ctx.reseller` (attached by middleware) to check scope

```typescript
// Correct - Verify organization belongs to reseller
const org = await Organization.query()
  .where('id', params.id)
  .where('resellerId', ctx.reseller!.id)
  .firstOrFail()
```

### Multi-Tenant Issues

- **NEVER** fetch data without filtering by `currentOrganizationId` (user's active organization)
- Always use `user.hasOrganization(orgId)` before accessing organization data
- Always use `user.isOwnerOf(orgId)` for owner-only operations
- Always use Bouncer policies to check tenant access
- Test organization isolation in all new features
- Remember: Users can belong to multiple organizations

### Current Organization Context

- **ALWAYS** ensure user has `currentOrganizationId` set before accessing organization-scoped data
- Handle case where user might not have a current organization selected
- Organization switching updates `currentOrganizationId` - verify membership first

### API Token Management

- Tokens are in `access_tokens` table
- Always invalidate tokens on logout
- Check token validity with `GET /check-token`

### Nuxt 4 Specifics

- Auto-imports work from `app/` directory
- Use `defineNuxtConfig` with `compatibilityDate`
- Layouts must be in `app/layouts/`
- Components auto-imported from `app/components/`

### Internationalization (i18n)

- **NEVER** hardcode user-facing messages in controllers or templates
- Always use `i18n.t('category.key')` for all messages
- When adding new messages, update BOTH `en/` and `fr/` translation files
- Pass `i18n` to Edge templates when rendering emails: `htmlView('emails/template', { i18n })`
- Test with different `Accept-Language` headers to verify translations work
- Translation keys follow pattern: `{file}.{category}.{message}` (e.g., `messages.auth.invalid_credentials`)

### Credits System

- **Credit Modes**: Organizations can use `shared` (pool) or `individual` (per-user) credit modes
- **Credit Check**: Use `CreditService.hasEnoughCreditsForProcessing(user, org)` - handles both modes automatically
- **Credit Deduction**: Use `CreditService.deductForAudioProcessing(...)` - deducts from correct source based on mode
- **Insufficient Credits**: Returns error with `code: 'INSUFFICIENT_CREDITS'` when credits are insufficient
- **Frontend Handling**: Credits page at `/dashboard/credits` shows:
  - **Owner**: Organization pool + all member transactions
  - **Member (shared mode)**: Organization pool balance
  - **Member (individual mode)**: Personal balance from `user_credits`
- **Auto-Refill**: Individual mode supports per-user auto-refill config (monthly top-up to target balance)
- **Reseller Credit Distribution**: Resellers must have enough credits in their pool before distributing to organizations

### Audio Processing

- **Max file size**: 512MB
- **Supported formats**: 27+ formats (mp3, wav, m4a, mp4, ogg, flac, opus, webm, aac, wma, aiff, amr, etc.) - all converted to AAC via ffmpeg
- **MIME validation**: Any type starting with `audio/`
- **Long files**: Automatically chunked via `AudioChunkingService` with diarization disabled during chunking
- **Job retry**: 2 attempts with 30s exponential backoff (handles Mistral 429 rate limits)
