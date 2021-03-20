module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  globals: {
    __DEV__: false
  },
  plugins: [
    'prettier',
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/react',
    'prettier/standard',
  ],
  rules: {
    strict: 'off',
    'no-nested-ternary': 'off',
    'no-underscore-dangle': 'off',
    'no-cond-assign': 'off',
    'no-unused-expressions': 'off',
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['frame'],
    }],
    'no-restricted-syntax': ['error',
      'ForInStatement', 'LabeledStatement', 'WithStatement'
    ],
    'lines-between-class-members': ['error',
      'always', { exceptAfterSingleLine: true }
    ],
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-shadow': ['error'],
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'react/jsx-key': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': ['error', {
      forbid: ['<', '>', '{', '}']
    }],
  },
  overrides: [
    {
      files: '**/__{tests,fixtures,mocks}__/*',
      rules: {
        'import/no-extraneous-dependencies': 'off'
      }
    }
  ],
  settings:{
    react: {
      pragma: 'Machinat',
    },
  }
};
