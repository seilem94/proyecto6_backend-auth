import mongoose from 'mongoose';

const perfumeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del perfume es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  brand: {
    type: String,
    required: [true, 'La marca es obligatoria'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['Hombre', 'Mujer', 'Unisex'],
    default: 'Unisex'
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x300.png?text=Perfume'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
perfumeSchema.index({ name: 1, brand: 1 });
perfumeSchema.index({ category: 1 });
perfumeSchema.index({ price: 1 });

export default mongoose.model('perfume', perfumeSchema);
