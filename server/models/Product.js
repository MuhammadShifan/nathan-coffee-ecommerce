import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    weight: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    image2: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 100,
    },
    sku: {
      type: String,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tamilTitle: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: String,
      default: '',
      trim: true,
    },
    blendRatio: {
      type: String,
      default: '',
      trim: true,
    },
    roastMaster: {
      type: String,
      default: '',
      trim: true,
    },
    packaging: {
      type: String,
      default: '',
      trim: true,
    },
    heritageOrigin: {
      type: String,
      default: '',
      trim: true,
    },
    roastLevel: {
      type: String,
      default: '',
      trim: true,
    },
    packagingType: {
      type: String,
      default: '',
      trim: true,
    },
    origin: {
      type: String,
      default: '',
      trim: true,
    },
    fssaiNumber: {
      type: String,
      default: '22426461000422',
    },
    variants: [variantSchema],
    selectedWeight: {
      type: String,
      default: '250g',
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewCount: {
      type: Number,
      default: 128,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre('validate', function (next) {
  if (this.roastMaster && !this.roastLevel) this.roastLevel = this.roastMaster;
  if (this.packaging && !this.packagingType) this.packagingType = this.packaging;
  if (this.heritageOrigin && !this.origin) this.origin = this.heritageOrigin;

  if (this.roastLevel && !this.roastMaster) this.roastMaster = this.roastLevel;
  if (this.packagingType && !this.packaging) this.packaging = this.packagingType;
  if (this.origin && !this.heritageOrigin) this.heritageOrigin = this.origin;

  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((v) => {
      const img1 = (v.image || (Array.isArray(v.images) ? v.images[0] : '') || '').trim();
      const img2 = (v.image2 || (Array.isArray(v.images) ? v.images[1] : '') || '').trim();
      v.image = img1;
      v.image2 = img2;
      v.images = [img1, img2].filter(Boolean);
    });

    const hasCurrent = this.variants.some((v) => v.weight === this.selectedWeight);
    if (!hasCurrent) {
      this.selectedWeight = this.variants[0].weight;
    }
  }
  next();
});

productSchema.virtual('image').get(function () {
  const activeVar = this.variants?.find((v) => v.weight === this.selectedWeight) || this.variants?.[0];
  return activeVar?.image || activeVar?.images?.[0] || '/images/250g front.png';
});

productSchema.virtual('images').get(function () {
  const activeVar = this.variants?.find((v) => v.weight === this.selectedWeight) || this.variants?.[0];
  if (activeVar?.images && activeVar.images.length > 0) {
    return activeVar.images;
  }
  if (activeVar?.image) {
    return [activeVar.image, activeVar.image2].filter(Boolean);
  }
  return ['/images/250g front.png'];
});

productSchema.virtual('price').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].price : 399;
});

productSchema.virtual('mrp').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].mrp : 450;
});

productSchema.virtual('weightVariant').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].weight : '250g';
});

const Product = mongoose.model('Product', productSchema);

export default Product;
