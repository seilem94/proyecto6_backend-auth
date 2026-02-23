import Stripe from 'stripe';
import { env } from '../config/env.config.js';

const stripe = new Stripe(env.stripe.secretKey);

// @desc    Crear PaymentIntent de Stripe
// @route   POST /api/orders/create-payment-intent
// @access  Private
// IMPORTANTE: CLP es zero-decimal currency en Stripe.
// Se envía el monto exacto en pesos — sin multiplicar por 100.
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser mayor a 0',
      });
    }

    const description = items?.length
      ? items.map(i => `${i.quantity}x ${i.perfume?.name || 'Perfume'}`).join(', ')
      : 'Compra en Perfumería Elegance';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'clp',
      description,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
      },
    });

    res.status(200).json({
      success: true,
      message: 'PaymentIntent creado',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
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

// @desc    Obtener estado de un PaymentIntent
// @route   GET /api/orders/payment-intent/:id
// @access  Private
export const getPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
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

// @desc    Webhook de Stripe — escucha pagos completados
// @route   POST /api/orders/webhook
// @access  Public (verificado con firma de Stripe)
// IMPORTANTE: esta ruta debe recibir el body RAW (Buffer), no JSON parseado.
// Ver configuración en server.js.
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
      console.log(`✅ Pago exitoso: ${pi.id} — ${pi.amount} CLP`);
      // Aquí se puede registrar la orden en MongoDB en una iteración futura
      break;

    case 'payment_intent.payment_failed':
      const failed = event.data.object;
      console.warn(`❌ Pago fallido: ${failed.id}`);
      break;

    default:
      console.log(`Evento Stripe ignorado: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
