import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const DEFAULT_HERO_IMAGE = '/images/hero-coffee.jpg';

const HeroBannerManager = ({ onBannerUpdated }) => {
  const [currentHeroImage, setCurrentHeroImage] = useState(DEFAULT_HERO_IMAGE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch current live hero banner image from backend
  const fetchCurrentBanner = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/settings/hero-image');
      if (res.data?.success && res.data?.heroImageUrl) {
        setCurrentHeroImage(res.data.heroImageUrl);
      }
    } catch (err) {
      console.warn('Could not fetch hero image setting, using default:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBanner();
  }, []);

  // Handle local file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: 'Please select a valid image file (JPG, PNG, WebP, AVIF).',
      });
      return;
    }

    // Validate max file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Image file size exceeds 10MB limit. Please choose a smaller image.',
      });
      return;
    }

    setSelectedFile(file);
    setStatusMessage(null);

    // Create instant local preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  // Upload and save new hero banner
  const handleUploadAndSave = async () => {
    if (!selectedFile) {
      setStatusMessage({
        type: 'error',
        text: 'Please choose an image file first.',
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('heroImage', selectedFile);

      const res = await api.post('/api/admin/settings/hero-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        const newUrl = res.data.heroImageUrl;
        setCurrentHeroImage(newUrl);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        setStatusMessage({
          type: 'success',
          text: 'Homepage hero banner updated successfully! The new image is now live on the store.',
        });

        if (onBannerUpdated) {
          onBannerUpdated(newUrl);
        }
      } else {
        throw new Error(res.data?.message || 'Failed to update hero banner');
      }
    } catch (err) {
      console.error('Error uploading hero banner:', err);
      setStatusMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Failed to upload hero image. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default original banner
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset the homepage hero banner back to the original default image?')) {
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await api.post('/api/admin/settings/hero-image', { reset: true });
      if (res.data?.success) {
        setCurrentHeroImage(DEFAULT_HERO_IMAGE);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        setStatusMessage({
          type: 'success',
          text: 'Reset to default hero banner successfully!',
        });

        if (onBannerUpdated) {
          onBannerUpdated(DEFAULT_HERO_IMAGE);
        }
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to reset hero banner.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel pending selection
  const handleCancelSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-coffee-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-brand-coffee-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-pink-50 text-brand-pink-600 rounded-2xl border border-brand-pink-200">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-brand-coffee-950">
                Homepage Hero Banner
              </h2>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Homepage
              </span>
            </div>
            <p className="text-xs text-brand-coffee-600">
              Customize the promotional image featured on the right side of the customer homepage.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCurrentBanner}
          disabled={loading || saving}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-brand-coffee-700 hover:text-brand-coffee-950 bg-brand-coffee-50 hover:bg-brand-coffee-100 border border-brand-coffee-200 rounded-xl flex items-center gap-1.5 transition-colors"
          title="Refresh current banner"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Feedback Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border ${statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Preview Comparison & Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Live Hero Banner */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-brand-coffee-800">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-pink-600" /> Current Live Banner
            </span>
            <span className="text-[11px] font-mono text-brand-coffee-500 truncate max-w-[150px]">
              {currentHeroImage}
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border-2 border-brand-coffee-200 bg-white shadow-sm group min-h-[200px] sm:min-h-[224px] flex items-center justify-center p-2">
            <img
              src={currentHeroImage}
              alt="Current Live Homepage Hero Banner"
              className="w-full h-48 sm:h-56 object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_HERO_IMAGE;
              }}
            />
          </div>
        </div>

        {/* Right: Upload Dropzone & New Selection Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold text-brand-coffee-800 flex items-center justify-between">
            <span>Upload New Banner</span>
            <span className="text-[11px] font-normal text-brand-coffee-500">
              Recommended: 1200×800px (4:3 or 16:9), Max 10MB
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {!previewUrl ? (
            /* Dropzone Prompt */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${isDragging
                  ? 'border-brand-pink-600 bg-brand-pink-50/70 scale-[0.99]'
                  : 'border-brand-coffee-300 hover:border-brand-pink-500 hover:bg-brand-coffee-50/60'
                }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-pink-100/70 text-brand-pink-600 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-coffee-950">
                  Click to select an image, or drag & drop here
                </p>
                <p className="text-[11px] text-brand-coffee-600">
                  Supports JPG, PNG, WebP, and AVIF
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 bg-brand-pink-600 hover:bg-brand-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-pink-600/20 transition-all pointer-events-none"
              >
                Browse Image File
              </button>
            </div>
          ) : (
            /* Selected Image Preview with Action Controls */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border-2 border-brand-pink-500/50 bg-white shadow-md min-h-[200px] sm:min-h-[224px] flex items-center justify-center p-2">
                <img
                  src={previewUrl}
                  alt="New Banner Preview"
                  className="w-full h-48 sm:h-56 object-contain"
                />
                <div className="absolute top-2.5 right-2.5 bg-brand-pink-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                  Ready to Publish
                </div>
                <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-lg">
                  {selectedFile?.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleUploadAndSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-pink-600 to-brand-pink-700 hover:from-brand-pink-700 hover:to-brand-pink-800 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-pink-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{saving ? 'Uploading & Updating...' : 'Publish & Save Banner'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="px-4 py-2.5 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-900 rounded-xl text-xs font-semibold transition-colors"
                >
                  Choose Different File
                </button>

                <button
                  type="button"
                  onClick={handleCancelSelection}
                  disabled={saving}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reset to Default Option */}
          {currentHeroImage !== DEFAULT_HERO_IMAGE && !previewUrl && (
            <div className="pt-2 border-t border-brand-coffee-100 flex items-center justify-between">
              <span className="text-[11px] text-brand-coffee-600">
                Want to restore the standard Nathan Coffee photo?
              </span>
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={saving}
                className="text-xs font-bold text-brand-pink-600 hover:text-brand-pink-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBannerManager;

