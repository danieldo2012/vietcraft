import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ExternalLink, MousePointerClick, TrendingUp } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const AdminAnalyticsPage: React.FC = () => {
  const { data: clickData, isLoading } = useQuery({
    queryKey: ['admin-click-analytics'],
    queryFn: adminApi.getClickAnalytics
  });

  const clicks = clickData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-900">Affiliate Click Analytics</h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed metrics of outbound visitor clicks to Amazon product listings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lotus-clay" />
            <h2 className="font-serif text-lg font-bold text-gray-900">Top Outbound Products</h2>
          </div>
          <span className="text-xs text-gray-400">Aggregated by unique daily clicks</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
            <tr>
              <th className="py-3.5 px-4">Product</th>
              <th className="py-3.5 px-4">Amazon ASIN</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4 text-center">Total Clicks</th>
              <th className="py-3.5 px-4 text-right">Last Clicked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading click analytics...</td></tr>
            ) : clicks.length > 0 ? (
              clicks.map((item: any) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-sm truncate">
                    {item.title || 'Product listing'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600 font-bold">
                    {item.asin}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">
                    {item.price ? `$${Number(item.price).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                      {item.clickCount} clicks
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-500">
                    {item.lastClicked ? new Date(item.lastClicked).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No affiliate clicks recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
