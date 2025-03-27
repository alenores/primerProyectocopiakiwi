<!-- Dashboard.vue -->
<template lang="pug">
main-layout(:drawer="drawer")
  v-row
    v-col(cols="12")
      h1.text-h4.mb-4 Dashboard
  
  template(v-if="isSuperAdmin")
    v-row
      v-col(cols="12" md="6" lg="3")
        v-card(outlined)
          v-card-text
            div.text-h6.mb-2 Negocios Registrados
            div.text-h4 {{ totalBusinesses || 0 }}
      v-col(cols="12" md="6" lg="3")
        v-card(outlined)
          v-card-text
            div.text-h6.mb-2 Usuarios Activos
            div.text-h4 {{ activeUsers || 0 }}
  
  template(v-else-if="isBusinessAdmin")
    v-row
      v-col(cols="12" md="6" lg="3")
        v-card(outlined)
          v-card-text
            div.text-h6.mb-2 Empleados
            div.text-h4 {{ totalEmployees || 0 }}
      v-col(cols="12" md="6" lg="3")
        v-card(outlined)
          v-card-text
            div.text-h6.mb-2 Servicios Activos
            div.text-h4 {{ activeServices || 0 }}
  
  v-row.mt-4
    v-col(cols="12")
      v-card
        v-card-title
          | Actividad Reciente
          v-spacer
          v-text-field(
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
          )
        v-data-table(
          :headers="headers"
          :items="activities"
          :search="search"
          :loading="loading"
        )
</template>

<script>
import { mapGetters } from 'vuex'
import MainLayout from '@/layouts/MainLayout.vue'

export default {
  name: 'Dashboard',
  components: {
    MainLayout
  },
  data: () => ({
    drawer: true,
    search: '',
    loading: false,
    headers: [
      { text: 'Tipo', value: 'type' },
      { text: 'Descripción', value: 'description' },
      { text: 'Fecha', value: 'date' },
      { text: 'Usuario', value: 'user' }
    ],
    activities: [],
    totalBusinesses: 0,
    activeUsers: 0,
    totalEmployees: 0,
    activeServices: 0
  }),
  computed: {
    ...mapGetters('auth', ['isSuperAdmin', 'isBusinessAdmin'])
  },
  created() {
    this.loadDashboardData()
  },
  methods: {
    loadDashboardData() {
      this.loading = true
      // Datos de ejemplo, en una aplicación real estos datos vendrían de una API
      setTimeout(() => {
        // Mock data
        if (this.isSuperAdmin) {
          this.totalBusinesses = 5
          this.activeUsers = 15
        } else if (this.isBusinessAdmin) {
          this.totalEmployees = 8
          this.activeServices = 12
        }
        
        this.activities = [
          {
            type: 'Venta',
            description: 'Venta de iPhone 13 Pro',
            date: '2025-03-20 10:30',
            user: 'Juan Pérez'
          },
          {
            type: 'Reparación',
            description: 'Cambio de batería Samsung S21',
            date: '2025-03-20 09:15',
            user: 'Ana Gómez'
          },
          {
            type: 'Inventario',
            description: 'Ingreso de 10 fundas iPhone',
            date: '2025-03-19 16:45',
            user: 'Carlos Rodríguez'
          }
        ]
        
        this.loading = false
      }, 500)
    }
  }
}
</script>
