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

export const webpackFinal = (
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

  const { rules = [] } = webpackConfig.module || {};

  const prevCssRuleIdx = rules.findIndex(
    ({ test }) => test?.toString() === '/\\.css$/',
  );
  const cssRuleIdx = prevCssRuleIdx === -1 ? rules.length : prevCssRuleIdx;
  const rulesBefore = rules.slice(0, cssRuleIdx);
  const rulesAfter = rules.slice(cssRuleIdx + 1);

  const cssRule = {
    test: /\.css$/,
    sideEffects: true,
    exclude: /\.module\.css$/,
    ...rule,
    use: [
      ...wrapLoader(require.resolve('style-loader'), styleLoaderOptions),
      ...wrapLoader(require.resolve('css-loader'), cssLoaderOptions),
      ...wrapLoader(require.resolve('postcss-loader'), postcssLoaderOptions),
    ],
  };

  const cssModulesRule = {
    test: /\.css$/,
    include: /\.module\.css$/,
    sideEffects: true,
    ...rule,
    use: [
      ...wrapLoader(require.resolve('style-loader'), styleLoaderOptions),
      ...wrapLoader(require.resolve('css-loader'), {
        ...cssLoaderOptions,
        modules: true,
      }),
      ...wrapLoader(require.resolve('postcss-loader'), postcssLoaderOptions),
    ],
  };

  return {
    ...webpackConfig,
    module: {
      ...webpackConfig.module,
      rules: [...rulesBefore, cssRule, cssModulesRule, ...rulesAfter],
    },
  };
};
