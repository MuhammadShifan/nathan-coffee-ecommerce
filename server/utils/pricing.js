import mongoose from 'mongoose';
import Product from '../models/Product.js';

export const BASE_PRODUCT_PRICE = 399;
export const STANDARD_DELIVERY_CHARGE = 40;
export const TAMIL_NADU_PINCODE_REGEX = /^6[0-4]\d{4}$/;

export const isValidTamilNaduPincode = (pincode) =>
  TAMIL_NADU_PINCODE_REGEX.test(String(pincode || '').trim());

export const isPrepaidPaymentMethod = (rawMethod) => {
  if (!rawMethod) return true;
  const normalized = String(rawMethod).trim().toLowerCase();
  return normalized === 'prepaid' || normalized === 'online' || normalized === 'cashfree';
};

export const resolveAuthoritativeCart = async (items = [], fallbackCatalog = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('No order items provided.');
  }

  const verifiedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Math.max(1, parseInt(item?.quantity, 10) || 1);
    const rawProductId = item?.productId ? String(item.productId).trim() : '';
    const requestedWeight = item?.weight ? String(item.weight).trim() : '';

    let catalogProduct = null;

    if (rawProductId && mongoose.Types.ObjectId.isValid(rawProductId)) {
      catalogProduct = await Product.findById(rawProductId).lean();
    }
    if (!catalogProduct && rawProductId) {
      catalogProduct = await Product.findOne({ slug: rawProductId }).lean();
    }
    if (!catalogProduct && Array.isArray(fallbackCatalog) && fallbackCatalog.length > 0) {
      catalogProduct =
        fallbackCatalog.find(
          (p) =>
            (rawProductId && (p.slug === rawProductId || p._id === rawProductId)) ||
            (item?.title && p.title === item.title)
        ) || null;
    }

    let unitPrice = BASE_PRODUCT_PRICE;
    let resolvedTitle = item?.title || 'Nathan Pure Filter Coffee Powder';
    let resolvedWeight = requestedWeight || '250g';
    let resolvedImage = item?.image || '/images/250g front.png';
    let resolvedProductObjectId = undefined;

    if (catalogProduct) {
      if (catalogProduct._id && mongoose.Types.ObjectId.isValid(catalogProduct._id)) {
        resolvedProductObjectId = catalogProduct._id;
      }
      resolvedTitle = catalogProduct.title || resolvedTitle;
      const variants = Array.isArray(catalogProduct.variants) ? catalogProduct.variants : [];
      const matchedVariant =
        variants.find((v) => v.weight === requestedWeight) || variants[0] || null;

      if (matchedVariant) {
        resolvedWeight = matchedVariant.weight || resolvedWeight;
        unitPrice = Number(matchedVariant.price) > 0 ? Number(matchedVariant.price) : BASE_PRODUCT_PRICE;
        if (matchedVariant.image) {
          resolvedImage = matchedVariant.image;
        }
      } else if (Array.isArray(catalogProduct.images) && catalogProduct.images.length > 0) {
        resolvedImage = catalogProduct.images[0];
      }
    }

    subtotal += unitPrice * quantity;

    verifiedItems.push({
      product: resolvedProductObjectId,
      productId: rawProductId || catalogProduct?.slug || 'prod-250g-pure',
      title: resolvedTitle,
      weight: resolvedWeight,
      price: unitPrice,
      quantity,
      image: resolvedImage,
    });
  }

  return {
    verifiedItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
};

export const calculateCheckoutTotals = (subtotal) => {
  const cleanSubtotal = Number(Number(subtotal || 0).toFixed(2));
  const deliveryCharge = cleanSubtotal > 0 ? STANDARD_DELIVERY_CHARGE : 0;
  const finalTotal = Number((cleanSubtotal + deliveryCharge).toFixed(2));

  return {
    subtotal: cleanSubtotal,
    deliveryCharge,
    finalTotal,
  };
};
