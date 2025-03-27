import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'

Vue.use(VueRouter)

// Admin routes
import UserManagement from '../views/admin/UserManagement.vue'
import RoleManagement from '../views/admin/RoleManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true, requiresPermission: 'manage_settings' }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresPermission: 'manage_users' }
  },
  {
    path: '/admin/roles',
    name: 'RoleManagement',
    component: RoleManagement,
    meta: { requiresAuth: true, requiresPermission: 'manage_roles' }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Navegación guard
router.beforeEach((to, from, next) => {
  console.log('Navigation guard running for route:', to.path)
  
  // Verificar autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresPermission = to.matched.some(record => record.meta.requiresPermission)
  const isGuestRoute = to.matched.some(record => record.meta.guest)
  
  const isAuthenticated = store.getters['auth/isLoggedIn']
  console.log('Is authenticated?', isAuthenticated)

  // Redirigir a login si intenta acceder a rutas protegidas sin estar autenticado
  if (requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login page')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Si está autenticado e intenta acceder a rutas de guest (como login)
  if (isGuestRoute && isAuthenticated) {
    console.log('Authenticated user trying to access guest route, redirecting to /')
    next('/')
    return
  }

  // Verificar permisos específicos solo si la ruta lo requiere
  if (requiresPermission && isAuthenticated) {
    const permission = to.meta.requiresPermission
    const hasPermission = store.getters['auth/hasPermission'](permission)
    console.log('Checking permission:', permission, 'Has permission?', hasPermission)
    
    if (!hasPermission) {
      console.log('User lacks required permission, redirecting to /')
      next('/')
      return
    }
  }

  console.log('Navigation allowed to:', to.path)
  next()
})

export default router
