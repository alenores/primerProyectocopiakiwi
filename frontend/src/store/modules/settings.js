import api from '@/services/api'

export default {
  namespaced: true,

  state: {
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'es',
    notifications: JSON.parse(localStorage.getItem('notifications') || 'true'),
    interfaceSettings: JSON.parse(localStorage.getItem('interfaceSettings') || '{}'),
    loading: false,
    error: null
  },

  mutations: {
    SET_THEME(state, theme) {
      state.theme = theme
      localStorage.setItem('theme', theme)
    },
    SET_LANGUAGE(state, language) {
      state.language = language
      localStorage.setItem('language', language)
    },
    SET_NOTIFICATIONS(state, enabled) {
      state.notifications = enabled
      localStorage.setItem('notifications', JSON.stringify(enabled))
    },
    SET_INTERFACE_SETTINGS(state, settings) {
      state.interfaceSettings = { ...state.interfaceSettings, ...settings }
      localStorage.setItem('interfaceSettings', JSON.stringify(state.interfaceSettings))
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },

  actions: {
    async saveSettings({ commit, rootGetters, state }, settings) {
      commit('SET_LOADING', true)
      try {
        if (settings.theme) {
          commit('SET_THEME', settings.theme)
        }
        if (settings.language) {
          commit('SET_LANGUAGE', settings.language)
        }
        if (settings.notifications !== undefined) {
          commit('SET_NOTIFICATIONS', settings.notifications)
        }
        if (settings.interfaceSettings) {
          commit('SET_INTERFACE_SETTINGS', settings.interfaceSettings)
        }

        // Sincronizar con el backend si el usuario está autenticado
        if (rootGetters['auth/isLoggedIn']) {
          await api.post('/users/settings', {
            theme: settings.theme || state.theme,
            language: settings.language || state.language,
            notifications: settings.notifications !== undefined ? settings.notifications : state.notifications,
            interfaceSettings: settings.interfaceSettings || state.interfaceSettings
          })
        }

        return { success: true }
      } catch (error) {
        commit('SET_ERROR', error.message)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchSettings({ commit, rootGetters }) {
      commit('SET_LOADING', true)
      try {
        // Solo hacer la petición si el usuario está autenticado
        if (rootGetters['auth/isLoggedIn']) {
          const { data } = await api.get('/users/settings')
          
          if (data.theme) {
            commit('SET_THEME', data.theme)
          }
          if (data.language) {
            commit('SET_LANGUAGE', data.language)
          }
          if (data.notifications !== undefined) {
            commit('SET_NOTIFICATIONS', data.notifications)
          }
          if (data.interfaceSettings) {
            commit('SET_INTERFACE_SETTINGS', data.interfaceSettings)
          }
        }
        
        return { success: true }
      } catch (error) {
        commit('SET_ERROR', error.message)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },

    resetSettings({ commit }) {
      commit('SET_THEME', 'light')
      commit('SET_LANGUAGE', 'es')
      commit('SET_NOTIFICATIONS', true)
      commit('SET_INTERFACE_SETTINGS', {})
      return { success: true }
    }
  },

  getters: {
    isDarkMode: state => state.theme === 'dark',
    currentLanguage: state => state.language,
    notificationsEnabled: state => state.notifications,
    getInterfaceSetting: state => key => {
      return state.interfaceSettings[key] || null
    }
  }
}
