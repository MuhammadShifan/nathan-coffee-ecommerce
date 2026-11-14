import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import SiteSettings from '../models/SiteSettings.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target upload directories for hero images
const clientPublicImagesDir = path.join(__dirname, '../../client/public/images');
const clientSrcImagesDir = path.join(__dirname, '../../client/src/assets/images');

// Ensure directories exist
if (!fs.existsSync(clientPublicImagesDir)) {
  fs.mkdirSync(clientPublicImagesDir, { recursive: true });
}
if (!fs.existsSync(clientSrcImagesDir)) {
  fs.mkdirSync(clientSrcImagesDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, clientPublicImagesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const filename = `hero-banner-${sanitizedBase}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|avif/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, AVIF) are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter,
});

// Middleware supporting single 'heroImage' or 'image' field
const uploadHeroImageMiddleware = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ============================================================================
// 1. PUBLIC ROUTES
// ============================================================================

// @route   GET /api/settings/hero-image
// @desc    Get the current active homepage hero banner image URL
// @access  Public
router.get('/hero-image', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'default' });

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

    // Check if an image file was uploaded via Multer
    const uploadedFile =
      req.files?.heroImage?.[0] || req.files?.image?.[0] || req.file;

    if (uploadedFile) {
      newHeroImageUrl = `/images/${uploadedFile.filename}`;

      // Mirror copy to client/src/assets/images if present
      try {
        const srcDest = path.join(clientSrcImagesDir, uploadedFile.filename);
        fs.copyFileSync(uploadedFile.path, srcDest);
      } catch (e) {
        // Non-blocking mirror copy
      }
    } else if (req.body?.reset === true || req.body?.reset === 'true') {
      // Admin requested resetting to factory default
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

