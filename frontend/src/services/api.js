import axios from 'axios'
import store from '@/store'
import router from '@/router'
import Vue from 'vue'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Determinar qué tipo de token está siendo usado
      const hasAdminToken = localStorage.getItem('token')

      if (hasAdminToken) {
        // Limpiar token y estado de autenticación de admin
      localStorage.removeItem('token')
      store.commit('auth/SET_TOKEN', null)
      store.commit('auth/SET_USER', null)
      
        // Redirigir a login admin si no estamos ya en esa página
        if (router.currentRoute.name !== 'AdminLogin') {
          router.push('/admin/login')
        }
      }
    }

    if (error.response) {
      switch (error.response.status) {
        case 403:
          Vue.$toast.error('Sin permisos para realizar esta acción')
          break
        case 500:
          Vue.$toast.error('Error del servidor')
          break
        default:
          Vue.$toast.error('Error en la petición')
      }
    } else if (error.request) {
      Vue.$toast.error('Error de red - No se pudo conectar con el servidor')
    }
    return Promise.reject(error)
  }
)

export default api
