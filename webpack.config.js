const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: 'inline-source-map',
  entry: './example.ts',
  output: {
    // path: path.resolve(__dirname, 'dist'),
    filename: 'example-markup-parser.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        use: "source-map-loader"
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: 'index.html', to: 'index.html'},
      {from: 'node_modules/spectre.css/dist/spectre.min.css', to: 'spectre.min.css'},
      {from: 'node_modules/open-color/open-color.css', to: 'open-color.css'},
      {from: 'example.css', to: 'example.css'},
    ])
  ]
};
