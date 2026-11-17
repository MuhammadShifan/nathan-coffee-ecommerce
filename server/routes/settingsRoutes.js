import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadHeroImageMiddleware } from '../middleware/uploadMiddleware.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const router = express.Router();

// ============================================================================
// 1. PUBLIC ROUTES
// ============================================================================

// @route   GET /api/settings/hero-image
// @desc    Get the current active homepage hero banner image URL
// @access  Public
router.get('/hero-image', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    let settings = await SiteSettings.findOne({ key: 'default' }).lean();

    if (!settings) {
      settings = await SiteSettings.create({
        key: 'default',
        heroImageUrl: '/images/hero-coffee.jpg',
      });
    }

    res.json({
      success: true,
      heroImageUrl: settings.heroImageUrl || '/images/hero-coffee.jpg',
      title: settings.heroBannerTitle || '',
      subtitle: settings.heroBannerSubtitle || '',
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching hero image setting:', error);
    // Graceful fallback so frontend never breaks
    res.json({
      success: true,
      heroImageUrl: '/images/hero-coffee.jpg',
    });
  }
});

// @route   GET /api/settings
// @desc    Get all site settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'default' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'default' });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// 2. ADMIN PROTECTED ROUTES
// ============================================================================

const handleUpdateHeroImage = async (req, res) => {
  try {
    let newHeroImageUrl = '';

    // Check if an image file was uploaded via Multer memoryStorage
    const uploadedFile =
      req.files?.heroImage?.[0] || req.files?.image?.[0] || req.file;

    if (uploadedFile) {
      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          success: false,
          message:
            'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your production environment variables (Render/Vercel).',
        });
      }

      const sanitizedName = (uploadedFile.originalname || 'hero-banner')
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');

      const result = await uploadToCloudinary(uploadedFile.buffer, {
        folder: 'nathan-coffee/hero',
        public_id: `hero-${sanitizedName}-${Date.now()}`,
        resource_type: 'image',
      });

      if (!result?.secure_url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload hero image to Cloudinary.',
        });
      }

      newHeroImageUrl = result.secure_url;
    } else if (req.body?.reset === true || req.body?.reset === 'true') {
      // Admin requested resetting to default banner
      newHeroImageUrl = '/images/hero-coffee.jpg';
    } else if (req.body?.heroImageUrl) {
      newHeroImageUrl = req.body.heroImageUrl.trim();
    }

    if (!newHeroImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload or provide a hero image URL.',
      });
    }

    const updatePayload = {
      heroImageUrl: newHeroImageUrl,
      updatedBy: req.admin?.email || 'admin',
    };

    if (typeof req.body?.heroBannerTitle === 'string') {
      updatePayload.heroBannerTitle = req.body.heroBannerTitle.trim();
    }
    if (typeof req.body?.heroBannerSubtitle === 'string') {
      updatePayload.heroBannerSubtitle = req.body.heroBannerSubtitle.trim();
    }

    const updatedSettings = await SiteSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Homepage hero banner image updated successfully!',
      heroImageUrl: updatedSettings.heroImageUrl,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating hero image setting:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/settings/hero-image OR /api/admin/settings/hero-image
// @route   PUT  /api/settings/hero-image OR /api/admin/settings/hero-image
// @desc    Upload & update the homepage hero banner (Admin)
// @access  Private (Admin)
router.post('/hero-image', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.put('/hero-image', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);

export default router;
