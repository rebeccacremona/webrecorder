const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const assetsPath = path.resolve(__dirname, '../static/dist');
const smp = new SpeedMeasurePlugin();


module.exports = smp.wrap({
  devtool: 'cheap-module-source-map',
  context: path.resolve(__dirname, '..'),

  output: {
    path: assetsPath,
    publicPath: '/static/',
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js'
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        include: [
          path.resolve(__dirname, '../src'),
          path.resolve(__dirname, '../node_modules/react-rte'),
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => {
                return [
                  autoprefixer({
                    browsers: [
                      '>1%',
                      'last 4 versions',
                      'Firefox ESR',
                      'not ie < 10',
                    ]
                  })
                ];
              }
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        include: /node_modules\/react-rte/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules\/react-rte/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream'
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'image/svg+xml'
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 10240
        }
      }
    ]
  },

  resolve: {
    alias: {
      components: path.resolve(__dirname, '../src/components'),
      containers: path.resolve(__dirname, '../src/containers'),
      helpers: path.resolve(__dirname, '../src/helpers'),
      store: path.resolve(__dirname, '../src/store'),
      shared: path.resolve(__dirname, '../src/shared'),
      config: path.resolve(__dirname, '../src/config.js'),
      routes: path.resolve(__dirname, '../src/routes.js')
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, '../src'),
    ],
    extensions: ['.json', '.js']
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      APP_HOST: null,
      ANNOUNCE_MAILING_LIST: null,
      CONTENT_HOST: 8092,
      FRONTEND_PORT: 8095,
      NODE_ENV: 'development',
      SCHEME: 'http'
    })
  ]
});