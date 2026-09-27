import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  RefreshCw,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { ImageUploader } from '../components/ImageUploader';
import { slugify, AmazonScrapedProduct } from '@vietcraft/shared';

export const AdminProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';
  const navigate = useNavigate();

  const [amazonInput, setAmazonInput] = useState('');
  const [scrapeResult, setScrapeResult] = useState<AmazonScrapedProduct | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [includeDimensions, setIncludeDimensions] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    images: [{ url: '', alt: '', isPrimary: true }],
    material: '',
    category: '',
    asin: '',
    affiliateUrl: '',
    price: 49.0,
    currency: 'USD',
    priceSource: 'manual_entry',
    featured: false,
    status: 'active',
    tagsString: 'natural, home decor',
    dimensions: {
      height: 12,
      width: 12,
      depth: 12,
      unit: 'in'
    },
    seo: {
      title: '',
      description: ''
    }
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch materials & categories
  const { data: materials } = useQuery({
    queryKey: ['admin-materials'],
    queryFn: adminApi.getMaterials
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories
  });

  // Fetch product if editing
  const { data: existingProduct, isLoading: isProductLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.getProductById(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (existingProduct) {
      if (existingProduct.asin && !amazonInput) {
        setAmazonInput(existingProduct.asin);
      }

      setIncludeDimensions(
        Boolean(
          existingProduct.dimensions &&
            (existingProduct.dimensions.height || existingProduct.dimensions.width || existingProduct.dimensions.depth)
        )
      );

      setFormData({
        title: existingProduct.title,
        slug: existingProduct.slug,
        description: existingProduct.description,
        shortDescription: existingProduct.shortDescription,
        images: existingProduct.images?.length > 0 ? existingProduct.images : [{ url: '', alt: '', isPrimary: true }],
        material:
          typeof existingProduct.material === 'object' && existingProduct.material !== null
            ? (existingProduct.material as any)._id
            : (existingProduct.material as string) || '',
        category:
          typeof existingProduct.category === 'object' && existingProduct.category !== null
            ? (existingProduct.category as any)._id
            : (existingProduct.category as string) || '',
        asin: existingProduct.asin,
        affiliateUrl: existingProduct.affiliateUrl,
        price: existingProduct.price,
        currency: existingProduct.currency || 'USD',
        priceSource: existingProduct.priceSource || 'manual_entry',
        featured: existingProduct.featured || false,
        status: existingProduct.status || 'active',
        tagsString: (existingProduct.tags || []).join(', '),
        dimensions: {
          height: existingProduct.dimensions?.height || 12,
          width: existingProduct.dimensions?.width || 12,
          depth: existingProduct.dimensions?.depth || 12,
          unit: existingProduct.dimensions?.unit || 'in'
        },
        seo: {
          title: existingProduct.seo?.title || '',
          description: existingProduct.seo?.description || ''
        }
      });
    }
  }, [existingProduct]);

  // Amazon Scrape Mutation
  const scrapeMutation = useMutation({
    mutationFn: adminApi.scrapeAmazonProduct,
    onSuccess: (data: AmazonScrapedProduct) => {
      setScrapeResult(data);
      setFormData((prev) => {
        const hasValidImages = data.images && data.images.length > 0;
        return {
          ...prev,
          title: prev.title.trim() ? prev.title : data.title,
          slug: !isEditing && !prev.slug ? slugify(data.title) : prev.slug,
          asin: data.asin,
          affiliateUrl: data.affiliateUrl || prev.affiliateUrl,
          price: data.price !== null ? data.price : prev.price,
          currency: data.currency || prev.currency,
          priceSource: 'direct_import',
          description: data.description || prev.description,
          shortDescription: data.shortDescription || prev.shortDescription,
          images: hasValidImages ? data.images : prev.images,
          dimensions: data.dimensions
            ? {
                height: data.dimensions.height || prev.dimensions.height,
                width: data.dimensions.width || prev.dimensions.width,
                depth: data.dimensions.depth || prev.dimensions.depth,
                unit: data.dimensions.unit || prev.dimensions.unit
              }
            : prev.dimensions
        };
      });

      setFeedback({
        type: 'success',
        text: `Đã cập nhật dữ liệu từ Amazon (${data.asin}): Giá $${data.price ?? '--'}, ${data.images?.length || 0} ảnh và mô tả sản phẩm!`
      });
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        text:
          err.response?.data?.message ||
          'Không thể lấy dữ liệu từ link Amazon. Vui lòng kiểm tra lại link hoặc ASIN.'
      });
    }
  });

  const handleScrapeAmazon = (overrideUrl?: string) => {
    const target = overrideUrl || amazonInput;
    if (!target.trim()) return;
    setFeedback(null);
    scrapeMutation.mutate(target.trim());
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((_, i) => i !== index);
      const withPrimary = filtered.map((img, i) => ({
        ...img,
        isPrimary: i === 0
      }));
      return {
        ...prev,
        images: withPrimary.length > 0 ? withPrimary : [{ url: '', alt: '', isPrimary: true }]
      };
    });
  };

  const handleAddCustomImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => {
      const valid = prev.images.filter((img) => img.url.trim());
      return {
        ...prev,
        images: [
          ...valid,
          { url: newImageUrl.trim(), alt: `${prev.title} view ${valid.length + 1}`, isPrimary: valid.length === 0 }
        ]
      };
    });
    setNewImageUrl('');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? slugify(title) : prev.slug
    }));
  };

  const handleAsinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const asin = e.target.value.trim().toUpperCase();
    setFormData((prev) => ({
      ...prev,
      asin,
      affiliateUrl: asin.length === 10 ? `https://www.amazon.com/dp/${asin}?tag=vietcraft-20` : prev.affiliateUrl
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        return adminApi.updateProduct(id!, payload);
      }
      return adminApi.createProduct(payload);
    },
    onSuccess: () => {
      setFeedback({ type: 'success', text: `Product ${isEditing ? 'updated' : 'created'} successfully!` });
      setTimeout(() => navigate('/admin/products'), 1200);
    },
    onError: (err: any) => {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        const errorDetails = validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(' • ');
        setFeedback({ type: 'error', text: errorDetails });
      } else {
        setFeedback({ type: 'error', text: serverMsg || 'Failed to save product.' });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formData.material) {
      setFeedback({ type: 'error', text: 'Please select a material.' });
      return;
    }

    if (!formData.category) {
      setFeedback({ type: 'error', text: 'Please select a category.' });
      return;
    }

    if (formData.asin.length !== 10) {
      setFeedback({ type: 'error', text: 'ASIN must be exactly 10 alphanumeric characters.' });
      return;
    }

    const validImages = formData.images.filter((img) => img.url.trim());
    if (validImages.length === 0) {
      setFeedback({ type: 'error', text: 'Please provide at least one product image.' });
      return;
    }

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      description: formData.description,
      shortDescription: formData.shortDescription,
      images: validImages.map((img, i) => ({
        url: img.url,
        alt: img.alt || formData.title,
        isPrimary: i === 0
      })),
      material: formData.material,
      category: formData.category,
      asin: formData.asin.toUpperCase(),
      affiliateUrl: formData.affiliateUrl || `https://www.amazon.com/dp/${formData.asin.toUpperCase()}?tag=vietcraft-20`,
      price: Number(formData.price),
      currency: formData.currency,
      priceSource: formData.priceSource,
      featured: formData.featured,
      status: formData.status,
      tags,
      dimensions: includeDimensions ? formData.dimensions : undefined,
      seo: {
        title: formData.seo.title || formData.title,
        description: formData.seo.description || formData.shortDescription
      }
    };

    saveMutation.mutate(payload);
  };

  if (isEditing && isProductLoading) {
    return <div className="py-24 text-center text-xs text-gray-500">Loading product editor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Amazon affiliate product discovery metadata, ASIN, and categories.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-lotus-clay text-white text-xs font-semibold hover:bg-lotus-clay-light transition-colors flex items-center gap-2 shadow-xs"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-xs ${
            feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Amazon Auto-Fill / Sync Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/70 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Đồng bộ & Tự động lấy dữ liệu từ Amazon
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 tracking-wider">
                  Ảnh • Giá • Mô tả • ASIN
                </span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Nhập link sản phẩm Amazon (hoặc mã ASIN 10 ký tự) để hệ thống tự động cập nhật ảnh, giá USD, mô tả chi tiết và tạo link tiếp thị liên kết.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={amazonInput}
              onChange={(e) => setAmazonInput(e.target.value)}
              placeholder="Dán link Amazon (ví dụ: https://www.amazon.com/dp/B0... hoặc https://a.co/... hoặc mã ASIN)"
              className="w-full px-4 py-2.5 text-xs text-gray-900 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              disabled={scrapeMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleScrapeAmazon();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => handleScrapeAmazon()}
            disabled={scrapeMutation.isPending || !amazonInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs shrink-0"
          >
            {scrapeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải dữ liệu Amazon...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Lấy thông tin từ Amazon</span>
              </>
            )}
          </button>
        </div>

        {scrapeResult && (
          <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-gray-700 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-green-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Đã nạp dữ liệu từ Amazon:
            </span>
            {scrapeResult.price !== null ? (
              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-mono font-medium">
                Giá: ${scrapeResult.price.toFixed(2)} USD
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                Giá: Chưa cập nhật trên Amazon
              </span>
            )}
            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              {scrapeResult.images.length} hình ảnh
            </span>
            <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200 font-mono">
              ASIN: {scrapeResult.asin}
            </span>
            <a
              href={scrapeResult.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1 ml-auto"
            >
              <span>Xem trên Amazon</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. Bát Tràng Fluted Celadon Stoneware Vase"
              className="w-full px-4 py-2.5 text-base font-serif font-bold text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-mono text-gray-600 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:border-lotus-forest"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">Amazon ASIN (10 chars) *</label>
                {formData.asin.length === 10 && (
                  <button
                    type="button"
                    onClick={() => handleScrapeAmazon(formData.asin)}
                    disabled={scrapeMutation.isPending}
                    className="text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                    title="Cập nhật lại từ mã ASIN này"
                  >
                    <RefreshCw className={`w-3 h-3 ${scrapeMutation.isPending ? 'animate-spin' : ''}`} />
                    <span>Lấy lại từ ASIN</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.asin}
                onChange={handleAsinChange}
                placeholder="e.g. B08J45MN91"
                className="w-full px-3 py-1.5 text-xs font-mono font-bold uppercase text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Affiliate Outbound URL *</label>
            <input
              type="url"
              required
              value={formData.affiliateUrl}
              onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
              placeholder="https://www.amazon.com/dp/B08J45MN91?tag=vietcraft-20"
              className="w-full px-3 py-2 text-xs text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description *</label>
            <input
              type="text"
              required
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief 1-sentence synopsis for discovery cards..."
              className="w-full px-3 py-2 text-xs text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Craft & Design Description *</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed background on materials, cultural craft roots, styling advice..."
              className="w-full p-3 text-xs text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          {/* Image Manager */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Product Images ({formData.images.filter((img) => img.url.trim()).length})
                </h3>
                <p className="text-[11px] text-gray-500">
                  Ảnh đầu tiên hoặc có gắn nhãn "Primary" sẽ là ảnh đại diện chính của sản phẩm.
                </p>
              </div>
            </div>

            {/* Visual Gallery Preview */}
            {formData.images.some((img) => img.url.trim()) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {formData.images
                  .filter((img) => img.url.trim())
                  .map((image, index) => (
                    <div
                      key={index}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-white ${
                        image.isPrimary ? 'border-lotus-forest shadow-xs ring-2 ring-lotus-forest/20' : 'border-gray-200'
                      }`}
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Primary badge */}
                      {image.isPrimary && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-lotus-forest text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Ảnh chính</span>
                        </div>
                      )}

                      {/* Action overlays */}
                      <div className="p-2 flex items-center justify-between gap-1 bg-white border-t border-gray-100">
                        {!image.isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(index)}
                            className="text-[10px] font-medium text-gray-600 hover:text-lotus-forest flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            <span>Đặt làm chính</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-lotus-forest font-medium">Đang chọn</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-auto"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Add Image via Direct URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Thêm nhanh link ảnh (URL https://...)"
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomImageUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomImageUrl}
                disabled={!newImageUrl.trim()}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm URL</span>
              </button>
            </div>

            {/* Local File Uploader */}
            <div className="space-y-3 pt-2">
              <ImageUploader
                value={formData.images[0]?.url || ''}
                onChange={(url) => {
                  const newImages = [...formData.images];
                  newImages[0] = { url, alt: formData.title, isPrimary: true };
                  setFormData({ ...formData, images: newImages });
                }}
                label="Tải ảnh chính lên từ máy tính (hoặc dán đè)"
              />

              {/* Additional Secondary Image */}
              <ImageUploader
                value={formData.images[1]?.url || ''}
                onChange={(url) => {
                  const newImages = [...formData.images];
                  newImages[1] = { url, alt: `${formData.title} alternate view`, isPrimary: false };
                  setFormData({ ...formData, images: newImages });
                }}
                label="Tải ảnh phụ lên từ máy tính (Optional)"
                helpText="Hiển thị khi di chuột (hover) trên thẻ sản phẩm trang chủ và danh mục."
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-gray-900">Dimensions & Sizing</h3>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDimensions}
                  onChange={(e) => setIncludeDimensions(e.target.checked)}
                  className="rounded border-gray-300 text-lotus-forest focus:ring-lotus-forest"
                />
                Include dimensions for this product
              </label>
            </div>
            {includeDimensions ? (
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Height</label>
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, height: Number(e.target.value) }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Width</label>
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, width: Number(e.target.value) }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Depth</label>
                  <input
                    type="number"
                    value={formData.dimensions.depth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, depth: Number(e.target.value) }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Unit</label>
                  <select
                    value={formData.dimensions.unit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dimensions: { ...formData.dimensions, unit: e.target.value }
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="in">Inches (in)</option>
                    <option value="cm">Centimeters (cm)</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">
                Not included — this product's listing will not display a size/dimensions section.
              </p>
            )}
          </div>
        </div>

        {/* Right Settings Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Classification & Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Catalog Placement
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Craft Material *</label>
              <select
                required
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-lotus-forest"
              >
                <option value="">Select Material...</option>
                {(materials || []).map((mat) => (
                  <option key={mat._id} value={mat._id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Room Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-lotus-forest"
              >
                <option value="">Select Category...</option>
                {(categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-lotus-forest"
              >
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-lotus-forest focus:ring-lotus-forest"
                />
                <span className="text-xs font-medium text-gray-800">Feature on Homepage</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-2">
            <label className="block text-xs font-semibold text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tagsString}
              onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
              placeholder="lighting, rattan, dining room"
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          {/* SEO Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              SEO Fields
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Meta Description</label>
              <textarea
                rows={2}
                value={formData.seo.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value }
                  })
                }
                className="w-full p-2 text-xs rounded-lg border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
