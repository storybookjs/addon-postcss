import { Configuration } from 'webpack';
import { logger } from '@storybook/node-logger';
import postcss from 'postcss';

type PostcssFactory = (plugins?: postcss.AcceptedPlugin[]) => postcss.Processor;

// TODO(blaine): Should we take PostCSS config in plugin options?
export const webpack = (
  webpackConfig: Configuration = {},
  options: { postcss?: PostcssFactory },
): Configuration => {
  const postcssFactory = options.postcss ?? postcss;
  const { version } = postcssFactory();

  logger.info(`=> Using PostCSS preset with version ${version}`);

  return {
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: [
        ...(webpackConfig.module?.rules ?? []),
        {
          test: /\.css$/,
          sideEffects: true,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                implementation: postcssFactory,
              },
            },
          ],
        },
      ],
    },
  };
};
