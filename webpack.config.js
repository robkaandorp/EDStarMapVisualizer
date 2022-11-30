const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: [ "./src/scripts/client.ts" ],
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
      ],
    },
    plugins: [
      //new webpack.ProgressPlugin(),
      new HtmlWebpackPlugin( { template: './static/index.html' } )
    ],
    externals: {
        //three: 'three'
    }
  };