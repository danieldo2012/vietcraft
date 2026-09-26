import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helpText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Featured Image',
  helpText = 'Upload a JPEG, PNG, or WEBP image, or paste an image URL.'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const result = await adminApi.uploadImage(file);
      onChange(result.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-gray-700">{label}</label>}

      {value ? (
        <div className="relative group w-full max-w-sm aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              isUploading
                ? 'border-lotus-clay bg-lotus-sand/10'
                : 'border-gray-300 hover:border-lotus-forest bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-xs text-lotus-clay">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Uploading image...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="font-medium text-gray-700">Click to upload local image</span>
                <span className="text-[11px] text-gray-400">JPEG, PNG, WEBP up to 10MB</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-lotus-forest hover:underline font-medium flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Or enter image URL</span>
            </button>
          </div>

          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-lotus-forest"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-1.5 text-xs bg-lotus-forest text-white rounded-lg font-medium hover:bg-lotus-forest-dark"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {helpText && <p className="text-[11px] text-gray-400">{helpText}</p>}
    </div>
  );
};
