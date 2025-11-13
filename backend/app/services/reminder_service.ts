import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import FormReminder from '#models/form_reminder'
import EmailLog from '#models/email_log'

export default class ReminderService {
  /**
   * Envoyer un rappel de formulaire
   */
  public async sendReminder(reminder: FormReminder): Promise<void> {
    const { formSubmission } = reminder
    const { student, form } = formSubmission

    // Créer le log email avant l'envoi
    const emailLog = await EmailLog.create({
      emailTo: student.email,
      emailFrom: 'onboarding@resend.dev',
      subject: this.getReminderSubject(reminder.reminderLevel, form.title),
      templateName: reminder.getTemplateNameForLevel(),
      templateData: {
        studentName: `${student.firstName} ${student.lastName}`,
        formTitle: form.title,
        formId: form.id,
        submissionIdentifier: formSubmission.identifier,
        formUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/fill-form?identifier=${formSubmission.identifier}`,
        reminderLevel: reminder.reminderLevel,
        isReminder: true,
      },
      status: 'pending',
    })

    try {
      // Envoyer l'email
      await mail.send((message) => {
        message
          .to(student.email)
          .from('onboarding@resend.dev')
          .subject(this.getReminderSubject(reminder.reminderLevel, form.title))
          .htmlView(`emails/${reminder.getTemplateNameForLevel()}`, emailLog.templateData!)
      })

      // Marquer le log comme envoyé
      await emailLog.markAsSent()

      // Marquer le rappel comme envoyé
      await reminder.markAsSent(emailLog.id)
    } catch (error) {
      // Marquer le log comme échoué
      await emailLog.markAsFailed(error.message)
      throw error
    }
  }

  /**
   * Générer un sujet d'email approprié selon le niveau de rappel
   */
  private getReminderSubject(level: number, formTitle: string): string {
    switch (level) {
      case 1:
        return `Rappel : ${formTitle} - En attente de votre réponse`
      case 2:
        return `2ème rappel : ${formTitle} - Action requise`
      case 3:
        return `Dernier rappel : ${formTitle} - Réponse urgente demandée`
      default:
        return `Rappel : ${formTitle}`
    }
  }

  /**
   * Créer les rappels programmés pour un nouveau formulaire soumis
   */
  public async createScheduledReminders(formSubmissionId: number): Promise<FormReminder[]> {
    const now = DateTime.now()
    return await FormReminder.createRemindersForSubmission(formSubmissionId, now)
  }

  /**
   * Annuler tous les rappels non envoyés pour une soumission de formulaire
   * (utile quand un étudiant répond au formulaire)
   */
  public async cancelPendingReminders(formSubmissionId: number): Promise<void> {
    await FormReminder.query()
      .where('form_submission_id', formSubmissionId)
      .where('sent', false)
      .delete()
  }

  /**
   * Obtenir les statistiques des rappels
   */
  public async getReminderStats() {
    const totalReminders = await FormReminder.query().count('* as total')
    const sentReminders = await FormReminder.query().where('sent', true).count('* as total')
    const pendingReminders = await FormReminder.query().where('sent', false).count('* as total')
    const overdueReminders = await FormReminder.query()
      .where('sent', false)
      .where('scheduled_for', '<', DateTime.now().toSQL())
      .count('* as total')

    return {
      total: Number(totalReminders[0].$extras.total),
      sent: Number(sentReminders[0].$extras.total),
      pending: Number(pendingReminders[0].$extras.total),
      overdue: Number(overdueReminders[0].$extras.total),
    }
  }

  /**
   * Obtenir les rappels en retard (pour monitoring)
   */
  public async getOverdueReminders(): Promise<FormReminder[]> {
    return await FormReminder.query()
      .where('sent', false)
      .where('scheduled_for', '<', DateTime.now().minus({ hours: 1 }).toSQL())
      .preload('formSubmission', (query) => {
        query.preload('student').preload('form')
      })
      .exec()
  }
}
