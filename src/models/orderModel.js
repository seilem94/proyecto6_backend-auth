import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  perfume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'perfume',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const shippingSchema = new mongoose.Schema({
  firstName:  { type: String, default: '' },
  lastName:   { type: String, default: '' },
  email:      { type: String, default: '' },
  phone:      { type: String, default: '' },
  address:    { type: String, default: '' },
  city:       { type: String, default: '' },
  region:     { type: String, default: '' },
  zip:        { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    items: [orderItemSchema],
    shipping: shippingSchema,
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'clp',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generar orderNumber automático antes de guardar
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    // Formato: ELG-XXXXXX (6 dígitos aleatorios)
    this.orderNumber = `ELG-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

// Método para respuesta pública
orderSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    orderNumber: this.orderNumber,
    items: this.items,
    shipping: this.shipping,
    subtotal: this.subtotal,
    shippingCost: this.shippingCost,
    total: this.total,
    currency: this.currency,
    status: this.status,
    paymentIntentId: this.paymentIntentId,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Order', orderSchema);
