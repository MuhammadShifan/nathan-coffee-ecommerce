import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target upload directories
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
    const filename = `${sanitizedBase}-${uniqueSuffix}${ext}`;
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

// Support uploading both 'images' array and single 'image' field for backwards compatibility
const handleUploadMiddleware = (req, res, next) => {
  const uploadArray = upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ]);

  uploadArray(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Too many files uploaded (Max: 10 images)' });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// @route   POST /api/upload
// @desc    Upload product image file(s) (Admin)
router.post('/', protectAdmin, handleUploadMiddleware, (req, res) => {
  try {
    const rawFiles = [];
    if (req.files?.images) rawFiles.push(...req.files.images);
    if (req.files?.image) rawFiles.push(...req.files.image);
    if (req.file) rawFiles.push(req.file);

    if (rawFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one image file to upload' });
    }

    const uploadedUrls = [];
    const fileDetails = [];

    for (const file of rawFiles) {
      const uploadedPath = `/images/${file.filename}`;
      uploadedUrls.push(uploadedPath);

      // Also mirror to client/src/assets/images if needed
      try {
        const srcDest = path.join(clientSrcImagesDir, file.filename);
        fs.copyFileSync(file.path, srcDest);
      } catch (e) {
        // Non-blocking copy
      }

      fileDetails.push({
        url: uploadedPath,
        filename: file.filename,
        size: file.size,
      });
    }

    res.json({
      success: true,
      message: `${uploadedUrls.length} image(s) uploaded successfully!`,
      urls: uploadedUrls,
      url: uploadedUrls[0],
      files: fileDetails,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
