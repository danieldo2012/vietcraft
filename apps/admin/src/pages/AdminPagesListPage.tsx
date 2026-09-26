import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';
import { Page } from '@vietcraft/shared';
import { Plus, Edit2, Trash2, Eye, FileText, CheckCircle, Clock } from 'lucide-react';

export const AdminPagesListPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin-pages-list'],
    queryFn: adminApi.getPages
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages-list'] });
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the page "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: Page['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" /> Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-lotus-sand/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-lotus-forest">Pages CMS</h1>
          <p className="text-sm text-lotus-charcoal/70 mt-1">
            Manage static and editorial content pages including About Us, Privacy Policy, Terms, and Affiliate Disclosure.
          </p>
        </div>
        <Link
          to="/admin/pages/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Page
        </Link>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lotus-forest"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-lotus-sand/40">
          <FileText className="w-12 h-12 text-lotus-sand mx-auto mb-3" />
          <p className="text-lotus-charcoal/70 font-medium">No pages created yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-lotus-sand/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-lotus-ivory border-b border-lotus-sand/30 text-xs uppercase tracking-wider text-lotus-charcoal/70">
                <tr>
                  <th className="px-6 py-3.5">Page Title</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lotus-sand/20">
                {pages.map((page) => (
                  <tr key={page._id} className="hover:bg-lotus-ivory/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-lotus-forest flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-lotus-clay" />
                      {page.title}
                    </td>
                    <td className="px-6 py-4 text-lotus-charcoal/70 font-mono text-xs">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(page.status)}</td>
                    <td className="px-6 py-4 text-lotus-charcoal/60 text-xs">
                      {new Date(page.updatedAt || page.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <a
                        href={`/${page.slug === 'home' ? '' : page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 text-lotus-charcoal/60 hover:text-lotus-forest rounded hover:bg-lotus-sand/20 transition-colors"
                        title="View Public Page"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <Link
                        to={`/admin/pages/${page._id}/edit`}
                        className="inline-flex p-1.5 text-lotus-charcoal/60 hover:text-lotus-forest rounded hover:bg-lotus-sand/20 transition-colors"
                        title="Edit Page"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(page._id, page.title)}
                        className="inline-flex p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
