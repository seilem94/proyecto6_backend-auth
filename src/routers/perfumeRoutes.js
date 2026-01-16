import express from 'express';
import { body } from 'express-validator';
import { getPerfumes, getPerfume, createPerfume, updatePerfume, deletePerfume } from '../controllers/perfumeController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validation rules
const perfumeValidation = [
  body('name').notEmpty().withMessage('Nombre es requerido'),
  body('description').notEmpty().withMessage('Descripción es requerida'),
  body('price').isNumeric().withMessage('Precio debe ser numérico')
];

// Routes (all protected)
router.get('/', authenticateToken, getPerfumes);
router.get('/:id', authenticateToken, getPerfume);
router.post('/', authenticateToken, perfumeValidation, createPerfume);
router.put('/:id', authenticateToken, perfumeValidation, updatePerfume);
router.delete('/:id', authenticateToken, deletePerfume);

export default router;
