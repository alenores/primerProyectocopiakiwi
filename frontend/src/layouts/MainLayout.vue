<template lang="pug">
v-app
  v-navigation-drawer(
    v-model="drawer"
    app
    clipped
    v-if="isAuthenticated"
  )
    v-list(dense)
      v-list-item(
        v-for="item in filteredMenuItems"
        :key="item.title"
        :to="item.to"
        link
      )
        v-list-item-icon
          v-icon {{ item.icon }}
        v-list-item-content
          v-list-item-title {{ item.title }}

  v-app-bar(
    v-if="isAuthenticated"
    app
    clipped-left
    color="primary"
    dark
  )
    v-app-bar-nav-icon(@click.stop="drawer = !drawer")
    v-toolbar-title GrinPlace
    v-spacer
    v-menu(left bottom)
      template(v-slot:activator="{ on, attrs }")
        v-btn(
          icon
          v-bind="attrs"
          v-on="on"
        )
          v-icon mdi-account-circle
      v-list
        v-list-item(:to="{ name: 'Profile' }")
          v-list-item-icon
            v-icon mdi-account
          v-list-item-content
            v-list-item-title Perfil
        
        v-list-item(:to="{ name: 'Settings' }")
          v-list-item-icon
            v-icon mdi-cog
          v-list-item-content
            v-list-item-title Configuración
        
        v-divider
        
        v-divider.my-2(v-if="hasAdminAccess")
        
        v-list-item(@click="handleLogout")
          v-list-item-icon
            v-icon mdi-logout
          v-list-item-content
            v-list-item-title Cerrar sesión

  v-main
    v-container(fluid)
      slot
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MainLayout',
  
  props: {
    drawer: {
      type: Boolean,
      default: true
    }
  },
  
  data: () => ({
    miniVariant: false,
    menuItems: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
      { 
        title: 'Usuarios', 
        icon: 'mdi-account-group', 
        to: '/admin/users',
        requiresPermission: 'manage_users'
      },
      { 
        title: 'Roles', 
        icon: 'mdi-shield-account', 
        to: '/admin/roles',
        requiresPermission: 'manage_roles'
      }
    ]
  }),
  
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isLoggedIn',
      currentUser: 'auth/currentUser',
      hasPermission: 'auth/hasPermission'
    }),
    
    hasAdminAccess() {
      return this.hasPermission('manage_users') || this.hasPermission('manage_roles');
    },
    
    filteredMenuItems() {
      return this.menuItems.filter(item => {
        // Si el elemento no requiere permiso, mostrarlo siempre
        if (!item.requiresPermission) {
          return true;
        }
        
        // Verificar si el usuario tiene el permiso requerido
        return this.hasPermission(item.requiresPermission);
      });
    }
  },
  
  methods: {
    ...mapActions({
      logout: 'auth/logout'
    }),
    
    toggleMini() {
      this.miniVariant = !this.miniVariant;
    },
    
    async handleLogout() {
      try {
        await this.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      }
    }
  }
}
</script>
