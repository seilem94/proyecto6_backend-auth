import Perfume from '../models/perfumeModel.js';
import { validationResult } from 'express-validator';

// Get all perfumes for the authenticated user
export const getPerfumes = async (req, res, next) => {
  try {
    const perfumes = await Perfume.find({ user: req.user.id });
    res.json(perfumes);
  } catch (error) {
    next(error);
  }
};

// Get single perfume
export const getPerfume = async (req, res, next) => {
  try {
    const perfume = await Perfume.findOne({ _id: req.params.id, user: req.user.id });
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }
    res.json(perfume);
  } catch (error) {
    next(error);
  }
};

// Create perfume
export const createPerfume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price } = req.body;
    const perfume = new Perfume({ name, description, price, user: req.user.id });
    await perfume.save();
    res.status(201).json(perfume);
  } catch (error) {
    next(error);
  }
};

// Update perfume
export const updatePerfume = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price } = req.body;
    const perfume = await Perfume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, description, price },
      { new: true }
    );
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }
    res.json(perfume);
  } catch (error) {
    next(error);
  }
};

// Delete perfume
export const deletePerfume = async (req, res, next) => {
  try {
    const perfume = await Perfume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!perfume) {
      return res.status(404).json({ message: 'Perfume no encontrado' });
    }
    res.json({ message: 'Perfume eliminado' });
  } catch (error) {
    next(error);
  }
};
