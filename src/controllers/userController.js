import User from '../models/userModel.js';
import { generateToken } from '../middlewares/authMiddleware.js';
import { validationResult } from 'express-validator';

// @desc    Registrar nuevo usuario
// @route   POST /api/user/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password} = req.body;

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password
    });

    // Generar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
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
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, currentPassword } = req.body;

    const user = await User.findById(req.user._id);
    const previousEmail = user.email;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validar formato de email si se proporciona
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso'
        });
      }
    }

    // Si se actualiza la contraseña, verificar la contraseña actual
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar la contraseña actual para cambiarla'
        });
      }
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }
    }

    // Actualizar campos
    let hasChanges = false;
    if (name && name !== user.name) {
      user.name = name;
      hasChanges = true;
    }
    if (email && email !== user.email) {
      user.email = email;
      hasChanges = true;
      const emailChanged = email && email !== previousEmail;
    }
    if (password) {
      user.password = password;
      hasChanges = true;
    }

    if (hasChanges) {
      await user.save();
    }

    // Generar nuevo token si se cambió email o contraseña
    let token;
    if (emailChanged || password) {
      token = generateToken(user._id);
    }

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        user: user.toPublicJSON(),
        ...(token && { token })
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

// @desc    Obtener información del usuario autenticado
// @route   GET /api/user/me
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
// @route   DELETE /api/user/me
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