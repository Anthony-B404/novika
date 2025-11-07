import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'
import FormReminder from '#models/form_reminder'
import ReminderService from '#services/reminder_service'

export default class SendFormReminders extends BaseCommand {
  static commandName = 'send:form-reminders'
  static description = 'Envoie les rappels de formulaires programmés qui sont dus'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  async run() {
    this.logger.info('🔍 Recherche des rappels à envoyer...')
    
    try {
      // Récupérer tous les rappels non envoyés qui sont dus
      const dueReminders = await FormReminder
        .query()
        .where('sent', false)
        .where('scheduled_for', '<=', DateTime.now().toSQL())
        .preload('formSubmission', (query) => {
          query
            .where('is_responded', false)
            .preload('student')
            .preload('form')
        })
        .exec()

      if (dueReminders.length === 0) {
        this.logger.info('✅ Aucun rappel à envoyer pour le moment')
        return
      }

      this.logger.info(`📧 ${dueReminders.length} rappel(s) à envoyer`)

      const reminderService = new ReminderService()
      let sentCount = 0
      let errorCount = 0

      // Traiter chaque rappel
      for (const reminder of dueReminders) {
        try {
          // Vérifier que le formulaire n'a pas été répondu entre temps
          if (reminder.formSubmission.isResponded) {
            this.logger.info(`⏭️  Saut du rappel ${reminder.id} - formulaire déjà répondu`)
            continue
          }

          await reminderService.sendReminder(reminder)
          sentCount++
          
          this.logger.info(
            `✅ Rappel niveau ${reminder.reminderLevel} envoyé à ${reminder.formSubmission.student.email}`
          )
        } catch (error) {
          errorCount++
          this.logger.error(
            `❌ Erreur lors de l'envoi du rappel ${reminder.id}: ${error.message}`
          )
        }
      }

      // Rapport final
      this.logger.info('')
      this.logger.info('📊 Rapport d\'envoi:')
      this.logger.info(`  ✅ Envoyés: ${sentCount}`)
      this.logger.info(`  ❌ Erreurs: ${errorCount}`)
      this.logger.info(`  📈 Total traités: ${sentCount + errorCount}`)

      if (errorCount > 0) {
        this.logger.warning(
          `⚠️  ${errorCount} erreur(s) détectée(s). Consultez les logs pour plus de détails.`
        )
      }

    } catch (error) {
      this.logger.error('❌ Erreur critique lors de l\'envoi des rappels:')
      this.logger.error(error.message)
      this.logger.error(error.stack)
      process.exit(1)
    }
  }
}