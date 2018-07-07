const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, './public/assets/scripts/common.ts'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: './assets/scripts/bundle.js'
  },
  cache: true,
  plugins: [
    new ExtractTextPlugin({
      filename: './assets/styles/bundle.css'
    }),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './public/pages/index.ejs'
    })
  ],
  resolve: {
    extensions: [
      '.ts',  // for ts-loader
      '.js'   // for style-loader
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        })
      },
      {
        test: /\.ejs$/,
        use: 'ejs-compiled-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 4100
  }
}
