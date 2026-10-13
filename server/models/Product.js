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
      default: '100% Selected Plantation Arabica & Robusta Coffee Beans',
    },
    roastLevel: {
      type: String,
      default: 'Medium-Dark Slow Drum Roast',
    },
    blendRatio: {
      type: String,
      default: '100% Pure Coffee (0% Chicory)',
    },
    fssaiNumber: {
      type: String,
      default: '22426461000422',
    },
    packagingType: {
      type: String,
      default: 'Eco Kraft Stand-up Pouch with Air-tight Zip Lock',
    },
    origin: {
      type: String,
      default: 'Thanjavur & Thanjavur, Tamil Nadu',
    },
    category: {
      type: String,
      enum: ['pure_coffee', 'chicory_blend', 'special_roast'],
      default: 'pure_coffee',
    },
    images: {
      type: [String],
      default: ['/images/250g front.png'],
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
  if (this.images && Array.isArray(this.images)) {
    this.images = this.images
      .map((img) => (typeof img === 'object' && img?.url ? img.url : img))
      .filter((img) => typeof img === 'string' && img.trim() !== '');
  }
  if (!this.images || this.images.length === 0) {
    this.images = ['/images/250g front.png'];
  }

  // Ensure selectedWeight defaults to first variant weight if available
  if (this.variants && this.variants.length > 0) {
    const hasCurrent = this.variants.some((v) => v.weight === this.selectedWeight);
    if (!hasCurrent) {
      this.selectedWeight = this.variants[0].weight;
    }
  }
  next();
});

productSchema.virtual('price').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].price : 299;
});

productSchema.virtual('mrp').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].mrp : 340;
});

productSchema.virtual('weightVariant').get(function () {
  return this.variants && this.variants.length > 0 ? this.variants[0].weight : '250g';
});

const Product = mongoose.model('Product', productSchema);

export default Product;
