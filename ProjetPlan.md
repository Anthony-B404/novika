# Plan de Projet - Clone Qualiobee (Qualiopii)

## <¯ Objectif Principal
Transformer une application de formulaires existante en un clone complet de Qualiobee, une plateforme SaaS de gestion administrative pour organismes de formation avec conformité Qualiopi.

## =Ê Vue d'ensemble du produit Qualiobee

### Proposition de valeur
**"Votre copilote pour la gestion administrative de vos formations"**
- Simplifier la gestion administrative des organismes de formation
- Garantir la conformité Qualiopi (32 indicateurs)
- Automatiser les processus répétitifs
- Gain de temps : 7 heures en moyenne par session

### Public cible
- Organismes de formation
- Formateurs indépendants  
- Coachs professionnels
- Entrepreneurs dans le domaine de la formation

## <× Architecture Complète des Fonctionnalités Qualiobee

### Module 1: Gestion Administrative

#### 1.1 Génération de documents
- Templates personnalisables avec système de variables
- Duplication et modification de documents
- Bibliothèque de modèles conformes Qualiopi
- Export en PDF

#### 1.2 Planification des sessions
- Calendrier avec vues jour/semaine/mois
- Filtrage avancé (formation, client, formateur, statut)
- Vue complète de la séquence pédagogique
- Gestion des lieux et horaires

#### 1.3 Automatisation des emails
- Templates personnalisables (objet, contenu, BCC)
- Variables dynamiques
- Déclencheurs automatiques (inscription, J-7, J-1, post-formation)
- Marquage automatique comme preuve Qualiopi

#### 1.4 Signatures électroniques
- Intégration pour contrats et conventions
- Suivi des statuts de signature
- Export avec signatures intégrées

#### 1.5 Émargements électroniques
- Génération de QR codes
- Interface mobile pour signature
- Validation automatique des présences
- Export des feuilles d'émargement

#### 1.6 Génération automatique du BPF
- Récupération automatique des données de la période comptable
- 21 règles de cohérence pour détecter les anomalies
- Calculs automatiques avec possibilité de modification manuelle
- Export CSV du BPF

#### 1.7 Espace dédié formateurs
- Droits d'accès personnalisés par formateur
- Dashboard adapté aux sessions assignées
- Accès limité aux documents et apprenants pertinents
- Espace de travail évolutif

#### 1.8 Calendrier des sessions
- Filtrage avancé multicritères
- Visualisation détaillée (participants, formateurs, modules)
- Gestion des feuilles d'émargement par session

### Module 2: Gestion Qualiopi

#### 2.1 Tableau des indicateurs Qualiopi
- Configuration des 32 indicateurs selon le type d'organisme
- Personnalisation via 6 questions spécifiques
- Suivi de l'avancement, corrections et obligations
- Exemples de preuves pour chaque indicateur

#### 2.2 Gestion des preuves
- Ajout simplifié depuis documents Qualiobee ou manuel
- Association preuves-indicateurs
- Versioning et historique
- Marquage direct comme preuve Qualiopi

#### 2.3 Suivi des audits
- Visualisation des audits à venir (blanc, initial, surveillance, renouvellement)
- Historique complet des audits passés
- Dates et organismes certificateurs
- Archivage intelligent post-audit avec toutes les preuves

### Module 3: Gestion Qualité

#### 3.1 Génération de questionnaires
- Éditeur intuitif avec types de questions variés
- Questions pré-remplies satisfaction/recommandation
- Ajout de contenu (texte, images, fichiers)
- Gestion de l'ordre et questions obligatoires
- Templates conformes Qualiopi disponibles

#### 3.2 Analyse avancée des questionnaires
- Filtrage par client, formateur, date, session
- Suivi en temps réel des retours apprenants
- Statistiques automatiques pour certification
- Enrichissement statistique automatique

#### 3.3 Suivi et amélioration continue
- Annotations des réponses aux questionnaires
- Tableau Kanban qualité personnalisable
- Transformation des retours en actions concrètes
- Cartes d'amélioration par drag & drop

#### 3.4 Statistiques globales des sessions
- Calcul automatique des taux de satisfaction/recommandation
- Suivi depuis le tableau de bord selon critères Qualiopi
- Rapports statistiques par session
- Indicateurs de performance pré-configurés

### Module 4: Gestion Commerciale & CRM

#### 4.1 Base de données unifiée
- **Gestion des entreprises** : suivi complet (apprenants, documents, questionnaires, statistiques)
- **Gestion des apprenants** : fiches détaillées avec indicateurs d'engagement
- **Gestion des formateurs** : droits, qualifications, documents, statistiques individuelles

