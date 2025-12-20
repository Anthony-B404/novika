# Roadmap MVP Alexia - Audio vers Documents Structurés

> **Dernière mise à jour**: Décembre 2024
> **Durée estimée**: 6-8 semaines

## Vue d'ensemble

### Ce qui existe déjà (fondations solides)
- **Auth complète**: Magic links, OAuth Google, vérification email
- **Multi-tenant**: Isolation par organisation, switch entre orgas
- **RBAC**: 3 rôles (Owner, Admin, Member) avec policies
- **Billing**: Lemon Squeezy, trial 14 jours, gestion abonnements
- **i18n**: Français + Anglais avec détection auto
- **Dashboard**: Layout, navigation, settings, membres

### Ce qu'il faut construire (coeur MVP)
1. **Atelier Audio** - Upload/enregistrement
2. **Transcription IA** - Voxtral (Mistral AI)
3. **Templates** - Modèles de documents métier
4. **Transformation** - Audio → Document structuré
5. **Export** - PDF/Word

---

## Stack Technique

| Composant | Technologie | Notes |
|-----------|-------------|-------|
| **Transcription** | Voxtral (Mistral AI) | Européen, excellent FR, GDPR-friendly |
| **Stockage** | Local (MVP) → R2 (prod) | Fichiers dans `storage/uploads` |
| **Queue** | Redis + Bull | Traitement asynchrone |
| **PDF** | Puppeteer ou pdfmake | HTML → PDF |
| **Word** | docx npm | Génération .docx |

## Décisions MVP

- **Transcription**: Voxtral (Mistral AI) - modèle européen, excellent support français
- **Stockage**: Local pour dev, migration R2/S3 en production
- **Templates**: Uniquement prédéfinis (Médical, Juridique, Commercial, Général)
- **Trial**: Limité à 3 audios, 30 min max par audio
- **Processing**: Asynchrone avec queue Redis

---

## Phase 1: Infrastructure Audio (Semaine 1-2)

### 1.1 Configuration Services
**Backend**
- [ ] Créer dossier `storage/uploads/audios` + `storage/uploads/documents`
- [ ] Créer compte Mistral AI + API key (console.mistral.ai)
- [ ] Configurer variables d'env: `MISTRAL_API_KEY`, `REDIS_HOST`, `REDIS_PORT`
- [ ] Setup Redis local (dev) + config Bull queue

**Fichiers à créer/modifier**:
```
backend/.env                          # Nouvelles vars
backend/config/drive.ts               # Config stockage local
backend/config/queue.ts               # Config Bull/Redis
```

### 1.2 Modèles de Données
**Migrations à créer**:
```sql
-- audios
id, organization_id, user_id, title, file_name, file_size,
duration, status (pending|processing|completed|failed),
r2_path, error_message, created_at, updated_at

-- transcriptions
id, audio_id, raw_text, language (fr|en),
timestamps (JSON), confidence, created_at

-- templates
id, organization_id, name, description, category (medical|legal|commercial|custom),
schema (JSON - définition des champs), is_default, created_by, created_at, updated_at

-- documents
id, audio_id, transcription_id, template_id,
title, content (JSON), status, r2_path, format (pdf|docx),
created_at
```

**Fichiers à créer**:
```
backend/database/migrations/XXXX_create_audios_table.ts
backend/database/migrations/XXXX_create_transcriptions_table.ts
backend/database/migrations/XXXX_create_templates_table.ts
backend/database/migrations/XXXX_create_documents_table.ts
backend/app/models/audio.ts
backend/app/models/transcription.ts
backend/app/models/template.ts
backend/app/models/document.ts
```

### 1.3 Service de Stockage Local
**Fichiers à créer**:
```
backend/app/services/storage_service.ts
  - upload(file, path): Promise<string>  # Retourne chemin local
  - download(path): Promise<Buffer>
  - delete(path): Promise<void>
  - getPublicUrl(path): Promise<string>
```

