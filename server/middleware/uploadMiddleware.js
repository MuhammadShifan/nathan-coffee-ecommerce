import multer from 'multer';
import path from 'path';

// Memory Storage: Files are stored purely in memory as Buffer objects.
// No physical files are written to the local disk, preventing Render/Vercel ephemeral filesystem wipe issues.
const storage = multer.memoryStorage();

// Supported image types
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
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
  },
  fileFilter,
});

/**
 * Wraps Multer middleware to provide consistent JSON error responses.
 */
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

// Middleware supporting product dual-image uploads (images array or single image)
export const uploadProductImagesMiddleware = handleMulterErrors(
  multerInstance.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ])
);

// Middleware supporting hero banner upload
export const uploadHeroImageMiddleware = handleMulterErrors(
  multerInstance.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ])
);

export default multerInstance;

