import express from 'express';
import { body } from 'express-validator';
import { createPerfume, getAllPerfumes, getPerfumeById, updatePerfume, deletePerfume } from '../controllers/perfumeController.js';
import { authenticateToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validacion 
const perfumeValidation = [
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('description').notEmpty().withMessage('Descripción es requerida'),
  body('price').isNumeric().withMessage('Precio debe ser numérico')
];

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de perfumes
 */


/**
 * @swagger
 * /api/product/create:
 *   post:
 *     summary: Crear un nuevo perfume
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Perfume'
 *     responses:
 *       201:
 *         description: Perfume creado exitosamente
 *       401:
 *         description: No autorizado
 */
router.post('/create', authenticateToken, authorize('admin'), createPerfume);

/**
 * @swagger
 * /api/perfume/readall:
 *   get:
 *     summary: Obtener todos los perfumes
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o marca
 *     responses:
 *       200:
 *         description: Lista de perfumes
 */
router.get('/readall', authenticateToken, getAllPerfumes);

/**
 * @swagger
 * /api/product/readone/{id}:
 *   get:
 *     summary: Obtener un perfume por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfume
 *     responses:
 *       200:
 *         description: Detalles del perfume
 *       404:
 *         description: Perfume no encontrado
 */
router.get('/readone/:id', authenticateToken, getPerfumeById);

/**
 * @swagger
 * /api/product/update/{id}:
 *   put:
 *     summary: Actualizar un perfume
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Perfume'
 *     responses:
 *       200:
 *         description: Perfume actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfume no encontrado
 */
router.post('/update/:id', authenticateToken, authorize('admin'), updatePerfume);

/**
 * @swagger
 * /api/product/delete/{id}:
 *   delete:
 *     summary: Eliminar un perfume
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfume
 *     responses:
 *       200:
 *         description: Perfume eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfume no encontrado
 */
router.delete('/:id', authenticateToken, authorize('admin'), deletePerfume);

export default router;
