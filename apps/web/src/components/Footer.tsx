import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Instagram,
  Facebook,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { FooterSettings } from '@vietcraft/shared';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch dynamic Footer CMS configuration from backend API
  const { data: footerSettings } = useQuery<FooterSettings>({
    queryKey: ['footer-settings'],
    queryFn: api.getFooter
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      await api.subscribeNewsletter(email, 'footer');
      setStatus('success');
      setFeedbackMessage(
        footerSettings?.newsletter?.successMessage || 'Thank you for joining our slow living community!'
      );
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setFeedbackMessage(
        err.response?.data?.message ||
          footerSettings?.newsletter?.errorMessage ||
          'Subscription failed. Please try again.'
      );
    }
  };

  const renderSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
    return <Sparkles className="w-4 h-4" />;
  };

  // Fallback data
  const description =
    footerSettings?.description ||
    'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam. We curate authentic artisanal craftsmanship—rattan, ceramics, lacquer, and wild silk—for mindful living spaces across the United States.';

  const columns = footerSettings?.columns || [];
  const socialLinks = (footerSettings?.socialLinks || []).filter((s) => s.isActive);
  const contact = footerSettings?.contactInformation;
  const newsletter = footerSettings?.newsletter;
  const copyrightText =
    footerSettings?.copyright?.copyrightText ||
    `© ${new Date().getFullYear()} VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.`;

  return (
    <footer className="bg-lotus-forest text-lotus-ivory pt-16 pb-12 border-t border-lotus-sand/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Brand & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-14 border-b border-lotus-ivory/10">
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-lotus-sand flex items-center justify-center text-lotus-forest">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2C10.5 6 7 9 4 10c3 1 6.5 4 8 8 1.5-4 5-7 8-8-3-1-6.5-4-8-8z" />
                </svg>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-lotus-ivory">
                VietCraft
              </span>
            </div>
            <p className="text-sm text-lotus-ivory/80 leading-relaxed max-w-md">
              {description}
            </p>

            {/* Social Links (CMS Managed) */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-3 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label || social.platform}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lotus-ivory hover:bg-lotus-clay hover:text-white transition-colors"
                  >
                    {renderSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}

            {/* Contact Details (CMS Managed) */}
            {contact && (contact.email || contact.phone || contact.address) && (
              <div className="pt-3 text-xs text-lotus-ivory/70 space-y-1.5">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-lotus-sand" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-lotus-sand" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-lotus-sand" />
                    <span>{contact.address}</span>
                  </div>
                )}
                {contact.businessHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-lotus-sand" />
                    <span>{contact.businessHours}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Newsletter Box (CMS Managed) */}
          <div className="lg:col-span-7 bg-lotus-forest-dark/70 rounded-2xl p-6 sm:p-8 border border-lotus-sand/20">
            <h3 className="font-serif text-2xl font-medium text-lotus-sand mb-2">
              {newsletter?.title || 'Join Our Slow Living Community'}
            </h3>
            <p className="text-xs sm:text-sm text-lotus-ivory/70 mb-5 leading-relaxed">
              {newsletter?.description ||
                'Weekly curated essays on ancient craft villages, slow interiors, and intentional living.'}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={newsletter?.placeholder || 'Enter your email address...'}
                  disabled={status === 'loading'}
                  className="flex-grow px-4 py-3 rounded-xl bg-white/10 border border-lotus-sand/30 text-white placeholder-white/40 text-sm focus:outline-none focus:border-lotus-sand"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 rounded-xl bg-lotus-clay hover:bg-lotus-clay-light text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>{status === 'loading' ? 'Subscribing...' : (newsletter?.buttonLabel || 'Subscribe')}</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-xs text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
              <p className="text-[11px] text-lotus-ivory/50">
                {newsletter?.privacyText || 'Zero spam. Unsubscribe anytime.'}
              </p>
            </form>
          </div>
        </div>

        {/* Middle Section: Navigation Columns (CMS Managed) */}
        {columns.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-lotus-ivory/10 text-sm">
            {columns.map((column) => (
              <div key={column.id}>
                <h4 className="font-serif text-base font-semibold text-lotus-sand uppercase tracking-wider mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links
                    .filter((l) => l.isActive)
                    .map((link) => (
                      <li key={link.id}>
                        <Link
                          to={link.url}
                          target={link.openInNewTab ? '_blank' : undefined}
                          rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                          className="text-lotus-ivory/70 hover:text-lotus-sand transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Section: FTC Amazon Associates Compliance & Copyright (CMS Managed) */}
        <div className="pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-lotus-forest-dark/40 border border-lotus-sand/15 text-xs text-lotus-ivory/70 leading-relaxed">
            <p className="font-medium text-lotus-sand mb-1">Amazon Associates Disclaimer</p>
            <p>
              VietCraft is a participant in the Amazon Services LLC Associates Program, an affiliate advertising
              program designed to provide a means for sites to earn advertising fees by advertising and linking to
              Amazon.com. As an Amazon Associate, we earn from qualifying purchases at zero additional cost to you.
              Prices and availability are accurate as of the display timestamp and subject to change. Any price and
              availability displayed on Amazon at the time of purchase will apply.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-lotus-ivory/50 pt-2">
            <p>{copyrightText}</p>
            <p className="mt-2 sm:mt-0">Natural materials, timeless design & sustainable living.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
