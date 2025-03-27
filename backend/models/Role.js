import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    maxLength: 200
  },
  permissions: [{
    type: String,
    enum: [
      'owner',  // Permiso especial para dueños
      'manage_users',  // Gestionar usuarios
      'manage_roles',  // Gestionar roles
      'manage_businesses',  // Gestionar negocios
      'manage_inventory',  // Gestionar inventario
      'manage_suppliers',  // Gestionar proveedores
      'manage_repairs',  // Gestionar reparaciones
      'manage_sales',  // Gestionar ventas
      'manage_customers',  // Gestionar clientes
      'manage_cash',  // Gestionar caja
      'manage_brands',  // Gestionar marcas
      'manage_products',  // Gestionar productos
      'manage_services',  // Gestionar servicios
      'manage_reports',  // Gestionar reportes
      'manage_settings',  // Gestionar configuraciones
      'view_dashboard',  // Ver dashboard
      'view_reports',  // Ver reportes
      'execute_sales',  // Ejecutar ventas
      'execute_repairs',  // Ejecutar reparaciones
      'approve_budgets',  // Aprobar presupuestos
      'manage_documents',  // Gestionar documentos
      'manage_tasks',  // Gestionar tareas
      'manage_users',  // Gestionar usuarios
      'manage_roles',  // Gestionar roles
    ]
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Método estático para obtener todos los permisos disponibles
roleSchema.statics.getAvailablePermissions = function() {
  return this.schema.path('permissions.0').enumValues;
};

const Role = mongoose.model('Role', roleSchema);

export default Role;
