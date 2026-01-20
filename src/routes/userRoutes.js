import express from 'express';
import { body } from 'express-validator';
import { register, login, verifyToken, updateUser, deleteMe, getMe } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validacion 
const registerValidation = [
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña es requerida')
];

// Routes
/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de autenticación y usuarios
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en el registro
 */
router.post('/register', registerValidation, register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidation, login);
/**
 * @swagger
 * /api/users/verifytoken:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
router.get('/verifytoken', authenticateToken, verifyToken);


/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: Actualizar información del usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       401:
 *         description: No autorizado
 */
router.put('/update', authenticateToken, updateUser);

/**
 * @swagger
 * /api/users/getme:
 *   get:
 *     summary: Obtener información del usuario autenticado/api/users/getme
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/getme', authenticateToken, getMe);

/**
 * @swagger
 * /api/users/deleteme:
 *   delete:
 *     summary: Desactivar cuenta del usuario autenticado (borrado lógico)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta desactivada correctamente
 *       400:
 *         description: La cuenta ya está desactivada
 *       401:
 *         description: No autorizado
 */
router.delete('/deleteme', authenticateToken, deleteMe);

export default router;
