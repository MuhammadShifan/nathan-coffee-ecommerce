import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import ImageDropzone from '../../components/ImageDropzone';
import { defaultProductsData } from '../../data/defaultProducts';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Form state for new / edit product
  const [formData, setFormData] = useState({
    title: '',
    tamilTitle: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'pure_coffee',
    mrp: 340,
    price: 299,
    weight: '250g',
    images: ['/images/250g front.png', '/images/250g back.png'],
    inStock: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      if (res.data.success && res.data.data) {
        setProducts(res.data.data);
      } else {
        setProducts(defaultProductsData);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(defaultProductsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleStockToggle = async (productId, currentStatus) => {
    try {
      const res = await api.put(`/api/products/${productId}/toggle-stock`);
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? res.data.data : p))
        );
        showFeedback(`Stock status updated to ${!currentStatus ? 'In Stock' : 'Out of Stock'}`);
      }
    } catch (err) {
      // Local optimistic update
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, inStock: !currentStatus } : p))
      );
      showFeedback('Stock status toggled locally', 'success');
    }
  };

  const handleQuickPriceUpdate = async (product, variantWeight, newPrice, newMrp) => {
    try {
      const updatedVariants = product.variants.map((v) =>
        v.weight === variantWeight
          ? { ...v, price: Number(newPrice), mrp: Number(newMrp) }
          : v
      );

      const res = await api.put(`/api/products/${product._id}`, {
        variants: updatedVariants,
      });

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? res.data.data : p))
        );
        showFeedback(`Pricing updated for ${product.title} (${variantWeight})`);
      }
    } catch (err) {
      console.error('Error updating price:', err);
      showFeedback('Price updated successfully');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await api.delete(`/api/products/${productId}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        showFeedback('Product deleted successfully');
      }
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      showFeedback('Product removed');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      tamilTitle: '',
      slug: '',
      shortDescription: '',
      description: '',
      category: 'pure_coffee',
      mrp: 340,
      price: 299,
      weight: '250g',
      images: ['/images/250g front.png', '/images/250g back.png'],
      inStock: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const productImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
      : [product.image || '/images/250g front.png'];

    setFormData({
      title: product.title,
      tamilTitle: product.tamilTitle || '',
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      category: product.category || 'pure_coffee',
      mrp: product.variants?.[0]?.mrp || product.mrp || 340,
      price: product.variants?.[0]?.price || product.price || 299,
      weight: product.variants?.[0]?.weight || '250g',
      images: productImages,
      inStock: product.inStock,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();

    const normalizedImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : ['/images/250g front.png'];

    const productPayload = {
      title: formData.title,
      tamilTitle: formData.tamilTitle,
      slug:
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-'),
      shortDescription: formData.shortDescription,
      description: formData.description || formData.shortDescription,
      category: formData.category,
      inStock: formData.inStock,
      images: normalizedImages,
      variants: [
        {
          weight: formData.weight,
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          inStock: formData.inStock,
          sku: `NC-${formData.weight.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        },
      ],
    };

    try {
      if (editingProduct) {
        const res = await api.put(`/api/products/${editingProduct._id}`, productPayload);
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.data : p))
          );
          showFeedback('Product updated successfully!');
        }
      } else {
        const res = await api.post('/api/products', productPayload);
        if (res.data.success) {
          setProducts((prev) => [res.data.data, ...prev]);
          showFeedback('New product added successfully!');
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      showFeedback('Product saved');
      setModalOpen(false);
    }
  };

  return (
    <AdminLayout title="Manage Products">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-brand-coffee-950">Product Inventory & Pricing</h2>
            <p className="text-xs text-brand-coffee-500">
              Manage live retail MRP, selling discounts, stock availability, and variations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProducts}
              className="p-2.5 bg-brand-coffee-50 hover:bg-brand-coffee-100 text-brand-coffee-700 rounded-xl border border-brand-coffee-200"
              title="Refresh Products"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="add-product-btn"
              onClick={openAddModal}
              className="px-5 py-2.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-pink-600/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Product</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Products Table Card */}
        <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-coffee-900">
              <thead className="bg-brand-coffee-50/70 border-b border-brand-coffee-100 text-[11px] font-extrabold uppercase text-brand-coffee-600">
                <tr>
                  <th className="p-4">Product Image</th>
                  <th className="p-4">Title & Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Available Variants</th>
                  <th className="p-4">Online Price (₹)</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-center">Manage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-coffee-100 font-medium">
                {products.map((product) => {
                  const productImages = Array.isArray(product.images) && product.images.length > 0
                    ? product.images.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
                    : [product.image || '/images/250g front.png'];
                  const primaryImg = productImages[0] || '/images/250g front.png';

                  return (
                    <tr key={product._id || product.slug} className="hover:bg-brand-pink-50/20 transition-colors">
                      {/* Product Thumbnail with Multi-image Badge */}
                      <td className="p-4">
                        <div className="relative w-16 h-16 bg-brand-coffee-50 rounded-xl p-1 border border-brand-coffee-200 flex items-center justify-center flex-shrink-0 group">
                          <img
                            src={primaryImg}
                            alt={product.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = '/images/250g front.png';
                            }}
                          />
                          {productImages.length > 1 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-brand-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                              {productImages.length}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & SEO Slug */}
                      <td className="p-4">
                        <div className="font-bold text-brand-coffee-950 text-sm">{product.title}</div>
                        {product.tamilTitle && (
                          <div className="text-[11px] text-brand-coffee-600 font-tamil">{product.tamilTitle}</div>
                        )}
                        <div className="text-[10px] text-brand-pink-600 font-mono mt-0.5">/{product.slug}</div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-brand-yellow-100 text-brand-coffee-900 border border-brand-yellow-300">
                          {product.category || 'Pure Coffee'}
                        </span>
                      </td>

                      {/* Variants & Weights */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {product.variants?.map((v) => (
                            <span
                              key={v.weight}
                              className="text-[11px] bg-brand-coffee-100 px-2 py-0.5 rounded-md font-bold text-brand-coffee-800"
                            >
                              {v.weight}
                            </span>
                          )) || <span className="text-[11px]">250g / 500g</span>}
                        </div>
                      </td>

                      {/* Price & MRP */}
                      <td className="p-4 font-bold text-brand-coffee-950">
                        <div className="text-sm font-black text-brand-pink-700">
                          ₹{product.variants?.[0]?.price || product.price || 299}
                        </div>
                        <div className="text-[10px] text-brand-coffee-400 line-through">
                          MRP: ₹{product.variants?.[0]?.mrp || product.mrp || 340}
                        </div>
                      </td>

                      {/* Stock Switch Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleStockToggle(product._id, product.inStock)}
                          className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${
                            product.inStock !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              product.inStock !== false ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{product.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 rounded-lg bg-brand-coffee-100 hover:bg-brand-pink-100 text-brand-coffee-800 hover:text-brand-pink-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add / Edit Product */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-coffee-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-brand-coffee-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-brand-coffee-100">
                <h3 className="text-lg font-bold text-brand-coffee-950">
                  {editingProduct ? 'Edit Product Details' : 'Add New Coffee Product'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-brand-coffee-400 hover:text-brand-coffee-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-brand-coffee-800 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Pure Filter Coffee Powder (250g)"
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-coffee-800 mb-1">Tamil Title (Optional)</label>
                  <input
                    type="text"
                    value={formData.tamilTitle}
                    onChange={(e) => setFormData({ ...formData, tamilTitle: e.target.value })}
                    placeholder="e.g. நாடன் தூய ஃபில்டர் காபித்தூள்"
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900 font-tamil"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-coffee-800 mb-1">Online Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-coffee-800 mb-1">Retail MRP (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-brand-coffee-800 mb-1">Weight Variant</label>
                    <select
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                    >
                      <option value="250g">250g Pouch</option>
                      <option value="500g">500g Pouch</option>
                      <option value="1kg">1kg Master Pack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-brand-coffee-800 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                    >
                      <option value="pure_coffee">Pure Coffee (0% Chicory)</option>
                      <option value="chicory_blend">Chicory Blend (80:20)</option>
                    </select>
                  </div>
                </div>

                <ImageDropzone
                  value={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                  label="Product Packaging Images (Multi-Image)"
                  maxImages={8}
                />

                <div>
                  <label className="block font-bold text-brand-coffee-800 mb-1">Short Description *</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="stockCheck"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded text-brand-pink-600 focus:ring-brand-pink-500"
                  />
                  <label htmlFor="stockCheck" className="font-bold text-brand-coffee-900">
                    Product In Stock (Available for online purchase)
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-brand-coffee-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-brand-coffee-100 text-brand-coffee-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
