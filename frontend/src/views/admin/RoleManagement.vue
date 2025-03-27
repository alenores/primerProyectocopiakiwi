<template lang="pug">
main-layout(:drawer="drawer")
  v-container.mt-3(fluid)
    v-card.mb-5
      v-card-title
        span Gestión de Roles
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
          span Nuevo Rol
          
      v-data-table(
        :headers="headers"
        :items="roles"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      )
        template(v-slot:item.permissions="{ item }")
          v-chip-group
            v-chip(
              v-for="(permission, i) in item.permissions.slice(0, 2)"
              :key="i"
              x-small
              label
              class="mr-1"
            ) {{ formatPermission(permission) }}
            v-chip(
              v-if="item.permissions.length > 2"
              x-small
              label
              outlined
            ) +{{ item.permissions.length - 2 }}
            
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
            :disabled="item.name === 'owner'"
          )
            v-icon mdi-pencil
          v-btn(
            icon
            small
            @click="confirmDelete(item)"
            color="error"
            :disabled="item.name === 'owner'"
          )
            v-icon mdi-delete
    
    // Dialog para crear/editar rol
    v-dialog(
      v-model="dialog"
      max-width="800px"
    )
      v-card
        v-card-title
          span {{ editing ? 'Editar Rol' : 'Nuevo Rol' }}
        
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
                    v-model="formData.description"
                    label="Descripción"
                    :rules="descriptionRules"
                  )
                
                v-col(cols="12")
                  v-switch(
                    v-model="formData.active"
                    label="Rol Activo"
                    color="success"
                  )
                
                v-col(cols="12")
                  span.subtitle-1 Permisos
                  v-divider
                
                v-col(
                  v-for="(group, groupName) in permissionGroups"
                  :key="groupName"
                  cols="12"
                  md="6"
                  class="mb-4"
                )
                  v-card(outlined)
                    v-card-title.py-2
                      span.subtitle-1 {{ formatGroupName(groupName) }}
                    v-card-text.py-1
                      v-row(dense)
                        v-col(
                          v-for="permission in group"
                          :key="permission"
                          cols="12"
                        )
                          v-checkbox(
                            v-model="formData.permissions"
                            :label="formatPermission(permission)"
                            :value="permission"
                            hide-details
                            dense
                          )
        
        v-card-actions
          v-spacer
          v-btn(text @click="dialog = false") Cancelar
          v-btn(
            color="primary"
            @click="saveRole"
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
          | Eliminar Rol
        
        v-card-text
          | ¿Estás seguro de que quieres eliminar el rol {{ roleToDelete?.name }}? Esta acción afectará a los usuarios que tengan este rol asignado.
        
        v-card-actions
          v-spacer
          v-btn(text @click="deleteDialog = false") Cancelar
          v-btn(
            color="error"
            @click="deleteRole"
            :loading="deleting"
          ) Eliminar
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MainLayout from '@/layouts/MainLayout.vue'

export default {
  name: 'RoleManagement',
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
    roleToDelete: null,
    editing: false,
    valid: false,
    headers: [
      { text: 'Nombre', value: 'name' },
      { text: 'Descripción', value: 'description' },
      { text: 'Permisos', value: 'permissions' },
      { text: 'Estado', value: 'active' },
      { text: 'Acciones', value: 'actions', sortable: false }
    ],
    formData: {
      name: '',
      description: '',
      permissions: [],
      active: true
    },
    nameRules: [
      v => !!v || 'El nombre es requerido',
      v => (v && v.length <= 50) || 'El nombre no puede exceder los 50 caracteres'
    ],
    descriptionRules: [
      v => (!v || v.length <= 200) || 'La descripción no puede exceder los 200 caracteres'
    ]
  }),
  
  computed: {
    ...mapState({
      roles: state => state.roles.list,
      availablePermissions: state => state.roles.availablePermissions
    }),
    
    permissionGroups() {
      const groups = {
        manage: [],
        view: [],
        execute: [],
        approve: []
      };
      
      // Agrupar permisos por prefijo
      this.availablePermissions.forEach(permission => {
        if (permission === 'owner') return; // No incluir el permiso especial
        
        const prefix = permission.split('_')[0];
        if (groups[prefix]) {
          groups[prefix].push(permission);
        } else {
          groups.other = groups.other || [];
          groups.other.push(permission);
        }
      });
      
      return groups;
    }
  },
  
  methods: {
    ...mapActions({
      fetchRoles: 'roles/fetch',
      fetchPermissions: 'roles/fetchPermissions',
      createRole: 'roles/create',
      updateRole: 'roles/update',
      removeRole: 'roles/remove'
    }),
    
    formatPermission(permission) {
      const words = permission.split('_');
      return words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    },
    
    formatGroupName(groupName) {
      switch (groupName) {
        case 'manage': return 'Gestionar';
        case 'view': return 'Visualizar';
        case 'execute': return 'Ejecutar';
        case 'approve': return 'Aprobar';
        default: return 'Otros';
      }
    },
    
    openDialog(role = null) {
      this.editing = !!role;
      
      if (role) {
        this.formData = {
          _id: role._id,
          name: role.name,
          description: role.description || '',
          permissions: [...role.permissions],
          active: role.active
        };
      } else {
        this.formData = {
          name: '',
          description: '',
          permissions: [],
          active: true
        };
      }
      
      this.dialog = true;
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
      });
    },
    
    async saveRole() {
      if (!this.$refs.form.validate()) return;
      
      this.saving = true;
      try {
        const roleData = { ...this.formData };
        
        if (this.editing) {
          await this.updateRole(roleData);
          this.$toast.success('Rol actualizado correctamente');
        } else {
          await this.createRole(roleData);
          this.$toast.success('Rol creado correctamente');
        }
        
        this.dialog = false;
      } catch (error) {
        this.$toast.error(`Error: ${error.message || 'No se pudo guardar el rol'}`);
      } finally {
        this.saving = false;
      }
    },
    
    confirmDelete(role) {
      this.roleToDelete = role;
      this.deleteDialog = true;
    },
    
    async deleteRole() {
      if (!this.roleToDelete) return;
      
      this.deleting = true;
      try {
        await this.removeRole(this.roleToDelete._id);
        this.$toast.success('Rol eliminado correctamente');
        this.deleteDialog = false;
        this.roleToDelete = null;
      } catch (error) {
        this.$toast.error(`Error: ${error.message || 'No se pudo eliminar el rol'}`);
      } finally {
        this.deleting = false;
      }
    },
    
    async loadData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchRoles(),
          this.fetchPermissions()
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
