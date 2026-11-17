import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true,
  });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName.trim(),
    api_key: apiKey.trim(),
    api_secret: apiSecret.trim(),
    secure: true,
  });
}

/**
 * Returns true if Cloudinary credentials are provided via environment variables.
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (cloudName && apiKey && apiSecret)
  );
};

/**
 * Directly streams an in-memory file Buffer to Cloudinary.
 * No physical files are written to the local server disk.
 *
 * @param {Buffer} fileBuffer - The in-memory file buffer from Multer memoryStorage
 * @param {object} options - Custom Cloudinary upload options (folder, transformations, etc.)
 * @returns {Promise<object>} Resolves with Cloudinary upload result (secure_url, public_id, etc.)
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(
        new Error(
          'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your production environment variables (Render/Vercel).'
        )
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'nathan-coffee/products',
        resource_type: options.resource_type || 'image',
        transformation: options.transformation || [
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

