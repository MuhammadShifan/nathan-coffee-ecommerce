import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import { uploadProductImagesMiddleware } from '../middleware/uploadMiddleware.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload product image file(s) directly to Cloudinary (Admin Protected)
 * @access  Private/Admin
 */
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

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        success: false,
        message:
          'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your production environment variables (Render/Vercel).',
      });
    }

    const uploadedUrls = [];
    const fileDetails = [];

    // Stream each in-memory buffer directly to Cloudinary
    for (const file of rawFiles) {
      const sanitizedName = file.originalname
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');

      const result = await uploadToCloudinary(file.buffer, {
        folder: 'nathan-coffee/products',
        public_id: `${sanitizedName}-${Date.now()}`,
        resource_type: 'image',
      });

      if (result?.secure_url) {
        uploadedUrls.push(result.secure_url);
        fileDetails.push({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    }

    if (uploadedUrls.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload images to Cloudinary.',
      });
    }

    return res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded successfully to Cloudinary!`,
      urls: uploadedUrls,
      url: uploadedUrls[0],
      files: fileDetails,
    });
  } catch (error) {
    console.error('[Upload Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file to cloud storage.',
    });
  }
});

export default router;
