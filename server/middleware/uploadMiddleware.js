import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('[Multer] Error ensuring uploads directory exists:', err);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadsDir)) {
      try {
        fs.mkdirSync(uploadsDir, { recursive: true });
      } catch (err) {}
    }
    cb(null, uploadsDir);
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

const ALLOWED_EXTENSIONS = /jpeg|jpg|png|webp|avif|gif/;
const ALLOWED_MIME_TYPES = /^image\/(jpeg|jpg|png|webp|avif|gif)$/;

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isValidExt = ALLOWED_EXTENSIONS.test(ext);
  const isValidMime = ALLOWED_MIME_TYPES.test(file.mimetype);

  if (isValidExt || isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WebP, AVIF, GIF) are allowed!'));
  }
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

const handleMulterErrors = (multerMiddleware) => {
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image size exceeds the 10MB limit. Please upload a smaller image.',
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected file upload field or too many files uploaded.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

export const uploadProductImagesMiddleware = handleMulterErrors(
  multerInstance.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ])
);

export const uploadHeroImageMiddleware = handleMulterErrors(
  multerInstance.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ])
);

export default multerInstance;
