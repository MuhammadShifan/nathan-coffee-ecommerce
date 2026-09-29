import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Star,
  Plus,
  ArrowLeft,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react';
import api from '../services/api';

/**
 * ImageDropzone Component (Multi-Image Upload & Preview)
 *
 * Supports:
 * - Multi-file selection via file dialog or drag-and-drop
 * - Server-side upload via Express Multer /api/upload
 * - Live grid of thumbnail previews for ALL selected images
 * - Reordering / setting primary main image
 * - Removing individual images
 */
const ImageDropzone = ({
  value = [],
  onChange,
  label = 'Product Packaging Images (Multi-Image)',
  maxImages = 8,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewModalImg, setPreviewModalImg] = useState(null);
  const fileInputRef = useRef(null);

  // Normalize incoming value to an array of string URLs
  const imageList = Array.isArray(value)
    ? value.map((img) => (typeof img === 'object' && img?.url ? img.url : img)).filter(Boolean)
    : typeof value === 'string' && value.trim()
    ? [value.trim()]
    : [];

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files));
    }
    // Reset input so same files can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesSelected = async (files) => {
    if (imageList.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    // Validate all file types & sizes
    const validFiles = [];
    for (const file of files) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp|avif)$/)) {
        setUploadError(`"${file.name}" is not a supported image format (JPG, PNG, WebP, AVIF only).`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the 10MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadError(null);
    setUploading(true);

    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const res = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success && res.data.urls && res.data.urls.length > 0) {
        const newImages = [...imageList, ...res.data.urls];
        onChange(newImages);
      } else if (res.data.url) {
        const newImages = [...imageList, res.data.url];
        onChange(newImages);
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Multi-image upload failed:', err);
      // Fallback local preview URLs
      const localUrls = validFiles.map((f) => URL.createObjectURL(f));
      const newImages = [...imageList, ...localUrls];
      onChange(newImages);
      setUploadError(err.response?.data?.message || 'Server upload failed. Stored local previews.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove, e) => {
    e.stopPropagation();
    const updated = imageList.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetPrimary = (indexToPrimary, e) => {
    e.stopPropagation();
    if (indexToPrimary === 0) return;
    const target = imageList[indexToPrimary];
    const rest = imageList.filter((_, idx) => idx !== indexToPrimary);
    const updated = [target, ...rest];
    onChange(updated);
  };

  const handleMove = (index, direction, e) => {
    e.stopPropagation();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= imageList.length) return;
    const updated = [...imageList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    if (window.confirm('Remove all selected product images?')) {
      onChange([]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      {/* Label and Count Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-brand-coffee-800">
          {label} *
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-brand-coffee-500">
            {imageList.length} / {maxImages} images
          </span>
          {imageList.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-rose-600 hover:text-rose-700 font-bold underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-4 transition-all overflow-hidden ${
          isDragging
            ? 'border-brand-pink-600 bg-brand-pink-100/60 scale-[1.005] shadow-lg shadow-brand-pink-500/10'
            : imageList.length > 0
            ? 'border-brand-coffee-300 bg-brand-coffee-50/40 hover:border-brand-pink-400'
            : 'border-brand-pink-300 bg-brand-pink-50/30 hover:bg-brand-pink-50/70 hover:border-brand-pink-500 cursor-pointer'
        }`}
        onClick={imageList.length === 0 ? triggerFileInput : undefined}
      >
        {/* If images exist: Show Multi-Image Thumbnail Gallery */}
        {imageList.length > 0 ? (
          <div className="space-y-3">
            {/* Grid of Image Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imageList.map((url, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`group relative bg-white rounded-xl p-2 border-2 transition-all shadow-xs flex flex-col justify-between ${
                      isPrimary
                        ? 'border-brand-pink-600 shadow-md ring-2 ring-brand-pink-400/30'
                        : 'border-brand-coffee-200 hover:border-brand-pink-300'
                    }`}
                  >
                    {/* Badge: Primary Main or Order Index */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      {isPrimary ? (
                        <span className="bg-brand-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" /> Main Cover
                        </span>
                      ) : (
                        <span className="bg-brand-coffee-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Delete Icon on top-right */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(idx, e)}
                      className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 hover:opacity-100 shadow-sm transition-transform hover:scale-110"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {/* Thumbnail Image Container */}
                    <div
                      className="h-28 w-full flex items-center justify-center overflow-hidden rounded-lg cursor-pointer bg-brand-coffee-50/50"
                      onClick={() => setPreviewModalImg(url)}
                      title="Click to zoom preview"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/images/250g front.png';
                        }}
                      />
                    </div>

                    {/* Action Bar per Thumbnail */}
                    <div className="mt-2 pt-1.5 border-t border-brand-coffee-100 flex items-center justify-between gap-1 text-[10px]">
                      {isPrimary ? (
                        <span className="text-[10px] font-bold text-brand-pink-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-brand-pink-600" /> Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleSetPrimary(idx, e)}
                          className="px-1.5 py-0.5 bg-brand-pink-50 hover:bg-brand-pink-100 text-brand-pink-700 font-bold rounded border border-brand-pink-200 transition-colors"
                        >
                          Make Main
                        </button>
                      )}

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => handleMove(idx, -1, e)}
                          className={`p-1 rounded ${
                            idx === 0
                              ? 'text-brand-coffee-300 cursor-not-allowed'
                              : 'text-brand-coffee-600 hover:bg-brand-coffee-100'
                          }`}
                          title="Move left"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === imageList.length - 1}
                          onClick={(e) => handleMove(idx, 1, e)}
                          className={`p-1 rounded ${
                            idx === imageList.length - 1
                              ? 'text-brand-coffee-300 cursor-not-allowed'
                              : 'text-brand-coffee-600 hover:bg-brand-coffee-100'
                          }`}
                          title="Move right"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* "+ Add More" Tile if under limit */}
              {imageList.length < maxImages && (
                <div
                  onClick={triggerFileInput}
                  className="h-full min-h-[140px] rounded-xl border-2 border-dashed border-brand-pink-300 bg-brand-pink-50/40 hover:bg-brand-pink-50 hover:border-brand-pink-500 cursor-pointer flex flex-col items-center justify-center p-3 text-center transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-pink-100 text-brand-pink-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    {uploading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-brand-coffee-900">
                    + Add More
                  </span>
                  <span className="text-[9px] text-brand-coffee-500">
                    Select files
                  </span>
                </div>
              )}
            </div>

            {/* Hint & Upload State */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-brand-coffee-200/60 text-[11px] text-brand-coffee-600">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>The first image is used as the card cover photo.</span>
              </span>
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploading || imageList.length >= maxImages}
                className="px-3 py-1 bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-800 rounded-lg font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-pink-600" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload More Files</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Prompt State */
          <div className="p-6 text-center space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-pink-100 text-brand-pink-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              {uploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-brand-pink-600" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-brand-coffee-950">
                <span className="text-brand-pink-600 underline decoration-brand-pink-400">
                  Click to select multiple images
                </span>{' '}
                or drag & drop files here
              </p>
              <p className="text-[11px] text-brand-coffee-500 mt-0.5">
                PNG, JPG, WebP, AVIF up to {maxImages} images (Max: 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1.5 p-2 bg-rose-50 rounded-xl border border-rose-200 mt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Modal Lightbox for Zoom Preview */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-brand-coffee-100 hover:bg-brand-coffee-200 text-brand-coffee-800"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Zoom preview"
              className="max-h-[70vh] w-auto object-contain rounded-lg"
            />
            <p className="text-xs text-brand-coffee-600 mt-2 font-mono truncate max-w-md">
              {previewModalImg}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
