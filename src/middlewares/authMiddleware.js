import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { env } from '../config/env.config.js';

// Proteger rutas - verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // Verificar si el token existe en el header Authorization
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado'
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, env.jwt.secret);

      // Buscar usuario
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
      error: error.message
    });
  }
};

// Middleware para verificar roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no tiene permiso para acceder a esta ruta`
      });
    }
    next();
  };
};

// Generar token JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, 
    env.jwt.secret, {
    expiresIn: env.jwt.expire
  });
};

//Middleware para determinar si es admin
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado — se requiere rol administrador'
    });
  }
  next();
};
