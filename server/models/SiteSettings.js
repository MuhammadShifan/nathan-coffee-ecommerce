import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      index: true,
    },
    heroImageUrl: {
      type: String,
      default: '/images/hero-coffee.jpg',
      trim: true,
    },
    heroBannerTitle: {
      type: String,
      default: '',
      trim: true,
    },
    heroBannerSubtitle: {
      type: String,
      default: '',
      trim: true,
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;

