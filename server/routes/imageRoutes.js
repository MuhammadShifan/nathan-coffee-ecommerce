import express from 'express';
import mongoose from 'mongoose';
import Image from '../models/Image.js';

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

export default router;

