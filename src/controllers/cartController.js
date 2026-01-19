import Cart from '../models/cartModel.js';
import Perfume from '../models/perfumeModel.js';

// @desc    Obtener carrito del usuario
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.perfume')
      .populate('user', 'name email');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener carrito',
      error: error.message
    });
  }
};

// @desc    Agregar item al carrito
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { perfumeId, quantity = 1 } = req.body;

    if (!perfumeId) {
      return res.status(400).json({
        success: false,
        message: 'ID del perfume es requerido'
      });
    }

    // Verificar que el perfume existe
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume || !perfume.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Perfume no encontrado'
      });
    }

    // Verificar stock
    if (perfume.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    // Buscar o crear carrito
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Agregar item
    cart.addItem(perfume, quantity);
    await cart.save();

    // Poblar y devolver carrito actualizado
    cart = await Cart.findById(cart._id).populate('items.perfume');

    res.status(200).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar al carrito',
      error: error.message
    });
  }
};

// @desc    Actualizar cantidad de item en carrito
// @route   PUT /api/cart/update/:perfumeId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad inválida'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    // Verificar stock
    const perfume = await Perfume.findById(perfumeId);
    if (!perfume || perfume.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    const updated = cart.updateItemQuantity(perfumeId, quantity);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    await cart.save();
    await cart.populate('items.perfume');

    res.status(200).json({
      success: true,
      message: 'Cantidad actualizada',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar carrito',
      error: error.message
    });
  }
};



// @desc    Eliminar item del carrito
// @route   DELETE /api/cart/remove/:perfumeId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { perfumeId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.removeItem(perfumeId);
    await cart.save();
    await cart.populate('items.perfume');

    res.status(200).json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar del carrito',
      error: error.message
    });
  }
};

// @desc    Vaciar carrito
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Carrito vaciado',
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al vaciar carrito',
      error: error.message
    });
  }
};