---

## Phase 2: Upload Audio (Semaine 2-3)

### 2.1 API Upload
**Endpoints à créer**:
```
POST   /api/audios/upload         # Upload fichier audio
GET    /api/audios                # Liste des audios (orga)
GET    /api/audios/:id            # Détails audio
DELETE /api/audios/:id            # Supprimer audio
```

**Fichiers à créer**:
```
backend/app/controllers/audios_controller.ts
backend/app/validators/audio_validator.ts
backend/app/policies/audio_policy.ts
backend/start/routes.ts           # Ajouter routes
```

**Validation**:
- Formats acceptés: MP3, WAV, M4A, WEBM
- Taille max: 100MB
- Durée max: 2 heures

### 2.2 Frontend Upload
**Pages à créer**:
```
frontend/app/pages/dashboard/workshop/index.vue    # Page principale
frontend/app/pages/dashboard/workshop/[id].vue     # Détail audio
```

**Composants à créer**:
```
frontend/app/components/workshop/
  - AudioUploadZone.vue           # Drag & drop
  - AudioRecorder.vue             # Enregistrement micro
  - AudioList.vue                 # Liste des audios
  - AudioCard.vue                 # Carte audio individuelle
  - AudioPlayer.vue               # Lecteur audio
  - ProcessingStatus.vue          # Statut traitement
```

**Composables à créer**:
```
frontend/app/composables/useAudioUpload.ts
frontend/app/composables/useAudioRecorder.ts
frontend/app/stores/audio.ts
frontend/app/types/audio.ts
```

---

## Phase 3: Transcription IA (Semaine 3-4)

### 3.1 Service Voxtral (Mistral AI)
**Fichiers à créer**:
```
backend/app/services/voxtral_service.ts
  - transcribe(audioPath): Promise<TranscriptionResult>
  - getLanguage(audioPath): Promise<string>
```

**Intégration**:
- Appel API Mistral AI (Voxtral)
- Gestion des fichiers volumineux
- Détection automatique langue (excellent FR)
- Extraction timestamps (optionnel)

**Avantages Voxtral**:
- Modèle européen (conformité GDPR)
- Excellent support français natif
- API simple et moderne
- Pricing compétitif

### 3.2 Queue de Transcription
**Fichiers à créer**:
```
backend/app/jobs/transcription_job.ts
backend/app/listeners/audio_uploaded.ts
backend/commands/transcribe_worker.ts    # Worker background
```

**Flow**:
1. Upload audio → Créer record `pending`
2. Emit event `audio:uploaded`
3. Listener enqueue job Bull
4. Worker process job
5. Appel Voxtral API
6. Sauvegarde transcription
7. Update status `completed`
8. (Optionnel) Email notification

### 3.3 Frontend Status
**Composants à modifier**:
```
frontend/app/components/workshop/ProcessingStatus.vue
  - Polling status toutes les 3 secondes
  - Progress bar animée
  - États: pending, processing, completed, failed
```

---

## Phase 4: Templates Prédéfinis (Semaine 4-5)

### 4.1 Templates par Défaut (MVP)
**4 catégories avec 2 templates chacune**:

1. **Médical**
   - Compte-rendu de consultation
   - Lettre de liaison

2. **Juridique**
   - Synthèse juridique
   - Note de réunion client

3. **Commercial**
   - Compte-rendu RDV client
   - Liste d'actions commerciales

4. **Général**
   - Compte-rendu réunion
   - Notes libres structurées

**Structure Template (JSON)**:
```json
{
  "name": "Compte-rendu Médical",
  "category": "medical",
  "sections": [
    {"id": "patient", "label": "Informations Patient", "type": "text"},
    {"id": "motif", "label": "Motif de consultation", "type": "text"},
    {"id": "examen", "label": "Examen clinique", "type": "textarea"},
    {"id": "diagnostic", "label": "Diagnostic", "type": "text"},
    {"id": "traitement", "label": "Traitement proposé", "type": "list"},
    {"id": "suivi", "label": "Suivi recommandé", "type": "text"}
  ]
}
```

