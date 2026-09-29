import express from 'express';
import Product from '../models/Product.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fallback seed data in case DB is newly initialized or connecting
export const defaultProductsData = [
  {
    title: 'Pure Filter Coffee Powder (250g)',
    tamilTitle: 'நாடன் காப்பி - தூய ஃபில்டர் காபித்தூள் (250g)',
    slug: 'pure-filter-coffee-powder-250g',
    shortDescription: '100% Pure Filter Coffee Powder crafted with traditional slow drum roasting from Thanjavur & Thanjavur.',
    description: 'Experience the legendary South Indian filter coffee withNathan Coffee. Our 250g Kraft Stand-up Pouch features 100% pure shade-grown Arabica & Robusta beans, ground to the perfect decoction consistency. Zero artificial colors, zero preservatives, 100% rich aroma and thick golden foam.',
    ingredients: '100% Pure Plantation Arabica & Robusta Coffee Beans (0% Chicory)',
    roastLevel: 'Medium-Dark Slow Roast',
    blendRatio: '100% Pure Coffee',
    fssaiNumber: '22426461000422',
    packagingType: 'Airtight Kraft Stand-up Zip Pouch / Traditional Foil Pack',
    origin: 'Thanjavur & Thanjavur, Tamil Nadu',
    category: 'pure_coffee',
    images: ['/images/250g front.png', '/images/250g back.png'],
    variants: [
      { weight: '250g', mrp: 340, price: 299, inStock: true, stockCount: 150, sku: 'NC-250G-PURE' },
      { weight: '500g', mrp: 680, price: 580, inStock: true, stockCount: 120, sku: 'NC-500G-PURE' },
      { weight: '1kg', mrp: 1360, price: 1100, inStock: true, stockCount: 80, sku: 'NC-1KG-PURE' },
    ],
    selectedWeight: '250g',
    rating: 4.9,
    reviewCount: 248,
    featured: true,
    inStock: true,
  },
  {
    title: 'Pure Filter Coffee Powder (500g)',
    tamilTitle: 'நாடன் காப்பி - தூய ஃபில்டர் காபித்தூள் (500g)',
    slug: 'pure-filter-coffee-powder-500g',
    shortDescription: 'Family Value Pack: Authentic 500g Slow-Roast South Indian Filter Coffee with thick golden decoction.',
    description: 'Our flagship 500g value pack for passionate filter coffee connoisseurs. Hand-selected beans slow roasted in small batches to preserve natural essential coffee oils. Yields maximum decoction cup after cup with unforgettable traditional aroma.',
    ingredients: '100% Premium Selected Coffee Beans (0% Chicory)',
    roastLevel: 'Medium-Dark Rich Roast',
    blendRatio: '100% Pure Coffee',
    fssaiNumber: '22426461000422',
    packagingType: 'Eco Kraft Stand-up Pouch with Air-tight Zip Lock',
    origin: 'Thanjavur & Thanjavur, Tamil Nadu',
    category: 'pure_coffee',
    images: ['/images/500g fornt.png', '/images/500g back.png'],
    variants: [
      { weight: '500g', mrp: 680, price: 580, inStock: true, stockCount: 120, sku: 'NC-500G-PURE' },
      { weight: '250g', mrp: 340, price: 299, inStock: true, stockCount: 150, sku: 'NC-250G-PURE' },
      { weight: '1kg', mrp: 1360, price: 1100, inStock: true, stockCount: 80, sku: 'NC-1KG-PURE' },
    ],
    selectedWeight: '500g',
    rating: 5.0,
    reviewCount: 312,
    featured: true,
    inStock: true,
  },
  {
    title: 'Traditional Chicory Blended Coffee Powder',
    tamilTitle: 'நாடன் பாரம்பரிய சிக்கரி கலந்த காபித்தூள் (80:20 Blend)',
    slug: 'traditional-chicory-blended-coffee-powder',
    shortDescription: 'Authentic South Indian Hotel-Style Filter Coffee Blend (80% Pure Coffee + 20% Roasted French Chicory).',
    description: 'The golden South Indian restaurant & wedding style blend! Carefully roasted French chicory blended with high-grown Arabica & Robusta gives a dark, velvety decoction with a heavenly lingering aftertaste and rich foaming crema.',
    ingredients: '80% Pure Plantation Coffee + 20% Roasted Specialty Chicory',
    roastLevel: 'Dark Traditional Roast',
    blendRatio: '80% Coffee : 20% Chicory',
    fssaiNumber: '22426461000422',
    packagingType: 'Air-sealed Moisture Barrier Pouch',
    origin: 'Thanjavur & Thanjavur, Tamil Nadu',
    category: 'chicory_blend',
    images: ['/images/chicory powder.jpg', '/images/250g back.png'],
    variants: [
      { weight: '250g', mrp: 280, price: 240, inStock: true, stockCount: 200, sku: 'NC-250G-CHIC' },
      { weight: '500g', mrp: 540, price: 450, inStock: true, stockCount: 160, sku: 'NC-500G-CHIC' },
      { weight: '1kg', mrp: 1050, price: 850, inStock: true, stockCount: 90, sku: 'NC-1KG-CHIC' },
    ],
    selectedWeight: '250g',
    rating: 4.8,
    reviewCount: 195,
    featured: true,
    inStock: true,
  },
];

// @route   GET /api/products
// @desc    Get all products (public)
router.get('/', async (req, res) => {
  try {
    let products = await Product.find({}).sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      // Auto-populate if empty
      await Product.insertMany(defaultProductsData);
      products = await Product.find({}).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return default products in case of DB connection glitch
    res.json({
      success: true,
      count: defaultProductsData.length,
      data: defaultProductsData,
      fromFallback: true,
    });
  }
});

// @route   GET /api/products/:idOrSlug
// @desc    Get single product by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      const fallback = defaultProductsData.find(
        (p) => p.slug === idOrSlug || p.title.toLowerCase().includes(idOrSlug.toLowerCase())
      );
      if (fallback) {
        return res.json({ success: true, data: fallback });
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper to normalize images array
const normalizeProductImages = (images, fallbackImage) => {
  if (Array.isArray(images)) {
    return images
      .map((img) => (typeof img === 'object' && img?.url ? img.url : img))
      .filter((img) => typeof img === 'string' && img.trim() !== '');
  }
  if (typeof images === 'string' && images.trim() !== '') {
    return [images.trim()];
  }
  if (fallbackImage && typeof fallbackImage === 'string' && fallbackImage.trim() !== '') {
    return [fallbackImage.trim()];
  }
  return ['/images/250g front.png'];
};

// @route   POST /api/products
// @desc    Create new product (Admin)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.images || payload.imageUrl || payload.image) {
      payload.images = normalizeProductImages(payload.images, payload.imageUrl || payload.image);
    }
    const product = new Product(payload);
    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product details / price / stock (Admin)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const payload = { ...req.body };
    if (payload.images || payload.imageUrl || payload.image) {
      payload.images = normalizeProductImages(payload.images, payload.imageUrl || payload.image);
    }

    Object.assign(product, payload);
    const updatedProduct = await product.save();

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id/toggle-stock
// @desc    Quick toggle inStock status (Admin)
router.put('/:id/toggle-stock', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.inStock = !product.inStock;
    // Also toggle variants stock
    product.variants.forEach((v) => {
      v.inStock = product.inStock;
    });

    const updatedProduct = await product.save();
    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
