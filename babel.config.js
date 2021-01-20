const withTests = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        useBuiltIns: 'usage',
        corejs: '3',
        targets: { node: 'current' },
      },
    ],
  ],
  plugins: [
    'babel-plugin-require-context-hook',
    'babel-plugin-dynamic-import-node',
    '@babel/plugin-transform-runtime',
  ],
};

const modules = process.env.BABEL_ESM === 'true' ? false : 'auto';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        useBuiltIns: 'usage',
        corejs: '3',
        targets: 'defaults',
        modules,
      },
    ],
    '@babel/preset-typescript',
  ],
  env: {
    test: withTests,
  },
};
