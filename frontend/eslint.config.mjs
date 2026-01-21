// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Migrated from .eslintrc.cjs
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'require-await': 'off',
    '@typescript-eslint/require-await': 'off',
    'no-console': 'warn',
    // Allow unused variables prefixed with underscore (common convention for intentionally unused vars)
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    // Disable v-html warning - project uses sanitized markdown content via 'marked' library
    'vue/no-v-html': 'off',
  },
})