#### 4.2 Import/Export de données
- Import CSV des apprenants avec mapping de colonnes
- Export personnalisé (choix et réorganisation des colonnes)
- Synchronisation avec systèmes externes
- Mise à jour continue du CRM

#### 4.3 Liens d'inscription publics
- Page d'inscription personnalisée
- Inscription pour particuliers ou entreprises
- Notifications email automatiques des nouvelles inscriptions
- Questionnaire intégré pour collecter les informations
- Gestion complète (validation, refus, annulation)
- Présentation du programme et des modules

### Module 5: Gestion Collaborative

#### 5.1 Espace d'échange Beehelp
- Création automatique de groupes par session
- Questions et partage d'idées entre apprenants
- Mise en avant des meilleures solutions
- Favorise l'apprentissage collectif

#### 5.2 Tableau Kanban interactif
- Accessible à tous les apprenants de la session
- Organisation des échanges
- Suivi des actions pendant la formation
- Animation dynamique des formations

#### 5.3 Espace de partage de fichiers
- Support multi-formats (PDF, Word, Excel, audio, vidéo)
- Organisation libre en dossiers
- Accès instantané depuis les groupes de formation
- Archivage organisé pour consultation future

#### 5.4 Documents et questionnaires conformes
- Templates pré-configurés conformes Qualiopi
- Duplication et personnalisation facile
- Marquage simplifié comme preuve
- Réutilisation des modèles

## =Å Roadmap de Développement Détaillée

### Phase 0: Audit et Préparation (Semaines 1-2)

#### Semaine 1: Analyse de l'existant
**Jour 1-2: Audit technique**
- [ ] Analyser l'architecture actuelle de l'app formulaires
- [ ] Identifier les composants réutilisables
- [ ] Lister les dépendances npm/composer
- [ ] Documenter les modèles de données existants
- [ ] Évaluer la qualité du code (dette technique)

**Jour 3-4: Analyse fonctionnelle Qualiobee**
- [ ] Créer un compte test Qualiobee (essai 14 jours)
- [ ] Mapper tous les workflows utilisateur
- [ ] Capturer screenshots de chaque fonctionnalité
- [ ] Analyser l'UX/UI et les patterns de navigation
- [ ] Identifier les fonctionnalités prioritaires pour le MVP

**Jour 5: Documentation et planification**
- [ ] Créer le document d'architecture cible
- [ ] Lister les modules à supprimer/conserver
- [ ] Définir les nouveaux modèles de données
- [ ] Estimer l'effort pour chaque module
- [ ] Prioriser les fonctionnalités MVP

#### Semaine 2: Refonte et Setup
**Jour 1-2: Nettoyage du code**
- [ ] Supprimer les modules formulaires non pertinents
- [ ] Restructurer l'arborescence des dossiers
- [ ] Mettre à jour les dépendances
- [ ] Configurer ESLint/Prettier
- [ ] Nettoyer la base de données

**Jour 3-4: Design System Qualiopii**
- [ ] Définir la charte graphique (couleurs, typographie)
- [ ] Créer les composants UI de base (buttons, cards, forms)
- [ ] Implémenter le layout principal (sidebar, header)
- [ ] Créer les pages de base (login, dashboard, 404)
- [ ] Configurer le responsive design

**Jour 5: Infrastructure Multi-tenant**
- [ ] Configurer PostgreSQL avec schema multi-tenant
- [ ] Implémenter le middleware de tenant isolation
- [ ] Créer les migrations de base
- [ ] Tester l'isolation des données
- [ ] Documenter l'architecture multi-tenant

### Phase 1: Core MVP (Semaines 3-6)

#### Sprint 1: Authentication & Autorisation (Semaine 3-4)

**Backend (AdonisJS)**
- [ ] Modèles: User, Organization, Role, Permission
- [ ] Authentication JWT avec refresh tokens
- [ ] Middleware RBAC (Role-Based Access Control)
- [ ] Endpoints API pour auth (login, register, forgot password)
- [ ] Validation et sanitization des inputs
- [ ] Tests unitaires et d'intégration

**Frontend (Nuxt 3)**
- [ ] Pages: Login, Register, Forgot Password
- [ ] Store Pinia pour authentication
- [ ] Guards de navigation
- [ ] Gestion des tokens et auto-refresh
- [ ] UI de profil utilisateur
- [ ] Tests composants

