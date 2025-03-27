import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { uploadToS3, deleteFromS3 } from '../services/s3Service.js';
import path from 'path';

const router = express.Router();

// Validation rules
const userValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
  body('role')
    .optional()
    .isMongoId().withMessage('ID de rol inválido'),
  body('business')
    .optional()
    .isMongoId().withMessage('ID de negocio inválido'),
  body('active')
    .optional()
    .isBoolean().withMessage('El estado debe ser verdadero o falso')
];

// GET /api/users - Get all users
router.get('/',
  authenticate,
  authorize('manage_users'),
  async (req, res, next) => {
    try {
      const users = await User.find()
        .select('-password')
        .populate('role')
        .populate('business');
      res.json(users);
    } catch (error) {
      next(error);
    }
});

// GET /api/users/:id - Get a single user
router.get('/:id',
  authenticate,
  authorize('manage_users'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password')
        .populate('role')
        .populate('business');
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
});

// POST /api/users - Create a new user
router.post('/',
  authenticate,
  authorize('manage_users'),
  [
    ...userValidation,
    body('password')
      .notEmpty().withMessage('La contraseña es requerida')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = new User(req.body);
      await user.save();

      const userResponse = await User.findById(user._id)
        .select('-password')
        .populate('role')
        .populate('business');

      res.status(201).json(userResponse);
    } catch (error) {
      next(error);
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id',
  authenticate,
  authorize('manage_users'),
  userValidation,
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Verificar si el email ya existe en otro usuario
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Si se proporciona una nueva contraseña, asegurarse de que cumpla con los requisitos
      if (req.body.password) {
        const passwordValidation = [
          body('password')
            .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
            .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
        ];
        await Promise.all(passwordValidation.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            error: 'Error de validación',
            details: errors.array()
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      )
      .select('-password')
      .populate('role')
      .populate('business');

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
});

// DELETE /api/users/:id - Delete a user
router.delete('/:id',
  authenticate,
  authorize('manage_users'),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Prevenir la eliminación del último super admin
      if (user.role === 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin' });
        if (superAdminCount <= 1) {
          return res.status(400).json({ 
            error: 'No se puede eliminar el último super administrador' 
          });
        }
      }

      await user.deleteOne();
      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
});

// GET /api/users/settings - Get user settings
router.get('/settings',
  authenticate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select('settings');
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json(user.settings || {});
    } catch (error) {
      next(error);
    }
});

// POST /api/users/settings - Update user settings
router.post('/settings',
  authenticate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      user.settings = {
        ...user.settings || {},
        ...req.body
      };
      
      await user.save();
      res.json(user.settings);
    } catch (error) {
      next(error);
    }
});

// PUT /api/users/profile - Update user's own profile
router.put('/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('email').optional().trim().isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = password; // El hash se hará en el middleware pre-save
      
      await user.save();
      
      // Retornar el usuario sin la contraseña
      const updatedUser = await User.findById(req.user.id)
        .select('-password')
        .populate('role')
        .populate('business');
        
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
});

// POST /api/users/upload-photo - Upload user profile photo
router.post('/upload-photo',
  authenticate,
  async (req, res, next) => {
    try {
      if (!req.files || !req.files.photo) {
        return res.status(400).json({ msg: 'No se ha enviado ninguna imagen' });
      }
      
      const photoFile = req.files.photo;
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      // Validar tipo de archivo
      if (!photoFile.mimetype.startsWith('image/')) {
        return res.status(400).json({ msg: 'El archivo debe ser una imagen' });
      }
      
      // Si el usuario ya tiene una foto, eliminarla de S3
      if (user.photo && user.photo.startsWith('https://')) {
        try {
          await deleteFromS3(user.photo);
        } catch (error) {
          console.error('Error al eliminar foto anterior:', error);
          // Continuar con la subida aun si falla la eliminación
        }
      }
      
      // Subir la imagen a S3
      const photoUrl = await uploadToS3(
        photoFile.data,
        photoFile.name,
        'profile'
      );
      
      // Actualizar el usuario con la URL de la foto
      user.photo = photoUrl;
      await user.save();
      
      // Retornar el usuario actualizado
      const updatedUser = await User.findById(req.user.id)
        .select('-password')
        .populate('role')
        .populate('business');
        
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
});

// GET /api/users/role/:role - Get users by role
router.get('/role/:role',
  authenticate,
  async (req, res, next) => {
    try {
      const users = await User.find()
        .populate({
          path: 'role',
          match: { name: req.params.role }
        })
        .select('-password')
        .populate('business');
      
      // Filtrar usuarios que coinciden con el rol (populate con match no filtra automáticamente)
      const filteredUsers = users.filter(user => user.role);
      
      res.json(filteredUsers);
    } catch (error) {
      next(error);
    }
});

export default router;
