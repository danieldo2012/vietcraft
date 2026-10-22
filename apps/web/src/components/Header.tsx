import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { api } from '../services/api';
import { HeaderSettings } from '@vietcraft/shared';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();

  // Fetch live Header CMS configuration from backend API
  const { data: headerSettings } = useQuery<HeaderSettings>({
    queryKey: ['header-settings'],
    queryFn: api.getHeader
  });

  // Handle scroll shadow and blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-sm font-medium transition-colors duration-200 tracking-wide ${
      isActive
        ? 'text-lotus-forest font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-lotus-clay'
        : 'text-lotus-charcoal/80 hover:text-lotus-forest'
    }`;

  // Fallback defaults if loading initial query
  const logoText = headerSettings?.logoText || 'VietCraft';
  const logoAlt = headerSettings?.logoAlt || 'VietCraft Natural Decor';
  const logoUrl = headerSettings?.logoUrl || '/';
  const showLogo = headerSettings?.showLogo !== false;
  const isSticky = headerSettings?.stickyHeader !== false;

  // Active navigation items sorted by order
  const navItems = (headerSettings?.navigationItems || [
    { id: 'nav-home', label: 'Home', url: '/', type: 'link', order: 0, isActive: true, openInNewTab: false },
    { id: 'nav-discover', label: 'Discover', url: '/discover', type: 'link', order: 1, isActive: true, openInNewTab: false },
    { id: 'nav-products', label: 'Products', url: '/products', type: 'link', order: 2, isActive: true, openInNewTab: false },
    { id: 'nav-articles', label: 'Journal', url: '/articles', type: 'link', order: 3, isActive: true, openInNewTab: false },
    { id: 'nav-about', label: 'About Us', url: '/about', type: 'link', order: 4, isActive: true, openInNewTab: false }
  ])
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <header
        className={`z-40 w-full transition-all duration-300 ${
          isSticky ? 'sticky top-0' : 'relative'
        } ${
          isScrolled
            ? 'bg-lotus-ivory/95 backdrop-blur-md shadow-sm border-b border-lotus-sand/40 py-3'
            : 'bg-lotus-ivory border-b border-lotus-sand/30 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo (CMS Managed) */}
            {showLogo && (
              <Link to={logoUrl} className="flex items-center gap-2.5 group">
                {headerSettings?.logo ? (
                  <img
                    src={headerSettings.logo}
                    alt={logoAlt}
                    className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-lotus-forest flex items-center justify-center text-lotus-ivory transition-transform group-hover:scale-105 duration-300 shadow-sm">
                    {/* Stylized Lotus Petal */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                      <path d="M12 2C10.5 6 7 9 4 10c3 1 6.5 4 8 8 1.5-4 5-7 8-8-3-1-6.5-4-8-8z" />
                      <circle cx="12" cy="12" r="2" className="fill-lotus-sand" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-serif text-2xl font-bold tracking-tight text-lotus-forest group-hover:text-lotus-forest/80 transition-colors">
                    {logoText}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-lotus-clay font-medium -mt-1">
                    Natural Living
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Navigation (CMS Managed Tree) */}
            <nav className="hidden md:flex items-center space-x-7" aria-label="Main navigation">
              {navItems.map((item) => {
                // Every item (including Discover) is a plain link: Discover opens the page that lists the categories.
                return (
                  <NavLink
                    key={item.id}
                    to={item.url}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className={navLinkClass}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search Trigger Button (CMS Managed) */}
              {headerSettings?.searchSettings?.showSearch !== false && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search website"
                  className="flex items-center gap-2 p-2 rounded-full text-lotus-charcoal/80 hover:text-lotus-forest hover:bg-lotus-sand/30 transition-colors"
                  title="Search VietCraft"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden lg:inline text-xs text-lotus-charcoal/60 bg-lotus-sand/20 px-2.5 py-0.5 rounded border border-lotus-sand/40">
                    Search
                  </span>
                </button>
              )}

              {/* Header CTA Button (CMS Managed) */}
              {headerSettings?.headerCTA?.showCTA && headerSettings.headerCTA.label && (
                <Link
                  to={headerSettings.headerCTA.url || '/articles'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-lotus-forest text-lotus-ivory text-xs font-semibold rounded-full hover:bg-lotus-clay transition-colors shadow-xs"
                >
                  <span>{headerSettings.headerCTA.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              {headerSettings?.mobileMenu !== false && (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={isMobileMenuOpen}
                  className="md:hidden p-2 rounded-lg text-lotus-charcoal/80 hover:text-lotus-forest hover:bg-lotus-sand/30 transition-colors"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Consumes EXACT SAME CMS Data) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-lotus-sand/40 bg-lotus-ivory px-4 pt-3 pb-6 space-y-3 animate-fade-in">
            {navItems.map((item) => {
              return (
                <NavLink
                  key={item.id}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-lotus-charcoal hover:text-lotus-forest border-b border-lotus-sand/20"
                >
                  {item.label}
                </NavLink>
              );
            })}

            {headerSettings?.headerCTA?.showCTA && (
              <div className="pt-2">
                <Link
                  to={headerSettings.headerCTA.url || '/articles'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-lotus-forest text-lotus-ivory text-sm font-semibold rounded-lg hover:bg-lotus-clay transition-colors"
                >
                  <span>{headerSettings.headerCTA.label}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Unified Search Modal with CMS Placeholder */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        placeholder={headerSettings?.searchSettings?.searchPlaceholder}
      />
    </>
  );
};
