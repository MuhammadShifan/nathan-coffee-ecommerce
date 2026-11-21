import sharp from 'sharp';
import mongoose from 'mongoose';
import Image from '../models/Image.js';

export const optimizeAndSaveImage = async (fileBuffer, originalName = '') => {
  const optimizedBuffer = await sharp(fileBuffer)
    .resize({
      width: 1200,
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const imageDoc = new Image({
    data: optimizedBuffer,
    contentType: 'image/webp',
    size: optimizedBuffer.length,
    filename: originalName ? originalName.replace(/\.[^/.]+$/, '.webp') : 'image.webp',
  });

  await imageDoc.save();
  return {
    id: imageDoc._id.toString(),
    url: `/api/images/${imageDoc._id.toString()}`,
    size: optimizedBuffer.length,
  };
};

export const deleteImageById = async (imageIdOrUrl) => {
  if (!imageIdOrUrl) return false;
  try {
    let id = imageIdOrUrl;
    if (typeof id === 'string') {
      const match = id.match(/\/api\/images\/([a-f0-9]{24})/i);
      if (match) {
        id = match[1];
      }
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Image.findByIdAndDelete(id);
      return true;
    }
  } catch (err) {
    console.warn('[ImageService] Error deleting old image:', err.message);
  }
  return false;
};

