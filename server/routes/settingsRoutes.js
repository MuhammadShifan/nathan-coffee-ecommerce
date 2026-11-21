import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { protectAdmin } from '../middleware/auth.js';
import { uploadHeroImageMiddleware } from '../middleware/uploadMiddleware.js';
import { optimizeAndSaveImage, deleteImageById } from '../utils/imageService.js';

const router = express.Router();

const handleGetHeroBanner = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    let settings = await SiteSettings.findOne({ key: 'default' }).lean();

    if (!settings) {
      settings = await SiteSettings.create({
        key: 'default',
        heroImageUrl: '/images/hero-coffee.jpg',
      });
    }

    const currentBannerUrl = settings.heroImageUrl || '/images/hero-coffee.jpg';

    return res.json({
      success: true,
      heroImageUrl: currentBannerUrl,
      bannerUrl: currentBannerUrl,
      url: currentBannerUrl,
      title: settings.heroBannerTitle || '',
      subtitle: settings.heroBannerSubtitle || '',
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error('[Settings] Error fetching hero banner:', error);
    return res.json({
      success: true,
      heroImageUrl: '/images/hero-coffee.jpg',
      bannerUrl: '/images/hero-coffee.jpg',
      url: '/images/hero-coffee.jpg',
    });
  }
};

router.get('/hero-image', handleGetHeroBanner);
router.get('/banner', handleGetHeroBanner);

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    let settings = await SiteSettings.findOne({ key: 'default' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'default' });
    }
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

const handleUpdateHeroImage = async (req, res) => {
  try {
    let newHeroImageUrl = '';

    const uploadedFile =
      req.files?.heroImage?.[0] ||
      req.files?.image?.[0] ||
      req.files?.banner?.[0] ||
      req.file;

    const existingSettings = await SiteSettings.findOne({ key: 'default' });

    if (uploadedFile && uploadedFile.buffer) {
      if (existingSettings?.heroImageUrl) {
        await deleteImageById(existingSettings.heroImageUrl);
      }
      const saved = await optimizeAndSaveImage(uploadedFile.buffer, uploadedFile.originalname);
      newHeroImageUrl = saved.url;
    } else if (req.body?.reset === true || req.body?.reset === 'true') {
      if (existingSettings?.heroImageUrl) {
        await deleteImageById(existingSettings.heroImageUrl);
      }
      newHeroImageUrl = '/images/hero-coffee.jpg';
    } else if (req.body?.heroImageUrl || req.body?.bannerUrl || req.body?.image) {
      newHeroImageUrl = (req.body.heroImageUrl || req.body.bannerUrl || req.body.image).trim();
    }

    if (!newHeroImageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an image file to upload or provide a valid banner URL.',
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

    return res.json({
      success: true,
      message: 'Homepage hero banner published and saved permanently to database!',
      heroImageUrl: updatedSettings.heroImageUrl,
      bannerUrl: updatedSettings.heroImageUrl,
      url: updatedSettings.heroImageUrl,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('[Settings] Error saving hero banner:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save hero banner.',
    });
  }
};

router.post('/hero-image', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.put('/hero-image', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.post('/banner', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.put('/banner', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.post('/', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);
router.put('/', protectAdmin, uploadHeroImageMiddleware, handleUpdateHeroImage);

export default router;
