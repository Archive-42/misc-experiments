/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */

const path = require('path');
const webpack = require('webpack');

/**
 * A regular expression used to replace Firestore's and Storage's platform-
 * specific modules, which are located under
 * 'packages/(component)/src/platform/'.
 */
const PLATFORM_RE = /^(.*)\/platform\/([^.\/]*)(\.ts)?$/;

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              module: 'commonjs',
              target: 'es5',
              downlevelIteration: true,
              resolveJsonModule: true
            }
          }
        }
      },
      {
        test: /\.[tj]sx?$/,
        use: 'source-map-loader',
        enforce: 'pre'
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'istanbul-instrumenter-loader',
          options: { esModules: true }
        },
        enforce: 'post',
        exclude: [/\.test\.ts$/, /\btest(ing)?\//]
      },
      {
        test: /\.js$/,
        include: [/node_modules\/chai-as-promised/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: ['ie 11']
                }
              ]
            ]
          }
        }
      },
      /**
       * Transform firebase packages to cjs, so they can be stubbed in tests
       */
      {
        test: /\.js$/,
        include: function (modulePath) {
          const match = /node_modules\/@firebase.*/.test(modulePath);
          return match;
        },
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['@babel/plugin-transform-modules-commonjs']
          }
        }
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, '../../node_modules')],
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.js', '.ts'],
    symlinks: false
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(PLATFORM_RE, resource => {
      const targetPlatform = process.env.TEST_PLATFORM || 'browser';
      resource.request = resource.request.replace(
        PLATFORM_RE,
        `$1/platform/${targetPlatform}/$2.ts`
      );
    }),
    new webpack.EnvironmentPlugin([
      'RTDB_EMULATOR_PORT',
      'RTDB_EMULATOR_NAMESPACE'
    ])
  ]
};