### 4.2 API Templates (lecture seule MVP)
**Endpoints**:
```
GET /api/templates             # Liste templates prédéfinis
GET /api/templates/:id         # Détail template
```

**Fichiers à créer**:
```
backend/app/controllers/templates_controller.ts
backend/app/models/template.ts
backend/database/seeders/default_templates_seeder.ts
```

### 4.3 Frontend Sélection Template
**Pas de page dédiée** - Intégré dans le workflow de transformation

**Composant à créer**:
```
frontend/app/components/workshop/TemplateSelector.vue
  - Grille de templates par catégorie
  - Preview du template sélectionné
  - Description des sections
```

---

## Phase 5: Transformation (Semaine 5-6)

### 5.1 Service de Transformation IA
**Fichiers à créer**:
```
backend/app/services/transformation_service.ts
  - transform(transcription, template): Promise<Document>
  - extractSections(text, schema): Promise<SectionData>
```

**Logique**:
1. Prendre transcription brute
2. Appliquer template sélectionné
3. Utiliser LLM pour extraire/structurer sections
4. Générer document structuré

**Prompt Engineering**:
```
Tu es un assistant de rédaction professionnelle.
Transcription: {transcription}
Template: {template_schema}
Génère un document structuré selon le template fourni.
Extrais les informations pertinentes de la transcription.
```

### 5.2 API Transformation
**Endpoints à créer**:
```
POST   /api/audios/:id/transform       # Lancer transformation
  body: { templateId: number }
GET    /api/audios/:id/transform/status
GET    /api/documents/:id              # Récupérer document généré
```

### 5.3 Frontend Transformation
**Page à modifier**:
```
frontend/app/pages/dashboard/workshop/[id].vue
  - Sélecteur de template
  - Bouton "Transformer"
  - Affichage résultat
  - Édition manuelle possible
```

**Composants à créer**:
```
frontend/app/components/workshop/
  - TemplateSelector.vue
  - TransformButton.vue
  - DocumentEditor.vue           # Édition du résultat
  - DocumentPreview.vue
```

---

## Phase 6: Export Documents (Semaine 6-7)

### 6.1 Génération PDF
**Fichiers à créer**:
```
backend/app/services/pdf_service.ts
  - generate(document, template): Promise<Buffer>
```

**Technologies**:
- Puppeteer pour rendu HTML → PDF
- Template Edge.js pour mise en page
- Styles CSS professionnels

### 6.2 Génération Word
**Fichiers à créer**:
```
backend/app/services/docx_service.ts
  - generate(document, template): Promise<Buffer>
```

**Technologies**:
- Package `docx` npm
- Styles Word professionnels
- Métadonnées document

### 6.3 API Export
**Endpoints à créer**:
```
GET /api/documents/:id/export?format=pdf
GET /api/documents/:id/export?format=docx
```

### 6.4 Frontend Export
**Composants à créer**:
```
frontend/app/components/workshop/
  - ExportButton.vue
  - ExportFormatModal.vue
```

---

## Phase 7: Bibliothèque Documents (Semaine 7)

### 7.1 API Documents
**Endpoints à créer**:
```
GET    /api/documents             # Liste documents (orga)
DELETE /api/documents/:id         # Supprimer document
```

### 7.2 Frontend Bibliothèque
**Pages à créer**:
```
frontend/app/pages/dashboard/documents/index.vue
frontend/app/pages/dashboard/documents/[id].vue
```

**Composants à créer**:
```
frontend/app/components/documents/
  - DocumentList.vue
  - DocumentCard.vue
  - DocumentFilters.vue          # Filtres par date, template, etc.
```

---

## Phase 8: Polish & UX (Semaine 7-8)

