import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminNewsletterPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscribers', page],
    queryFn: () => adminApi.getNewsletterSubscribers(page, 20)
  });

  const subscribers = data?.subscribers || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;
    const headers = 'Email,Status,Subscribed Date,Source\n';
    const rows = subscribers
      .map((s) => `"${s.email}","${s.status}","${new Date(s.subscribedAt).toISOString()}","${s.source || 'website'}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vietcraft_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Total active subscribers: {meta.total} mindful homeowners.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={subscribers.length === 0}
          className="px-4 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-2 shadow-xs disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Subscriber Email</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">Loading subscribers...</td></tr>
            ) : subscribers.length > 0 ? (
              subscribers.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{s.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 capitalize">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 capitalize">{s.source || 'Website'}</td>
                  <td className="py-3.5 px-4 text-gray-500">{new Date(s.subscribedAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="py-12 text-center text-gray-400">No subscribers found.</td></tr>
            )}
          </tbody>
        </table>

        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Page {meta.page} of {meta.totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded border border-gray-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="p-1 rounded border border-gray-200 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
