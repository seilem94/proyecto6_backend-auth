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
 *   name: Perfumes
 *   description: Gestión de perfumes
 */


/**
 * @swagger
 * /api/perfumes/create:
 *   post:
 *     summary: Crear un nuevo perfume
 *     tags: [Perfumes]
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
 * /api/perfumes/readall:
 *   get:
 *     summary: Obtener todos los perfumes
 *     tags: [Perfumes]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Perfume'
 */
router.get('/readall', getAllPerfumes);

/**
 * @swagger
 * /api/perfumes/readone/{id}:
 *   get:
 *     summary: Obtener un perfume por ID
 *     tags: [Perfumes]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfume'
 *       404:
 *         description: Perfume no encontrado
 */
router.get('/readone/:id', getPerfumeById);

/**
 * @swagger
 * /api/perfumes/update/{id}:
 *   put:
 *     summary: Actualizar un perfume
 *     tags: [Perfumes]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Perfume'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Perfume no encontrado
 */
router.put('/update/:id', authenticateToken, authorize('admin'), updatePerfume);

/**
 * @swagger
 * /api/perfumes/{id}:
 *   delete:
 *     summary: Eliminar un perfume
 *     tags: [Perfumes]
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
