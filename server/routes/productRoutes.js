import express from 'express';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import { protectAdmin } from '../middleware/auth.js';
import multerInstance from '../middleware/uploadMiddleware.js';
import { deleteImageById } from '../utils/imageService.js';

const router = express.Router();

const extractProductImageUrls = (product) => {
  const urls = new Set();
  if (!product) return urls;
  if (typeof product.image === 'string' && product.image.trim()) {
    urls.add(product.image.trim());
  }
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim()) urls.add(img.trim());
    }
  }
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      if (typeof v?.image === 'string' && v.image.trim()) urls.add(v.image.trim());
      if (typeof v?.image2 === 'string' && v.image2.trim()) urls.add(v.image2.trim());
      if (Array.isArray(v?.images)) {
        for (const img of v.images) {
          if (typeof img === 'string' && img.trim()) urls.add(img.trim());
        }
      }
    }
  }
  return urls;
};

const handleOptionalMultipart = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    const multipartHandler = multerInstance.fields([
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

export const defaultProductsData = [
  {
    title: 'Pure Filter Coffee Powder (250g)',
    tamilTitle: 'நாதன் காப்பி - தூய ஃபில்டர் காபித்தூள் (250g)',
    slug: 'pure-filter-coffee-powder-250g',
    shortDescription: '100% Pure Filter Coffee Powder crafted with traditional slow drum roasting from Thanjavur',
    description: 'Experience the legendary South Indian filter coffee with Nathan Coffee. Our 250g Kraft Stand-up Pouch features 100% pure shade-grown Arabica & Robusta beans, ground to the perfect decoction consistency. Zero artificial colors, zero preservatives, 100% rich aroma and thick golden foam.',
    ingredients: '100% Pure Plantation Arabica & Robusta Coffee Beans (0% Chicory)',
    blendRatio: '100% Pure Coffee',
    roastMaster: 'Medium-Dark Slow Roast',
    packaging: 'Airtight Kraft Stand-up Zip Pouch / Traditional Foil Pack',
    heritageOrigin: 'Thanjavur, Tamil Nadu',
    roastLevel: 'Medium-Dark Slow Roast',
    packagingType: 'Airtight Kraft Stand-up Zip Pouch / Traditional Foil Pack',
    origin: 'Thanjavur, Tamil Nadu',
    fssaiNumber: '22426461000422',
    images: ['/images/250g front.png', '/images/250g back.png'],
    variants: [
      { weight: '250g', mrp: 450, price: 399, image: '/images/250g front.png', image2: '/images/250g back.png', images: ['/images/250g front.png', '/images/250g back.png'], inStock: true, stockCount: 150, sku: 'NC-250G-PURE' },
      { weight: '500g', mrp: 680, price: 580, image: '/images/500g fornt.png', image2: '/images/500g back.png', images: ['/images/500g fornt.png', '/images/500g back.png'], inStock: true, stockCount: 120, sku: 'NC-500G-PURE' },
      { weight: '1kg', mrp: 1360, price: 1100, image: '/images/250g front.png', image2: '/images/250g back.png', images: ['/images/250g front.png', '/images/250g back.png'], inStock: true, stockCount: 80, sku: 'NC-1KG-PURE' },
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
    blendRatio: '100% Pure Coffee',
    roastMaster: 'Medium-Dark Rich Roast',
    packaging: 'Eco Kraft Stand-up Pouch with Air-tight Zip Lock',
    heritageOrigin: 'Thanjavur, Tamil Nadu',
    roastLevel: 'Medium-Dark Rich Roast',
    packagingType: 'Eco Kraft Stand-up Pouch with Air-tight Zip Lock',
    origin: 'Thanjavur, Tamil Nadu',
    fssaiNumber: '22426461000422',
    images: ['/images/500g fornt.png', '/images/500g back.png'],
    variants: [
      { weight: '500g', mrp: 680, price: 580, image: '/images/500g fornt.png', image2: '/images/500g back.png', images: ['/images/500g fornt.png', '/images/500g back.png'], inStock: true, stockCount: 120, sku: 'NC-500G-PURE' },
      { weight: '250g', mrp: 450, price: 399, image: '/images/250g front.png', image2: '/images/250g back.png', images: ['/images/250g front.png', '/images/250g back.png'], inStock: true, stockCount: 150, sku: 'NC-250G-PURE' },
      { weight: '1kg', mrp: 1360, price: 1100, image: '/images/500g fornt.png', image2: '/images/500g back.png', images: ['/images/500g fornt.png', '/images/500g back.png'], inStock: true, stockCount: 80, sku: 'NC-1KG-PURE' },
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
    blendRatio: '80% Coffee : 20% Chicory',
    roastMaster: 'Dark Traditional Roast',
    packaging: 'Air-sealed Moisture Barrier Pouch',
    heritageOrigin: 'Thanjavur, Tamil Nadu',
    roastLevel: 'Dark Traditional Roast',
    packagingType: 'Air-sealed Moisture Barrier Pouch',
    origin: 'Thanjavur, Tamil Nadu',
    fssaiNumber: '22426461000422',
    images: ['/images/chicory powder.jpg', '/images/250g back.png'],
    variants: [
      { weight: '250g', mrp: 280, price: 240, image: '/images/chicory powder.jpg', image2: '/images/250g back.png', images: ['/images/chicory powder.jpg', '/images/250g back.png'], inStock: true, stockCount: 200, sku: 'NC-250G-CHIC' },
      { weight: '500g', mrp: 540, price: 450, image: '/images/chicory powder.jpg', image2: '/images/500g back.png', images: ['/images/chicory powder.jpg', '/images/500g back.png'], inStock: true, stockCount: 160, sku: 'NC-500G-CHIC' },
      { weight: '1kg', mrp: 1050, price: 850, image: '/images/chicory powder.jpg', image2: '/images/250g back.png', images: ['/images/chicory powder.jpg', '/images/250g back.png'], inStock: true, stockCount: 90, sku: 'NC-1KG-CHIC' },
    ],
    selectedWeight: '250g',
    rating: 4.8,
    reviewCount: 195,
    featured: true,
    inStock: true,
  },
];

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

  if (uploadedFiles && uploadedFiles.length > 0) {
    const newUrls = uploadedFiles.map((f) => `/images/${f.filename}`);
    list = [...list, ...newUrls];
  }

  const cleaned = list.filter((img) => typeof img === 'string' && img.trim() !== '');
  return cleaned.length > 0 ? cleaned : ['/images/250g front.png'];
};

const parseProductPayload = (req) => {
  const body = { ...req.body };

  if (body.inStock !== undefined) {
    body.inStock = body.inStock === true || body.inStock === 'true';
  }

  if (typeof body.variants === 'string') {
    try {
      body.variants = JSON.parse(body.variants);
    } catch (e) {
    }
  }

  if (Array.isArray(body.variants) && body.variants.length > 0) {
    body.variants = body.variants
      .map((v) => {
        const img1 = String(v.image || v.image1 || (Array.isArray(v.images) ? v.images[0] : '') || '').trim();
        const img2 = String(v.image2 || (Array.isArray(v.images) ? v.images[1] : '') || '').trim();
        const dualImages = [img1, img2].filter(Boolean);
        return {
          weight: String(v.weight || '').trim(),
          price: Number(v.price) || 0,
          mrp: Number(v.mrp) || Number(v.price) || 0,
          image: img1,
          image2: img2,
          images: dualImages,
          inStock: v.inStock !== false && v.inStock !== 'false',
          stockCount: Number(v.stockCount) || 100,
          sku: v.sku || `NC-${String(v.weight || '').toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
        };
      })
      .filter((v) => v.weight && v.price > 0);
  }

  delete body.images;
  delete body.image;

  if ((!body.variants || !Array.isArray(body.variants) || body.variants.length === 0) && (body.price || body.mrp)) {
    const weight = String(body.weight || body.selectedWeight || '250g').trim();
    const fallbackImg = Array.isArray(body.images) && body.images.length > 0 ? body.images[0] : (body.image || '');
    body.variants = [
      {
        weight,
        price: Number(body.price || 399),
        mrp: Number(body.mrp || 450),
        image: fallbackImg,
        inStock: body.inStock !== false,
        stockCount: 100,
        sku: `NC-${weight.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      },
    ];
  }

  if (Array.isArray(body.variants) && body.variants.length > 0) {
    const matched = body.variants.some((v) => v.weight === body.selectedWeight);
    if (!matched) {
      body.selectedWeight = body.variants[0].weight;
    }
  }

  return body;
};

router.get('/', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const products = await Product.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      data: [],
    });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const { idOrSlug } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).lean();
    }
    if (!product && idOrSlug) {
      product = await Product.findOne({ slug: idOrSlug }).lean();
    }
    if (!product && idOrSlug) {
      product = await Product.findOne({ slug: String(idOrSlug).trim().toLowerCase() }).lean();
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

router.put('/reorder', protectAdmin, async (req, res) => {
  try {
    const { productIds } = req.body;
    const ids = Array.isArray(productIds)
      ? productIds
      : Array.isArray(req.body)
        ? req.body
        : Array.isArray(req.body?.order)
          ? req.body.order
          : null;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs to reorder',
      });
    }

    const bulkOps = ids
      .map((id, index) => {
        const targetId = typeof id === 'object' && id !== null ? (id._id || id.id || id.slug) : id;
        if (!targetId) return null;
        return {
          updateOne: {
            filter: {
              $or: [
                ...(mongoose.Types.ObjectId.isValid(targetId) ? [{ _id: targetId }] : []),
                { slug: String(targetId) },
              ],
            },
            update: { $set: { sortOrder: index } },
          },
        };
      })
      .filter((op) => op && op.updateOne.filter.$or.length > 0);

    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
    }

    const updatedProducts = await Product.find({}).sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      message: 'Product sort order updated successfully',
      count: updatedProducts.length,
      data: updatedProducts,
    });
  } catch (error) {
    console.error('Error reordering products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protectAdmin, handleOptionalMultipart, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldImageUrls = extractProductImageUrls(product);
    const payload = parseProductPayload(req);
    Object.assign(product, payload);
    const updatedProduct = await product.save();

    const newImageUrls = extractProductImageUrls(updatedProduct);
    const removedUrls = [...oldImageUrls].filter((url) => !newImageUrls.has(url));
    if (removedUrls.length > 0) {
      await Promise.all(removedUrls.map((url) => deleteImageById(url).catch(() => {})));
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id/toggle-stock', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.inStock = !product.inStock;
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

router.delete('/:idOrSlug', protectAdmin, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug });
    }
    if (!product) {
      product = await Product.findOne({
        $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      }).catch(() => null);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in database' });
    }

    const deletedId = product._id;
    const deletedSlug = product.slug;

    const imageUrlsToDelete = extractProductImageUrls(product);
    if (imageUrlsToDelete.size > 0) {
      await Promise.all([...imageUrlsToDelete].map((url) => deleteImageById(url).catch(() => {})));
    }

    await Product.deleteOne({ _id: deletedId });

    console.log(`[Product Removed] Successfully deleted "${product.title}" (${deletedId}) from database.`);

    res.json({
      success: true,
      message: 'Product permanently removed from database',
      deletedId,
      deletedSlug,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
