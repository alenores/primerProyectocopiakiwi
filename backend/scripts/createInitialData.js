import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Business from '../models/Business.js';
import Role from '../models/Role.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const createInitialData = async () => {
  try {
    // Verificar que tenemos la URI de MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definida en el archivo .env');
    }

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Limpiar datos existentes
    await Promise.all([
      User.deleteMany({}),
      Business.deleteMany({}),
      Role.deleteMany({})
    ]);
    console.log('Datos existentes eliminados');

    // Crear roles
    const ownerRole = await Role.create({
      name: 'owner',
      permissions: [
        'owner',
        'manage_users',
        'manage_roles',
        'manage_businesses',
        'manage_inventory',
        'manage_suppliers',
        'manage_repairs',
        'manage_sales',
        'manage_customers',
        'manage_cash',
        'manage_brands',
        'manage_products',
        'manage_services',
        'manage_reports',
        'manage_settings',
        'view_dashboard',
        'view_reports',
        'execute_sales',
        'execute_repairs',
        'approve_budgets',
        'manage_documents',
        'manage_tasks'
      ]
    });

    const adminRole = await Role.create({
      name: 'business_admin',
      permissions: [
        'manage_inventory',
        'manage_suppliers',
        'manage_repairs',
        'manage_sales',
        'manage_customers',
        'manage_cash',
        'manage_products',
        'manage_services',
        'manage_reports',
        'manage_settings',
        'view_dashboard',
        'view_reports',
        'execute_sales',
        'execute_repairs',
        'approve_budgets',
        'manage_documents',
        'manage_tasks'
      ]
    });

    console.log('Roles creados');

    // Crear super admin
    const superAdmin = await User.create({
      email: 'superadmin@grinplace.com',
      password: 'SuperAdmin2024!',
      name: 'Super Administrador',
      role: ownerRole._id
    });
    console.log('Super Admin creado:', superAdmin.email);

    // Crear negocio
    const business = await Business.create({
      name: 'Grinplace',
      description: 'Venta y reparación de celulares',
      address: {
        street: 'Av. Principal',
        number: '123',
        city: 'Buenos Aires',
        state: 'CABA',
        country: 'Argentina',
        zipCode: '1000'
      },
      contact: {
        phone: '+54 11 1234-5678',
        email: 'contacto@grinplace.com',
        whatsapp: '+54 11 1234-5678'
      },
      services: ['phone_sales', 'phone_repair', 'accessories_sales'],
      schedule: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: '', close: '' }
      },
      owner: superAdmin._id
    });
    console.log('Negocio creado:', business.name);

    // Crear admin del negocio
    const businessAdmin = await User.create({
      email: 'admin@grinplace.com',
      password: 'Admin2024!',
      name: 'Administrador',
      role: adminRole._id,
      business: business._id
    });
    console.log('Admin del negocio creado:', businessAdmin.email);

    console.log('\nCredenciales de acceso:');
    console.log('Super Admin - Email: superadmin@grinplace.com, Password: SuperAdmin2024!');
    console.log('Admin - Email: admin@grinplace.com, Password: Admin2024!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
};

createInitialData();
