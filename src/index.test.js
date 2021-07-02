import { logger } from '@storybook/node-logger';
import { webpackFinal } from './index.ts';

jest.mock('@storybook/node-logger');

describe('webpack hook', () => {
  const loaderMatcher = {
    use: expect.arrayContaining([
      expect.objectContaining({
        loader: expect.stringContaining('style-loader'),
      }),
      expect.objectContaining({
        loader: expect.stringContaining('css-loader'),
      }),
      expect.objectContaining({
        loader: expect.stringContaining('postcss-loader'),
      }),
    ]),
  };

  test('adds loaders to the end of a webpack config', () => {
    const configFixture = {
      module: {
        rules: ['dummy-loader'],
      },
    };
    const config = webpackFinal(configFixture);
    expect(config.module.rules[0]).toEqual('dummy-loader');
    expect(config.module.rules[1]).toMatchObject(loaderMatcher);
  });

  test('applying to an empty webpack config', () => {
    const configFixture = {};
    const config = webpackFinal(configFixture);
    expect(config.module.rules[0]).toMatchObject(loaderMatcher);
  });

  test('accepts a custom postcss through postcssLoaderOptions & logs the version being used', () => {
    const version = '99.99.99';
    const configFixture = {};
    const fakePostcss = () => ({ version });
    const config = webpackFinal(configFixture, {
      postcssLoaderOptions: {
        implementation: fakePostcss,
      },
    });
    expect(config.module.rules[0]).toMatchObject({
      use: expect.arrayContaining([
        expect.objectContaining({
          loader: expect.stringContaining('postcss-loader'),
          options: {
            implementation: fakePostcss,
          },
        }),
      ]),
    });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(`postcss@${version}`),
    );
  });

  test('always ensures importLoaders: 1 on css-loader', () => {
    const configFixture = {};
    const config = webpackFinal(configFixture, {
      cssLoaderOptions: {
        importLoaders: 2,
      },
    });
    expect(config.module.rules[0]).toMatchObject({
      use: expect.arrayContaining([
        expect.objectContaining({
          loader: expect.stringContaining('css-loader'),
          options: expect.objectContaining({
            importLoaders: 1,
          }),
        }),
      ]),
    });
  });

  test('disables all loaders if their options are set to false', () => {
    const configFixture = {};
    const config = webpackFinal(configFixture, {
      styleLoaderOptions: false,
      cssLoaderOptions: false,
      postcssLoaderOptions: false,
    });
    expect(config.module.rules[0]).toMatchObject({
      use: [],
    });
  });

  test('overrides rule properties with option', () => {
    const configFixture = {};
    const config = webpackFinal(configFixture, {
      rule: {
        sideEffects: false,
      },
    });
    expect(config.module.rules[0]).toMatchObject({
      sideEffects: false,
    });
  });
});
