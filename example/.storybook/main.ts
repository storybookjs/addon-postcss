import type { StorybookConfig } from '@storybook/html-webpack5';

export default {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '../../', // the addon we're actually interested in seeing if it works
  ],
  framework: '@storybook/html-webpack5',
} as StorybookConfig;
