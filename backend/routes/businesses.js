import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const businessValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('address').trim().notEmpty().withMessage('La dirección es requerida'),
  body('phone')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^\+?[\d\s-]+$/).withMessage('Formato de teléfono inválido'),
  body('email')
    .optional()
    .isEmail().withMessage('Email inválido'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder los 500 caracteres')
];

// GET /api/businesses - Get all businesses
router.get('/', 
  authenticate,
  async (req, res) => {
    try {
      // TODO: Implement get all businesses logic
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los negocios' });
    }
});

// GET /api/businesses/:id - Get a single business
router.get('/:id',
  authenticate,
  async (req, res) => {
    try {
      // TODO: Implement get single business logic
      res.json({});
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el negocio' });
    }
});

// POST /api/businesses - Create a new business
router.post('/', 
  authenticate,
  authorize('manage_businesses'),
  businessValidation,
  validate,
  async (req, res) => {
    try {
      // TODO: Implement create business logic
      res.status(201).json({ message: 'Negocio creado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el negocio' });
    }
});

// PUT /api/businesses/:id - Update a business
router.put('/:id',
  authenticate,
  authorize('manage_businesses'),
  businessValidation,
  validate,
  async (req, res) => {
    try {
      // TODO: Implement update business logic
      res.json({ message: 'Negocio actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el negocio' });
    }
});

// DELETE /api/businesses/:id - Delete a business
router.delete('/:id',
  authenticate,
  authorize('manage_businesses'),
  async (req, res) => {
    try {
      // TODO: Implement delete business logic
      res.json({ message: 'Negocio eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el negocio' });
    }
});

export default router;
