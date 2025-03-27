import api from '../../services/api';

// State inicial
const state = {
  list: [],
  loading: false,
  error: null,
  currentRole: null,
  availablePermissions: []
};

// Getters
const getters = {
  roleById: state => id => state.list.find(r => r._id === id),
  roleByName: state => name => state.list.find(r => r.name === name)
};

// Mutations
const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_ROLES(state, roles) {
    state.list = roles;
  },
  SET_CURRENT_ROLE(state, role) {
    state.currentRole = role;
  },
  SET_AVAILABLE_PERMISSIONS(state, permissions) {
    state.availablePermissions = permissions;
  },
  ADD_ROLE(state, role) {
    state.list.push(role);
  },
  UPDATE_ROLE(state, updatedRole) {
    const index = state.list.findIndex(r => r._id === updatedRole._id);
    if (index !== -1) {
      state.list.splice(index, 1, updatedRole);
    }
  },
  REMOVE_ROLE(state, roleId) {
    state.list = state.list.filter(r => r._id !== roleId);
  }
};

// Actions
const actions = {
  // Obtener todos los roles
  async fetch({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.get('/roles');
      commit('SET_ROLES', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || 'Error al obtener roles');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener permisos disponibles
  async fetchPermissions({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.get('/roles/permissions/list');
      commit('SET_AVAILABLE_PERMISSIONS', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || 'Error al obtener permisos');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Obtener un rol por ID
  async fetchById({ commit }, id) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.get(`/roles/${id}`);
      commit('SET_CURRENT_ROLE', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || `Error al obtener rol ${id}`);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Crear un nuevo rol
  async create({ commit }, roleData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.post('/roles', roleData);
      commit('ADD_ROLE', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || 'Error al crear rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Actualizar un rol existente
  async update({ commit }, roleData) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      const response = await api.put(`/roles/${roleData._id}`, roleData);
      commit('UPDATE_ROLE', response.data);
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || 'Error al actualizar rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  // Eliminar un rol
  async remove({ commit }, roleId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    
    try {
      await api.delete(`/roles/${roleId}`);
      commit('REMOVE_ROLE', roleId);
      return true;
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.msg || 'Error al eliminar rol');
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
