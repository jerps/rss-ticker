const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const fs = require('fs');

module.exports = env => {

  env = env ? env : {};

  conf = {
    mode: env.prod ? 'production' : 'development',
    context: path.resolve(__dirname),
    entry: {
      main: path.resolve(__dirname, 'src/rss-ticker.js')
    },
    output: {
      path: path.resolve(__dirname),
      filename: 'index.js',
      library: 'ModuleRssTicker',
      libraryTarget: 'umd'
    },
    plugins: [
      new webpack.BannerPlugin(fs.readFileSync(path.resolve(__dirname, 'LICENSE.txt'), 'utf8'))
    ]
  };

  if (env.prod) {conf=merge(conf, {
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  });} else {conf=merge(conf, {
    devtool: 'cheap-module-eval-source-map'
  });}
  return conf;
};