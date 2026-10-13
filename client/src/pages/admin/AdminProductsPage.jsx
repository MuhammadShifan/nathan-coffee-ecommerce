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
  AlertTriangle,
  Upload,
  GripVertical,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api, {
  createProduct,
  updateProduct,
  toggleProductStock,
  deleteProduct,
  reorderProducts,
  getAdminToken,
  uploadProductImages,
} from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import ImageDropzone from '../../components/ImageDropzone';
import { defaultProductsData } from '../../data/defaultProducts';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

  // Form state for new / edit product
  const [formData, setFormData] = useState({
    title: '',
    tamilTitle: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'pure_coffee',
    variants: [
      { weight: '250g', price: 299, mrp: 340, image: '/images/250g front.png' },
    ],
    images: ['/images/250g front.png', '/images/250g back.png'],
    inStock: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      if (res.data.success && Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleStockToggle = async (productId, currentStatus) => {
    try {
      const res = await toggleProductStock(productId);
      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? res.data.data : p))
        );
        showFeedback(`Stock status updated to ${!currentStatus ? 'In Stock' : 'Out of Stock'}`, 'success');
      }
    } catch (err) {
      console.error('Error toggling stock status:', err);
      const errMsg = err.response?.data?.message || 'Failed to update stock status on server';
      showFeedback(errMsg, 'error');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    // 1. Immediately reorder local React state for instantaneous visual feedback
    const reordered = Array.from(products);
    const [movedProduct] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedProduct);

    setProducts(reordered);

    // 2. Persist new sequence to backend API
    try {
      const productIds = reordered.map((p) => p._id || p.id || p.slug);
      const res = await reorderProducts(productIds);
      if (res.data.success) {
        showFeedback('Product order saved! Public storefront updated.', 'success');
        if (Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        }
      } else {
        showFeedback(res.data.message || 'Failed to update product order', 'error');
        fetchProducts();
      }
    } catch (err) {
      console.error('Error saving reordered products:', err);
      const errMsg = err.response?.data?.message || 'Failed to save product order to server';
      showFeedback(errMsg, 'error');
      fetchProducts();
    }
  };

  const handleQuickPriceUpdate = async (product, variantWeight, newPrice, newMrp) => {
    try {
      const updatedVariants = product.variants.map((v) =>
        v.weight === variantWeight
          ? { ...v, price: Number(newPrice), mrp: Number(newMrp) }
          : v
      );

      const res = await updateProduct(product._id, {
        variants: updatedVariants,
      });

      if (res.data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? res.data.data : p))
        );
        showFeedback(`Pricing updated for ${product.title} (${variantWeight})`, 'success');
      }
    } catch (err) {
      console.error('Error updating price:', err);
      const errMsg = err.response?.data?.message || 'Error updating product price';
      showFeedback(errMsg, 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    const idOrSlug = product._id || product.slug || product.id;
    if (!idOrSlug) return;

    if (!window.confirm(`Are you sure you want to permanently delete "${product.title}"? This will remove it from the store and database.`)) return;

    try {
      const res = await deleteProduct(idOrSlug);
      if (res.data.success) {
        setProducts((prev) =>
          prev.filter(
            (p) =>
              p._id !== idOrSlug &&
              p.slug !== idOrSlug &&
              p.id !== idOrSlug &&
              (res.data.deletedId ? p._id !== res.data.deletedId : true) &&
              (res.data.deletedSlug ? p.slug !== res.data.deletedSlug : true)
          )
        );
        showFeedback(`"${product.title}" permanently removed from database!`, 'success');
      } else {
        showFeedback(res.data.message || 'Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      const errMsg = err.response?.data?.message || 'Failed to delete product from database';
      showFeedback(errMsg, 'error');
    }
  };

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { weight: '', price: '', mrp: '', image: '' },
      ],
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return { ...prev, variants: updated };
    });
  };

  const handleVariantImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingVariantIndex(index);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await uploadProductImages(data);
      if (res.data.success && res.data.url) {
        handleVariantChange(index, 'image', res.data.url);
        showFeedback(`Image uploaded for variant ${formData.variants[index]?.weight || `#${index + 1}`}!`, 'success');
      } else {
        showFeedback(res.data.message || 'Failed to upload variant image', 'error');
      }
    } catch (err) {
      console.error('Error uploading variant image:', err);
      showFeedback(err.response?.data?.message || 'Error uploading variant image', 'error');
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) {
      showFeedback('A product must have at least one variant', 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index),
    }));
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
      variants: [
        { weight: '250g', price: 299, mrp: 340, image: '/images/250g front.png' },
      ],
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

    const initialVariants = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants.map((v) => ({
          weight: v.weight || '',
          price: v.price ?? '',
          mrp: v.mrp ?? '',
          image: v.image || v.imageUrl || '',
          inStock: v.inStock !== false,
        }))
      : [
          {
            weight: product.weight || product.selectedWeight || '250g',
            price: product.price || 299,
            mrp: product.mrp || 340,
            image: product.image || (product.images && product.images[0]) || '',
            inStock: true,
          },
        ];

    setFormData({
      title: product.title,
      tamilTitle: product.tamilTitle || '',
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      category: product.category || 'pure_coffee',
      variants: initialVariants,
      images: productImages,
      inStock: product.inStock !== false,
    });
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = getAdminToken();
    if (!token) {
      showFeedback('Admin session not found or expired. Please log in again.', 'error');
      setSaving(false);
      return;
    }

    if (!formData.variants || formData.variants.length === 0) {
      showFeedback('Please add at least one product variant', 'error');
      setSaving(false);
      return;
    }

    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.weight || !v.weight.trim()) {
        showFeedback(`Variant #${i + 1} is missing a weight (e.g. '100g', '250g', '750g')`, 'error');
        setSaving(false);
        return;
      }
      if (v.price === '' || isNaN(v.price) || Number(v.price) <= 0) {
        showFeedback(`Variant "${v.weight}" must have a valid selling price greater than 0`, 'error');
        setSaving(false);
        return;
      }
    }

    const cleanedVariants = formData.variants.map((v) => ({
      weight: v.weight.trim(),
      price: Number(v.price),
      mrp: Number(v.mrp) || Number(v.price),
      image: (v.image || '').trim(),
      inStock: v.inStock !== false,
      sku: `NC-${v.weight.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
    }));

    const normalizedImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : ['/images/250g front.png'];

    const productPayload = {
      title: formData.title.trim(),
      tamilTitle: formData.tamilTitle?.trim() || '',
      slug:
        formData.slug?.trim() ||
        formData.title
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-'),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description?.trim() || formData.shortDescription.trim(),
      category: formData.category,
      inStock: formData.inStock,
      images: normalizedImages,
      variants: cleanedVariants,
      selectedWeight: cleanedVariants[0]?.weight || '250g',
    };

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, productPayload);
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) => (p._id === editingProduct._id ? res.data.data : p))
          );
          showFeedback('Product updated successfully!', 'success');
          setModalOpen(false);
        } else {
          showFeedback(res.data.message || 'Failed to update product', 'error');
        }
      } else {
        const res = await createProduct(productPayload);
        if (res.data.success) {
          setProducts((prev) => [res.data.data, ...prev]);
          showFeedback('New product added successfully!', 'success');
          setModalOpen(false);
        } else {
          showFeedback(res.data.message || 'Failed to create product', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving product:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error saving product to server';
      showFeedback(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Manage Products">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-coffee-200 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-brand-coffee-950">Product Inventory & Custom Ordering</h2>
            <p className="text-xs text-brand-coffee-500 flex items-center gap-1.5 flex-wrap mt-0.5">
              <span>Manage live retail pricing & stock. Drag</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-brand-pink-700 bg-brand-pink-50 px-1.5 py-0.5 rounded border border-brand-pink-200">
                <GripVertical className="w-3.5 h-3.5" /> Grip
              </span>
              <span>to rearrange how products appear on the public store.</span>
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
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Products Table Card with Drag-and-Drop Reordering */}
        <div className="bg-white rounded-3xl border border-brand-coffee-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="w-full text-left text-xs text-brand-coffee-900">
                <thead className="bg-brand-coffee-50/70 border-b border-brand-coffee-100 text-[11px] font-extrabold uppercase text-brand-coffee-600">
                  <tr>
                    <th className="p-4 w-14 text-center">Order</th>
                    <th className="p-4">Product Image</th>
                    <th className="p-4">Title & Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Available Variants</th>
                    <th className="p-4">Online Price (₹)</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-center">Manage Actions</th>
                  </tr>
                </thead>
                <Droppable droppableId="admin-products-droppable">
                  {(droppableProvided) => (
                    <tbody
                      ref={droppableProvided.innerRef}
                      {...droppableProvided.droppableProps}
                      className="divide-y divide-brand-coffee-100 font-medium"
                    >
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-12 text-center text-brand-coffee-500 bg-white">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <Package className="w-12 h-12 text-brand-coffee-300" />
                              <div>
                                <p className="font-bold text-sm text-brand-coffee-900">No products in the catalog</p>
                                <p className="text-xs text-brand-coffee-500 mt-0.5">
                                  All products have been removed. Click "+ Add New Product" to create one.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={openAddModal}
                                className="px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                              >
                                + Add New Product
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        products.map((product, index) => {
                          const productImages = Array.isArray(product.images) && product.images.length > 0
                            ? product.images.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
                            : [product.image || '/images/250g front.png'];
                          const primaryImg = productImages[0] || '/images/250g front.png';

                          const draggableId = String(product._id || product.slug || product.id || index);

                          return (
                            <Draggable
                              key={draggableId}
                              draggableId={draggableId}
                              index={index}
                            >
                              {(dragProvided, snapshot) => (
                                <tr
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  style={{
                                    ...dragProvided.draggableProps.style,
                                    ...(snapshot.isDragging
                                      ? { display: 'table', tableLayout: 'fixed', width: '100%' }
                                      : {}),
                                  }}
                                  className={`transition-colors ${
                                    snapshot.isDragging
                                      ? 'bg-brand-pink-50/95 shadow-2xl ring-2 ring-brand-pink-500 z-50'
                                      : 'hover:bg-brand-pink-50/20'
                                  }`}
                                >
                                  {/* Drag Handle & Order Sequence Badge */}
                                  <td className="p-4 w-14 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <div
                                        {...dragProvided.dragHandleProps}
                                        className="p-1 rounded-lg text-brand-coffee-400 hover:text-brand-pink-600 hover:bg-brand-pink-50 cursor-grab active:cursor-grabbing transition-colors"
                                        title="Click and drag to reorder products"
                                      >
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      <span className="text-[10px] font-black text-brand-coffee-600 bg-brand-coffee-100 px-1.5 py-0.5 rounded border border-brand-coffee-200">
                                        {index + 1}
                                      </span>
                                    </div>
                                  </td>

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
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {Array.isArray(product.variants) && product.variants.length > 0 ? (
                            product.variants.map((v, vIdx) => (
                              <span
                                key={v?.weight || vIdx}
                                className="inline-flex items-center gap-1.5 text-[11px] bg-brand-coffee-100 px-2 py-0.5 rounded-md font-bold text-brand-coffee-800 border border-brand-coffee-200"
                              >
                                {v?.image && (
                                  <img
                                    src={v.image}
                                    alt={v.weight || 'Variant'}
                                    className="w-3.5 h-3.5 rounded object-contain bg-white flex-shrink-0"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <span>{v?.weight || 'Pack'}: ₹{v?.price ?? product.price ?? 299}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] bg-brand-coffee-100 px-2 py-0.5 rounded-md font-bold text-brand-coffee-800 border border-brand-coffee-200">
                              {product.weight || product.selectedWeight || '250g'}: ₹{product.price || 299}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price & MRP */}
                      <td className="p-4 font-bold text-brand-coffee-950">
                        {(() => {
                          const vars = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [];
                          const prices = vars.map((v) => Number(v?.price) || 0).filter((p) => p > 0);
                          const lowest = prices.length > 0 ? Math.min(...prices) : product.price || 299;
                          const highest = prices.length > 0 ? Math.max(...prices) : lowest;
                          return (
                            <div>
                              <div className="text-sm font-black text-brand-pink-700">
                                ₹{lowest} {highest > lowest ? <span className="text-xs text-brand-coffee-600 font-normal">to ₹{highest}</span> : ''}
                              </div>
                              <div className="text-[10px] text-brand-coffee-500 font-medium">
                                {vars.length} variant{vars.length !== 1 ? 's' : ''} configured
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Stock Switch Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleStockToggle(product._id, product.inStock)}
                          className={`px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all ${product.inStock !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${product.inStock !== false ? 'bg-emerald-500' : 'bg-rose-500'
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
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Draggable>
              );
            })
          )}
          {droppableProvided.placeholder}
        </tbody>
      )}
    </Droppable>
  </table>
