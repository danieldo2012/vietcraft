import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';
import { Page } from '@vietcraft/shared';
import { Save, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { RichTextEditor } from '../components/RichTextEditor';

export const AdminPageEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [formData, setFormData] = useState<Partial<Page>>({
    title: '',
    slug: '',
    content: '',
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    ogImage: '',
    status: 'published'
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: existingPage, isLoading } = useQuery({
    queryKey: ['admin-page-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const all = await adminApi.getPages();
      return all.find((p) => p._id === id) || null;
    },
    enabled: Boolean(id)
  });

  useEffect(() => {
    if (existingPage) {
      setFormData(existingPage);
    }
  }, [existingPage]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Page>) => {
      if (isNew) {
        return adminApi.createPage(data);
      } else {
        return adminApi.updatePage(id!, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages-list'] });
      setFeedback({ type: 'success', message: 'Page saved successfully! Changes are live.' });
      setTimeout(() => {
        navigate('/admin/pages');
      }, 1200);
    },
    onError: (err: any) => {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save page.'
      });
    }
  });

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew && (!prev.slug || prev.slug === '') ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      setFeedback({ type: 'error', message: 'Title, slug, and content are required.' });
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lotus-forest"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-lotus-sand/30 pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/pages"
            className="p-2 text-lotus-charcoal/60 hover:text-lotus-forest rounded hover:bg-lotus-sand/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-lotus-forest">
              {isNew ? 'Create New Page' : `Edit Page: ${formData.title}`}
            </h1>
            <p className="text-xs text-lotus-charcoal/70 mt-0.5">
              URL path: /{formData.slug || 'your-slug'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="About VietCraft"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Status
              </label>
              <select
                value={formData.status || 'published'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm bg-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Page Slug * (e.g. about, privacy-policy, terms)
            </label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-') })}
              required
              className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm font-mono"
              placeholder="about"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Featured Banner Image (Optional)
            </label>
            <ImageUploader
              value={formData.featuredImage || ''}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Page Content (Rich Text / Markdown) *
            </label>
            <RichTextEditor
              value={formData.content || ''}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>
        </div>

        {/* SEO Meta Fields */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-4">
          <h2 className="text-base font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Search Engine Optimization (SEO)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={formData.seoTitle || ''}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="About VietCraft | Vietnamese Craftsmanship"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.seoDescription || ''}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="Detailed page description for Google search results..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium text-base shadow-sm disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saveMutation.isPending ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </form>
    </div>
  );
};
