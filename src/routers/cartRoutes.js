import express from 'express';
import { body } from 'express-validator';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validation for adding to cart
const addToCartValidation = [
  body('perfumeId').isMongoId().withMessage('ID de perfume inválido'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser un entero positivo')
];

// Routes (all protected)
router.get('/', authenticateToken, getCart);
router.post('/add', authenticateToken, addToCartValidation, addToCart);
router.delete('/remove/:perfumeId', authenticateToken, removeFromCart);

export default router;
