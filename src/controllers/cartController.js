import Cart from '../models/cartModel.js';
import Perfume from '../models/perfumeModel.js';

// Get user's cart
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.perfume');
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// Add item to cart
export const addToCart = async (req, res, next) => {
  try {
    const { perfumeId, quantity } = req.body;
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => item.perfume.toString() === perfumeId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ perfume: perfumeId, quantity: quantity || 1 });
    }

    await cart.save();
    await cart.populate('items.perfume');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
export const removeFromCart = async (req, res, next) => {
  try {
    const { perfumeId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    cart.items = cart.items.filter(item => item.perfume.toString() !== perfumeId);
    await cart.save();
    await cart.populate('items.perfume');
    res.json(cart);
  } catch (error) {
    next(error);
  }
};
