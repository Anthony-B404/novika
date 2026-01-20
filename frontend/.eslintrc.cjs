module.exports = {
  root: true,
  extends: ['@nuxtjs/eslint-config-typescript'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'require-await': 'off',
    '@typescript-eslint/require-await': 'off',
    'no-console': 'warn',
  },
}
