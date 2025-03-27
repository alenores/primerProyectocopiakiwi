import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

export const authenticate = async (req, res, next) => {
  try {
    var token = null;
    if (req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).populate('role');
      
      if (!user || !user.active) {
        return res.status(401).json({ error: 'Token inválido' });
      }
      
      req.userId = user._id;
      req.user = user;
    } else {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.role.permissions) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const hasAllPermissions = permissions.every(permission =>
      req.user.role.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    next();
  };
};
