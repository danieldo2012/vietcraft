import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { Material } from '@vietcraft/shared';
import { ImageUploader } from '../components/ImageUploader';
import { slugify } from '@vietcraft/shared';

export const AdminMaterialsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingMaterial, setEditingMaterial] = useState<Partial<Material> | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: materials, isLoading } = useQuery({
    queryKey: ['admin-materials'],
    queryFn: adminApi.getMaterials
  });

  const saveMutation = useMutation({
    mutationFn: async (material: Partial<Material>) => {
      if (material._id) {
        return adminApi.updateMaterial(material._id, material);
      }
      return adminApi.createMaterial(material);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
      setFeedback({ type: 'success', text: 'Material saved successfully!' });
      setEditingMaterial(null);
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save material.' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
      setFeedback({ type: 'success', text: 'Material deleted.' });
      setTimeout(() => setFeedback(null), 3000);
    }
  });

  const handleEdit = (mat: Material) => {
    setEditingMaterial({ ...mat });
  };

  const handleNew = () => {
    setEditingMaterial({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1000&q=80',
      displayOrder: (materials?.length || 0),
      isActive: true,
      craftingTechniques: ['Handcrafted'],
      originRegions: ['Vietnam']
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    if (!editingMaterial.slug && editingMaterial.name) {
      editingMaterial.slug = slugify(editingMaterial.name);
    }
    saveMutation.mutate(editingMaterial);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Craft Materials</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage the foundational natural mediums (Rattan, Ceramics, Lacquer, Wood, Woven Fibers, Silk).
          </p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="px-4 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
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

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Material</th>
              <th className="py-3.5 px-4">Short Lore</th>
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">Loading materials...</td>
              </tr>
            ) : (materials || []).map((mat) => (
              <tr key={mat._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                  <img src={mat.coverImage} alt={mat.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <span>{mat.name}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">/{mat.slug}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-gray-600 max-w-sm truncate">{mat.shortDescription}</td>
                <td className="py-3.5 px-4 font-mono">{mat.displayOrder}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${mat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {mat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(mat)}
                    className="p-1.5 text-blue-600 hover:text-blue-800 mr-1"
                    title="Edit Material"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete material "${mat.name}"?`)) {
                        deleteMutation.mutate(mat._id);
                      }
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700"
                    title="Delete Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal / Drawer */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-gray-900">
                {editingMaterial._id ? 'Edit Material' : 'New Material'}
              </h2>
              <button onClick={() => setEditingMaterial(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={editingMaterial.name || ''}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      name: e.target.value,
                      slug: !editingMaterial._id ? slugify(e.target.value) : editingMaterial.slug
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
                  value={editingMaterial.slug || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300 font-mono bg-gray-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={editingMaterial.shortDescription || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Craft Narrative *</label>
                <textarea
                  required
                  rows={4}
                  value={editingMaterial.description || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  className="w-full p-3 border rounded-xl border-gray-300"
                />
              </div>

              <ImageUploader
                value={editingMaterial.coverImage || ''}
                onChange={(url) => setEditingMaterial({ ...editingMaterial, coverImage: url })}
                label="Cover Image *"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingMaterial.displayOrder ?? 0}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl border-gray-300"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMaterial.isActive ?? true}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-lotus-forest"
                    />
                    <span className="font-semibold text-gray-800">Active on Website</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMaterial(null)}
                  className="px-4 py-2 border rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-lotus-forest text-white rounded-xl font-semibold hover:bg-lotus-forest-dark"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
