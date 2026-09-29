import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  weight: {
    type: String,
    required: true,
    enum: ['250g', '500g', '1kg'],
  },
  mrp: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
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
});

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
  },
  {
    timestamps: true,
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
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