### 8.1 Navigation
**Modifier sidebar**:
```
frontend/app/layouts/default.vue
  - Ajouter: Atelier Audio (workshop)
  - Ajouter: Mes Documents (documents)
  - Ajouter: Templates (templates) - Owner/Admin seulement
```

### 8.2 Traductions i18n
**Fichiers à modifier**:
```
backend/resources/lang/fr/messages.json
backend/resources/lang/en/messages.json
frontend/locales/fr.json
frontend/locales/en.json
```

### 8.3 Onboarding
- Tour guidé première utilisation
- Template par défaut selon métier utilisateur
- Audio de démo pour tester

### 8.4 Notifications
- Email quand transcription terminée
- Email quand document prêt
- Toast in-app pour statuts

---

## Estimation Effort

| Phase | Durée | Backend | Frontend |
|-------|-------|---------|----------|
| 1. Infrastructure | 3-4 jours | ███░░ | ░░░░░ |
| 2. Upload Audio | 4-5 jours | ██░░░ | ███░░ |
| 3. Transcription | 5-6 jours | ████░ | █░░░░ |
| 4. Templates | 5-6 jours | ██░░░ | ███░░ |
| 5. Transformation | 6-7 jours | ████░ | ██░░░ |
| 6. Export | 4-5 jours | ███░░ | █░░░░ |
| 7. Bibliothèque | 3-4 jours | █░░░░ | ███░░ |
| 8. Polish | 3-4 jours | █░░░░ | ██░░░ |

**Total estimé**: 6-8 semaines pour 1 développeur full-stack

---

## Limites Trial (MVP)

| Limite | Trial (14 jours) | Abonnement payant |
|--------|------------------|-------------------|
| **Audios max** | 3 audios | Illimité |
| **Durée max/audio** | 30 minutes | 2 heures |
| **Templates** | Tous | Tous |
| **Export PDF/Word** | Oui | Oui |

**Implémentation**:
- Middleware `AudioQuotaMiddleware` vérifie limites avant upload
- Compteur audios dans modèle `Audio` par utilisateur
- Validation durée côté backend après upload

---

## Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Coût API Voxtral | Moyen | Limites trial, monitoring usage |
| Fichiers volumineux | Moyen | Limite 100MB, chunking si nécessaire |
| Qualité transcription | Haut | Édition manuelle post-transcription |
| Temps transformation | Moyen | Queue async + polling status |
| Multi-langue | Faible | Voxtral excellent en FR/EN natif |

---

## Prochaines Étapes

1. **Créer compte Mistral AI** - Obtenir API key sur console.mistral.ai
2. **Setup Redis local** - `docker run -d -p 6379:6379 redis`
3. **Créer migrations** - Tables audios, transcriptions, templates, documents
4. **Créer service storage local** - Upload/download depuis `storage/uploads`
5. **Créer endpoint upload** - POST /api/audios/upload

---

## Fichiers Critiques à Créer

### Backend
```
backend/app/models/audio.ts
backend/app/models/transcription.ts
backend/app/models/template.ts
backend/app/models/document.ts
backend/app/controllers/audios_controller.ts
backend/app/controllers/templates_controller.ts
backend/app/controllers/documents_controller.ts
backend/app/services/storage_service.ts
backend/app/services/voxtral_service.ts
backend/app/services/transformation_service.ts
backend/app/services/pdf_service.ts
backend/app/jobs/transcription_job.ts
backend/commands/transcribe_worker.ts
```

### Frontend
```
frontend/app/pages/dashboard/workshop/index.vue
frontend/app/pages/dashboard/workshop/[id].vue
frontend/app/pages/dashboard/documents/index.vue
frontend/app/components/workshop/AudioUploadZone.vue
frontend/app/components/workshop/AudioRecorder.vue
frontend/app/components/workshop/TemplateSelector.vue
frontend/app/components/workshop/DocumentPreview.vue
frontend/app/composables/useAudioUpload.ts
frontend/app/stores/audio.ts
```
