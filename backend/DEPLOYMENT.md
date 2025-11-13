# 📧 Système de Rappels Automatiques - Guide de Déploiement

## 🏗️ Architecture du système

Le système de rappels automatiques TeachMetric comprend :

- **Migration de base de données** : Tables `email_logs` et `form_reminders`
- **Models Lucid** : `EmailLog` et `FormReminder`
- **Services** : `ReminderService` et `EmailErrorService`
- **Commande AdonisJS** : `SendFormReminders`
- **Webhooks Resend** : Gestion des bounces et erreurs
- **Templates MJML** : 3 niveaux de rappel

## 🚀 Déploiement

### 1. Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```bash
# Existing
RESEND_API_KEY=your_resend_api_key

# New - Required for reminder system
RESEND_WEBHOOK_SECRET=your_webhook_secret_from_resend_dashboard
FRONTEND_URL=https://your-frontend-domain.com

# Optional - defaults to localhost:3000 if not set
```

### 2. Migration de base de données

```bash
# Exécuter les nouvelles migrations
node ace migration:run

# Vérifier que les tables ont été créées
psql -d your_database -c "\dt" | grep -E "(email_logs|form_reminders)"
```

### 3. Configuration Cron/Scheduler

#### Option A : Cron système (Linux/macOS)

```bash
# Éditer la crontab
crontab -e

# Ajouter cette ligne pour exécuter toutes les 15 minutes
*/15 * * * * cd /path/to/your/backend && node ace send:form-reminders >> /var/log/teachmetric-reminders.log 2>&1

# Ou toutes les heures (recommandé pour la production)
0 * * * * cd /path/to/your/backend && node ace send:form-reminders >> /var/log/teachmetric-reminders.log 2>&1
```

#### Option B : PM2 (Recommandé pour Node.js)

Créer un fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    {
      name: 'teachmetric-api',
      script: 'bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'teachmetric-reminders',
      script: 'ace',
      args: 'send:form-reminders',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 */1 * * *', // Toutes les heures
      autorestart: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
```

#### Option C : Docker avec cron

Si vous utilisez Docker, ajoutez à votre `Dockerfile` :

```dockerfile
# Installer cron
RUN apt-get update && apt-get install -y cron

# Copier le script cron
COPY cron-reminders /etc/cron.d/teachmetric-reminders
RUN chmod 0644 /etc/cron.d/teachmetric-reminders

# Démarrer cron
CMD cron && npm start
```

Fichier `cron-reminders` :

```
0 */1 * * * root cd /app && node ace send:form-reminders >> /var/log/cron.log 2>&1
```

### 4. Configuration Webhooks Resend

Dans votre dashboard Resend (https://resend.com/webhooks) :

1. **Créer un webhook** avec l'URL : `https://your-api-domain.com/webhooks/resend`
2. **Événements à écouter** :
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.delivery_delayed`
3. **Secret** : Générez un secret sécurisé et ajoutez-le à `RESEND_WEBHOOK_SECRET`

### 5. Test du système

```bash
# Test manuel de la commande
node ace send:form-reminders

# Test du webhook (avec curl)
curl -X POST https://your-api-domain.com/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "resend-signature: test" \
  -d '{"type":"email.sent","data":{"email_id":"test-id","to":["test@example.com"],"from":"test@example.com"}}'

# Vérifier les logs d'emails
curl https://your-api-domain.com/admin/email-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Monitoring

### 1. Logs système

```bash
# Voir les logs de rappels
tail -f /var/log/teachmetric-reminders.log

# Logs PM2 si utilisé
pm2 logs teachmetric-reminders
```

### 2. Endpoints de monitoring

- `GET /admin/email-stats` - Statistiques des emails
- `GET /admin/problematic-emails` - Emails problématiques

### 3. Requêtes SQL utiles

```sql
-- Statistiques des rappels
SELECT
  reminder_level,
  COUNT(*) as total,
  COUNT(CASE WHEN sent = true THEN 1 END) as sent,
  COUNT(CASE WHEN sent = false AND scheduled_for < NOW() THEN 1 END) as overdue
FROM form_reminders
GROUP BY reminder_level;

-- Taux de livraison des emails
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM email_logs
GROUP BY status;

-- Rappels en retard (à investiguer)
SELECT
  fr.*,
  fs.identifier,
  s.email,
  f.title
FROM form_reminders fr
JOIN form_submissions fs ON fr.form_submission_id = fs.id
JOIN students s ON fs.student_id = s.id
JOIN forms f ON fs.form_id = f.id
WHERE fr.sent = false
AND fr.scheduled_for < NOW() - INTERVAL '1 hour';
```

## 🔧 Configuration avancée

### 1. Personnalisation des délais

Dans `FormReminder.getScheduleDelayForLevel()`, modifier :

```typescript
case 1: return { days: 1 }    // Premier rappel après 1 jour
case 2: return { days: 3 }    // Deuxième rappel après 3 jours
case 3: return { days: 7 }    // Dernier rappel après 7 jours
```

### 2. Personnalisation des templates

Les templates MJML sont dans `resources/views/emails/` :

- `form_reminder_1.edge` - Rappel amical
- `form_reminder_2.edge` - Rappel insistant
- `form_reminder_final.edge` - Rappel urgent

### 3. Rate limiting

Pour éviter de surcharger Resend, ajoutez un rate limiting dans `ReminderService` :

```typescript
// Limite de 100 emails par heure
const RATE_LIMIT = 100
const emails_sent_this_hour = await this.getEmailsSentLastHour()
if (emails_sent_this_hour >= RATE_LIMIT) {
  throw new Error('Rate limit atteint, réessayer plus tard')
}
```

## 🚨 Troubleshooting

### Problèmes courants

1. **Rappels non envoyés**
   - Vérifier que cron/PM2 fonctionne
   - Vérifier les logs d'erreur
   - Tester la commande manuellement

2. **Webhooks non reçus**
   - Vérifier l'URL webhook dans Resend
   - Vérifier `RESEND_WEBHOOK_SECRET`
   - Tester avec curl

3. **Emails dans spam**
   - Configurer SPF/DKIM dans Resend
   - Éviter les mots-clés spam dans les templates
   - Monitorer les complaints

### Commandes de diagnostic

```bash
# Test de connectivité base de données
node ace migration:status

# Test d'envoi d'email
node -e "
import mail from '@adonisjs/mail/services/main'
mail.send(message => message.to('test@example.com').from('onboarding@resend.dev').subject('Test'))
"

# Statistiques des rappels
node ace tinker
> await (await import('#models/form_reminder')).default.query().count()
```

## 📈 Métriques de succès

- **Taux de rappel** : % de rappels envoyés avec succès
- **Taux de réponse** : % d'étudiants qui répondent après rappel
- **Délai de réponse** : Temps moyen entre envoi initial et réponse
- **Taux d'erreur** : % d'emails bounced/failed

## 🔐 Sécurité

- ✅ Validation webhook signatures
- ✅ Rate limiting
- ✅ Logs d'audit pour tous les emails
- ✅ Pas de données sensibles dans les templates
- ✅ Endpoints admin protégés par authentification

---

## 📋 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Migrations exécutées
- [ ] Cron/scheduler configuré
- [ ] Webhook Resend configuré
- [ ] Tests de bout en bout réalisés
- [ ] Monitoring en place
- [ ] Documentation équipe mise à jour
- [ ] Plan de rollback préparé

Ce système est maintenant prêt pour la production ! 🚀
