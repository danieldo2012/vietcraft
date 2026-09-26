import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { Category } from '@vietcraft/shared';
import { slugify } from '@vietcraft/shared';

export const AdminCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories
  });

  const saveMutation = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      if (cat._id) {
        return adminApi.updateCategory(cat._id, cat);
      }
      return adminApi.createCategory(cat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setFeedback({ type: 'success', text: 'Category saved successfully!' });
      setEditingCategory(null);
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save category.' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setFeedback({ type: 'success', text: 'Category deleted.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.slug && editingCategory.name) {
      editingCategory.slug = slugify(editingCategory.name);
    }
    saveMutation.mutate(editingCategory);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Room Categories</h1>
          <p className="text-xs text-gray-500 mt-1">
            Product taxonomies (Lighting, Baskets, Wall Decor, Vases, Furniture, Kitchen & Dining, Textiles, Decorative Objects).
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditingCategory({
              name: '',
              slug: '',
              description: '',
              displayOrder: (categories?.length || 0),
              isActive: true
            })
          }
          className="px-4 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl flex items-center gap-2 text-xs ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading categories...</td></tr>
            ) : (categories || []).map((cat) => (
              <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900">
                  <span>{cat.name}</span>
                  <span className="block text-[10px] text-gray-400 font-mono">/{cat.slug}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-600">{cat.description || '—'}</td>
                <td className="py-3.5 px-4 font-mono">{cat.displayOrder}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button onClick={() => setEditingCategory({ ...cat })} className="p-1.5 text-blue-600 hover:text-blue-800 mr-1">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete category "${cat.name}"?`)) {
                        deleteMutation.mutate(cat._id);
                      }
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                {editingCategory._id ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setEditingCategory(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: !editingCategory._id ? slugify(e.target.value) : editingCategory.slug
                    })
                  }
                  className="w-full px-3 py-2 border rounded-xl border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300 font-mono bg-gray-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border rounded-xl border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-lotus-forest text-white rounded-xl font-semibold"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
