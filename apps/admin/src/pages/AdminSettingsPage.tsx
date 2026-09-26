import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Globe, Mail, Share2, BarChart2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { SiteSettings } from '@vietcraft/shared';
import { ImageUploader } from '../components/ImageUploader';

export const AdminSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: initialSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminApi.getSettings
  });

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'seo' | 'legal' | 'analytics'>('brand');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings({ ...initialSettings });
    }
  }, [initialSettings]);

  const saveMutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      setFeedback({ type: 'success', text: 'Site settings updated successfully! Storefront settings are live.' });
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to update settings.' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    saveMutation.mutate(settings);
  };

  if (isLoading || !settings) {
    return (
      <div className="py-24 text-center text-xs text-lotus-charcoal/60">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-lotus-forest" />
        Loading site settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-lotus-sand/30 pb-5">
        <div>
          <h1 className="font-serif text-3xl font-bold text-lotus-forest">Site Settings & Configuration</h1>
          <p className="text-xs text-lotus-charcoal/70 mt-1">
            Configure global brand identity, contact info, default SEO, legal disclosures, and analytics scripts.
          </p>
        </div>
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 rounded-md bg-lotus-forest text-lotus-ivory text-sm font-semibold hover:bg-lotus-forest/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Settings</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md flex items-center gap-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-lotus-sand/30 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-md transition-colors ${
            activeTab === 'brand'
              ? 'bg-white border-t-2 border-lotus-forest text-lotus-forest shadow-xs'
              : 'text-lotus-charcoal/60 hover:text-lotus-forest'
          }`}
        >
          Brand & Identity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-md transition-colors ${
            activeTab === 'contact'
              ? 'bg-white border-t-2 border-lotus-forest text-lotus-forest shadow-xs'
              : 'text-lotus-charcoal/60 hover:text-lotus-forest'
          }`}
        >
          Contact & Location
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-md transition-colors ${
            activeTab === 'seo'
              ? 'bg-white border-t-2 border-lotus-forest text-lotus-forest shadow-xs'
              : 'text-lotus-charcoal/60 hover:text-lotus-forest'
          }`}
        >
          Default SEO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-md transition-colors ${
            activeTab === 'legal'
              ? 'bg-white border-t-2 border-lotus-forest text-lotus-forest shadow-xs'
              : 'text-lotus-charcoal/60 hover:text-lotus-forest'
          }`}
        >
          Legal & FTC
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-t-md transition-colors ${
            activeTab === 'analytics'
              ? 'bg-white border-t-2 border-lotus-forest text-lotus-forest shadow-xs'
              : 'text-lotus-charcoal/60 hover:text-lotus-forest'
          }`}
        >
          Analytics & Tracking
        </button>
      </div>

      {/* Brand Tab */}
      {activeTab === 'brand' && (
        <div className="bg-white p-6 rounded-lg border border-lotus-sand/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Website Name
              </label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Brand Description / Story
              </label>
              <textarea
                rows={3}
                required
                value={settings.brandDescription}
                onChange={(e) => setSettings({ ...settings, brandDescription: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Site Logo
              </label>
              <ImageUploader
                value={settings.logo || ''}
                onChange={(url) => setSettings({ ...settings, logo: url })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Favicon Image
              </label>
              <ImageUploader
                value={settings.favicon || ''}
                onChange={(url) => setSettings({ ...settings, favicon: url })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 rounded-lg border border-lotus-sand/40 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Contact Email Address
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Customer Care Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone || ''}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Physical / Guild Location
              </label>
              <input
                type="text"
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Default SEO Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white p-6 rounded-lg border border-lotus-sand/40 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Default Meta Title
              </label>
              <input
                type="text"
                required
                value={settings.defaultTitle || ''}
                onChange={(e) => setSettings({ ...settings, defaultTitle: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                required
                value={settings.defaultMetaDescription || ''}
                onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                  Twitter / X Handle
                </label>
                <input
                  type="text"
                  value={settings.twitterHandle || ''}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                  placeholder="@vietcraft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                  Default Open Graph (OG) Share Image
                </label>
                <ImageUploader
                  value={settings.defaultOGImage || ''}
                  onChange={(url) => setSettings({ ...settings, defaultOGImage: url })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal & FTC Tab */}
      {activeTab === 'legal' && (
        <div className="bg-white p-6 rounded-lg border border-lotus-sand/40 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-lotus-sand/30 pb-3">
            <ShieldCheck className="w-5 h-5 text-lotus-clay" />
            <h2 className="font-serif text-lg font-bold text-lotus-forest">
              Amazon Associates & FTC Disclosure
            </h2>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Full Affiliate Disclosure Notice
            </label>
            <textarea
              rows={6}
              required
              value={settings.affiliateDisclosure}
              onChange={(e) => setSettings({ ...settings, affiliateDisclosure: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-lg border border-lotus-sand/40 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-lotus-sand/30 pb-3">
            <BarChart2 className="w-5 h-5 text-lotus-forest" />
            <h2 className="font-serif text-lg font-bold text-lotus-forest">
              Third-Party Analytics & Tracking Scripts
            </h2>
          </div>
          <p className="text-xs text-lotus-charcoal/70">
            Tracking tags are only injected on the live public storefront when a valid ID is provided.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm font-mono"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Meta (Facebook) Pixel ID
              </label>
              <input
                type="text"
                value={settings.metaPixelId || ''}
                onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                className="w-full px-3.5 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm font-mono"
                placeholder="123456789012345"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium text-base shadow-sm disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </form>
  );
};
