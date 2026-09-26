import crypto from 'crypto';
import { ENV } from '../config/env';
import { AFFILIATE_DISCLOSURE, AmazonScrapedProduct, ProductImage } from '@vietcraft/shared';
import { AffiliateClick } from '../models/AffiliateClick';

export interface AmazonProductData {
  asin: string;
  title?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  affiliateUrl: string;
  isLive: boolean;
}

export class AmazonProductService {
  private associateTag: string;

  constructor() {
    this.associateTag = ENV.AMAZON_ASSOCIATE_TAG || 'vietcraft-20';
  }

  /**
   * Validate ASIN format (10 alphanumeric characters)
   */
  public isValidAsin(asin: string): boolean {
    if (!asin) return false;
    const cleanAsin = asin.trim().toUpperCase();
    return /^[A-Z0-9]{10}$/.test(cleanAsin);
  }

  /**
   * Constructs compliant Amazon affiliate link with the configured Associate tag
   */
  public buildAffiliateUrl(asin: string, customTag?: string): string {
    const tag = customTag || this.associateTag;
    const cleanAsin = asin.trim().toUpperCase();
    return `https://www.amazon.com/dp/${cleanAsin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
  }

  /**
   * Validates if a given URL is a legitimate Amazon domain
   */
  public isAmazonUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      return (
        hostname === 'amazon.com' ||
        hostname.endsWith('.amazon.com') ||
        hostname === 'amzn.to' ||
        hostname.endsWith('.amzn.to') ||
        hostname === 'a.co' ||
        hostname.endsWith('.a.co')
      );
    } catch {
      return false;
    }
  }

  /**
   * Extracts ASIN from either a raw 10-char ASIN, an Amazon product URL, or shortlink
   */
  public async extractAsin(input: string): Promise<string | null> {
    if (!input) return null;
    const trimmed = input.trim();

    // 1. Raw ASIN
    if (this.isValidAsin(trimmed)) {
      return trimmed.toUpperCase();
    }

    // 2. Standard Amazon URL patterns: /dp/B0..., /gp/product/B0..., /d/B0...
    const directMatch = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/d\/)([A-Z0-9]{10})/i);
    if (directMatch && this.isValidAsin(directMatch[1])) {
      return directMatch[1].toUpperCase();
    }

    // 3. Fallback pattern for URL containing 10-char alphanumeric after slash
    const fallbackMatch = trimmed.match(/\/([A-Z0-9]{10})(?:[/?#]|$)/i);
    if (fallbackMatch && this.isValidAsin(fallbackMatch[1])) {
      return fallbackMatch[1].toUpperCase();
    }

    // 4. Resolve shortlinks (e.g. a.co/d/..., amzn.to/...)
    if (trimmed.includes('a.co') || trimmed.includes('amzn.to')) {
      try {
        const redirectUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const res = await fetch(redirectUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
          }
        });
        const finalUrl = res.url;
        const resolvedMatch = finalUrl.match(/(?:\/dp\/|\/gp\/product\/|\/d\/)([A-Z0-9]{10})/i);
        if (resolvedMatch && this.isValidAsin(resolvedMatch[1])) {
          return resolvedMatch[1].toUpperCase();
        }
      } catch (err) {
        console.error('[AmazonProductService] Error resolving shortlink:', err);
      }
    }

    return null;
  }

  /**
   * Helper to decode HTML entities
   */
  private decodeEntities(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
      .trim();
  }

  /**
   * Scrapes Amazon product page to extract title, price, images, description, and short description
   */
  public async scrapeProductByUrlOrAsin(input: string): Promise<AmazonScrapedProduct> {
    const asin = await this.extractAsin(input);
    if (!asin) {
      throw new Error('Invalid Amazon link or ASIN format. Please provide a valid product link or a 10-character ASIN.');
    }

    const productUrl = `https://www.amazon.com/dp/${asin}`;
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    ];

    let html = '';
    let responseStatus = 0;

