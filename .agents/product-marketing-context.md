# Product Marketing Context

*Last updated: 2026-03-07*

## Product Overview

**One-liner:** Novika transforme vos enregistrements audio en documents structures professionnels en 2 minutes grace a l'IA.

**What it does:** Novika est une plateforme SaaS B2B2B qui prend n'importe quel enregistrement audio (reunions, dictees, appels, consultations) et le transforme en un document ecrit parfaitement structure. En deux etapes : transcription fidele avec identification des interlocuteurs, puis restructuration intelligente via des prompts personnalisables par metier. Le resultat est un document pret a etre utilise, exportable en PDF ou Word.

**Product category:** Transcription IA + redaction automatique de documents (au croisement de la dictee professionnelle et de l'IA generative appliquee au document).

**Product type:** SaaS multi-tenant avec distribution via revendeurs (B2B2B).

**Business model:** Systeme de credits consommes a l'usage. Novika vend des credits aux revendeurs, qui les redistribuent aux organisations clientes (manuellement ou via abonnement recurrent). Pas d'inscription publique : tous les utilisateurs sont crees par les revendeurs.

## Target Audience

**Target companies:**
- Cabinets d'avocats (3 a 50 avocats)
- Cabinets medicaux, cliniques, centres de sante
- Cabinets de conseil et d'audit
- Directions commerciales / equipes de vente
- Cabinets comptables et d'expertise
- Agences immobilieres
- Societes d'assurance

**Decision-makers:**
- Associes / managing partners (cabinets)
- Directeurs de cabinet / office managers
- DSI / responsables outils (structures moyennes)
- Directeurs commerciaux (equipes de vente)

**Primary use case:** Transformer un enregistrement audio brut (reunion, dictee, appel) en un document ecrit structure et professionnel, sans effort de redaction manuelle.

**Jobs to be done:**
- "J'ai dicte pendant 20 minutes apres mon audience, je veux un projet de conclusions structure"
- "J'ai enregistre ma reunion client d'1h30, je veux un compte-rendu clair avec les actions a mener"
- "J'ai fait 8 consultations aujourd'hui, je veux mes comptes-rendus medicaux prets avant demain"

**Use cases:**
- Avocat : dictee post-audience -> conclusions, memoires, notes de dossier
- Medecin : dictee post-consultation -> compte-rendu medical, lettre de liaison
- Consultant : enregistrement d'atelier -> livrable structure, recommandations
- Commercial : appel client -> notes CRM, plan d'action, suivi
- Expert-comptable : reunion client -> lettre de mission, notes structurees
- Agent immobilier : visite terrain -> fiche de visite structuree
- Assureur : entretien d'expertise -> rapport de sinistre

## Personas

### Pour le revendeur : qui convaincre chez le client ?

| Persona | Role | Ce qui compte | Defi | Valeur promise |
|---------|------|---------------|------|----------------|
| **Utilisateur final** | Avocat, medecin, consultant, commercial | Gagner du temps, ne plus rediger | "Je passe plus de temps a rediger qu'a exercer mon metier" | "Dictez, Novika redige. Votre document est pret en 2 minutes." |
| **Champion** | Office manager, secretaire juridique/medicale, assistante de direction | Reduire la charge de travail de redaction | "Je suis submergee de dictees a retranscrire" | "Les dictees se transforment toutes seules, vous ne faites que relire." |
| **Decideur** | Associe gerant, directeur de cabinet | ROI, productivite de l'equipe | "On paie du temps qualifie pour de la redaction repetitive" | "Vos collaborateurs produisent plus, les documents sortent plus vite." |
| **Acheteur financier** | DAF, comptable du cabinet | Cout vs benefice, previsibilite | "Combien ca coute et est-ce que ca remplace un poste ?" | "Systeme de credits previsible. Moins cher qu'une demi-journee de secretariat." |

## Problems & Pain Points

**Core problem:** Les professionnels passent un temps disproportionne a transformer leurs echanges oraux en documents ecrits structures. La parole est naturelle et rapide ; la redaction est lente et penible.

**Why alternatives fall short:**
- **Secretariat humain** : Couteux, delais (24-48h), penurie de secretaires qualifie(e)s (medical, juridique), erreurs de comprehension
- **Dictee vocale classique (Dragon, etc.)** : Transcrit mot a mot mais ne structure rien. L'utilisateur doit quand meme rediger/reformatter
- **Outils de transcription IA generiques (Otter, Whisper)** : Transcription brute sans restructuration intelligente, pas de prompts metier, pas d'adaptation au contexte professionnel
- **Ne rien faire / rediger a la main** : Chronophage, reportage systematique, documents incomplets ou jamais rediges

**What it costs them:**
- Temps : 30min a 2h de redaction par heure d'audio
- Argent : Cout du secretariat ou du temps qualifie passe a rediger (un avocat a 200EUR/h qui redige 2h = 400EUR de manque a facturer)
- Opportunites : Documents non rediges = suivi client defaillant, dossiers incomplets, perte de memoire sur les echanges

**Emotional tension:**
- Frustration de passer ses soirees a "rattraper les CR"
- Culpabilite de ne pas documenter ses echanges
- Stress de la pile de dictees en attente
- Peur de perdre des informations importantes dites a l'oral

## Competitive Landscape

**Direct competitors (meme solution, meme probleme):**
- **Otter.ai** : Transcription + resume IA, mais oriente meetings anglophone. Pas de prompts metier, pas de modele revendeur, pas de personnalisation profonde. Faible en francais.
- **Noota** : Transcription de reunions, oriente commercial/CRM. Moins flexible sur les cas d'usage metier.
- **Fireflies.ai** : Transcription de meetings, oriente equipes tech/sales US. Pas adapte aux professions reglementees FR.

**Secondary competitors (approche differente, meme probleme):**
- **Dragon / Nuance** : Dictee vocale classique. Transcrit mais ne restructure pas. Cher, licence perpetuelle, UX datee. Dominant chez les medecins mais frustrant.
- **Secretariat externe / freelance** : Humain = qualite variable, delais, cout eleve, problemes de confidentialite.

**Indirect competitors (approche conflictuelle):**
- **"Je redige moi-meme"** : Habitude ancree, gratuite, mais chronophage.
- **ChatGPT / Claude en direct** : L'utilisateur copie-colle sa transcription dans un LLM. Fonctionne mais fastidieux, pas de workflow integre, pas de gestion d'equipe/credits.

**Comment chacun echoue pour nos clients :**
- Otter/Fireflies : Pas de restructuration metier, anglophone, pas de modele revendeur
- Dragon : Ne fait que transcrire, pas de restructuration, UX ancienne
- ChatGPT en direct : Pas de workflow, pas de gestion multi-utilisateurs, pas de traitement audio direct

## Differentiation

**Key differentiators:**
- **Restructuration intelligente par prompts metier** : Pas juste une transcription, mais un document structure adapte au contexte (juridique, medical, commercial)
- **Prompts personnalisables par l'utilisateur** : Chaque professionnel configure ses propres modeles de sortie
- **Modele revendeur (B2B2B)** : Architecture multi-tenant pensee pour la distribution via partenaires
- **Identification des interlocuteurs (diarization)** : Distingue automatiquement qui parle
- **Tout-en-un integre** : Upload/enregistrement -> transcription -> restructuration -> export PDF/Word -> partage, dans un seul outil
- **Chat sur transcription** : Possibilite d'approfondir ou reformuler via conversation IA
- **Versioning** : Historique complet des versions avec diff et restauration
- **Conformite GDPR** : Suppression programmee, export des donnees, transparence

**How we do it differently:** Novika ne s'arrete pas a la transcription. L'IA prend l'audio brut et produit directement le document final grace a des prompts adaptes au metier de l'utilisateur. C'est la difference entre un dictaphone et un assistant redacteur.

**Why that's better:** L'utilisateur passe de "1h d'audio brut" a "document pret en 2 minutes" sans aucune etape manuelle de reformatage. Le document est exportable immediatement.

**Why customers choose us:** Gain de temps radical, qualite de restructuration superieure aux outils de transcription simple, personnalisation par metier, et modele de distribution adapte aux revendeurs.

## Objections

| Objection | Reponse |
|-----------|---------|
| "La transcription IA fait des erreurs" | Novika utilise Mistral AI (modeles de pointe), avec diarization. La transcription est une etape intermediaire : c'est la restructuration finale qui compte, et elle corrige naturellement les imperfections. L'utilisateur peut editer et versionner. |
| "Mes donnees sont confidentielles (secret professionnel)" | Hebergement securise, conformite RGPD complete (suppression programmee, export de donnees). Les audios sont traites et stockes de maniere isolee par organisation. Pas de reutilisation des donnees pour l'entrainement. |
| "C'est trop cher / je ne sais pas combien ca va me couter" | Systeme de credits previsible. Un audio d'1h = X credits. Comparez au cout horaire d'un secretaire ou au temps qualifie passe a rediger. ROI mesurable des le premier mois. |
| "Mon equipe ne va pas l'adopter" | UX "Drag, Drop, Done" - extremement simple. Pas besoin de formation. Prompts pre-configures par metier. Adoption progressive possible (commencer avec 1-2 utilisateurs). |
| "Je prefere dicter dans Dragon, j'ai l'habitude" | Dragon transcrit, Novika redige. Vous pouvez meme enregistrer avec Dragon et deposer le fichier dans Novika pour obtenir un document structure. C'est complementaire, puis ca remplace. |

**Anti-persona (qui n'est PAS un bon client) :**
- Entreprises qui n'ont pas d'audio a traiter (tout est deja ecrit)
- Tres grandes entreprises avec des outils internes deja deployes (> 500 personnes)
- Profils tres techniques qui veulent du self-hosting et du controle total sur les modeles IA
- Utilisateurs occasionnels (1-2 audios par mois) : le ROI ne justifie pas l'abonnement

## Switching Dynamics

**Push (ce qui les pousse a quitter leur solution actuelle) :**
- Secretaire qui part / penurie de secretariat
- Retard chronique dans la production de documents
- Cout croissant du secretariat externalise
- Frustration avec Dragon (transcrit mais ne structure pas)
- Volume d'audio qui augmente (plus de reunions, plus de consultations)

**Pull (ce qui les attire vers Novika) :**
- Promesse du "2 minutes au lieu de 2 heures"
- Personnalisation par prompts metier
- Export PDF/Word pret a l'emploi
- Interface simple et moderne
- Possibilite de partager les transcriptions

**Habit (ce qui les retient sur leur solution actuelle) :**
- "On a toujours fait comme ca" (dictee + secretariat)
- Investissement dans Dragon (licence, formation)
- Workflow etablis autour du secretariat
- Mefiance envers l'IA ("ca ne peut pas comprendre mon metier")

**Anxiety (ce qui les inquiete a l'idee de changer) :**
- Confidentialite des donnees (secret professionnel)
- Qualite de la transcription en francais
- Dependance a un outil externe
- Cout a long terme
- Adoption par l'equipe

## Customer Language

**How they describe the problem:**
- "Je passe mes soirees a rediger mes comptes-rendus"
- "Ma secretaire est debordee, elle a 3 jours de retard sur les dictees"
- "Je n'ai pas le temps de faire les CR, donc je ne les fais plus"
- "Dragon transcrit mais ca me donne un pave de texte inutilisable"
- "J'ai 8 consultations par jour et pas le temps de tout documenter"
- "On perd de l'information parce que personne ne redige les CR de reunion"

**How they describe us:**
- "C'est comme avoir un assistant qui redige pour moi"
- "Je dicte, et j'ai mon document tout fait"
- "Ca fait le boulot de la secretaire en 2 minutes"
- "C'est Dragon en 10 fois mieux"

**Words to use:**
- Restructuration (pas juste transcription)
- Document structure / pret a l'emploi
- Dictee intelligente
- Gain de temps
- Professionnel / adapte a votre metier
- Simple / intuitif / "Drag, Drop, Done"
- Confidentiel / securise

**Words to avoid:**
- "Intelligence artificielle" (trop generique, fait peur)
- "Machine learning" / "deep learning" (trop technique)
- "Automatisation" (connotation de remplacement)
- "Robot" / "bot" (deshumanisant)
- "Gratuit" (pas le modele, et devalue le produit)
- "Disruptif" / "revolutionnaire" (bullshit marketing)

**Glossary:**
| Term | Meaning |
|------|---------|
| Atelier audio | Interface principale ou l'utilisateur depose/enregistre son audio et obtient le resultat |
| Prompt | Instruction personnalisable qui guide l'IA pour structurer le document de sortie |
| Diarization | Identification automatique des differents interlocuteurs dans un audio |
| Credits | Unite de consommation du service. Un traitement audio consomme X credits |
| Organisation | Entite cliente (cabinet, entreprise) qui regroupe les utilisateurs |
| Revendeur | Partenaire commercial qui distribue Novika a ses clients |

## Brand Voice

**Tone:** Professionnel, rassurant, direct. Ni trop corporate ni trop decontracte. On parle a des professionnels occupes qui veulent des resultats, pas des promesses.

**Style:** Phrases courtes. Benefice avant fonctionnalite. On montre le resultat, pas le processus technique. On parle le langage du metier du client, pas celui de la tech.

**Personality:**
- **Efficace** : On va droit au but, comme le produit
- **Fiable** : On inspire confiance, on ne survend pas
- **Accessible** : Simple a comprendre, simple a utiliser
- **Professionnel** : A la hauteur des exigences de nos utilisateurs
- **Discret** : On respecte la confidentialite, on ne fait pas de bruit inutile

## Proof Points

**Metrics:**
- "1 heure d'audio -> document structure en 2 minutes"
- "27+ formats audio supportes"
- "Identification automatique des interlocuteurs"
- Export PDF et Word professionnel en 1 clic

**Customers:** *(a completer avec les premiers clients revendeurs et organisations)*

**Testimonials:** *(a completer avec les premiers retours utilisateurs)*
> "[Verbatim a capturer des premiers utilisateurs]" -- [Role, Profession]

**Value themes:**
| Theme | Proof |
|-------|-------|
| Gain de temps radical | 1h d'audio -> document en 2 min (vs 1-2h de redaction manuelle) |
| Adapte a chaque metier | Prompts personnalisables par profession et type de document |
| Simple d'utilisation | Interface "Drag, Drop, Done", zero formation necessaire |
| Securise et confidentiel | RGPD, isolation des donnees par organisation, suppression programmee |
| Modele revendeur eprouve | Architecture B2B2B, gestion des credits, abonnements recurrents |

## Goals

**Business goal:** Recruter des revendeurs qui deploient Novika dans des cabinets professionnels (avocats, medecins, consultants) et generent un revenu recurrent via le systeme de credits.

**Conversion action:** Le revendeur obtient un rendez-vous de demonstration avec un cabinet cible, realise un test en direct avec un audio reel du prospect, et convertit en creation d'organisation avec premier achat de credits.

**Current metrics:** *(a completer)*

---

## Appendice : Priorites de ciblage pour les revendeurs

### Tier 1 -- Cibles immediates (douleur forte, budget, volume)

1. **Cabinets d'avocats** (3-50 avocats)
   - Douleur maximale : dictee quotidienne, secretariat juridique en penurie
   - Budget : cout horaire eleve, ROI immediat
   - Argument : "Votre avocat dicte 20 min apres l'audience, son projet de conclusions est pret en 2 min"
   - Levier : Effet de reseau dans les ordres professionnels

2. **Professionnels de sante** (cabinets de groupe, cliniques)
   - Marche de la dictee medicale etabli (remplacement Dragon)
   - Volume : 5-15 dictees/jour par praticien
   - Argument : "Le CR de consultation est pret avant le patient suivant"
   - Levier : Prompts pre-configures par specialite

3. **Cabinets de conseil et d'audit** (10-100 consultants)
   - Reunions clients constantes -> livrables structures
   - Argument : "L'atelier client est enregistre, le livrable est pret le soir meme"
   - Levier : Diarization multi-speakers

### Tier 2 -- Fort potentiel

4. **Directions commerciales** : Appels -> notes CRM, plans d'action
5. **Societes d'assurance** : Expertises -> rapports structures
6. **Agences immobilieres** : Visites -> fiches structurees
7. **Cabinets comptables** : Reunions -> notes, lettres de mission

### Tier 3 -- Niches

8. **Journalistes** : Interviews -> articles
9. **Organismes de formation** : Cours -> supports pedagogiques
10. **RH / Recrutement** : Entretiens -> evaluations structurees

### Criteres de priorisation

| Critere | Impact |
|---------|--------|
| Volume audio quotidien | Plus le volume est eleve, plus le ROI est evident |
| Cout actuel de la redaction | Secretariat, temps qualifie = budget substituable |
| Urgence du document | Document attendu rapidement = Novika indispensable |
| Habitude de la dictee | Adoption plus rapide si deja habitue a dicter |
| Taille de l'organisation | 5-50 utilisateurs = sweet spot |
