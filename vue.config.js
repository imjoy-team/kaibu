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
        from: path.join(__dirname, "node_modules/itk-vtk-viewer/dist/itkVtkViewer.js"),
        to: path.join(__dirname, "dist/itkVtkViewer.js"),
        toType: "file"
      },
      {
        context: 'node_modules/itk-vtk-viewer/dist/',
        from: '**/*.png',
        to: path.join(__dirname, "dist"),
        toType: "dir",
        force: true
      },
      {
        from: path.join(__dirname, "node_modules/itk-vtk-viewer/dist/itk"),
        to: path.join(__dirname, "dist/itk"),
        toType: "dir"
      }
    ])]
  }
}