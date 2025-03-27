import api from '@/services/api'

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  },
  getters: {
    isLoggedIn: state => !!state.token,
    currentUser: state => state.user,
    isSuperAdmin: state => state.user?.role?.name === 'owner',
    isBusinessAdmin: state => state.user?.role?.name === 'business_admin',
    hasPermission: state => permission => {
      if (!state.user || !state.user.role) return false
      return state.user.role.permissions?.includes(permission)
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await api.post('/auth/login', credentials)
        const { token, user } = response.data
        commit('SET_TOKEN', token)
        commit('SET_USER', user)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        return user
      } catch (error) {
        throw error.response?.data?.error || 'Error al iniciar sesión'
      }
    },
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_USER', null)
      delete api.defaults.headers.common['Authorization']
    }
  }
}
