import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Role from '../models/Role.js';
import User from '../models/User.js';

const router = express.Router();

// Validation rules
const roleValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La descripción no puede exceder los 200 caracteres'),
  body('permissions')
    .isArray().withMessage('Los permisos deben ser un array')
    .custom(async permissions => {
      const availablePermissions = await Role.getAvailablePermissions();
      if (!permissions.every(p => availablePermissions.includes(p))) {
        throw new Error('Permisos inválidos');
      }
      return true;
    })
];

// GET /api/roles - Get all roles (except owner)
router.get('/',
  authenticate,
  authorize('manage_roles'),
  async (req, res, next) => {
    try {
      const roles = await Role.find({
        name: { $ne: 'owner' }
      });
      res.json(roles);
    } catch (error) {
      next(error);
    }
});

// GET /api/roles/:id - Get a single role
router.get('/:id',
  authenticate,
  authorize('manage_roles'),
  async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.id);
      
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      // No permitir ver el rol owner
      if (role.name === 'owner') {
        return res.status(403).json({ error: 'No tienes permiso para ver este rol' });
      }

      res.json(role);
    } catch (error) {
      next(error);
    }
});

// POST /api/roles - Create a new role
router.post('/',
  authenticate,
  authorize('manage_roles'),
  roleValidation,
  validate,
  async (req, res, next) => {
    try {
      const { name } = req.body;

      // No permitir crear rol owner
      if (name.toLowerCase() === 'owner') {
        return res.status(400).json({ error: 'No se puede crear el rol owner' });
      }

      // Verificar si ya existe un rol con el mismo nombre
      const existingRole = await Role.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
      if (existingRole) {
        return res.status(400).json({ error: 'Ya existe un rol con este nombre' });
      }

      const role = new Role(req.body);
      await role.save();

      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
});

// PUT /api/roles/:id - Update a role
router.put('/:id',
  authenticate,
  authorize('manage_roles'),
  roleValidation,
  validate,
  async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.id);
      
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      // No permitir modificar rol owner
      if (role.name === 'owner') {
        return res.status(400).json({ error: 'No se puede modificar el rol owner' });
      }

      const { name } = req.body;

      // Verificar si ya existe un rol con el mismo nombre (excluyendo el actual)
      const existingRole = await Role.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp('^' + name + '$', 'i') }
      });
      if (existingRole) {
        return res.status(400).json({ error: 'Ya existe un rol con este nombre' });
      }

      Object.assign(role, req.body);
      await role.save();

      res.json(role);
    } catch (error) {
      next(error);
    }
});

// DELETE /api/roles/:id - Delete a role
router.delete('/:id',
  authenticate,
  authorize('manage_roles'),
  async (req, res, next) => {
    try {
      const role = await Role.findById(req.params.id);
      
      if (!role) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }

      // No permitir eliminar rol owner
      if (role.name === 'owner') {
        return res.status(400).json({ error: 'No se puede eliminar el rol owner' });
      }

      // Verificar si el rol está en uso
      const usersWithRole = await User.countDocuments({ role: req.params.id });
      if (usersWithRole > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el rol porque está asignado a usuarios' 
        });
      }

      await role.deleteOne();
      res.json({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
});

// GET /api/roles/permissions - Get all available permissions
router.get('/permissions',
  authenticate,
  authorize('manage_roles'),
  async (req, res, next) => {
    try {
      const permissions = await Role.getAvailablePermissions();
      res.json(permissions);
    } catch (error) {
      next(error);
    }
});

// GET /api/roles/permissions/list - Get available permissions
router.get('/permissions/list',
  authenticate,
  authorize('manage_roles'),
  async (req, res) => {
    const permissions = await Role.getAvailablePermissions();
    res.json(permissions);
});

export default router;
