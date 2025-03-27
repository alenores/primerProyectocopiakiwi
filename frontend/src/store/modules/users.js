import api from '@/services/api'

export default {
  namespaced: true,

  state: {
    list: [],
    loading: false,
    error: null,
    currentUser: null
  },

  mutations: {
    SET_USERS(state, users) {
      state.list = users
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user
    },
    ADD_USER(state, user) {
      state.list.push(user)
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.list.findIndex(u => u._id === updatedUser._id)
      if (index !== -1) {
        state.list.splice(index, 1, updatedUser)
      }
    },
    REMOVE_USER(state, userId) {
      const index = state.list.findIndex(u => u._id === userId)
      if (index !== -1) {
        state.list.splice(index, 1)
      }
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async fetch({ commit }) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.get('/users')
        commit('SET_USERS', data)
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchById({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.get(`/users/${userId}`)
        commit('SET_CURRENT_USER', data)
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchByRole({ commit }, role) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.get(`/users/role/${role}`)
        commit('SET_USERS', data)
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async create({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.post('/users', userData)
        commit('ADD_USER', data)
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async update({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.put(`/users/${userData._id}`, userData)
        commit('UPDATE_USER', data)
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updateProfile({ commit }, profileData) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.put('/users/profile', profileData)
        // Actualizamos el usuario en el store de autenticación
        commit('auth/SET_USER', data, { root: true })
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async uploadPhoto({ commit }, formData) {
      commit('SET_LOADING', true)
      try {
        const { data } = await api.post('/users/upload-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        commit('auth/SET_USER', data, { root: true })
        return data
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async remove({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        await api.delete(`/users/${userId}`)
        commit('REMOVE_USER', userId)
        return true
      } catch (error) {
        commit('SET_ERROR', error.response?.data?.msg || error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },

  getters: {
    getUserById: state => id => {
      return state.list.find(user => user._id === id) || null
    },
    getUsersByRole: state => roleName => {
      return state.list.filter(user => user.role?.name === roleName)
    },
    getActiveUsers: state => {
      return state.list.filter(user => user.active)
    }
  }
}
