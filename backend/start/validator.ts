/**
 * Custom error messages for VineJS validator
 */
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * Configure VineJS to use custom validation messages
 * Note: For request-specific i18n, use request.validateUsing with custom messages
 */
vine.messagesProvider = new SimpleMessagesProvider({
  // Required field
  'required': 'The {{ field }} field is required',
  // Email validation
  'email': 'The {{ field }} field must be a valid email address',
  // String validations
  'string.minLength': 'The {{ field }} field must have at least {{ min }} characters',
  'string.maxLength': 'The {{ field }} field must not exceed {{ max }} characters',
  // Number validation
  'number': 'The {{ field }} field must be a number',
  // Boolean validation
  'boolean': 'The {{ field }} field must be a boolean',
  // UUID validation
  'uuid': 'The {{ field }} field must be a valid UUID',
  // URL validation
  'url': 'The {{ field }} field must be a valid URL',
  // Date validation
  'date': 'The {{ field }} field must be a valid date',
  // Enum validation
  'enum': 'The {{ field }} field must be one of the allowed values',
  // Database unique validation
  'database.unique': 'The {{ field }} has already been taken',
  // Confirmed validation
  'confirmed': 'The {{ field }} confirmation does not match',
})
