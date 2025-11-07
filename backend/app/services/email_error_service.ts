import EmailLog from '#models/email_log'
import { DateTime } from 'luxon'

interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced' | 'email.opened' | 'email.clicked'
  created_at: string
  data: {
    created_at: string
    email_id: string
    from: string
    to: string[]
    subject: string
    html?: string
    text?: string
    tags?: any[]
    // Pour les bounces
    error?: {
      message: string
      name: string
    }
    // Pour les delivery delays
    reason?: string
  }
}

export default class EmailErrorService {
  /**
   * Traiter les événements de webhook Resend
   */
  public async processResendWebhook(event: ResendWebhookEvent): Promise<void> {
    const { data } = event
    
    // Trouver le log email correspondant
    const emailLog = await EmailLog.query()
      .where('resend_id', data.email_id)
      .first()

    if (!emailLog) {
      console.warn(`EmailLog non trouvé pour Resend ID: ${data.email_id}`)
      return
    }

    switch (event.type) {
      case 'email.sent':
        await this.handleEmailSent(emailLog, event)
        break
      case 'email.delivered':
        await this.handleEmailDelivered(emailLog, event)
        break
      case 'email.bounced':
        await this.handleEmailBounced(emailLog, event)
        break
      case 'email.complained':
        await this.handleEmailComplained(emailLog, event)
        break
      case 'email.delivery_delayed':
        await this.handleEmailDelayed(emailLog, event)
        break
      default:
        console.log(`Événement Resend non géré: ${event.type}`)
    }
  }

  /**
   * Email confirmé comme envoyé par Resend
   */
  private async handleEmailSent(emailLog: EmailLog, event: ResendWebhookEvent): Promise<void> {
    if (emailLog.status === 'pending') {
      await emailLog.markAsSent(event.data.email_id)
    }
  }

  /**
   * Email livré avec succès
   */
  private async handleEmailDelivered(emailLog: EmailLog, _event: ResendWebhookEvent): Promise<void> {
    await emailLog.markAsDelivered()
  }

  /**
   * Email rejeté (bounce)
   */
  private async handleEmailBounced(emailLog: EmailLog, event: ResendWebhookEvent): Promise<void> {
    await emailLog.markAsBounced()
    
    // Optionnel : désactiver l'email de l'étudiant si bounce permanent
    if (event.data.error?.name === 'hard_bounce') {
      await this.handleHardBounce(emailLog, event)
    }
  }

  /**
   * Email marqué comme spam
   */
  private async handleEmailComplained(emailLog: EmailLog, event: ResendWebhookEvent): Promise<void> {
    emailLog.status = 'failed'
    emailLog.errorMessage = 'Email marqué comme spam par le destinataire'
    await emailLog.save()

    // Optionnel : marquer l'email comme problématique
    await this.handleSpamComplaint(emailLog, event)
  }

  /**
   * Email retardé
   */
  private async handleEmailDelayed(emailLog: EmailLog, event: ResendWebhookEvent): Promise<void> {
    emailLog.errorMessage = event.data.reason || 'Livraison retardée'
    await emailLog.save()
  }

  /**
   * Gestion des hard bounces (adresses email invalides)
   */
  private async handleHardBounce(emailLog: EmailLog, event: ResendWebhookEvent): Promise<void> {
    // Log pour monitoring
    console.warn(`Hard bounce détecté pour ${emailLog.emailTo}: ${event.data.error?.message}`)
    
    // Ici on pourrait :
    // 1. Marquer l'étudiant comme ayant une adresse email invalide
    // 2. Envoyer une notification à l'admin
    // 3. Créer un système de quarantaine des emails
    
    // Pour l'instant, on se contente de logger
    emailLog.errorMessage = `Hard bounce: ${event.data.error?.message}`
    await emailLog.save()
  }

  /**
   * Gestion des plaintes spam
   */
  private async handleSpamComplaint(emailLog: EmailLog, _event: ResendWebhookEvent): Promise<void> {
    // Log pour monitoring
    console.warn(`Plainte spam reçue pour ${emailLog.emailTo}`)
    
    // Ici on pourrait :
    // 1. Ajouter l'email à une liste de suppression
    // 2. Notifier l'admin
    // 3. Analyser le contenu du template pour amélioration
  }

  /**
   * Obtenir les statistiques d'erreur des emails
   */
  public async getErrorStats() {
    const totalEmails = await EmailLog.query().count('* as total')
    const sentEmails = await EmailLog.query().where('status', 'sent').count('* as total')
    const deliveredEmails = await EmailLog.query().where('status', 'delivered').count('* as total')
    const failedEmails = await EmailLog.query().where('status', 'failed').count('* as total')
    const bouncedEmails = await EmailLog.query().where('status', 'bounced').count('* as total')

    return {
      total: Number(totalEmails[0].$extras.total),
      sent: Number(sentEmails[0].$extras.total),
      delivered: Number(deliveredEmails[0].$extras.total),
      failed: Number(failedEmails[0].$extras.total),
      bounced: Number(bouncedEmails[0].$extras.total),
      deliveryRate: Number(totalEmails[0].$extras.total) > 0 
        ? Number(deliveredEmails[0].$extras.total) / Number(totalEmails[0].$extras.total) * 100 
        : 0
    }
  }

  /**
   * Obtenir les emails problématiques pour monitoring
   */
  public async getProblematicEmails(limit: number = 50) {
    return await EmailLog.query()
      .whereIn('status', ['failed', 'bounced'])
      .orderBy('created_at', 'desc')
      .limit(limit)
      .exec()
  }

  /**
   * Réessayer l'envoi d'emails échoués (avec limite de tentatives)
   */
  public async retryFailedEmails(maxRetries: number = 3): Promise<void> {
    const failedEmails = await EmailLog.query()
      .where('status', 'failed')
      .where('retry_count', '<', maxRetries)
      .where('created_at', '>', DateTime.now().minus({ days: 7 }).toSQL())
      .exec()

    for (const emailLog of failedEmails) {
      try {
        // Ici on pourrait ré-envoyer l'email
        // Pour l'instant on se contente de mettre à jour le compteur
        emailLog.retryCount += 1
        await emailLog.save()
        
        console.log(`Email ${emailLog.id} programmé pour nouvelle tentative (${emailLog.retryCount}/${maxRetries})`)
      } catch (error) {
        console.error(`Erreur lors de la programmation de retry pour email ${emailLog.id}:`, error)
      }
    }
  }
}