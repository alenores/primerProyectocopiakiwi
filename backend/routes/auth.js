import express from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import User from '../models/User.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

const registerValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido'),
  body('business')
    .optional()
    .isMongoId().withMessage('ID de negocio inválido')
];

// Login
router.post('/login',
  loginValidation,
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      // Buscar usuario
      const user = await User.findOne({ email });
      if (!user || !user.active) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Generar token
      const token = jwt.sign(
        { 
          userId: user._id,
          role: user.role._id,
          businessId: user.business?._id
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          business: user.business
        }
      });
    } catch (error) {
      next(error);
    }
});

// Register (solo para super admin)
router.post('/register',
  authenticate,
  registerValidation,
  validate,
  async (req, res, next) => {
    try {
      // Verificar si el email ya está en uso
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }

      const user = new User(req.body);
      await user.save();

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          business: user.business
        }
      });
    } catch (error) {
      next(error);
    }
});

// Get current user profile
router.get('/profile',
  authenticate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        business: user.business
      });
    } catch (error) {
      next(error);
    }
});

// Update profile
router.put('/profile',
  authenticate,
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().trim().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar campos
      if (req.body.name) user.name = req.body.name;
      if (req.body.email && req.body.email !== user.email) {
        // Verificar si el nuevo email ya está en uso
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          return res.status(400).json({ error: 'El email ya está en uso' });
        }
        user.email = req.body.email;
      }
      if (req.body.password) user.password = req.body.password;

      await user.save();

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        business: user.business
      });
    } catch (error) {
      next(error);
    }
});

export default router;
