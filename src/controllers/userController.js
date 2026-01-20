import User from '../models/userModel.js';
import { generateToken } from '../middlewares/authMiddleware.js';
import { validationResult } from 'express-validator';

// @desc    Registrar nuevo usuario
// @route   POST /api/user/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password} = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione nombre, email y contraseña'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password
    });

    // Generar token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/user/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña'
      });
    }

    // Buscar usuario con contraseña
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Verificar token
// @route   GET /api/user/verifytoken
// @access  Private
export const verifyToken = async (req, res) => {
  try {
    // Generar nuevo token para mantener la sesión activa
    const token = generateToken(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: {
        user: req.user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message
    });
  }
};


// @desc    Actualizar información de usuario
// @route   PUT /api/user/update
// @access  Private
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, currentPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    let hasChanges = false;
    let emailChanged = false;

    if (name && name !== user.name) {
      user.name = name;
      hasChanges = true;
    }

    if (email && email !== user.email) {
      user.email = email;
      hasChanges = true;
      emailChanged = true;
    }

    // Si quieres permitir cambio de password:
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Debes enviar currentPassword para cambiar la contraseña",
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Contraseña actual incorrecta" });
      }

      user.password = password;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(400).json({ success: false, message: "No hay cambios para actualizar" });
    }

    await user.save();

    // Si tu lógica regenera token al cambiar email/password:
    let token;
    if (emailChanged || password) {
      token = generateToken(user._id);
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      ...(token ? { token } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener información del usuario autenticado
// @route   GET /api/user/getme
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Usuario obtenido exitosamente',
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

// @desc    Desactivar cuenta del usuario (borrado lógico)
// @route   DELETE /api/user/deleteme
// @access  Private
export const deleteMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'La cuenta ya está desactivada'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cuenta desactivada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al desactivar cuenta',
      error: error.message
    });
  }
};