**Rôles à implémenter:**
- Super Admin (gestion plateforme)
- Admin Organisation (gestion complète organisme)
- Formateur (accès limité aux sessions)
- Apprenant (consultation et participation)

#### Sprint 2: Gestion des Sessions (Semaine 5-6)

**Modèles de données:**
```
- TrainingProgram (programmes de formation)
- TrainingSession (sessions)
- SessionModule (modules pédagogiques)
- SessionParticipant (inscriptions)
- SessionTrainer (assignations formateurs)
- SessionLocation (lieux)
```

**Fonctionnalités:**
- [ ] CRUD complet des programmes de formation
- [ ] CRUD des sessions avec calendrier
- [ ] Gestion des participants (inscription/désinscription)
- [ ] Assignation des formateurs
- [ ] Gestion des lieux et salles
- [ ] Génération automatique des liens d'inscription
- [ ] Dashboard avec widgets de statistiques

### Phase 2: Documents & Signatures (Semaines 7-10)

#### Sprint 3: Moteur de Templates (Semaine 7-8)

**Système de variables:**
- [ ] Parser de variables {{variable}}
- [ ] Variables prédéfinies (organisation, session, participant)
- [ ] Variables personnalisées par organisation
- [ ] Calculs et conditions dans les templates

**Templates à créer:**
- [ ] Convention de formation
- [ ] Programme de formation
- [ ] Contrat de prestation
- [ ] Attestation de présence
- [ ] Certificat de réalisation
- [ ] Convocation
- [ ] Feuille d'émargement

**Éditeur WYSIWYG:**
- [ ] Intégration TipTap ou Quill
- [ ] Insertion de variables via UI
- [ ] Preview en temps réel
- [ ] Sauvegarde de templates personnalisés

#### Sprint 4: Signatures & Émargements (Semaine 9-10)

**Signatures électroniques:**
- [ ] Intégration API Yousign ou DocuSign
- [ ] Workflow de signature (envoi, relance, validation)
- [ ] Stockage sécurisé des documents signés
- [ ] Audit trail des signatures

**Émargements électroniques:**
- [ ] Génération de QR codes uniques par session/jour
- [ ] Interface mobile pour scanner/signer
- [ ] Validation en temps réel des présences
- [ ] Export PDF des feuilles signées
- [ ] Gestion des retards/absences

### Phase 3: Conformité Qualiopi (Semaines 11-14)

#### Sprint 5: Tableau des Indicateurs (Semaine 11-12)

**Configuration des 32 indicateurs:**
```javascript
const INDICATEURS_QUALIOPI = {
  1: "Conditions générales de vente",
  2: "Identification précise des objectifs",
  3: "Adaptation aux publics bénéficiaires",
  // ... 32 indicateurs au total
}
```

**Fonctionnalités:**
- [ ] Questionnaire de configuration (6 questions)
- [ ] Dashboard de conformité avec scoring
- [ ] Statuts par indicateur (conforme/partiel/non-conforme)
- [ ] Exemples et guides pour chaque indicateur
- [ ] Alertes sur les non-conformités
- [ ] Export rapport de conformité

#### Sprint 6: Gestion des Preuves (Semaine 13-14)

**Système de preuves:**
- [ ] Upload et stockage sécurisé
- [ ] Association preuves-indicateurs (many-to-many)
- [ ] Versioning automatique des documents
- [ ] Validation des preuves par indicateur
- [ ] Commentaires et annotations

**Archivage post-audit:**
- [ ] Snapshot complet de l'état à la date d'audit
- [ ] Archive ZIP avec toutes les preuves
- [ ] Historique des audits
- [ ] Possibilité de "reset" après audit

### Phase 4: Communications (Semaines 15-18)

#### Sprint 7: Emails Automatisés (Semaine 15-16)

**Intégration Resend/SendGrid:**
- [ ] Configuration API et webhooks
- [ ] Gestion des templates transactionnels
- [ ] Queue pour envois en masse
- [ ] Gestion des bounces et complaints

**Déclencheurs automatiques:**
- [ ] Inscription confirmée (immédiat)
- [ ] Convocation (J-7)
- [ ] Rappel (J-1)
- [ ] Questionnaire satisfaction (J+1)
- [ ] Évaluation à froid (J+30, J+90)

**Personnalisation:**
- [ ] Éditeur de templates email
- [ ] Variables dynamiques
- [ ] Pièces jointes automatiques
- [ ] Tracking ouvertures/clics

#### Sprint 8: Questionnaires (Semaine 17-18)

