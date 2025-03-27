<template lang="pug">
main-layout(:drawer="drawer")
  v-card(class="elevation-2")
    v-card-title
      | Configuración
    
    v-card-text
      v-tabs(v-model="tab")
        v-tab(href="#general") General
        v-tab(href="#notifications") Notificaciones
        v-tab(href="#theme") Apariencia
      
      v-tabs-items(v-model="tab")
        v-tab-item(value="general")
          v-card(flat)
            v-card-text
              v-list-item
                v-list-item-content
                  v-list-item-title Idioma
                  v-list-item-subtitle Selecciona tu idioma preferido
                v-list-item-action
                  v-select(
                    v-model="settings.language"
                    :items="languages"
                    item-text="name"
                    item-value="code"
                    dense
                    outlined
                    hide-details
                    style="width: 150px"
                  )
                  
              v-divider
              
              v-list-item
                v-list-item-content
                  v-list-item-title Zona horaria
                  v-list-item-subtitle Configura tu zona horaria
                v-list-item-action
                  v-select(
                    v-model="settings.timezone"
                    :items="timezones"
                    dense
                    outlined
                    hide-details
                    style="width: 180px"
                  )

        v-tab-item(value="notifications")
          v-card(flat)
            v-card-text
              v-switch(
                v-model="settings.emailNotifications"
                label="Notificaciones por correo electrónico"
              )
              v-switch(
                v-model="settings.pushNotifications"
                label="Notificaciones push"
              )
              v-switch(
                v-model="settings.smsNotifications"
                label="Notificaciones SMS"
              )
              
        v-tab-item(value="theme")
          v-card(flat)
            v-card-text
              v-radio-group(v-model="settings.theme" row)
                v-radio(
                  label="Claro"
                  value="light"
                )
                v-radio(
                  label="Oscuro"
                  value="dark"
                )
                v-radio(
                  label="Sistema"
                  value="system"
                )
              
              v-select(
                v-model="settings.primaryColor"
                :items="colors"
                label="Color primario"
                outlined
              )
    
    v-card-actions
      v-spacer
      v-btn(
        color="primary"
        @click="saveSettings"
        :loading="loading"
      )
        v-icon(left) mdi-content-save
        | Guardar configuración
</template>

<script>
import MainLayout from '@/layouts/MainLayout.vue'

export default {
  name: 'Settings',
  components: {
    MainLayout
  },
  data: () => ({
    drawer: true,
    tab: 'general',
    loading: false,
    settings: {
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      theme: 'light',
      primaryColor: 'primary'
    },
    languages: [
      { name: 'Español', code: 'es' },
      { name: 'Inglés', code: 'en' }
    ],
    timezones: [
      'America/Argentina/Buenos_Aires',
      'America/Argentina/Cordoba',
      'America/Argentina/Mendoza'
    ],
    colors: [
      'primary',
      'secondary',
      'accent',
      'success',
      'info',
      'warning',
      'error'
    ]
  }),
  methods: {
    async saveSettings() {
      this.loading = true
      // Simular guardado
      setTimeout(() => {
        this.loading = false
        this.$toast.success('Configuración guardada correctamente')
      }, 500)
    }
  },
  created() {
    // Cargar configuración del usuario
    // En un caso real, esto vendría de una API
  }
}
</script>
