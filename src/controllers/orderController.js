import Stripe from 'stripe';
import { env } from '../config/env.config.js';
import Order from '../models/orderModel.js';
import Perfume from '../models/perfumeModel.js';

const stripe = new Stripe(env.stripe.secretKey);

// @desc    Crear PaymentIntent de Stripe + Order pendiente en MongoDB
// @route   POST /api/orders/create-payment-intent
// @access  Private
// CLP es zero-decimal currency — se envía el monto exacto sin multiplicar por 100
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, items, shipping, subtotal, shippingCost } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0',
      });
    }

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío',
      });
    }

    // 1. Crear PaymentIntent en Stripe
    const description = items
      .map(i => `${i.quantity}x ${i.perfume?.name || 'Perfume'}`)
      .join(', ');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'clp',
      description,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
      },
    });

    // 2. Crear Order con status 'pending' en MongoDB
    const orderItems = items.map(i => ({
      perfume:  i.perfume._id || i.perfume,
      name:     i.perfume?.name || 'Perfume',
      quantity: i.quantity,
      price:    i.price,
    }));

    const order = await Order.create({
      user:            req.user._id,
      items:           orderItems,
      shipping:        shipping || {},
      subtotal:        subtotal || amount,
      shippingCost:    shippingCost || 0,
      total:           amount,
      paymentIntentId: paymentIntent.id,
      status:          'pending',
    });

    res.status(200).json({
      success: true,
      message: 'PaymentIntent creado',
      data: {
        clientSecret:    paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId:         order._id,
        orderNumber:     order.orderNumber,
        amount:          paymentIntent.amount,
        currency:        paymentIntent.currency,
      },
    });
  } catch (error) {
    console.error('Error Stripe createPaymentIntent:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el intento de pago',
      error: env.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Confirmar orden tras pago exitoso (llamado desde el frontend)
// @route   POST /api/orders/confirm
// @access  Private
// El frontend llama a este endpoint cuando stripe.confirmCardPayment devuelve succeeded
export const confirmOrder = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId es requerido',
      });
    }

    // Verificar el estado real con Stripe antes de marcar como pagado
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `El pago no fue exitoso. Estado: ${paymentIntent.status}`,
      });
    }

    // Actualizar la orden a 'paid'
    const order = await Order.findOneAndUpdate(
      {
        paymentIntentId,
        user: req.user._id,
      },
      { status: 'paid' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    // Descontar stock de cada perfume comprado
    // bulkWrite ejecuta todas las operaciones en una sola llamada a MongoDB
    const stockUpdates = order.items.map(item => ({
      updateOne: {
        filter: { _id: item.perfume },
        update: { $inc: { stock: -item.quantity } },
      },
    }));

    if (stockUpdates.length > 0) {
      await Perfume.bulkWrite(stockUpdates);
    }

    res.status(200).json({
      success: true,
      message: 'Orden confirmada exitosamente',
      data: { order: order.toPublicJSON() },
    });
  } catch (error) {
    console.error('Error confirmOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la orden',
      error: env.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Obtener órdenes del usuario autenticado
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.perfume', 'name brand image');

    res.status(200).json({
      success: true,
      message: 'Órdenes obtenidas exitosamente',
      data: { orders: orders.map(o => o.toPublicJSON()) },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las órdenes',
      error: env.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Obtener una orden por ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id:  req.params.id,
      user: req.user._id,
    }).populate('items.perfume', 'name brand image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: { order: order.toPublicJSON() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la orden',
      error: env.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Obtener estado de un PaymentIntent
// @route   GET /api/orders/payment-intent/:id
// @access  Private
export const getPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        id:       paymentIntent.id,
        status:   paymentIntent.status,
        amount:   paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el intento de pago',
      error: env.nodeEnv === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Webhook de Stripe (respaldo — opcional)
// @route   POST /api/orders/webhook
// @access  Public (verificado con firma de Stripe)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!env.stripe.webhookSecret) {
    return res.status(200).json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripe.webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const pi = event.data.object;
      // Respaldo: si el frontend no pudo llamar a /confirm, el webhook lo hace
      const updatedOrder = await Order.findOneAndUpdate(
        { paymentIntentId: pi.id, status: 'pending' },
        { status: 'paid' },
        { new: true }
      );
      // Descontar stock solo si la orden estaba pending (evita doble descuento)
      if (updatedOrder?.items?.length) {
        const stockOps = updatedOrder.items.map(item => ({
          updateOne: {
            filter: { _id: item.perfume },
            update: { $inc: { stock: -item.quantity } },
          },
        }));
        await Perfume.bulkWrite(stockOps);
      }
      console.log(`✅ Pago exitoso (webhook): ${pi.id} — ${pi.amount} CLP`);
      break;

    case 'payment_intent.payment_failed':
      const failed = event.data.object;
      await Order.findOneAndUpdate(
        { paymentIntentId: failed.id },
        { status: 'failed' }
      );
      console.warn(`❌ Pago fallido (webhook): ${failed.id}`);
      break;

    default:
      console.log(`Evento Stripe ignorado: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
