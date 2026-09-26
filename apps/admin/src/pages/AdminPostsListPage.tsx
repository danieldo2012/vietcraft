import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, ExternalLink, Filter } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminPostsListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', statusFilter, searchTerm],
    queryFn: () =>
      adminApi.getPosts({
        status: statusFilter || undefined,
        search: searchTerm || undefined
      })
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const posts = data?.posts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Articles & Journal</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage blog stories, artisan profiles, and cultural heritage guides.
          </p>
        </div>
        <Link
          to="/admin/posts/new"
          className="px-4 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-lotus-forest"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Article</th>
                <th className="py-3.5 px-4">Material</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading articles...
                  </td>
                </tr>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/posts/${post._id}/edit`}
                            className="font-semibold text-gray-900 hover:text-lotus-forest truncate block"
                          >
                            {post.title}
                          </Link>
                          <span className="text-[10px] text-gray-400 font-mono">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {typeof post.material === 'object' && post.material !== null ? (
                        <span className="px-2 py-0.5 rounded-full bg-lotus-sand/30 text-lotus-forest text-[11px]">
                          {(post.material as any).name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {post.author?.name || 'VietCraft'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <a
                            href={`http://localhost:5173/articles/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700"
                            title="Preview on Public Site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          to={`/admin/posts/${post._id}/edit`}
                          className="p-1.5 text-blue-600 hover:text-blue-800"
                          title="Edit Post"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(post._id, post.title)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No articles found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
