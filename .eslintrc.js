module.exports = {
  root: true,
  extends: ['plugin:jest/recommended', 'prettier', 'plugin:import/recommended'],
  parser: 'babel-eslint',
  env: {
    es6: true,
    node: true,
    'jest/globals': true,
  },
  overrides: [
    {
      files: ['./examples/**'],
      env: {
        browser: true,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'import/extensions': 'off', // [warn, { ts: 'never', tsx: 'never' }],
        'import/no-default-export': 'error',
        'import/prefer-default-export': 'off',
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
          ts: {
            directory: './{packages,examples}/*/tsconfig.json',
          },
        },
      },
    },
  ],
};
