module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ?
    './' // prod
    :
    '/', // dev
  configureWebpack: () => {

  }
}