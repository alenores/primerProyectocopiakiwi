<template lang="pug">
main-layout(:drawer="drawer")
  v-card(class="elevation-2")
    v-card-title
      | Perfil de Usuario
      v-spacer
      v-btn(color="primary" @click="editable = !editable")
        v-icon(left) {{ editable ? 'mdi-cancel' : 'mdi-pencil' }}
        | {{ editable ? 'Cancelar' : 'Editar' }}
    
    v-card-text.text-center
      v-avatar(size="150")
        v-img(
          v-if="currentUser && currentUser.photo" 
          :src="currentUser.photo"
          :alt="currentUser.name"
        )
        v-icon(v-else size="80") mdi-account-circle

    v-card-text
      v-form(ref="form" v-model="valid" @submit.prevent="saveProfile")
        v-container
          v-row
            v-col(cols="12" md="6")
              v-text-field(
                v-model="formData.name"
                label="Nombre"
                :disabled="!editable"
                :rules="nameRules"
                prepend-icon="mdi-account"
              )
            v-col(cols="12" md="6")
              v-text-field(
                v-model="formData.email"
                label="Email"
                :disabled="!editable"
                :rules="emailRules"
                prepend-icon="mdi-email"
              )
            v-col(cols="12" v-if="editable")
              v-text-field(
                v-model="formData.password"
                label="Nueva Contraseña (opcional)"
                :rules="passwordRules"
                prepend-icon="mdi-lock"
                type="password"
              )
            v-col(cols="12")
              v-text-field(
                v-model="businessName"
                label="Negocio"
                disabled
                prepend-icon="mdi-store"
              )
            v-col(cols="12")
              v-text-field(
                v-model="roleName"
                label="Rol"
                disabled
                prepend-icon="mdi-badge-account"
              )
            v-col(cols="12" v-if="editable")
              v-btn(color="primary" @click="$refs.fileInput.click()" :disabled="loading")
                v-icon(left) mdi-camera
                | Cambiar foto
              input(
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileChange"
              )
              
    v-card-actions(v-if="editable")
      v-spacer
      v-btn(color="primary" @click="saveProfile" :loading="loading" :disabled="!valid")
        v-icon(left) mdi-content-save
        | Guardar
</template>

<script>
import { mapGetters } from 'vuex'
import MainLayout from '@/layouts/MainLayout.vue'

export default {
  name: 'Profile',
  components: {
    MainLayout
  },
  data: () => ({
    drawer: true,
    editable: false,
    valid: true,
    loading: false,
    formData: {
      name: '',
      email: '',
      password: ''
    },
    nameRules: [
      v => !!v || 'El nombre es requerido'
    ],
    emailRules: [
      v => !!v || 'El email es requerido',
      v => /.+@.+\..+/.test(v) || 'Email inválido'
    ],
    passwordRules: [
      v => !v || v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
    ]
  }),
  computed: {
    ...mapGetters('auth', ['currentUser']),
    businessName() {
      return this.currentUser?.business?.name || 'No asignado'
    },
    roleName() {
      return this.currentUser?.role?.name || 'Sin rol'
    }
  },
  methods: {
    async saveProfile() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          // Filtrar campos vacíos
          const updateData = Object.fromEntries(
            Object.entries(this.formData).filter(([, value]) => value !== '')
          )
          
          // Actualizar perfil
          await this.$store.dispatch('users/updateProfile', updateData)
          this.editable = false
          this.$toast.success('Perfil actualizado correctamente')
        } catch (error) {
          this.$toast.error('Error al actualizar perfil')
        } finally {
          this.loading = false
        }
      }
    },
    async handleFileChange(event) {
      if (!event.target.files.length) return;
      
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        this.$toast.error('Solo se permiten imágenes');
        return;
      }
      
      this.loading = true;
      try {
        // Crear un FormData para enviar el archivo
        const formData = new FormData();
        formData.append('photo', file);
        
        // Subir la foto
        await this.$store.dispatch('users/uploadPhoto', formData);
        this.$toast.success('Foto actualizada correctamente');
      } catch (error) {
        this.$toast.error('Error al subir la foto');
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    // Inicializar formulario con datos del usuario
    if (this.currentUser) {
      this.formData.name = this.currentUser.name
      this.formData.email = this.currentUser.email
    }
  }
}
</script>
