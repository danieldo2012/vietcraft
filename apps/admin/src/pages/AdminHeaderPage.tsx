import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';
import { HeaderSettings, NavigationItem } from '@vietcraft/shared';
import {
  Save,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Compass,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';

export const AdminHeaderPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HeaderSettings | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: headerSettings, isLoading } = useQuery({
    queryKey: ['admin-header-settings'],
    queryFn: adminApi.getHeaderSettings
  });

  const { data: materials } = useQuery({
    queryKey: ['admin-materials-for-header'],
    queryFn: adminApi.getMaterials
  });

  useEffect(() => {
    if (headerSettings) {
      setFormData(headerSettings);
    }
  }, [headerSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: HeaderSettings) => adminApi.updateHeaderSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-header-settings'] });
      setFeedback({ type: 'success', message: 'Header settings updated successfully! Changes are immediately live on the storefront.' });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update header settings.' });
    }
  });

  if (isLoading || !formData) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lotus-forest"></div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // Navigation Items Management
  const addNavItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      url: '/',
      type: 'link',
      order: formData.navigationItems.length,
      isActive: true,
      openInNewTab: false
    };
    setFormData({
      ...formData,
      navigationItems: [...formData.navigationItems, newItem]
    });
  };

  const updateNavItem = (index: number, fields: Partial<NavigationItem>) => {
    const updated = [...formData.navigationItems];
    updated[index] = { ...updated[index], ...fields };
    setFormData({ ...formData, navigationItems: updated });
  };

  const removeNavItem = (index: number) => {
    const updated = formData.navigationItems.filter((_, i) => i !== index);
    setFormData({ ...formData, navigationItems: updated });
  };

  const moveNavItem = (index: number, direction: 'up' | 'down') => {
    const updated = [...formData.navigationItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFormData({ ...formData, navigationItems: updated });
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-lotus-sand/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-lotus-forest">Header CMS</h1>
          <p className="text-sm text-lotus-charcoal/70 mt-1">
            Customize the storefront header, navigation bar, Discover menu, CTA, and search configuration without writing code.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Header Changes'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & Logo Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Brand Logo & Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Logo Display Text
              </label>
              <input
                type="text"
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="VietCraft"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Logo Alt Description
              </label>
              <input
                type="text"
                value={formData.logoAlt}
                onChange={(e) => setFormData({ ...formData, logoAlt: e.target.value })}
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="VietCraft Natural Decor"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Logo Destination URL
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="/"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showLogo}
                  onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                  className="rounded text-lotus-forest focus:ring-lotus-forest"
                />
                <span className="text-sm font-medium text-lotus-charcoal">Show Logo in Header</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Custom Logo Image (Optional - leaves stylized leaf if empty)
            </label>
            <ImageUploader
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
            />
          </div>
        </div>

        {/* Dynamic Navigation Menu Items */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Navigation Menu Links</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Manage top-level links visible on both desktop and mobile navigation drawers.
              </p>
            </div>
            <button
              type="button"
              onClick={addNavItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lotus-sand/30 text-lotus-forest rounded hover:bg-lotus-sand/50 transition-colors text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Navigation Link
            </button>
          </div>

          <div className="space-y-3">
            {formData.navigationItems.map((item, index) => (
              <div
                key={item.id || index}
                className="flex flex-col md:flex-row md:items-center gap-3 p-3.5 bg-lotus-ivory/50 rounded-md border border-lotus-sand/30"
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveNavItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-lotus-charcoal/50 hover:text-lotus-forest disabled:opacity-20"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveNavItem(index, 'down')}
                    disabled={index === formData.navigationItems.length - 1}
                    className="p-1 text-lotus-charcoal/50 hover:text-lotus-forest disabled:opacity-20"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateNavItem(index, { label: e.target.value })}
                    className="px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-sm focus:ring-1 focus:ring-lotus-forest outline-none"
                    placeholder="Link Label (e.g. Products or Shop)"
                  />
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => updateNavItem(index, { url: e.target.value })}
                    className="px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-sm focus:ring-1 focus:ring-lotus-forest outline-none"
                    placeholder="URL (e.g. /products)"
                  />
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateNavItem(index, { isActive: e.target.checked })}
                      className="rounded text-lotus-forest"
                    />
                    <span className="text-lotus-charcoal/80">Active</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.openInNewTab}
                      onChange={(e) => updateNavItem(index, { openInNewTab: e.target.checked })}
                      className="rounded text-lotus-forest"
                    />
                    <span className="text-lotus-charcoal/80">New Tab</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeNavItem(index)}
                    className="p-1 text-rose-500 hover:text-rose-700 transition-colors ml-auto"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discover Dropdown Configuration */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Discover Materials Dropdown</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Control the Discover mega-menu label, visibility, and which materials are highlighted.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.discoverMenu.showDiscover}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discoverMenu: { ...formData.discoverMenu, showDiscover: e.target.checked }
                  })
                }
                className="rounded text-lotus-forest"
              />
              <span className="text-sm font-semibold text-lotus-forest">Enable Discover Menu</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Discover Menu Button Label
              </label>
              <input
                type="text"
                value={formData.discoverMenu.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discoverMenu: { ...formData.discoverMenu, label: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="Discover"
              />
            </div>
          </div>
        </div>

        {/* Header CTA Button */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Header Call-to-Action (CTA)</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Manage the prominent action button displayed on the right of the desktop navigation bar.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.headerCTA.showCTA}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headerCTA: { ...formData.headerCTA, showCTA: e.target.checked }
                  })
                }
                className="rounded text-lotus-forest"
              />
              <span className="text-sm font-semibold text-lotus-forest">Show CTA Button</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.headerCTA.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headerCTA: { ...formData.headerCTA, label: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="Explore Journal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                CTA Button URL
              </label>
              <input
                type="text"
                value={formData.headerCTA.url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    headerCTA: { ...formData.headerCTA, url: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="/articles"
              />
            </div>
          </div>
        </div>

        {/* Search Modal Settings */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Search Modal & Placeholders</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Configure the search triggers, input placeholders, and empty states.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.searchSettings.showSearch}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    searchSettings: { ...formData.searchSettings, showSearch: e.target.checked }
                  })
                }
                className="rounded text-lotus-forest"
              />
              <span className="text-sm font-semibold text-lotus-forest">Enable Header Search</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Search Input Placeholder
              </label>
              <input
                type="text"
                value={formData.searchSettings.searchPlaceholder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    searchSettings: { ...formData.searchSettings, searchPlaceholder: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="Search handcrafted items, articles, materials..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Search Modal Title
              </label>
              <input
                type="text"
                value={formData.searchSettings.searchPageTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    searchSettings: { ...formData.searchSettings, searchPageTitle: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="Search VietCraft Collection"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Search Empty-State Message
              </label>
              <input
                type="text"
                value={formData.searchSettings.searchEmptyStateMessage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    searchSettings: { ...formData.searchSettings, searchEmptyStateMessage: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
                placeholder="No handcrafted results found matching your inquiry."
              />
            </div>
          </div>
        </div>

        {/* Layout & Sticky Toggles */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-4">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Header Layout Options
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.stickyHeader}
                onChange={(e) => setFormData({ ...formData, stickyHeader: e.target.checked })}
                className="rounded text-lotus-forest"
              />
              <span className="text-sm text-lotus-charcoal">Sticky Header (with blur effect on scroll)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.mobileMenu}
                onChange={(e) => setFormData({ ...formData, mobileMenu: e.target.checked })}
                className="rounded text-lotus-forest"
              />
              <span className="text-sm text-lotus-charcoal">Enable Mobile Drawer Menu</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium shadow-sm disabled:opacity-50 text-base"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save All Header Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
