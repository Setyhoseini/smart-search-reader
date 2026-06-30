/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');

module.exports = {
  mode: 'production', // ✅ Add this to remove warning
  entry: './src/sw/service-worker.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.sw.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'service-worker.js',
    path: path.resolve(__dirname, 'public'),
  },
  // Add this for cleaner output
  optimization: {
    minimize: false, // Service workers should not be minified for debugging
  },
};