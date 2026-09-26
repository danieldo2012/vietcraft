import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Package,
  Layers,
  MousePointerClick,
  Mail,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { StatCard } from '../components/StatCard';

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: adminApi.getDashboardStats
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">CMS Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time platform metrics, editorial drafts, and Amazon affiliate performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/posts/new"
            className="px-4 py-2 rounded-xl bg-lotus-forest text-white text-xs font-semibold hover:bg-lotus-forest-dark transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Post</span>
          </Link>
          <Link
            to="/admin/products/new"
            className="px-4 py-2 rounded-xl bg-lotus-clay text-white text-xs font-semibold hover:bg-lotus-clay-light transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Published Posts"
          value={stats?.publishedPosts ?? 0}
          icon={FileText}
          color="forest"
          subtitle={`${stats?.draftPosts ?? 0} drafts`}
        />
        <StatCard
          title="Curated Products"
          value={stats?.products ?? 0}
          icon={Package}
          color="clay"
          subtitle="Active on Amazon"
        />
        <StatCard
          title="Active Materials"
          value={stats?.materials ?? 6}
          icon={Layers}
          color="sand"
          subtitle="Craft traditions"
        />
        <StatCard
          title="Affiliate Clicks"
          value={stats?.affiliateClicks ?? 0}
          icon={MousePointerClick}
          color="blue"
          subtitle="Total outbound"
        />
        <StatCard
          title="Newsletter Subs"
          value={stats?.newsletterSubscribers ?? 0}
          icon={Mail}
          color="forest"
          subtitle="Active readers"
        />
        <StatCard
          title="Draft Posts"
          value={stats?.draftPosts ?? 0}
          icon={Clock}
          color="clay"
          subtitle="Unpublished"
        />
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Posts Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-lotus-clay" />
              <span>Recent Articles & Drafts</span>
            </h2>
            <Link to="/admin/posts" className="text-xs text-lotus-clay hover:underline font-medium flex items-center">
              <span>View all</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats?.recentPosts && stats.recentPosts.length > 0 ? (
              stats.recentPosts.map((post: any) => (
                <div key={post._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 pr-4">
                    <Link
                      to={`/admin/posts/${post._id}/edit`}
                      className="text-xs font-semibold text-gray-900 hover:text-lotus-forest truncate block"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {post.status}
                      </span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/admin/posts/${post._id}/edit`}
                    className="px-3 py-1 rounded-lg border border-gray-200 text-xs text-gray-700 hover:bg-gray-100 flex-shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No recent posts found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Clicks Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-blue-600" />
              <span>Recent Outbound Clicks</span>
            </h2>
            <Link to="/admin/analytics" className="text-xs text-lotus-clay hover:underline font-medium flex items-center">
              <span>Analytics</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {stats?.recentClicks && stats.recentClicks.length > 0 ? (
              stats.recentClicks.map((click: any) => (
                <div key={click._id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium text-gray-800 truncate">
                      {click.productId?.title || `ASIN: ${click.asin}`}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                      ASIN: {click.asin}
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">
                    {new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No affiliate clicks recorded yet today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
