// webpack.config.js
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
  entry: './apollo-client.js',
  output: {
    library: 'Apollo',
    libraryTarget: 'var',
    path: __dirname+'/build',
    filename: 'apollo-client.js'
  },
  plugins: [
    new MinifyPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
};
