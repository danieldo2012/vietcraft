import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi';
import { FooterSettings, FooterColumn, FooterLink, SocialLink } from '@vietcraft/shared';
import {
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminFooterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FooterSettings | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: footerSettings, isLoading } = useQuery({
    queryKey: ['admin-footer-settings'],
    queryFn: adminApi.getFooterSettings
  });

  useEffect(() => {
    if (footerSettings) {
      setFormData(footerSettings);
    }
  }, [footerSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: FooterSettings) => adminApi.updateFooterSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-footer-settings'] });
      setFeedback({ type: 'success', message: 'Footer settings updated successfully! Storefront footer is updated.' });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: any) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to update footer settings.' });
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

  // Column management
  const addColumn = () => {
    const newCol: FooterColumn = {
      id: `col-${Date.now()}`,
      title: 'New Column',
      order: formData.columns.length,
      links: []
    };
    setFormData({ ...formData, columns: [...formData.columns, newCol] });
  };

  const removeColumn = (colIndex: number) => {
    const updated = formData.columns.filter((_, idx) => idx !== colIndex);
    setFormData({ ...formData, columns: updated });
  };

  const updateColumnTitle = (colIndex: number, title: string) => {
    const updated = [...formData.columns];
    updated[colIndex] = { ...updated[colIndex], title };
    setFormData({ ...formData, columns: updated });
  };

  const addLinkToColumn = (colIndex: number) => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      label: 'New Link',
      url: '/',
      openInNewTab: false,
      isActive: true,
      order: formData.columns[colIndex].links.length
    };
    const updated = [...formData.columns];
    updated[colIndex].links = [...updated[colIndex].links, newLink];
    setFormData({ ...formData, columns: updated });
  };

  const updateLink = (colIndex: number, linkIndex: number, fields: Partial<FooterLink>) => {
    const updated = [...formData.columns];
    updated[colIndex].links[linkIndex] = { ...updated[colIndex].links[linkIndex], ...fields };
    setFormData({ ...formData, columns: updated });
  };

  const removeLink = (colIndex: number, linkIndex: number) => {
    const updated = [...formData.columns];
    updated[colIndex].links = updated[colIndex].links.filter((_, idx) => idx !== linkIndex);
    setFormData({ ...formData, columns: updated });
  };

  // Social links management
  const addSocialLink = () => {
    const newSocial: SocialLink = {
      platform: 'Instagram',
      label: 'VietCraft Instagram',
      url: 'https://instagram.com',
      isActive: true,
      order: formData.socialLinks.length
    };
    setFormData({ ...formData, socialLinks: [...formData.socialLinks, newSocial] });
  };

  const updateSocialLink = (index: number, fields: Partial<SocialLink>) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], ...fields };
    setFormData({ ...formData, socialLinks: updated });
  };

  const removeSocialLink = (index: number) => {
    const updated = formData.socialLinks.filter((_, idx) => idx !== index);
    setFormData({ ...formData, socialLinks: updated });
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-lotus-sand/30 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-lotus-forest">Footer CMS</h1>
          <p className="text-sm text-lotus-charcoal/70 mt-1">
            Manage footer brand biography, multi-column navigation, social profiles, contact details, and copyright.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Footer Changes'}
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
        {/* Brand Description Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-4">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Brand Bio & Description
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Footer Description Paragraph
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              placeholder="Discover natural beauty, thoughtful living..."
            />
          </div>
        </div>

        {/* Dynamic Footer Columns & Links */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Footer Navigation Columns</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Create and organize multi-column links (e.g. Explore, Materials, About & Legal).
              </p>
            </div>
            <button
              type="button"
              onClick={addColumn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lotus-sand/30 text-lotus-forest rounded hover:bg-lotus-sand/50 transition-colors text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Column
            </button>
          </div>

          <div className="space-y-6">
            {formData.columns.map((column, colIdx) => (
              <div
                key={column.id || colIdx}
                className="p-5 bg-lotus-ivory/40 rounded-lg border border-lotus-sand/40 space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-[11px] font-semibold uppercase text-lotus-charcoal/60 mb-1">
                      Column Title
                    </label>
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-sm font-semibold text-lotus-forest"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addLinkToColumn(colIdx)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-lotus-sand/60 text-lotus-forest rounded text-xs hover:bg-lotus-sand/20"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                    <button
                      type="button"
                      onClick={() => removeColumn(colIdx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 transition-colors"
                      title="Delete Column"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {column.links.map((link, linkIdx) => (
                    <div
                      key={link.id || linkIdx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-white rounded border border-lotus-sand/30"
                    >
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(colIdx, linkIdx, { label: e.target.value })}
                        className="flex-1 px-2.5 py-1 border border-lotus-sand/50 rounded text-xs"
                        placeholder="Link Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(colIdx, linkIdx, { url: e.target.value })}
                        className="flex-1 px-2.5 py-1 border border-lotus-sand/50 rounded text-xs"
                        placeholder="URL (e.g. /products)"
                      />
                      <div className="flex items-center gap-3 text-xs pl-2">
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.isActive}
                            onChange={(e) => updateLink(colIdx, linkIdx, { isActive: e.target.checked })}
                            className="rounded text-lotus-forest text-xs"
                          />
                          <span>Active</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.openInNewTab}
                            onChange={(e) => updateLink(colIdx, linkIdx, { openInNewTab: e.target.checked })}
                            className="rounded text-lotus-forest text-xs"
                          />
                          <span>New Tab</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeLink(colIdx, linkIdx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links Management */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <div className="flex items-center justify-between border-b border-lotus-sand/30 pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-lotus-forest">Social Media Channels</h2>
              <p className="text-xs text-lotus-charcoal/60 mt-0.5">
                Configure profiles for Instagram, Pinterest, Facebook, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lotus-sand/30 text-lotus-forest rounded hover:bg-lotus-sand/50 transition-colors text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Social Profile
            </button>
          </div>

          <div className="space-y-3">
            {formData.socialLinks.map((social, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-lotus-ivory/50 rounded-md border border-lotus-sand/30"
              >
                <input
                  type="text"
                  value={social.platform}
                  onChange={(e) => updateSocialLink(idx, { platform: e.target.value })}
                  className="w-32 px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-xs font-medium"
                  placeholder="Platform"
                />
                <input
                  type="text"
                  value={social.label}
                  onChange={(e) => updateSocialLink(idx, { label: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-xs"
                  placeholder="Aria Label (e.g. VietCraft Instagram)"
                />
                <input
                  type="text"
                  value={social.url}
                  onChange={(e) => updateSocialLink(idx, { url: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-white border border-lotus-sand/60 rounded text-xs"
                  placeholder="URL (https://...)"
                />
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={social.isActive}
                      onChange={(e) => updateSocialLink(idx, { isActive: e.target.checked })}
                      className="rounded text-lotus-forest"
                    />
                    <span>Active</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactInformation.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInformation: { ...formData.contactInformation, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactInformation.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInformation: { ...formData.contactInformation, phone: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Guild / Physical Address
              </label>
              <input
                type="text"
                value={formData.contactInformation.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInformation: { ...formData.contactInformation, address: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Business Hours
              </label>
              <input
                type="text"
                value={formData.contactInformation.businessHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactInformation: { ...formData.contactInformation, businessHours: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Newsletter Copy Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-6">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Footer Newsletter Section
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Newsletter Title
              </label>
              <input
                type="text"
                value={formData.newsletter.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newsletter: { ...formData.newsletter, title: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Button Text
              </label>
              <input
                type="text"
                value={formData.newsletter.buttonLabel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newsletter: { ...formData.newsletter, buttonLabel: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Newsletter Description
              </label>
              <input
                type="text"
                value={formData.newsletter.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newsletter: { ...formData.newsletter, description: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Success Message
              </label>
              <input
                type="text"
                value={formData.newsletter.successMessage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newsletter: { ...formData.newsletter, successMessage: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
                Privacy / Reassurance Note
              </label>
              <input
                type="text"
                value={formData.newsletter.privacyText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newsletter: { ...formData.newsletter, privacyText: e.target.value }
                  })
                }
                className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-lotus-sand/40 space-y-4">
          <h2 className="text-lg font-serif font-bold text-lotus-forest border-b border-lotus-sand/30 pb-3">
            Copyright Notice
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-2">
              Copyright Line (Displayed at the very bottom)
            </label>
            <input
              type="text"
              value={formData.copyright.copyrightText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  copyright: { copyrightText: e.target.value }
                })
              }
              className="w-full px-3 py-2 border border-lotus-sand/60 rounded-md focus:ring-1 focus:ring-lotus-forest outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-lotus-forest text-lotus-ivory rounded-md hover:bg-lotus-forest/90 transition-colors font-medium shadow-sm disabled:opacity-50 text-base"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? 'Saving...' : 'Save All Footer Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
