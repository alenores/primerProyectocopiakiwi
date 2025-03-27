<!-- Login.vue -->
<template lang="pug">
auth-layout
  v-row(align="center" justify="center")
    v-col(cols="12" sm="8" md="4")
      v-card(class="elevation-12")
        v-toolbar(color="primary" dark flat)
          v-toolbar-title Iniciar Sesión
        v-card-text
          v-form(ref="form" v-model="valid" @submit.prevent="handleLogin")
            v-text-field(
              v-model="email"
              label="Email"
              name="email"
              prepend-icon="mdi-email"
              type="text"
              :rules="emailRules"
            )
            v-text-field(
              v-model="password"
              label="Contraseña"
              name="password"
              prepend-icon="mdi-lock"
              type="password"
              :rules="passwordRules"
            )
        v-card-actions
          v-spacer
          v-btn(
            color="primary"
            @click="handleLogin"
            :loading="loading"
            :disabled="!valid"
          ) Ingresar
</template>

<script>
import { mapActions } from 'vuex'
import AuthLayout from '@/layouts/AuthLayout.vue'

export default {
  name: 'Login',
  components: {
    AuthLayout
  },
  data: () => ({
    valid: false,
    loading: false,
    email: '',
    password: '',
    emailRules: [
      v => !!v || 'El email es requerido',
      v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
    ],
    passwordRules: [
      v => !!v || 'La contraseña es requerida',
      v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
    ]
  }),
  methods: {
    ...mapActions('auth', ['login']),
    async handleLogin() {
      if (this.$refs.form.validate()) {
        this.loading = true
        try {
          await this.login({
            email: this.email,
            password: this.password
          })
          this.$router.push('/dashboard')
        } catch (error) {
          this.$toast.error(error)
        } finally {
          this.loading = false
        }
      }
    }
  }
}
</script>
