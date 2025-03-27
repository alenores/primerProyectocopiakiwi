import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcryptjs';

// Models
import User from '../models/User.js';
import Role from '../models/Role.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB');

    // Crear rol de administrador si no existe
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'admin',
        permissions: ['all']
      });
      console.log('Rol de administrador creado');
    }

    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@admin.com',
      password: hashedPassword,
      name: 'Administrador',
      role: adminRole._id,
      business: 'Peluquería Admin'
    });

    console.log('Usuario administrador creado exitosamente:');
    console.log('Email: admin@admin.com');
    console.log('Contraseña: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
};

createAdminUser();
