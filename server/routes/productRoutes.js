import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target upload directories for direct multipart updates
const clientPublicImagesDir = path.join(__dirname, '../../client/public/images');
const clientSrcImagesDir = path.join(__dirname, '../../client/src/assets/images');

if (!fs.existsSync(clientPublicImagesDir)) {
  fs.mkdirSync(clientPublicImagesDir, { recursive: true });
}
if (!fs.existsSync(clientSrcImagesDir)) {
  fs.mkdirSync(clientSrcImagesDir, { recursive: true });
}

// Multer Storage Configuration for product updates with file attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, clientPublicImagesDir);
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, AVIF) are allowed!'));
    }
  },
});

// Middleware to gracefully handle multipart form-data or standard JSON
const handleOptionalMultipart = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    const multipartHandler = upload.fields([
      { name: 'images', maxCount: 10 },
      { name: 'image', maxCount: 10 },
      { name: 'files', maxCount: 10 },
      { name: 'file', maxCount: 10 },
    ]);
    return multipartHandler(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      next();
    });
  }
  next();
};

// Fallback seed data in case DB is newly initialized or connecting
export const defaultProductsData = [
  {
    title: 'Pure Filter Coffee Powder (250g)',
    tamilTitle: 'நாதன் காப்பி - தூய ஃபில்டர் காபித்தூள் (250g)',
    slug: 'pure-filter-coffee-powder-250g',
    shortDescription: '100% Pure Filter Coffee Powder crafted with traditional slow drum roasting from Thanjavur & Thanjavur.',
    description: 'Experience the legendary South Indian filter coffee with Nathan Coffee. Our 250g Kraft Stand-up Pouch features 100% pure shade-grown Arabica & Robusta beans, ground to the perfect decoction consistency. Zero artificial colors, zero preservatives, 100% rich aroma and thick golden foam.',
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
    tamilTitle: 'நாதன் காப்பி - தூய ஃபில்டர் காபித்தூள் (500g)',
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
    tamilTitle: 'நாதன் பாரம்பரிய சிக்கரி கலந்த காபித்தூள் (80:20 Blend)',
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

// Helper to normalize images array from JSON or multipart uploads
const normalizeProductImages = (images, fallbackImage, uploadedFiles = []) => {
  let list = [];

  if (Array.isArray(images)) {
    list = images.map((img) => (typeof img === 'object' && img?.url ? img.url : img));
  } else if (typeof images === 'string' && images.trim() !== '') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        list = parsed.map((img) => (typeof img === 'object' && img?.url ? img.url : img));
      } else {
        list = [images.trim()];
      }
    } catch {
      list = [images.trim()];
    }
  } else if (fallbackImage && typeof fallbackImage === 'string' && fallbackImage.trim() !== '') {
    list = [fallbackImage.trim()];
  }

  // Include newly uploaded files from multipart
  if (uploadedFiles && uploadedFiles.length > 0) {
    const newUrls = uploadedFiles.map((f) => `/images/${f.filename}`);
    list = [...list, ...newUrls];
  }

  const cleaned = list.filter((img) => typeof img === 'string' && img.trim() !== '');
  return cleaned.length > 0 ? cleaned : ['/images/250g front.png'];
};

// Helper to parse and sanitize product body from JSON or FormData
const parseProductPayload = (req) => {
  const body = { ...req.body };
  const rawFiles = [];
  if (req.files?.images) rawFiles.push(...req.files.images);
  if (req.files?.image) rawFiles.push(...req.files.image);
  if (req.files?.files) rawFiles.push(...req.files.files);
  if (req.files?.file) rawFiles.push(...req.files.file);
  if (req.file) rawFiles.push(req.file);

  // Copy uploaded files to src/assets/images if present
  for (const file of rawFiles) {
    try {
      const srcDest = path.join(clientSrcImagesDir, file.filename);
      fs.copyFileSync(file.path, srcDest);
    } catch (e) {
      // non-blocking
    }
  }

  // Normalize Images
  body.images = normalizeProductImages(body.images, body.imageUrl || body.image, rawFiles);

  // Normalize inStock
  if (body.inStock !== undefined) {
    body.inStock = body.inStock === true || body.inStock === 'true';
  }

  // Normalize variants
  if (typeof body.variants === 'string') {
    try {
      body.variants = JSON.parse(body.variants);
    } catch (e) {
      // ignore
    }
  }

  // If variants not provided but price / mrp / weight are provided, build variant
  if ((!body.variants || !Array.isArray(body.variants) || body.variants.length === 0) && (body.price || body.mrp)) {
    const weight = body.weight || body.selectedWeight || '250g';
    body.variants = [
      {
        weight,
        price: Number(body.price || 299),
        mrp: Number(body.mrp || 340),
        inStock: body.inStock !== false,
        sku: `NC-${weight.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      },
    ];
  }

  return body;
};

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

// @route   POST /api/products
// @desc    Create new product (Admin - Supports JSON & FormData)
router.post('/', protectAdmin, handleOptionalMultipart, async (req, res) => {
  try {
    const payload = parseProductPayload(req);
    const product = new Product(payload);
    const createdProduct = await product.save();
    res.status(201).json({ success: true, data: createdProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product details / price / stock (Admin - Supports JSON & FormData)
router.put('/:id', protectAdmin, handleOptionalMultipart, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const payload = parseProductPayload(req);
    Object.assign(product, payload);
    const updatedProduct = await product.save();

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
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
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        v.inStock = product.inStock;
      });
    }

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
