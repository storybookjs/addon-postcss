import { logger } from '@storybook/node-logger';

import { webpack } from './index.ts';

jest.mock('@storybook/node-logger');

describe('webpack hook', () => {
  const loaderMatcher = {
    use: expect.arrayContaining([
      expect.stringContaining('style-loader'),
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
    const config = webpack(configFixture);
    expect(config.module.rules[0]).toEqual('dummy-loader');
    expect(config.module.rules[1]).toMatchObject(loaderMatcher);
  });

  test('applying to an empty webpack config', () => {
    const configFixture = {};
    const config = webpack(configFixture);
    expect(config.module.rules[0]).toMatchObject(loaderMatcher);
  });

  test('accepts a custom postcss & logs the version being used', () => {
    const version = '99.99.99';
    const configFixture = {};
    const fakePostcss = () => ({ version });
    const config = webpack(configFixture, {
      postcss: fakePostcss,
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
});