**Générateur de questionnaires:**
- [ ] Types de questions (QCM, échelle, texte, NPS)
- [ ] Logique conditionnelle
- [ ] Questions obligatoires/optionnelles
- [ ] Pagination et progression

**Templates Qualiopi:**
- [ ] Satisfaction à chaud
- [ ] Satisfaction à froid
- [ ] Évaluation des acquis
- [ ] Analyse des besoins

**Analyse:**
- [ ] Statistiques en temps réel
- [ ] Graphiques (Chart.js)
- [ ] Export Excel/PDF
- [ ] Comparaisons périodes/formations

### Phase 5: Analytics & Reporting (Semaines 19-22)

#### Sprint 9: BPF Automatique (Semaine 19-20)

**Génération du Bilan Pédagogique et Financier:**
- [ ] Extraction automatique des données
- [ ] Calculs selon période comptable
- [ ] 21 règles de cohérence
- [ ] Interface de correction manuelle
- [ ] Export format DGEFP

**Données à calculer:**
- Nombre de stagiaires
- Heures de formation
- Chiffre d'affaires par type
- Répartition par OPCO
- Taux de satisfaction

#### Sprint 10: Dashboards (Semaine 21-22)

**Dashboard Direction:**
- [ ] KPIs globaux (CA, sessions, apprenants)
- [ ] Évolution temporelle
- [ ] Répartition par formation/formateur
- [ ] Taux de remplissage
- [ ] Prévisions

**Dashboard Qualité:**
- [ ] Score Qualiopi global
- [ ] Statut par indicateur
- [ ] Taux de satisfaction
- [ ] Taux d'abandon
- [ ] Actions d'amélioration

**Dashboard Commercial:**
- [ ] Pipeline de ventes
- [ ] Taux de conversion
- [ ] Panier moyen
- [ ] Sources d'acquisition
- [ ] ROI par canal

### Phase 6: CRM & Collaboration (Semaines 23-26)

#### Sprint 11: CRM Complet (Semaine 23-24)

**Gestion des contacts:**
- [ ] Fiches entreprises enrichies
- [ ] Profils apprenants détaillés
- [ ] CV et qualifications formateurs
- [ ] Historique complet des interactions
- [ ] Tags et segmentation

**Import/Export:**
- [ ] Import CSV avec mapping intelligent
- [ ] Détection des doublons
- [ ] Export personnalisé
- [ ] API REST pour intégrations
- [ ] Webhooks pour synchronisation

#### Sprint 12: Espaces Collaboratifs (Semaine 25-26)

**Beehelp (messagerie):**
- [ ] Création auto de groupes par session
- [ ] Chat temps réel (WebSocket)
- [ ] Partage de fichiers
- [ ] Mentions et notifications
- [ ] Modération

**Kanban interactif:**
- [ ] Boards personnalisables
- [ ] Drag & drop de cartes
- [ ] Assignation de tâches
- [ ] Commentaires
- [ ] Intégration calendrier

## =à Stack Technique Détaillée

### Frontend (Nuxt 3)
```json
{
  "dependencies": {
    "nuxt": "^3.x",
    "@nuxtjs/tailwindcss": "^6.x",
    "@pinia/nuxt": "^0.5.x",
    "@vueuse/nuxt": "^10.x",
    "shadcn-vue": "latest",
    "@tiptap/vue-3": "^2.x",
    "vue-cal": "^4.x",
    "chart.js": "^4.x",
    "vee-validate": "^4.x",
    "zod": "^3.x",
    "dayjs": "^1.x",
    "vue-i18n": "^9.x"
  }
}
```

### Backend (AdonisJS v6)
```json
{
  "dependencies": {
    "@adonisjs/core": "^6.x",
    "@adonisjs/lucid": "^20.x",
    "@adonisjs/auth": "^9.x",
    "@adonisjs/bouncer": "^3.x",
    "@adonisjs/mail": "^9.x",
    "@adonisjs/redis": "^8.x",
    "@adonisjs/drive-s3": "^2.x",
    "bullmq": "^4.x",
    "resend": "^2.x",
    "puppeteer": "^21.x",
    "qrcode": "^1.x",
    "exceljs": "^4.x"
  }
}
```

### Infrastructure
```yaml
services:
  app:
    image: node:20-alpine
    environment:
      - NODE_ENV=production
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=qualiopii
      - POSTGRES_USER=admin
  
  redis:
    image: redis:7-alpine
  
  minio:
    image: minio/minio
    command: server /data
```

## =È Métriques de Succès

### Performance
- Time to First Byte (TTFB) < 200ms
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- API response time p95 < 150ms

