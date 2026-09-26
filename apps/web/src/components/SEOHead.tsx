import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'VietCraft | Natural Home Decor Inspired by Vietnam',
  description = 'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnamese craftsmanship. Rattan, ceramics, lacquer, wood, and wild silk.',
  ogImage = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
  canonicalUrl,
  structuredData
}) => {
  useEffect(() => {
    // Dynamic Title
    document.title = title.includes('VietCraft') ? title : `${title} | VietCraft`;

    // Dynamic Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Dynamic Canonical
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    // JSON-LD Structured Data
    if (structuredData) {
      const scriptId = 'vietcraft-jsonld';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(structuredData);
    }
  }, [title, description, ogImage, canonicalUrl, structuredData]);

  return null;
};
