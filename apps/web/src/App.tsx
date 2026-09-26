import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MaterialDetailPage } from './pages/MaterialDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { AboutPage } from './pages/AboutPage';
import { SearchPage } from './pages/SearchPage';
import { AffiliateDisclosurePage } from './pages/AffiliateDisclosurePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { GenericPage } from './pages/GenericPage';

// Scroll to top automatically when location pathname changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

// Loads Google Analytics (gtag.js) using the Measurement ID saved in
// Admin CMS -> Settings -> Google Analytics ID. Does nothing if empty.
const GoogleAnalytics = () => {
  useEffect(() => {
    api
      .getSettings()
      .then((settings) => {
        const gaId = settings?.googleAnalyticsId?.trim();
        if (!gaId || document.getElementById('ga-gtag-script')) return;

        const loaderScript = document.createElement('script');
        loaderScript.id = 'ga-gtag-script';
        loaderScript.async = true;
        loaderScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(loaderScript);

        const inlineScript = document.createElement('script');
        inlineScript.id = 'ga-gtag-inline';
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `;
        document.head.appendChild(inlineScript);
      })
      .catch(() => {
        // Silently ignore - analytics should never break the site.
      });
  }, []);

  return null;
};

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-lotus-ivory text-lotus-charcoal">
      <ScrollToTop />
      <GoogleAnalytics />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/discover/:materialSlug" element={<MaterialDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosurePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/pages/:slug" element={<GenericPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
                <h1 className="font-serif text-4xl font-bold text-lotus-forest">Page Not Found</h1>
                <p className="text-sm text-lotus-charcoal/70">
                  The page you are looking for does not exist or has been relocated.
                </p>
                <a
                  href="/"
                  className="inline-block px-6 py-2.5 rounded-xl bg-lotus-forest text-white text-xs font-semibold uppercase tracking-wider"
                >
                  Return Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
