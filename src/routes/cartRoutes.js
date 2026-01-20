import express from 'express';
import { body } from 'express-validator';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Gestión del carrito de compras
 */

// Validation for adding to cart
const addToCartValidation = [
  body('perfumeId').isMongoId().withMessage('ID de perfume inválido'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser un entero positivo')
];

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener carrito del usuario
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateToken, getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - perfumeId
 *             properties:
 *               perfumeId:
 *                 type: string
 *                 description: ID del perfume a agregar
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Cantidad del producto
 *     responses:
 *       200:
 *         description: Producto agregado al carrito exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto agregado al carrito
 *                 data:
 *                   type: object
 *                   description: Carrito actualizado con el producto
 *       400:
 *         description: Error de validación (ID inválido, stock insuficiente o cantidad inválida)
 *       404:
 *         description: Perfume no encontrado
 *       401:
 *         description: No autorizado - Token faltante o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/add', authenticateToken, addToCartValidation, addToCart);

/**
 * @swagger
 * /api/cart/update/{perfumeId}:
 *   put:
 *     summary: Actualizar cantidad de un producto en el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 *       400:
 *         description: Error al actualizar
 *       401:
 *         description: No autorizado
 */
router.put('/update/:perfumeId', authenticateToken, updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{perfumeId}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: perfumeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del perfume
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado en el carrito
 */
router.delete('/remove/:perfumeId', authenticateToken, removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Vaciar carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 *       401:
 *         description: No autorizado
 */
router.delete('/clear', authenticateToken, clearCart);

export default router;
