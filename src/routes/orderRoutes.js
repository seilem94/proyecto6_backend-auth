import express from 'express';
import {
  createPaymentIntent,
  confirmOrder,
  getMyOrders,
  getOrderById,
  getPaymentIntent,
  stripeWebhook,
} from '../controllers/orderController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Órdenes
 *   description: Procesamiento de pagos con Stripe y gestión de órdenes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         perfume:
 *           type: string
 *           description: ID del perfume
 *           example: 699b36b2586b5dd952e0639c
 *         name:
 *           type: string
 *           example: Dior Sauvage
 *         quantity:
 *           type: number
 *           example: 2
 *         price:
 *           type: number
 *           example: 89990
 *     ShippingInfo:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: Salem
 *         lastName:
 *           type: string
 *           example: Hidd
 *         email:
 *           type: string
 *           example: salem@ejemplo.com
 *         phone:
 *           type: string
 *           example: "+56912345678"
 *         address:
 *           type: string
 *           example: Av. Providencia 1234
 *         city:
 *           type: string
 *           example: Santiago
 *         region:
 *           type: string
 *           example: Metropolitana
 *         zip:
 *           type: string
 *           example: "7500000"
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderNumber:
 *           type: string
 *           example: ELG-482910
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         shipping:
 *           $ref: '#/components/schemas/ShippingInfo'
 *         subtotal:
 *           type: number
 *           example: 149980
 *         shippingCost:
 *           type: number
 *           example: 0
 *         total:
 *           type: number
 *           example: 149980
 *         currency:
 *           type: string
 *           example: clp
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, cancelled]
 *           example: paid
 *         paymentIntentId:
 *           type: string
 *           example: pi_3Oabc123
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders/create-payment-intent:
 *   post:
 *     summary: Crear PaymentIntent de Stripe y orden pendiente
 *     description: |
 *       Crea un PaymentIntent en Stripe y simultáneamente registra una orden
 *       con `status: pending` en MongoDB. Devuelve el `clientSecret` para que
 *       el frontend confirme el pago con Stripe.js.
 *
 *       **Flujo Opción C (sin webhook):**
 *       1. Frontend llama a este endpoint → se crea el PaymentIntent + Order pendiente
 *       2. Frontend confirma con `stripe.confirmCardPayment(clientSecret)`
 *       3. Si `status === succeeded` → frontend llama a `POST /api/orders/confirm`
 *       4. Backend verifica con Stripe y actualiza la orden a `status: paid`
 *
 *       **Nota CLP:** Zero-decimal currency — el monto se envía en pesos exactos, sin centavos.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - items
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Total en CLP (zero-decimal)
 *                 example: 149980
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OrderItem'
 *               shipping:
 *                 $ref: '#/components/schemas/ShippingInfo'
 *               subtotal:
 *                 type: number
 *                 example: 149980
 *               shippingCost:
 *                 type: number
 *                 example: 0
 *     responses:
 *       200:
 *         description: PaymentIntent y orden pendiente creados
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
 *                     clientSecret:
 *                       type: string
 *                       example: pi_3Oabc_secret_xyz
 *                     paymentIntentId:
 *                       type: string
 *                       example: pi_3Oabc123
 *                     orderId:
 *                       type: string
 *                     orderNumber:
 *                       type: string
 *                       example: ELG-482910
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Monto inválido o carrito vacío
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al comunicarse con Stripe
 */
router.post('/create-payment-intent', authenticateToken, createPaymentIntent);

/**
 * @swagger
 * /api/orders/confirm:
 *   post:
 *     summary: Confirmar orden tras pago exitoso
 *     description: |
 *       El frontend llama a este endpoint inmediatamente después de que
 *       `stripe.confirmCardPayment()` devuelve `status: succeeded`.
 *       El backend verifica el estado con Stripe (no confía solo en el frontend)
 *       y actualiza la orden de `pending` a `paid` en MongoDB.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *                 example: pi_3Oabc123
 *     responses:
 *       200:
 *         description: Orden confirmada y actualizada a paid
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: paymentIntentId faltante o pago no exitoso en Stripe
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autorizado
 */
router.post('/confirm', authenticateToken, confirmOrder);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Obtener historial de órdenes del usuario autenticado
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes del usuario ordenadas por fecha descendente
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 */
router.get('/myorders', authenticateToken, getMyOrders);

/**
 * @swagger
 * /api/orders/payment-intent/{id}:
 *   get:
 *     summary: Consultar estado de un PaymentIntent en Stripe
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                     amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         description: No autorizado
 */
router.get('/payment-intent/:id', authenticateToken, getPaymentIntent);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener una orden por ID
 *     description: Solo el propietario de la orden puede consultarla.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden en MongoDB
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authenticateToken, getOrderById);

/**
 * @swagger
 * /api/orders/webhook:
 *   post:
 *     summary: Webhook de Stripe (respaldo opcional)
 *     description: |
 *       Endpoint que Stripe llama para notificar eventos de pago.
 *       En este proyecto se usa como respaldo — el flujo principal de confirmación
 *       pasa por `POST /api/orders/confirm` llamado desde el frontend.
 *
 *       El webhook actualiza órdenes que hayan quedado en `pending` si el frontend
 *       no pudo llamar a `/confirm` (por ejemplo, si el usuario cerró el browser).
 *
 *       Verificado con `STRIPE_WEBHOOK_SECRET`. Si no está configurado, el endpoint
 *       responde 200 y no ejecuta ninguna acción.
 *     tags: [Órdenes]
 *     responses:
 *       200:
 *         description: Evento recibido
 *       400:
 *         description: Firma inválida
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
