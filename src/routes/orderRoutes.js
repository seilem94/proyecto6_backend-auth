import express from 'express';
import {
  createPaymentIntent,
  getPaymentIntent,
  stripeWebhook,
} from '../controllers/orderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Órdenes
 *   description: Procesamiento de pagos con Stripe
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentIntentRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           description: Monto total en CLP (zero-decimal currency — sin centavos)
 *           example: 155990
 *         items:
 *           type: array
 *           description: Ítems del carrito para la descripción del pago
 *           items:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 2
 *               perfume:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Dior Sauvage
 *     PaymentIntentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             clientSecret:
 *               type: string
 *               description: Secret que el frontend usa para confirmar el pago con Stripe.js
 *               example: pi_3Oabc_secret_xyz
 *             paymentIntentId:
 *               type: string
 *               example: pi_3Oabc123
 *             amount:
 *               type: number
 *               example: 155990
 *             currency:
 *               type: string
 *               example: clp
 */

/**
 * @swagger
 * /api/orders/create-payment-intent:
 *   post:
 *     summary: Crear un PaymentIntent de Stripe
 *     description: |
 *       Crea un PaymentIntent en Stripe y devuelve el `clientSecret` al frontend.
 *       El frontend usa este secret con Stripe.js para confirmar el pago directamente
 *       con Stripe, sin que la secret key del servidor quede expuesta al cliente.
 *
 *       **Flujo completo:**
 *       1. Frontend llama a este endpoint con el monto total del carrito
 *       2. Backend crea el PaymentIntent usando la `STRIPE_SECRET_KEY`
 *       3. Backend devuelve el `clientSecret`
 *       4. Frontend usa `stripe.confirmCardPayment(clientSecret)` — Stripe procesa el pago
 *
 *       **Nota sobre CLP:** El peso chileno es una *zero-decimal currency* en Stripe,
 *       por lo que el monto se envía en pesos exactos, sin multiplicar por 100.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentIntentRequest'
 *     responses:
 *       200:
 *         description: PaymentIntent creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentIntentResponse'
 *       400:
 *         description: Monto inválido
 *       401:
 *         description: No autorizado — se requiere token JWT
 *       500:
 *         description: Error al comunicarse con Stripe
 */
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

/**
 * @swagger
 * /api/orders/payment-intent/{id}:
 *   get:
 *     summary: Obtener estado de un PaymentIntent
 *     description: Consulta el estado de un PaymentIntent previamente creado. Útil para verificar si el pago fue exitoso después de la confirmación.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del PaymentIntent
 *         example: pi_3Oabc123
 *     responses:
 *       200:
 *         description: Estado del PaymentIntent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [requires_payment_method, requires_confirmation, requires_action, processing, succeeded, canceled]
 *                       example: succeeded
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al consultar Stripe
 */
router.get('/payment-intent/:id', authenticateToken, getPaymentIntent);

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Webhook de Stripe
 *     description: |
 *       Endpoint que Stripe llama para notificar eventos de pago (pago exitoso, fallido, etc.).
 *       Verificado con la firma `STRIPE_WEBHOOK_SECRET` para garantizar que la llamada
 *       proviene realmente de Stripe.
 *
 *       **Importante:** Esta ruta debe recibir el body como Buffer raw (no JSON),
 *       por eso está registrada ANTES del middleware `express.json()` en server.js.
 *
 *       **Eventos manejados:**
 *       - `payment_intent.succeeded` — pago completado exitosamente
 *       - `payment_intent.payment_failed` — pago rechazado o fallido
 *     tags: [Órdenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evento recibido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Firma inválida — el evento no proviene de Stripe
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