    for (const ua of userAgents) {
      try {
        const res = await fetch(productUrl, {
          headers: {
            'User-Agent': ua,
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            Cookie: 'i18n-prefs=USD; lc-main=en_US;'
          }
        });

        responseStatus = res.status;
        if (res.ok) {
          const body = await res.text();
          if (!body.includes('validateCaptcha') && !body.includes('Type the characters you see in this image')) {
            html = body;
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[AmazonScraper] Attempt failed with ${ua.slice(0, 30)}: ${err.message}`);
      }
    }

    if (!html) {
      if (responseStatus === 404) {
        throw new Error(`Amazon product not found for ASIN ${asin}.`);
      }
      throw new Error(
        'Unable to fetch Amazon product page at this moment. Please check the link or try again in a few seconds.'
      );
    }

    // 1. Extract Title
    let title = '';
    const titleMatch = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i);
    if (titleMatch) {
      title = this.decodeEntities(titleMatch[1]);
    } else {
      const metaTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      if (metaTitleMatch) {
        title = this.decodeEntities(metaTitleMatch[1]);
      } else {
        const docTitleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (docTitleMatch) {
          title = this.decodeEntities(
            docTitleMatch[1].replace(/^Amazon\.com\s*:\s*/i, '').replace(/\s*:\s*.*$/, '')
          );
        }
      }
    }

    if (!title) {
      title = `Amazon Product ${asin}`;
    }

    // 2. Extract Price (USD)
    let price: number | null = null;
    const priceCandidates = [
      ...html.matchAll(
        /<span class=["'][^"']*apex-pricetopay-value[^"']*["'][\s\S]*?<span class=["']a-offscreen["']>([^<]+)<\/span>/gi
      ),
      ...html.matchAll(
        /<span class=["'][^"']*corePrice_desktop[^"']*["'][\s\S]*?<span class=["']a-offscreen["']>([^<]+)<\/span>/gi
      ),
      ...html.matchAll(/<span class=["']a-offscreen["']>([^<]+)<\/span>/g)
    ];

    for (const match of priceCandidates) {
      const rawText = match[1]?.trim() || '';
      if (rawText.includes('$')) {
        const cleanNumber = rawText.replace(/[^0-9.]/g, '');
        const val = parseFloat(cleanNumber);
        if (!isNaN(val) && val > 0 && val < 50000) {
          price = val;
          break;
        }
      }
    }

    // Fallback: price whole and fraction
    if (!price) {
      const wholeMatch = html.match(/class=["']a-price-whole["']>([0-9,]+)/i);
      const fracMatch = html.match(/class=["']a-price-fraction["']>([0-9]+)/i);
      if (wholeMatch) {
        const wholeVal = wholeMatch[1].replace(/,/g, '');
        const fracVal = fracMatch ? fracMatch[1] : '00';
        const combined = parseFloat(`${wholeVal}.${fracVal}`);
        if (!isNaN(combined) && combined > 0) {
          price = combined;
        }
      }
    }

    // 3. Extract Images
    const imageUrls: string[] = [];

    // Primary image from landingImage
    const landingMatch = html.match(/id=["']landingImage["'][^>]*src=["'](https:\/\/m\.media-amazon\.com\/images\/I\/[^"']+)["']/i);
    if (landingMatch) {
      const highResLanding = landingMatch[1].replace(/\._[A-Z0-9_]+_\./i, '._AC_SL1500_.');
      imageUrls.push(highResLanding);
    }

    // Gallery images from altImages
    const altBlockMatch = html.match(/<div id=["']altImages["'][\s\S]*?<\/div>\s*<\/div>/i);
    if (altBlockMatch) {
      const altMatches = [...altBlockMatch[0].matchAll(/src=["'](https:\/\/m\.media-amazon\.com\/images\/I\/[^"']+)["']/g)];
      for (const m of altMatches) {
        const rawUrl = m[1];
        if (!rawUrl.includes('play-button') && !rawUrl.includes('transparent-pixel')) {
          const highRes = rawUrl.replace(/\._[A-Z0-9_]+_\./i, '._AC_SL1500_.');
          if (!imageUrls.includes(highRes)) {
            imageUrls.push(highRes);
          }
        }
      }
    }

    // Fallback dynamic images
    if (imageUrls.length === 0) {
      const dynImgMatch = html.match(/data-a-dynamic-image=["'](\{.*?\})["']/i);
      if (dynImgMatch) {
        try {
          const decoded = dynImgMatch[1].replace(/&quot;/g, '"');
          const dynMap = JSON.parse(decoded);
          for (const key of Object.keys(dynMap)) {
            const highRes = key.replace(/\._[A-Z0-9_]+_\./i, '._AC_SL1500_.');
            if (!imageUrls.includes(highRes)) {
              imageUrls.push(highRes);
            }
          }
        } catch {}
      }
    }

    const images: ProductImage[] = imageUrls.slice(0, 8).map((url, index) => ({
      url,
      alt: index === 0 ? title : `${title} - detail view ${index + 1}`,
      isPrimary: index === 0
    }));

    // 4. Extract Bullets
    const rawBullets: string[] = [];
    const bulletsBlockMatch = html.match(/<div id=["']feature-bullets["'][\s\S]*?<\/ul>/i);
    if (bulletsBlockMatch) {
      const itemMatches = [...bulletsBlockMatch[0].matchAll(/<span class=["']a-list-item["']>([\s\S]*?)<\/span>/gi)];
      for (const m of itemMatches) {
        const clean = this.decodeEntities(m[1].replace(/<[^>]+>/g, ''));
        if (
          clean.length > 15 &&
          !clean.includes('Make sure this fits') &&
          !clean.includes('Amazon.com') &&
          !clean.includes('cookie')
        ) {
          rawBullets.push(clean);
        }
      }
    }

    // 5. Extract Full Description
    let productDescription = '';
    const descMatch = html.match(/<div id=["']productDescription["'][\s\S]*?<p>([\s\S]*?)<\/p>/i);
    if (descMatch) {
      productDescription = this.decodeEntities(descMatch[1].replace(/<[^>]+>/g, ''));
    }

    let fullDescription = '';
    if (productDescription && rawBullets.length > 0) {
      fullDescription = `${productDescription}\n\nKey Craft & Design Highlights:\n${rawBullets
        .map((b) => `• ${b}`)
        .join('\n')}`;
    } else if (rawBullets.length > 0) {
      fullDescription = rawBullets.join('\n\n');
    } else if (productDescription) {
      fullDescription = productDescription;
    } else {
      fullDescription = `Curated natural design piece discovered on Amazon. Features authentic artisanal craftsmanship and durable organic materials.`;
    }

    // 6. Short Description
    let shortDescription = '';
    if (rawBullets.length > 0) {
      const firstBullet = rawBullets[0];
      shortDescription = firstBullet.length > 200 ? `${firstBullet.slice(0, 197)}...` : firstBullet;
    } else if (productDescription) {
      shortDescription =
        productDescription.length > 200 ? `${productDescription.slice(0, 197)}...` : productDescription;
    } else {
      shortDescription = `Artisan handmade discovery imported with verified natural craft heritage.`;
    }

    // 7. Dimensions if found
    let dimensions = undefined;
    const dimMatch = html.match(/([0-9.]+)\s*["xX*]\s*([0-9.]+)\s*["xX*]\s*([0-9.]+)\s*(inches|in|cm)/i);
    if (dimMatch) {
      dimensions = {
        depth: parseFloat(dimMatch[1]),
        width: parseFloat(dimMatch[2]),
        height: parseFloat(dimMatch[3]),
        unit: dimMatch[4].toLowerCase().startsWith('in') ? 'in' : 'cm'
      };
    }

    return {
      asin,
      title,
      price,
      currency: 'USD',
      description: fullDescription,
      shortDescription,
      images,
      affiliateUrl: this.buildAffiliateUrl(asin),
      priceSource: 'direct_import',
      rawBullets,
      dimensions
    };
  }

  /**
   * Anonymizes user IP for privacy-friendly analytics
   */
  public hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip + (ENV.JWT_SECRET || 'salt')).digest('hex');
  }

  /**
   * Records an affiliate click event
   */
  public async trackClick(params: {
    productId: string;
    asin: string;
    ip: string;
    userAgent?: string;
    referrer?: string;
  }): Promise<void> {
    try {
      const ipHash = this.hashIp(params.ip);
      await AffiliateClick.create({
        productId: params.productId,
        asin: params.asin,
        ipHash,
        userAgent: params.userAgent || '',
        referrer: params.referrer || '',
        timestamp: new Date()
      });
    } catch (error) {
      // Non-blocking error logging
      console.error('[AffiliateTracker] Failed to record click:', error);
    }
  }

  /**
   * Returns FTC & Amazon compliant disclosures
   */
  public getDisclosures() {
    return AFFILIATE_DISCLOSURE;
  }

  /**
   * Placeholder for future approved Amazon Product Advertising API (PA-API 5.0) integration.
   * Strictly returns isLive: false unless verified official PA-API credentials are configured.
   */
  public async fetchProductDetails(asin: string): Promise<AmazonProductData | null> {
    if (!this.isValidAsin(asin)) {
      throw new Error(`Invalid ASIN: ${asin}`);
    }

    const hasApiCredentials = !!(ENV.AMAZON_API_KEY && ENV.AMAZON_API_SECRET);

    if (!hasApiCredentials) {
      // Return structured data indicating API is in manual/curated mode
      return {
        asin: asin.toUpperCase(),
        affiliateUrl: this.buildAffiliateUrl(asin),
        isLive: false
      };
    }

    // When official PA-API credentials are provided in production, call official Amazon SDK here
    return {
      asin: asin.toUpperCase(),
      affiliateUrl: this.buildAffiliateUrl(asin),
      isLive: true
    };
  }
}

export const amazonProductService = new AmazonProductService();

