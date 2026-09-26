import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { ENV } from '../config/env';
import {
  User,
  Material,
  Category,
  SiteSettings,
  HeaderSettings,
  FooterSettings,
  Page,
  Homepage
} from '../models';
import { MATERIALS, CATEGORIES, AFFILIATE_DISCLOSURE, SITE_DEFAULTS } from '@vietcraft/shared';

/**
 * Idempotent Production Bootstrap
 * - NEVER drops collections (no deleteMany)
 * - Only seeds records if they do not already exist
 * - Ensures admin user exists using production environment variables
 * - Fails if default weak passwords are used in production mode
 */
export const seedProduction = async () => {
  try {
    console.log('\n======================================================');
    console.log('🛡️  VIETCRAFT PRODUCTION DATABASE BOOTSTRAP (SAFE & IDEMPOTENT)');
    console.log('======================================================\n');

    if (ENV.NODE_ENV === 'production') {
      if (
        !ENV.INITIAL_ADMIN_PASSWORD ||
        ENV.INITIAL_ADMIN_PASSWORD === 'AdminSecurePassword123!' ||
        ENV.INITIAL_ADMIN_PASSWORD.length < 8
      ) {
        throw new Error(
          'Security check failed: In production, INITIAL_ADMIN_PASSWORD must be a strong custom password set via environment variables.'
        );
      }
    }

    await connectDB();

    // 1. Ensure Admin User
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      console.log(`👤 No admin user found. Creating initial production admin (${ENV.INITIAL_ADMIN_EMAIL})...`);
      const newAdmin = await User.create({
        name: ENV.INITIAL_ADMIN_NAME,
        email: ENV.INITIAL_ADMIN_EMAIL.toLowerCase(),
        password: ENV.INITIAL_ADMIN_PASSWORD,
        role: 'admin',
        avatar: ''
      });
      console.log(`✅ Admin user initialized: ${newAdmin.email}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${existingAdmin.email} (Skipped creation)`);
    }

    // 2. Ensure Foundational Categories
    let categoriesCreated = 0;
    for (const [idx, cat] of CATEGORIES.entries()) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (!exists) {
        await Category.create({
          ...cat,
          displayOrder: idx,
          isActive: true
        });
        categoriesCreated++;
      }
    }
    console.log(`🏷️  Categories: ${categoriesCreated} initialized (${CATEGORIES.length - categoriesCreated} already present)`);

    // 3. Ensure Foundational Materials
    let materialsCreated = 0;
    for (const [idx, mat] of MATERIALS.entries()) {
      const exists = await Material.findOne({ slug: mat.slug });
      if (!exists) {
        await Material.create({
          ...mat,
          coverImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1000&q=80',
          displayOrder: idx,
          isActive: true,
          seo: {
            title: `${mat.name} Home Decor & Craft Heritage | VietCraft`,
            description: mat.shortDescription,
            keywords: [mat.name.toLowerCase(), 'vietnamese craftsmanship', 'sustainable home decor']
          }
        });
        materialsCreated++;
      }
    }
    console.log(`🌿 Materials: ${materialsCreated} initialized (${MATERIALS.length - materialsCreated} already present)`);

    // 4. Ensure Site Settings
    const existingSiteSettings = await SiteSettings.findOne({});
    if (!existingSiteSettings) {
      console.log('⚙️  Creating default SiteSettings...');
      await SiteSettings.create({
        siteName: 'VietCraft',
        tagline: 'Natural Living & Vietnamese Craftsmanship',
        brandDescription: SITE_DEFAULTS.brandDescription,
        contactEmail: SITE_DEFAULTS.contactEmail,
        affiliateDisclosure: AFFILIATE_DISCLOSURE.full,
        defaultTitle: 'VietCraft | Natural Home Decor & Vietnamese Craftsmanship',
        defaultMetaDescription: SITE_DEFAULTS.brandDescription
      });
      console.log('✅ SiteSettings initialized');
    } else {
      console.log('ℹ️  SiteSettings already present (Skipped)');
    }

    // 5. Ensure Header Settings
    const existingHeader = await HeaderSettings.findOne({});
    if (!existingHeader) {
      console.log('🧭 Creating default HeaderSettings...');
      await HeaderSettings.create({
        logoText: 'VietCraft',
        logoAlt: 'VietCraft Natural Decor',
        logoUrl: '/',
        showLogo: true,
        navigationItems: [
          { id: 'nav-home', label: 'Home', url: '/', type: 'link', order: 0, isActive: true },
          { id: 'nav-discover', label: 'Discover', url: '/discover', type: 'dropdown', order: 1, isActive: true },
          { id: 'nav-products', label: 'Products', url: '/products', type: 'link', order: 2, isActive: true },
          { id: 'nav-articles', label: 'Journal', url: '/articles', type: 'link', order: 3, isActive: true },
          { id: 'nav-about', label: 'About Us', url: '/about', type: 'link', order: 4, isActive: true }
        ]
      });
      console.log('✅ HeaderSettings initialized');
    } else {
      console.log('ℹ️  HeaderSettings already present (Skipped)');
    }

    // 6. Ensure Footer Settings
    const existingFooter = await FooterSettings.findOne({});
    if (!existingFooter) {
      console.log('🦶 Creating default FooterSettings...');
      await FooterSettings.create({
        description: SITE_DEFAULTS.brandDescription,
        copyright: {
          copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`
        }
      });
      console.log('✅ FooterSettings initialized');
    } else {
      console.log('ℹ️  FooterSettings already present (Skipped)');
    }

    // 7. Ensure Homepage Configuration
    const existingHomepage = await Homepage.findOne({});
    if (!existingHomepage) {
      console.log('🏠 Creating default Homepage configuration...');
      await Homepage.create({
        heroSlides: [
          {
            title: 'Naturally Thoughtful Living',
            subtitle: 'Timeless home decor handcrafted from Vietnamese rattan, ceramics, lacquer, and wild silk.',
            buttonText: 'Explore Collections',
            buttonUrl: '/discover',
            image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
            displayOrder: 0
          }
        ],
        materialSection: {
          headline: 'Discover by Material',
          subheadline: 'Each raw fiber and natural medium holds generations of sustainable cultural heritage.'
        },
        aboutSection: {
          title: 'About VietCraft',
          body: 'VietCraft connects mindful homeowners with Vietnam ancestral craft villages.',
          quote: 'True luxury is quiet, patient, and intimately connected with the hands that created it.',
          quoteAuthor: 'Mai Nguyen, Founder & Creative Director',
          image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
          buttonText: 'Discover Our Story',
          buttonUrl: '/about'
        },
        newsletterSection: {
          headline: 'Slow Living, Delivered to Your Inbox',
          subheadline: 'Join mindful homeowners receiving our monthly craft journals.',
          buttonText: 'Subscribe'
        },
        footerSection: {
          brandBio: 'VietCraft is a natural home decor blog and Amazon affiliate discovery platform.',
          contactEmail: SITE_DEFAULTS.contactEmail,
          copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`
        },
        sectionOrder: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter'],
        isPublished: true
      });
      console.log('✅ Homepage configuration initialized');
    } else {
      console.log('ℹ️  Homepage configuration already present (Skipped)');
    }

    console.log('\n✨ Production database bootstrap completed successfully! ✨\n');
  } catch (error) {
    console.error('\n❌ Production bootstrap error:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

if (require.main === module || process.argv[1]?.includes('seedProduction')) {
  seedProduction()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
