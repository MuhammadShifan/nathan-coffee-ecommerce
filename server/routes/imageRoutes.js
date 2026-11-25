import express from 'express';
import mongoose from 'mongoose';
import Image from '../models/Image.js';
import { protectAdmin } from '../middleware/auth.js';
import { deleteImageById } from '../utils/imageService.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id || '';
    const cleanId = rawId.replace(/\.[^/.]+$/, '');

    if (!mongoose.Types.ObjectId.isValid(cleanId)) {
      return res.status(404).send('Image not found');
    }

    const image = await Image.findById(cleanId);
    if (!image || !image.data) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', image.contentType || 'image/webp');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('Access-Control-Allow-Origin', '*');
    return res.send(image.data);
  } catch (error) {
    console.error('[Image Route Error]:', error);
    return res.status(500).send('Error serving image');
  }
});

router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const deleted = await deleteImageById(req.params.id);
    return res.json({ success: true, deleted });
  } catch (error) {
    console.error('[Image Delete Error]:', error);
    return res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

export default router;

