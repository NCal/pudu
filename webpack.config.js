var path = require('path')
var webpack = require('webpack')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  stats: {
    warnings: false
  },
  output: {
    path: path.join(__dirname, 'src'),
    publicPath: '/',
    filename: 'bundle.js',
  },
  plugins: [
    // new UglifyJSPlugin()
  ],
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'stage-0'],
        },
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader?sourceMap',
      },
      {
        test: /\.(png|jpe?g|gif|woff|tff|otf)$/i,
        loader: 'url-loader',
        options: {
          esModule: false,
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ],
  },
}
