import Perfume from '../models/perfumeModel.js';
import { validationResult } from 'express-validator';


// @desc    Crear un nuevo perfume
// @route   POST /api/perfumes/create
// @access  Private/Admin
export const createPerfume = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, brand, description, price, stock, category, image } = req.body;
    const perfume = await Perfume.create({
      name,
      brand,
      description,
      price,
      stock,
      category,
      image,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Perfume creado exitosamente',
      data: perfume
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear perfume',
      error: error.message
    });
  }
};


// @desc    Obtener todos los perfumes
// @route   GET /api/perfumes/readall
// @access  Public
export const getAllPerfumes = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    let query = { isActive: true };

    // Filtrar por categoría
    if (category) {
      query.category = category;
    }

    // Filtrar por rango de precio
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Buscar por nombre o marca
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const perfumes = await Perfume.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: perfumes.length,
      data: perfumes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfumes',
      error: error.message
    });
  }
};


// @desc    Obtener un perfume por ID
// @route   GET /api/perfumes/readone/:id
// @access  Public
export const getPerfumeById = async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!perfume || !perfume.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Perfume no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: perfume
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfume',
      error: error.message
    });
  }
};

// @desc    Actualizar un perfume
// @route   PUT /api/perfumes/update/:id
// @access  Private/Admin
export const updatePerfume = async (req, res) => {
try {
    let perfume = await Perfume.findById(req.params.id);

    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: 'Perfume no encontrado'
      });
    }

    // Verificar si el usuario es el creador o es admin
    if (perfume.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar este perfume'
      });
    }

    perfume = await Perfume.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Perfume actualizado exitosamente',
      data: perfume
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar perfume',
      error: error.message
    });
  }
};

// @desc    Eliminar un perfume (soft delete)
// @route   DELETE /api/perfumes/:id
// @access  Private/Admin
export const deletePerfume = async (req, res) => {
try {
    const perfume = await Perfume.findById(req.params.id);

    if (!perfume) {
      return res.status(404).json({
        success: false,
        message: 'Perfume no encontrado'
      });
    }

    // Verificar si el usuario es el creador o es admin
    if (perfume.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este perfume'
      });
    }

    // Soft delete
    perfume.isActive = false;
    await perfume.save();

    res.status(200).json({
      success: true,
      message: 'Perfume eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar perfume',
      error: error.message
    });
  }
};