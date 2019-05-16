const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: [ "./src/scripts/client.ts", "./src/css/tailwind.css" ],
    output: {
      path: path.resolve(__dirname, 'dist/static'),
      filename: "./scripts/bundle.js"
    },
    resolve: {
      extensions: [ ".ts", ".tsx", ".js" ],
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: "ts-loader" },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader', options: { importLoaders: 1 } },
              'postcss-loader',
            ],
          }),
        },
      ],
    },
    plugins: [
      //new webpack.ProgressPlugin(),
      new ExtractTextPlugin('./css/tailwind.css', {
        disable: process.env.NODE_ENV === 'development',
      }),
      new HtmlWebpackPlugin( { template: './static/index.html' } )
    ],
    externals: {
        //three: 'three'
    }
  };