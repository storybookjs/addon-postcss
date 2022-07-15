import type { Configuration, RuleSetRule, RuleSetUseItem } from 'webpack';
import { logger } from '@storybook/node-logger';
import postcss from 'postcss';

type StyleLoaderOptions = Record<string, unknown>;
type CssLoaderOptions = Record<string, unknown> & {
  importLoaders?: number;
};

type PostcssLoaderOptions = Record<string, unknown> & {
  implementation?: typeof postcss;
};

interface Options {
  styleLoaderOptions?: StyleLoaderOptions | false;
  cssLoaderOptions?: CssLoaderOptions | false;
  postcssLoaderOptions?: PostcssLoaderOptions | false;
  rule?: RuleSetRule;
}

function wrapLoader(
  loader: string,
  options?:
    | StyleLoaderOptions
    | CssLoaderOptions
    | PostcssLoaderOptions
    | false,
): RuleSetUseItem[] {
  if (options === false) {
    return [];
  }

  return [{ loader, options }];
}

export const webpack = (
  webpackConfig: Configuration = {},
  options: Options = {},
): Configuration => {
  const { styleLoaderOptions, postcssLoaderOptions, rule = {} } = options;

  let { cssLoaderOptions } = options;

  if (typeof cssLoaderOptions === 'object') {
    cssLoaderOptions = {
      ...cssLoaderOptions,
      importLoaders: 1, // We always need to apply postcss-loader before css-loader
    };
  }

  let postcssFactory = postcss;
  if (typeof postcssLoaderOptions === 'object') {
    postcssFactory = postcssLoaderOptions?.implementation ?? postcss;
  }

  const { version } = postcssFactory();

  logger.info(`=> Using PostCSS preset with postcss@${version}`);

  return {
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: [
        ...(
          (webpackConfig.module?.rules ?? []) as unknown as (RuleSetRule & {
            custom_id?: string;
          })[]
        ).filter((r) => r.custom_id !== 'storybook_css'),
        {
          test: /\.css$/,
          sideEffects: true,
          ...rule,
          use: [
            ...wrapLoader(
              require.resolve('style-loader').toString(),
              styleLoaderOptions,
            ),
            ...wrapLoader(
              require.resolve('css-loader').toString(),
              cssLoaderOptions,
            ),
            ...wrapLoader(
              require.resolve('postcss-loader').toString(),
              postcssLoaderOptions,
            ),
          ],
        },
      ],
    },
  };
};