### Scalabilité
- Support 500+ organisations simultanément
- 10,000+ utilisateurs concurrents
- 1M+ documents stockés
- 100K+ emails/jour

### Qualité
- Code coverage > 80% (95% pour Qualiopi)
- 0 vulnérabilités critiques
- Lighthouse score > 90
- Accessibilité WCAG 2.1 AA

### Business
- Conformité RGPD garantie
- Certification Qualiopi validée
- SLA 99.9% uptime
- Support < 2h en horaires ouvrés

## =° Modèle de Tarification Suggéré

### Starter (29¬/mois)
- 1 organisation
- 3 utilisateurs
- 10 sessions/mois
- 100 apprenants
- Support email

### Professional (79¬/mois)
- 1 organisation
- 10 utilisateurs
- 50 sessions/mois
- 500 apprenants
- Signatures électroniques
- Support prioritaire

### Business (199¬/mois)
- 1 organisation
- Utilisateurs illimités
- Sessions illimitées
- Apprenants illimités
- API access
- Support téléphone
- Formation incluse

### Enterprise (sur devis)
- Multi-organisations
- White label
- SLA personnalisé
- Serveur dédié
- Account manager

## =€ Plan d'Action Immédiat (Semaine 1)

### Lundi - Mardi
**Matin:**
- [ ] Cloner le repo existant
- [ ] Installer les dépendances
- [ ] Lancer l'application localement
- [ ] Explorer le code source

**Après-midi:**
- [ ] Documenter l'architecture actuelle
- [ ] Identifier les composants réutilisables
- [ ] Lister les dépendances à garder/supprimer

### Mercredi - Jeudi
**Matin:**
- [ ] Créer compte test Qualiobee
- [ ] Capturer tous les écrans
- [ ] Documenter les workflows

**Après-midi:**
- [ ] Analyser l'UX/UI Qualiobee
- [ ] Identifier les patterns de navigation
- [ ] Prioriser les fonctionnalités MVP

### Vendredi
**Matin:**
- [ ] Rédiger l'architecture cible
- [ ] Planifier la migration des données
- [ ] Estimer l'effort par module

**Après-midi:**
- [ ] Préparer l'environnement de dev
- [ ] Configurer Git flow
- [ ] Planifier le Sprint 1

##   Points d'Attention Critiques

### Technique
- **Multi-tenancy**: Isolation stricte des données entre organisations
- **Scalabilité**: Architecture permettant la montée en charge
- **Sécurité**: Chiffrement, HTTPS, protection CSRF/XSS
- **Performance**: Optimisation des requêtes, cache Redis
- **Monitoring**: Logs centralisés, alerting, APM

### Légal/Conformité
- **RGPD**: Consentement, droit à l'oubli, portabilité
- **Qualiopi**: Validation avec expert certification
- **CGV/CGU**: Rédaction par juriste spécialisé
- **Données de santé**: Si handicap, conformité renforcée
- **Hébergement**: Datacenter en France/Europe

### Business
- **Différenciation**: UX moderne, prix compétitif, API ouverte
- **Go-to-market**: Partenariats avec certificateurs Qualiopi
- **Support**: Base de connaissances, chat, formation
- **Évolutivité**: Roadmap publique, feedback utilisateurs
- **Monétisation**: Freemium possible pour acquisition

## =Ú Ressources et Références

### Documentation Technique
- [Nuxt 3 Documentation](https://nuxt.com)
- [AdonisJS v6 Documentation](https://docs.adonisjs.com)
- [shadcn-vue Components](https://www.shadcn-vue.com)
- [PostgreSQL Multi-tenant Patterns](https://www.postgresql.org/docs/current/ddl-schemas.html)

### Qualiopi
- [Guide Qualiopi Officiel](https://travail-emploi.gouv.fr/formation-professionnelle/acteurs-cadre-et-qualite-de-la-formation-professionnelle/article/qualiopi)
- [Référentiel National Qualité](https://www.legifrance.gouv.fr)
- [32 Indicateurs Détaillés](https://certification.afnor.org)

### Intégrations
- [Resend API Docs](https://resend.com/docs)
- [Yousign API](https://developers.yousign.com)
- [DocuSign API](https://developers.docusign.com)
- [Stripe Billing](https://stripe.com/docs/billing)

---

*Document créé le : ${new Date().toLocaleDateString('fr-FR')}*  
*Version : 1.0.0*  
*Auteur : Équipe Qualiopii*

> **Note**: Ce plan est évolutif et doit être ajusté selon les retours utilisateurs et les contraintes rencontrées pendant le développement.