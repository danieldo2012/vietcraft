import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Home, Sparkles, MoveUp, MoveDown } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { HomepageConfig, HeroSlide } from '@vietcraft/shared';
import { ImageUploader } from '../components/ImageUploader';

export const AdminHomepagePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: initialConfig, isLoading } = useQuery({
    queryKey: ['admin-homepage-config'],
    queryFn: adminApi.getHomepage
  });

  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialConfig) {
      setConfig({ ...initialConfig });
    }
  }, [initialConfig]);

  const saveMutation = useMutation({
    mutationFn: adminApi.updateHomepage,
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-homepage-config'], data);
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-config'] });
      setFeedback({ type: 'success', text: 'Homepage changes saved and published to storefront!' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err: any) => {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        const errorDetails = validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        setFeedback({ type: 'error', text: `${serverMsg || 'Validation failed'}: ${errorDetails}` });
      } else {
        setFeedback({ type: 'error', text: serverMsg || 'Failed to update homepage.' });
      }
    }
  });

  const handleAddSlide = () => {
    if (!config) return;
    const newSlide: HeroSlide = {
      title: 'New Artisanal Collection',
      subtitle: 'Handmade Vietnamese decor for the modern sanctuary.',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
      displayOrder: config.heroSlides.length
    };
    setConfig({
      ...config,
      heroSlides: [...config.heroSlides, newSlide]
    });
  };

  const handleRemoveSlide = (idx: number) => {
    if (!config) return;
    const updated = config.heroSlides.filter((_, i) => i !== idx);
    setConfig({ ...config, heroSlides: updated });
  };

  const handleUpdateSlide = (idx: number, field: keyof HeroSlide, value: any) => {
    if (!config) return;
    const updated = [...config.heroSlides];
    updated[idx] = { ...updated[idx], [field]: value };
    setConfig({ ...config, heroSlides: updated });
  };

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    if (!config) return;
    const nextOrder = [...config.sectionOrder];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= nextOrder.length) return;
    const temp = nextOrder[idx];
    nextOrder[idx] = nextOrder[targetIdx];
    nextOrder[targetIdx] = temp;
    setConfig({ ...config, sectionOrder: nextOrder });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const payload = {
      ...config,
      featuredProductIds: config.featuredProductIds
        ?.map((p: any) => (typeof p === 'object' && p !== null ? p._id || p.id : p))
        .filter(Boolean),
      materialSection: {
        ...config.materialSection,
        enabledMaterialIds: config.materialSection?.enabledMaterialIds
          ?.map((m: any) => (typeof m === 'object' && m !== null ? m._id || m.id : m))
          .filter(Boolean)
      }
    };

    saveMutation.mutate(payload);
  };

  if (isLoading || !config) {
    return <div className="py-24 text-center text-xs text-gray-500">Loading Homepage CMS...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Homepage Content Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure dynamic hero carousel slides, material headlines, about storytelling, and section layout.
          </p>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Publish Changes</span>
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

      {/* 1. Hero Carousel Management */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">1. Hero Carousel Slides</h2>
            <p className="text-xs text-gray-500">Full-width rotating editorial slides on top of homepage.</p>
          </div>
          <button
            type="button"
            onClick={handleAddSlide}
            className="px-3.5 py-1.5 rounded-xl bg-lotus-sand/30 hover:bg-lotus-sand/50 text-lotus-forest text-xs font-medium flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
        </div>

        <div className="space-y-6">
          {config.heroSlides.map((slide, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-lotus-forest">
                  Slide {idx + 1}
                </span>
                {config.heroSlides.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(idx)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Headline Title</label>
                  <input
                    type="text"
                    required
                    value={slide.title}
                    onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    required
                    value={slide.subtitle}
                    onChange={(e) => handleUpdateSlide(idx, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    required
                    value={slide.buttonText}
                    onChange={(e) => handleUpdateSlide(idx, 'buttonText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Button URL</label>
                  <input
                    type="text"
                    required
                    value={slide.buttonUrl}
                    onChange={(e) => handleUpdateSlide(idx, 'buttonUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
                  />
                </div>
              </div>

              <ImageUploader
                value={slide.image}
                onChange={(url) => handleUpdateSlide(idx, 'image', url)}
                label="Slide Background Image"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Material Section Headlines */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
          2. Discover by Material Section
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Section Headline</label>
            <input
              type="text"
              required
              value={config.materialSection.headline}
              onChange={(e) =>
                setConfig({
                  ...config,
                  materialSection: { ...config.materialSection, headline: e.target.value }
                })
              }
              className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Section Subheadline</label>
            <input
              type="text"
              required
              value={config.materialSection.subheadline}
              onChange={(e) =>
                setConfig({
                  ...config,
                  materialSection: { ...config.materialSection, subheadline: e.target.value }
                })
              }
              className="w-full px-3 py-2 border rounded-xl border-gray-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* 3. About VietCraft Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
          3. About VietCraft Story
        </h2>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              required
              value={config.aboutSection.title}
              onChange={(e) =>
                setConfig({
                  ...config,
                  aboutSection: { ...config.aboutSection, title: e.target.value }
                })
              }
              className="w-full px-3 py-2 border rounded-xl border-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Body Text</label>
            <textarea
              rows={4}
              required
              value={config.aboutSection.body}
              onChange={(e) =>
                setConfig({
                  ...config,
                  aboutSection: { ...config.aboutSection, body: e.target.value }
                })
              }
              className="w-full p-3 border rounded-xl border-gray-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Artisan Quote</label>
              <input
                type="text"
                required
                value={config.aboutSection.quote}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    aboutSection: { ...config.aboutSection, quote: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl border-gray-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Quote Author</label>
              <input
                type="text"
                required
                value={config.aboutSection.quoteAuthor}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    aboutSection: { ...config.aboutSection, quoteAuthor: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl border-gray-300"
              />
            </div>
          </div>
          <ImageUploader
            value={config.aboutSection.image}
            onChange={(url) =>
              setConfig({
                ...config,
                aboutSection: { ...config.aboutSection, image: url }
              })
            }
            label="Artisan Portrait Photo"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                required
                value={config.aboutSection.buttonText || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    aboutSection: { ...config.aboutSection, buttonText: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl border-gray-300"
                placeholder="Read Our Story"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Button URL</label>
              <input
                type="text"
                required
                value={config.aboutSection.buttonUrl || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    aboutSection: { ...config.aboutSection, buttonUrl: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl border-gray-300"
                placeholder="/about"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Newsletter Section */}
      {config.newsletterSection && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
            4. Newsletter Call-to-Action
          </h2>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={config.newsletterSection.headline || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      newsletterSection: { ...config.newsletterSection, headline: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl border-gray-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Button Text</label>
                <input
                  type="text"
                  required
                  value={config.newsletterSection.buttonText || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      newsletterSection: { ...config.newsletterSection, buttonText: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Subheadline</label>
              <input
                type="text"
                required
                value={config.newsletterSection.subheadline || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    newsletterSection: { ...config.newsletterSection, subheadline: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl border-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Section Ordering */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">
          5. Section Ordering
        </h2>
        <div className="space-y-2 text-xs">
          {config.sectionOrder.map((sectionName, idx) => (
            <div
              key={sectionName}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between font-medium text-gray-800 capitalize"
            >
              <span>{idx + 1}. {sectionName}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveSection(idx, 'up')}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === config.sectionOrder.length - 1}
                  onClick={() => moveSection(idx, 'down')}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