</DragDropContext>
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
                    placeholder="e.g. நாதன் தூய ஃபில்டர் காபித்தூள்"
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900 font-tamil"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block font-bold text-brand-coffee-800 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-900 bg-white"
                  >
                    <option value="pure_coffee">Pure Coffee (0% Chicory)</option>
                    <option value="chicory_blend">Chicory Blend (80:20)</option>
                    <option value="special_roast">Special Roast</option>
                  </select>
                </div>

                {/* Dynamic Variants & Pricing Section */}
                <div className="bg-brand-coffee-50/70 p-4 rounded-2xl border border-brand-coffee-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-brand-coffee-950 text-xs flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-brand-pink-600" />
                        Weight Variants & Dynamic Pricing *
                      </h4>
                      <p className="text-[11px] text-brand-coffee-600">
                        Add weights (e.g., '100g', '250g', '750g') with specific selling price & MRP.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.variants.map((variant, index) => (
                      <div
                        key={index}
                        className="bg-white p-3.5 rounded-2xl border border-brand-coffee-200 shadow-xs space-y-3 transition-all hover:border-brand-pink-300"
                      >
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          <div className="flex-1">
                            <label className="block text-[10px] font-extrabold text-brand-coffee-700 uppercase tracking-wider mb-0.5">
                              Weight (e.g. 100g, 250g, 1kg) *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 250g or 100g"
                              value={variant.weight}
                              onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-950 text-xs font-semibold"
                            />
                          </div>

                          <div className="w-full sm:w-28">
                            <label className="block text-[10px] font-extrabold text-brand-coffee-700 uppercase tracking-wider mb-0.5">
                              Price (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="299"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-950 text-xs font-semibold"
                            />
                          </div>

                          <div className="w-full sm:w-28">
                            <label className="block text-[10px] font-extrabold text-brand-coffee-700 uppercase tracking-wider mb-0.5">
                              MRP (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              placeholder="340"
                              value={variant.mrp}
                              onChange={(e) => handleVariantChange(index, 'mrp', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-brand-coffee-200 focus:ring-2 focus:ring-brand-pink-500 focus:outline-none text-brand-coffee-950 text-xs font-semibold"
                            />
                          </div>

                          <div className="flex items-end justify-end sm:pt-4">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              disabled={formData.variants.length <= 1}
                              className={`p-2 rounded-lg transition-colors ${
                                formData.variants.length <= 1
                                  ? 'text-brand-coffee-300 cursor-not-allowed bg-brand-coffee-50'
                                  : 'text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50'
                              }`}
                              title={formData.variants.length <= 1 ? 'Minimum 1 variant required' : 'Remove variant'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Variant-Specific Image Upload Bar */}
                        <div className="pt-2.5 border-t border-brand-coffee-100 flex flex-wrap items-center justify-between gap-3 bg-brand-coffee-50/60 p-2.5 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            {variant.image ? (
                              <div className="relative group w-12 h-12 rounded-lg bg-white border border-brand-coffee-200 p-1 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <img
                                  src={variant.image}
                                  alt={`Variant ${variant.weight || index}`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = '/images/250g front.png';
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantChange(index, 'image', '')}
                                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs hover:bg-rose-700"
                                  title="Remove variant image"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg border-2 border-dashed border-brand-coffee-300 bg-white flex items-center justify-center flex-shrink-0 text-brand-coffee-400">
                                <ImageIcon className="w-5 h-5 text-brand-coffee-400" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="text-[11px] font-extrabold text-brand-coffee-950 flex items-center gap-1.5">
                                <span>Variant Image ({variant.weight || `#${index + 1}`})</span>
                                {variant.image && (
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                    Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-coffee-600 truncate max-w-xs">
                                {variant.image
                                  ? variant.image
                                  : 'Specific pack image shown when customer selects this size.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`variant-image-file-${index}`}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                                uploadingVariantIndex === index
                                  ? 'bg-brand-coffee-100 text-brand-coffee-400 border-brand-coffee-200 pointer-events-none'
                                  : 'bg-white hover:bg-brand-pink-50 text-brand-pink-700 border-brand-pink-300 shadow-2xs hover:border-brand-pink-400'
                              }`}
                            >
                              {uploadingVariantIndex === index ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-pink-600" />
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3.5 h-3.5 text-brand-pink-600" />
                                  <span>{variant.image ? 'Change Image' : 'Upload Image'}</span>
                                </>
                              )}
                            </label>
                            <input
                              id={`variant-image-file-${index}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingVariantIndex === index}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleVariantImageUpload(index, e.target.files[0]);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
                    disabled={saving}
                    className="px-5 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Product
                      </>
                    )}
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
