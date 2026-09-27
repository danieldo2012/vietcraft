import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { RichTextEditor } from '../components/RichTextEditor';
import { ImageUploader } from '../components/ImageUploader';
import { slugify } from '@vietcraft/shared';

export const AdminPostEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== 'new';
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    material: '',
    author: {
      name: 'Linh Tran',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Vietnamese architectural historian and curator.'
    },
    tagsString: 'rattan, slow living, craft',
    status: 'draft',
    seo: {
      title: '',
      description: ''
    }
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch materials for dropdown
  const { data: materials } = useQuery({
    queryKey: ['admin-materials'],
    queryFn: adminApi.getMaterials
  });

  // Fetch post details if editing
  const { data: existingPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: () => adminApi.getPostById(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title,
        slug: existingPost.slug,
        excerpt: existingPost.excerpt,
        content: existingPost.content,
        featuredImage: existingPost.featuredImage,
        material:
          typeof existingPost.material === 'object' && existingPost.material !== null
            ? (existingPost.material as any)._id
            : (existingPost.material as string) || '',
        author: {
          name: existingPost.author?.name || 'VietCraft',
          avatar: existingPost.author?.avatar || '',
          bio: existingPost.author?.bio || ''
        },
        tagsString: (existingPost.tags || []).join(', '),
        status: existingPost.status,
        seo: {
          title: existingPost.seo?.title || '',
          description: existingPost.seo?.description || ''
        }
      });
    }
  }, [existingPost]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: !isEditing ? slugify(title) : prev.slug
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditing) {
        return adminApi.updatePost(id!, payload);
      }
      return adminApi.createPost(payload);
    },
    onSuccess: () => {
      setFeedback({ type: 'success', text: `Article ${isEditing ? 'updated' : 'created'} successfully!` });
      setTimeout(() => navigate('/admin/posts'), 1200);
    },
    onError: (err: any) => {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
        const errorDetails = validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(' • ');
        setFeedback({ type: 'error', text: errorDetails });
      } else {
        setFeedback({ type: 'error', text: serverMsg || 'Failed to save post.' });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const tags = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      excerpt: formData.excerpt,
      content: formData.content,
      featuredImage: formData.featuredImage,
      material: formData.material || undefined,
      author: formData.author,
      tags,
      status: formData.status,
      seo: {
        title: formData.seo.title || formData.title,
        description: formData.seo.description || formData.excerpt
      }
    };

    saveMutation.mutate(payload);
  };

  if (isEditing && isPostLoading) {
    return <div className="py-24 text-center text-xs text-gray-500">Loading article editor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/posts"
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Article' : 'Write New Article'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Draft or publish editorial stories on natural living and Vietnamese craft.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEditing ? 'Update Article' : 'Save & Publish'}</span>
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

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Editor Column */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. The Living Art of Sơn Ta: Inside Hanoi's Ancestral Lacquer Village"
              className="w-full px-4 py-2.5 text-base font-serif font-bold text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Slug (URL identifier) *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-mono text-gray-600 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Short Excerpt *</label>
            <textarea
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A brief summary shown on preview cards and meta descriptions..."
              className="w-full p-3 text-xs text-gray-800 rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
            />
          </div>

          {/* Rich Content Editor */}
          <RichTextEditor
            value={formData.content}
            onChange={(val) => setFormData({ ...formData, content: val })}
          />
        </div>

        {/* Sidebar Settings Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Settings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Publishing Options
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-lotus-forest"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Material</label>
              <select
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:border-lotus-forest"
              >
                <option value="">None / General Lifestyle</option>
                {(materials || []).map((mat) => (
                  <option key={mat._id} value={mat._id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tagsString}
                onChange={(e) => setFormData({ ...formData, tagsString: e.target.value })}
                placeholder="bamboo, lighting, slow living"
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-lotus-forest"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <ImageUploader
              value={formData.featuredImage}
              onChange={(url) => setFormData({ ...formData, featuredImage: url })}
              label="Featured Image (Optional)"
              helpText="Primary hero photo displayed on the article header and blog feed. Leave empty to publish without a cover photo."
            />
          </div>

          {/* Author Details */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              Author Profile
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.author.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    author: { ...formData.author, name: e.target.value }
                  })
                }
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
              <textarea
                rows={2}
                value={formData.author.bio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    author: { ...formData.author, bio: e.target.value }
                  })
                }
                className="w-full p-2 text-xs rounded-lg border border-gray-300"
              />
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              SEO Optimization
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
                placeholder="Custom title for Google search"
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
                placeholder="Brief summary for search snippets"
                className="w-full p-2 text-xs rounded-lg border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
