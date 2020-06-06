module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/image-viewer/'
  : '/',
  configureWebpack: () => {

  }
}