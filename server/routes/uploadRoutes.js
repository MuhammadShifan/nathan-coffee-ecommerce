import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import { uploadProductImagesMiddleware } from '../middleware/uploadMiddleware.js';
import { optimizeAndSaveImage } from '../utils/imageService.js';

const router = express.Router();

router.post('/', protectAdmin, uploadProductImagesMiddleware, async (req, res) => {
  try {
    const rawFiles = [];
    if (req.files?.images) rawFiles.push(...req.files.images);
    if (req.files?.image) rawFiles.push(...req.files.image);
    if (req.file) rawFiles.push(req.file);

    if (rawFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one image file to upload.',
      });
    }

    const uploadedUrls = [];
    const fileDetails = [];

    for (const file of rawFiles) {
      const saved = await optimizeAndSaveImage(file.buffer, file.originalname);
      uploadedUrls.push(saved.url);

      fileDetails.push({
        id: saved.id,
        url: saved.url,
        filename: `${saved.id}.webp`,
        size: saved.size,
        mimetype: 'image/webp',
      });
    }

    return res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) optimized & saved permanently to database!`,
      urls: uploadedUrls,
      url: uploadedUrls[0],
      files: fileDetails,
    });
  } catch (error) {
    console.error('[Upload Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file to server.',
    });
  }
});

export default router;
