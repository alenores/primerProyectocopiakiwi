module.exports = {
  transpileDependencies: ['vuetify'],
  
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },

  // Configuración del título de la página
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'GrinPlace - Venta y reparación de celulares',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },

  // Configuración de PWA
  pwa: {
    name: 'GrinPlace',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
  },

  chainWebpack: config => {
    config.plugin('define').tap(args => {
      Object.assign(args[0]['process.env'], {
        VUE_APP_VERSION: JSON.stringify(require('./package.json').version),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      });
      return args;
    });
  },

  css: {
    extract: { ignoreOrder: true },
    loaderOptions: {
      sass: {
        additionalData: '@import "@/assets/styles/variables.scss"'
      }
    }
  }
}
