import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      default: 'image/webp',
    },
    size: {
      type: Number,
      default: 0,
    },
    filename: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);

export default Image;

