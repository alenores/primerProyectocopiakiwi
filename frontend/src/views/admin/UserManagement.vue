<template lang="pug">
main-layout(:drawer="drawer")
  v-container.mt-3(fluid)
    v-card.mb-5
      v-card-title
        span Gestión de Usuarios
        v-spacer
        v-text-field(
          v-model="search"
          append-icon="mdi-magnify"
          label="Buscar"
          single-line
          hide-details
        )
        v-spacer
        v-btn(
          color="primary"
          @click="openDialog()"
          class="ml-2"
        )
          v-icon(left) mdi-plus
          span Nuevo Usuario
          
      v-data-table(
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      )
        template(v-slot:item.photo="{ item }")
          v-avatar(size="36")
            v-img(v-if="item.photo" :src="item.photo" :alt="item.name")
            v-icon(v-else) mdi-account
            
        template(v-slot:item.role="{ item }")
          v-chip(
            :color="getRoleColor(item.role?.name)"
            text-color="white"
            small
          ) {{ item.role?.name || 'Sin rol' }}
          
        template(v-slot:item.active="{ item }")
          v-chip(
            :color="item.active ? 'success' : 'error'"
            text-color="white"
            small
          ) {{ item.active ? 'Activo' : 'Inactivo' }}
          
        template(v-slot:item.actions="{ item }")
          v-btn(
            icon
            small
            @click="openDialog(item)"
            color="info"
          )
            v-icon mdi-pencil
          v-btn(
            icon
            small
            @click="confirmDelete(item)"
            color="error"
            :disabled="item.role?.name === 'owner'"
          )
            v-icon mdi-delete
    
    // Dialog para crear/editar usuario
    v-dialog(
      v-model="dialog"
      max-width="600px"
    )
      v-card
        v-card-title
          span {{ editing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        
        v-card-text
          v-form(ref="form" v-model="valid")
            v-container
              v-row
                v-col(cols="12" sm="6")
                  v-text-field(
                    v-model="formData.name"
                    label="Nombre"
                    :rules="nameRules"
                    required
                  )
                
                v-col(cols="12" sm="6")
                  v-text-field(
                    v-model="formData.email"
                    label="Email"
                    :rules="emailRules"
                    required
                  )
                
                v-col(cols="12" sm="6")
                  v-text-field(
                    v-model="formData.password"
                    label="Contraseña"
                    :rules="passwordRules"
                    :required="!editing"
                    type="password"
                    hint="Dejar en blanco para mantener la misma contraseña"
                    persistent-hint
                  )
                
                v-col(cols="12" sm="6")
                  v-select(
                    v-model="formData.role"
                    :items="roles"
                    item-text="name"
                    item-value="_id"
                    label="Rol"
                    :rules="roleRules"
                    required
                  )
                
                v-col(cols="12" sm="6")
                  v-select(
                    v-model="formData.business"
                    :items="businesses"
                    item-text="name"
                    item-value="_id"
                    label="Negocio"
                    clearable
                  )
                
                v-col(cols="12" sm="6")
                  v-switch(
                    v-model="formData.active"
                    label="Usuario Activo"
                    color="success"
                  )
        
        v-card-actions
          v-spacer
          v-btn(text @click="dialog = false") Cancelar
          v-btn(
            color="primary"
            @click="saveUser"
            :loading="saving"
            :disabled="!valid || saving"
          ) Guardar
    
    // Dialog de confirmación para eliminar
    v-dialog(
      v-model="deleteDialog"
      max-width="400px"
    )
      v-card
        v-card-title.error--text
          | Eliminar Usuario
        
        v-card-text
          | ¿Estás seguro de que quieres eliminar al usuario {{ userToDelete?.name }}? Esta acción no se puede deshacer.
        
        v-card-actions
          v-spacer
          v-btn(text @click="deleteDialog = false") Cancelar
          v-btn(
            color="error"
            @click="deleteUser"
            :loading="deleting"
          ) Eliminar
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MainLayout from '@/layouts/MainLayout.vue'

export default {
  name: 'UserManagement',
  components: {
    MainLayout
  },
  data: () => ({
    drawer: true,
    search: '',
    loading: false,
    saving: false,
    deleting: false,
    dialog: false,
    deleteDialog: false,
    userToDelete: null,
    editing: false,
    valid: false,
    headers: [
      { text: 'Foto', value: 'photo', sortable: false },
      { text: 'Nombre', value: 'name' },
      { text: 'Email', value: 'email' },
      { text: 'Rol', value: 'role.name' },
      { text: 'Negocio', value: 'business.name' },
      { text: 'Estado', value: 'active' },
      { text: 'Acciones', value: 'actions', sortable: false }
    ],
    formData: {
      name: '',
      email: '',
      password: '',
      role: '',
      business: null,
      active: true
    },
    nameRules: [
      v => !!v || 'El nombre es requerido'
    ],
    emailRules: [
      v => !!v || 'El email es requerido',
      v => /.+@.+\..+/.test(v) || 'Email inválido'
    ],
    passwordRules: [
      v => (this.editing && !v) || (v && v.length >= 6) || 'La contraseña debe tener al menos 6 caracteres'
    ],
    roleRules: [
      v => !!v || 'El rol es requerido'
    ],
    businesses: [] // Esto se debe cargar de la API
  }),
  
  computed: {
    ...mapState({
      users: state => state.users.list,
      roles: state => state.roles.list
    })
  },
  
  methods: {
    ...mapActions({
      fetchUsers: 'users/fetch',
      fetchRoles: 'roles/fetch',
      createUser: 'users/create',
      updateUser: 'users/update',
      removeUser: 'users/remove'
    }),
    
    getRoleColor(role) {
      const colors = {
        owner: 'deep-purple',
        admin: 'primary',
        manager: 'teal',
        employee: 'green',
        technician: 'orange',
        cashier: 'blue',
        customer: 'blue-grey'
      };
      return colors[role] || 'grey';
    },
    
    openDialog(user = null) {
      this.editing = !!user;
      
      if (user) {
        this.formData = {
          _id: user._id,
          name: user.name,
          email: user.email,
          password: '',
          role: user.role?._id,
          business: user.business?._id,
          active: user.active
        };
      } else {
        this.formData = {
          name: '',
          email: '',
          password: '',
          role: '',
          business: null,
          active: true
        };
      }
      
      this.dialog = true;
      // Necesitamos esperar a que el DOM se actualice antes de validar
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      });
    },
    
    async saveUser() {
      if (!this.$refs.form.validate()) return;
      
      this.saving = true;
      try {
        // Si no hay contraseña y estamos editando, eliminarla del objeto
        const userData = { ...this.formData };
        if (this.editing && !userData.password) {
          delete userData.password;
        }
        
        if (this.editing) {
          await this.updateUser(userData);
          this.$toast.success('Usuario actualizado correctamente');
        } else {
          await this.createUser(userData);
          this.$toast.success('Usuario creado correctamente');
        }
        
        this.dialog = false;
      } catch (error) {
        this.$toast.error(`Error: ${error.message || 'No se pudo guardar el usuario'}`);
      } finally {
        this.saving = false;
      }
    },
    
    confirmDelete(user) {
      this.userToDelete = user;
      this.deleteDialog = true;
    },
    
    async deleteUser() {
      if (!this.userToDelete) return;
      
      this.deleting = true;
      try {
        await this.removeUser(this.userToDelete._id);
        this.$toast.success('Usuario eliminado correctamente');
        this.deleteDialog = false;
        this.userToDelete = null;
      } catch (error) {
        this.$toast.error(`Error: ${error.message || 'No se pudo eliminar el usuario'}`);
      } finally {
        this.deleting = false;
      }
    },
    
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchUsers(),
          this.fetchRoles(),
          // Aquí se deberían cargar los negocios también
          // await this.fetchBusinesses()
        ]);
      } catch (error) {
        this.$toast.error('Error al cargar los datos');
      } finally {
        this.loading = false;
      }
    }
  },
  
  created() {
    this.loadData();
  }
}
</script>

<style scoped>
.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-x: auto;
}
</style>
