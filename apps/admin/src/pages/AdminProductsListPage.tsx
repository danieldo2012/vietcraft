import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, ExternalLink, Sparkles, Filter } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminProductsListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', statusFilter, searchTerm],
    queryFn: () =>
      adminApi.getProducts({
        status: statusFilter || undefined,
        search: searchTerm || undefined
      })
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    }
  });

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const products = data?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Curated Products</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage Amazon affiliate catalog, pricing metadata, ASIN records, and product relationships.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 rounded-xl bg-lotus-clay text-white text-xs font-semibold hover:bg-lotus-clay-light transition-colors flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or ASIN..."
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
            <option value="active">Active (Public)</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">ASIN</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Material</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url}
                          alt={product.title}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="font-semibold text-gray-900 hover:text-lotus-clay truncate"
                            >
                              {product.title}
                            </Link>
                            {product.featured && (
                              <span title="Featured"><Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /></span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono block">
                            /{product.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      <div className="flex items-center gap-1.5">
                        <span>{product.asin}</span>
                        {product.affiliateUrl && (
                          <a
                            href={product.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-amber-600 transition-colors"
                            title="Xem trên Amazon"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {typeof product.material === 'object' && product.material !== null ? (
                        (product.material as any).name
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {typeof product.category === 'object' && product.category !== null ? (
                        (product.category as any).name
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {product.status === 'active' && (
                          <a
                            href={`http://localhost:5173/products/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-gray-700"
                            title="Preview on Storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="p-1.5 text-blue-600 hover:text-blue-800"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id, product.title)}
                          className="p-1.5 text-red-500 hover:text-red-700"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No products found matching filters.
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
