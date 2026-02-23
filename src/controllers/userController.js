import User from '../models/userModel.js';
import { generateToken } from '../middlewares/authMiddleware.js';
import { validationResult } from 'express-validator';

// @desc    Registrar nuevo usuario
// @route   POST /api/user/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body; // ← agregar role

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione nombre, email y contraseña'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe con este email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      // Solo aplicar si es un valor válido del enum — el modelo rechazará cualquier otro
      ...(role && ['user', 'admin'].includes(role) && { role }),
    });

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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporcione email y contraseña'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

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
    const { name, email, password, currentPassword, role } = req.body; // ← agregar role

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
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

    // Cambio de rol — solo valores válidos del enum
    if (role && ['user', 'admin'].includes(role) && role !== user.role) {
      user.role = role;
      hasChanges = true;
    }

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Debes enviar currentPassword para cambiar la contraseña',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
      }

      user.password = password;
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(400).json({ success: false, message: 'No hay cambios para actualizar' });
    }

    await user.save();

    let token;
    if (emailChanged || password) {
      token = generateToken(user._id);
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: {
        user: user.toPublicJSON(),
        ...(token ? { token } : {}),
      }
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


// @desc    Obtener todos los usuarios
// @route   GET /api/users/readall
// @access  Private (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// @desc    Actualizar usuario por ID (solo admin)
// @route   PUT /api/users/update/:id
// @access  Private (admin)
export const updateUserById = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: { user: user.toPublicJSON() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

