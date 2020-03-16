module.exports = (env = 'development') => ({
  mode: env,
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  entry: {
    woogle: './client/index.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(ts|js)x?$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/,
        options: {
          presets: [
            ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
            '@babel/preset-typescript',
            '@babel/preset-react'
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json']
  }
});
