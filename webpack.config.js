const path = require('path');
const webpack = require('webpack');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
  mode: 'production',
  entry: './apollo-client.js',
  output: {
    library: 'Apollo',
    libraryTarget: 'var',
    path: path.resolve(__dirname+'/build'),
    filename: 'apollo-client.js'
  },
  plugins: [
    new BabiliPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["env"]
          }
        }
      }
    ]
  }
};
