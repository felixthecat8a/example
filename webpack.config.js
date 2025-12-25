const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require('path')

module.exports = {
  mode: 'development',
  entry: {
    home: path.resolve(__dirname, 'src/js/home.js'),
    cat: path.resolve(__dirname, 'src/js/cat.js'),
    temperature: path.resolve(__dirname, 'src/js/temperature.js'),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "script/[name].bundle.js",
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'style/[name].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Home',
      filename: 'index.html',
      template: 'src/pages/home.html',
      favicon: 'src/favicon/favicon.ico',
      chunks: ['home'],
    }),
    new HtmlWebpackPlugin({
      title: 'Temperature',
      filename: 'temperature.html',
      template: 'src/pages/temperature.html',
      favicon: 'src/favicon/favicon.ico',
      chunks: ['temperature'],
    }),
    new HtmlWebpackPlugin({
      title: 'Cat',
      filename: 'cat.html',
      template: 'src/pages/cat.html',
      favicon: 'src/favicon/favicon.ico',
      chunks: ['cat'],
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
    },
    // runtimeChunk: 'single',
    minimizer: [new CssMinimizerPlugin()],
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
}
