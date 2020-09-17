module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    react: {
      pragma: 'React',
      version: 'detect',
    }
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parser: '@babel/eslint-parser',
  plugins: ['react'],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    indent: ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    quotes: ['error', 'single', { 'avoidEscape': true }],
    semi: ['error', 'never'],
  },
}
