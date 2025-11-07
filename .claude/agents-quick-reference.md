# 🚀 Référence Rapide - Agents Claude Qualiopii

## 📝 Phrases Magiques pour Auto-Activation

### 🔴 Conformité Critique (Activation Immédiate)
```
✨ "avec conformité Qualiopi"
✨ "données RGPD"  
✨ "audit trail requis"
✨ "indicateurs de certification"
✨ "données personnelles des apprenants"
```
→ Active `legal-compliance-checker` + `backend-architect` + `test-writer-fixer`

### 🧪 TDD Obligatoire
```  
✨ "implémenter [fonctionnalité]"
✨ "créer [module]"
✨ "ajouter [feature]" 
✨ "fixer [bug]"
✨ "refactoriser [code]"
```
→ Active `test-writer-fixer` en PREMIER

### ⚙️ Architecture Backend
```
✨ "API multi-tenant"
✨ "modèles de données" 
✨ "authentification"
✨ "base de données"
✨ "migration AdonisJS"
```
→ Active `backend-architect`

### 🎨 Interface Utilisateur  
```
✨ "composant dashboard"
✨ "interface responsive"
✨ "page d'administration"
✨ "formulaire d'inscription" 
✨ "Nuxt 3 + shadcn-vue"
```
→ Active `frontend-developer` → `whimsy-injector`

## 🎯 Formules Optimales par Cas d'Usage

### Nouvelle Fonctionnalité Qualiopi
```bash
"Je veux implémenter [fonctionnalité] avec conformité Qualiopi et données RGPD"
```
**Résultat**: Chaîne complète conformité → architecture → tests → implémentation

### Composant UI Professionnel
```bash  
"Créer un composant [nom] responsive avec tests pour l'interface formateur"
```
**Résultat**: TDD → développement frontend → améliorations UX → validation

### Bug Critique
```bash
"Fixer d'urgence le bug [description] dans l'API multi-tenant"  
```
**Résultat**: Priorisation urgente + tests de régression + architecture + validation

### Optimisation Performance
```bash
"Optimiser les performances de [module] avec tests de charge"
```
**Résultat**: Tests → architecture → benchmarks → validation

## 🔧 Modificateurs Avancés

### Forcer un Agent Spécifique
```bash
# Dans votre demande, ajoutez:
"// @force-agent:legal-compliance-checker"
"// @force-agent:api-tester"  
"// @force-agent:performance-benchmarker"
```

### Désactiver un Agent Temporairement  
```bash
"// @skip-agent:whimsy-injector"     # Pas d'améliorations UX
"// @skip-agent:test-writer-fixer"   # Mode prototype rapide
```

### Mode Debug Détaillé
```bash
"// @debug-agents"                   # Voir tous les calculs d'activation
"// @show-confidence"                # Afficher les scores de confiance  
"// @trace-routing"                  # Tracer le processus de routing
```

## 🚨 Situations d'Urgence

### Contourner le TDD (Prototype Uniquement)
```bash
"Prototype rapide [feature] // @skip-tdd @prototype-mode"
```
⚠️ **Attention**: À utiliser seulement pour validation de concept !

### Force Conformité Immédiate
```bash
"[demande] // @force-compliance @audit-ready"  
```
→ Active tous les agents de conformité même sans mots-clés

### Mode Performance Maximale
```bash
"[demande] // @max-performance @benchmark-required"
```
→ Active performance-benchmarker + api-tester + optimisations

## 📊 Indicateurs de Succès

### ✅ Agents Bien Activés
- Message: "🤖 **AGENTS RECOMMANDÉS**"
- Agents obligatoires listés en rouge 🔴
- Séquence claire affichée  
- Raisons d'activation explicites

### ❌ Activation Manquée  
- Message: "ℹ️ Aucun agent spécialisé recommandé"
- **Solution**: Ajoutez des mots-clés plus précis
- **Exemple**: "créer interface" → "créer composant dashboard responsive"

### ⚠️ Conflit d'Agents
- **Symptôme**: Trop d'agents activés simultanément
- **Solution**: Soyez plus spécifique dans la demande
- **Exemple**: "améliorer l'app" → "optimiser les performances de l'API formations"

## 💡 Pro Tips

### Maximiser la Précision
1. **Soyez spécifique**: "API des sessions" vs "API"
2. **Mentionnez le contexte**: "pour les organismes de formation"  
3. **Précisez les contraintes**: "multi-tenant obligatoire"
4. **Indiquez l'urgence**: "critique", "urgent", "bloquant"

### Optimiser les Performances
1. **Une tâche = une demande** : Évitez les demandes multiples
2. **Contexte clair** : Aide le système à choisir les bons agents
3. **Réutilisez les patterns** : Le système apprend de vos habitudes

### Debugging Efficace
1. **Mode verbose** : `// @debug-agents` pour comprendre les décisions
2. **Test isolated** : Testez un agent à la fois si problème
3. **Check config** : Vérifiez `.claude/agent-triggers.yaml` si doute

## 🎓 Exemples d'Excellence

### ⭐ Excellente Demande
```bash
"Implémenter le module de gestion des présences avec QR codes, 
conformité Qualiopi requise pour l'audit trail, 
architecture multi-tenant AdonisJS, 
interface responsive Nuxt 3 pour les formateurs"
```

**Pourquoi c'est excellent** :
- ✅ Fonctionnalité claire et précise  
- ✅ Contraintes de conformité mentionnées
- ✅ Architecture spécifiée
- ✅ Interface utilisateur définie
- ✅ Contexte métier ("formateurs")

**Agents activés** :
1. `legal-compliance-checker` (conformité Qualiopi)
2. `backend-architect` (AdonisJS multi-tenant)  
3. `frontend-developer` (Nuxt 3 responsive)
4. `test-writer-fixer` (TDD obligatoire)
5. `whimsy-injector` (UX des QR codes)

### 🚫 Demande À Éviter
```bash
"Répare le truc qui marche pas"
```

**Problèmes** :
- ❌ Trop vague ("le truc")
- ❌ Pas de contexte technique  
- ❌ Aucun mot-clé reconnaissable
- ❌ Pas d'indication d'urgence ou de priorité

**Résultat** : Aucun agent spécialisé activé

## 📞 Support Rapide

### Agent Manquant ?
1. Vérifiez les mots-clés dans votre demande
2. Consultez `agent-triggers.yaml` pour les triggers
3. Utilisez `// @force-agent:nom-agent` si nécessaire

### Trop d'Agents ?
1. Soyez plus spécifique dans la demande
2. Augmentez les seuils de confiance dans la config
3. Utilisez `// @skip-agent:nom-agent` pour exclure

### Performance Lente ?
1. Vérifiez le mode debug (désactivez si activé)  
2. Simplifiez les chaînes d'agents personnalisées
3. Optimisez la configuration des triggers

---

💡 **Mémorisation** : Plus vous utilisez les "phrases magiques", plus le système devient précis dans ses recommandations !

🚀 **Ready to go** : Votre système d'agents intelligents est configuré et optimisé pour Qualiopii !