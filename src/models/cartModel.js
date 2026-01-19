import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  perfume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Perfume',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calcular totales antes de guardar
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((acc, item) => acc + item.quantity, 0);
  this.totalPrice = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  next();
});

// Método para agregar item al carrito
cartSchema.methods.addItem = function(perfume, quantity = 1) {
  const itemIndex = this.items.findIndex(
    item => item.perfume.toString() === perfume._id.toString()
  );

  if (itemIndex > -1) {
    this.items[itemIndex].quantity += quantity;
  } else {
    this.items.push({
      perfume: perfume._id,
      quantity,
      price: perfume.price
    });
  }
};

// Método para actualizar cantidad de un item
cartSchema.methods.updateItemQuantity = function(perfumeId, quantity) {
  const item = this.items.find(
    item => item.perfume.toString() === perfumeId.toString()
  );

  if (item) {
    item.quantity = quantity;
    return true;
  }
  return false;
};

// Método para eliminar item del carrito
cartSchema.methods.removeItem = function(perfumeId) {
  this.items = this.items.filter(
    item => item.perfume.toString() !== perfumeId.toString()
  );
};

export default mongoose.model('Cart', cartSchema);
