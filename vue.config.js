const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  publicPath: '/',
  pwa: {
    workboxPluginMode: 'GenerateSW',
      workboxOptions: {
          skipWaiting: true
      }
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: path.join(__dirname, "./docs"),
        to: path.join(__dirname, "dist/docs"),
        toType: "dir"
      },
      {
        from: path.join(__dirname, "node_modules/@hms-dbmi/vizarr"),
        to: path.join(__dirname, "dist/vizarr_module"),
        toType: "dir"
      }
    ])]
  }
}