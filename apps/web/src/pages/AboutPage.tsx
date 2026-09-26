import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { GenericPage } from './GenericPage';

export const AboutPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.submitContact(formData);
      setStatus('success');
      setFeedback('Thank you for reaching out! Our team will get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setFeedback(err.response?.data?.message || 'Could not send message. Please try again.');
    }
  };

  return (
    <GenericPage forcedSlug="about" defaultTitle="About VietCraft">
      {/* Contact & Artisan Guild Form */}
      <section className="bg-white rounded-2xl p-8 border border-lotus-sand/40 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-lotus-sand/30 flex items-center justify-center text-lotus-forest">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-lotus-forest">Contact Our Team</h3>
            <p className="text-xs text-lotus-charcoal/60 mt-0.5">
              Inquiries regarding curated features, artisan partnerships, or customer assistance.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-lotus-sand/60 bg-lotus-ivory/30 text-sm focus:outline-none focus:ring-1 focus:ring-lotus-forest"
                placeholder="Mai Nguyen"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-md border border-lotus-sand/60 bg-lotus-ivory/30 text-sm focus:outline-none focus:ring-1 focus:ring-lotus-forest"
                placeholder="mai@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-lotus-sand/60 bg-lotus-ivory/30 text-sm focus:outline-none focus:ring-1 focus:ring-lotus-forest"
              placeholder="Product inquiry, artisan partnership, or general hello"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-lotus-charcoal/80 mb-1">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2 rounded-md border border-lotus-sand/60 bg-lotus-ivory/30 text-sm focus:outline-none focus:ring-1 focus:ring-lotus-forest"
              placeholder="Tell us what you have in mind..."
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-rose-50 text-rose-800 text-xs border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{feedback}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 px-6 rounded-md bg-lotus-forest hover:bg-lotus-forest/90 text-lotus-ivory font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>
    </GenericPage>
  );
};
