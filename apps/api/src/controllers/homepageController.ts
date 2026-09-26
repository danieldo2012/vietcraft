import { Request, Response } from 'express';
import { Homepage } from '../models/Homepage';
import { Product } from '../models/Product';
import { Material } from '../models/Material';
import { sendError, sendSuccess } from '../utils/response';

export const getHomepage = async (req: Request, res: Response): Promise<void> => {
  let homepage = await Homepage.findOne({ isPublished: true })
    .populate({
      path: 'featuredProductIds',
      match: { status: 'active' },
      populate: [
        { path: 'material', select: 'name slug' },
        { path: 'category', select: 'name slug' }
      ]
    })
    .populate({
      path: 'materialSection.enabledMaterialIds',
      match: { isActive: true },
      options: { sort: { displayOrder: 1 } }
    });

  if (!homepage) {
    // If no custom doc yet, fetch fallback active materials and featured products
    const [materials, products] = await Promise.all([
      Material.find({ isActive: true }).sort({ displayOrder: 1 }),
      Product.find({ status: 'active', featured: true })
        .limit(8)
        .populate('material', 'name slug')
        .populate('category', 'name slug')
    ]);

    const fallbackHomepage = {
      heroSlides: [
        {
          title: 'Naturally Thoughtful Home Decor',
          subtitle: 'Artisanal Vietnamese craft, sustainable rattan, handcrafted ceramics, and timeless organic textures.',
          buttonText: 'Discover Materials',
          buttonUrl: '/discover',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
          displayOrder: 0
        }
      ],
      materialSection: {
        headline: 'Handcrafted by Material',
        subheadline: 'Each collection honors ancestral Vietnamese techniques passed down across generations.',
        enabledMaterialIds: materials
      },
      featuredProductIds: products,
      aboutSection: {
        title: 'Rooted in Vietnamese Craft Heritage',
        body: 'VietCraft was founded to bridge ancestral craft communities of Vietnam with modern interior spaces across America. From bamboo weavers in Chương Mỹ to ceramics masters in Bát Tràng, we curate sustainable home decor that feels warm, grounded, and enduring.',
        quote: 'True luxury is organic, patient, and deeply tied to the hands that shaped it.',
        quoteAuthor: 'Mai Nguyen, Creative Director',
        image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
        buttonText: 'Read Our Story',
        buttonUrl: '/about'
      },
      newsletterSection: {
        headline: 'Slow Living, Delivered to Your Inbox',
        subheadline: 'Join 14,000+ mindful homeowners discovering natural Vietnamese decor, artisan studio tours, and styling advice.',
        buttonText: 'Subscribe'
      },
      footerSection: {
        brandBio: 'VietCraft curates natural home decor inspired by Vietnamese artisanal heritage, connecting mindful US homeowners with timeless craftsmanship.',
        contactEmail: 'hello@vietcraft.com',
        copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`,
        socialLinks: {
          instagram: 'https://instagram.com/vietcrafthome',
          pinterest: 'https://pinterest.com/vietcrafthome',
          facebook: 'https://facebook.com/vietcrafthome'
        }
      },
      sectionOrder: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter'],
      isPublished: true
    };

    sendSuccess(res, fallbackHomepage, 'Homepage configuration retrieved (fallback)');
    return;
  }

  // If enabledMaterialIds is empty, populate all active materials
  if (!homepage.materialSection.enabledMaterialIds || homepage.materialSection.enabledMaterialIds.length === 0) {
    const allMaterials = await Material.find({ isActive: true }).sort({ displayOrder: 1 });
    homepage.materialSection.enabledMaterialIds = allMaterials as any;
  }

  sendSuccess(res, homepage, 'Homepage configuration retrieved');
};

export const adminGetHomepage = async (req: Request, res: Response): Promise<void> => {
  let homepage = await Homepage.findOne().populate('featuredProductIds materialSection.enabledMaterialIds');

  if (!homepage) {
    homepage = await Homepage.create({
      heroSlides: [
        {
          title: 'Naturally Thoughtful Home Decor',
          subtitle: 'Artisanal Vietnamese craft, sustainable rattan, handcrafted ceramics, and timeless organic textures.',
          buttonText: 'Discover Materials',
          buttonUrl: '/discover',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
          displayOrder: 0
        }
      ],
      materialSection: {
        headline: 'Handcrafted by Material',
        subheadline: 'Each collection honors ancestral Vietnamese techniques passed down across generations.',
        enabledMaterialIds: []
      },
      featuredProductIds: [],
      aboutSection: {
        title: 'Rooted in Vietnamese Craft Heritage',
        body: 'VietCraft was founded to bridge ancestral craft communities of Vietnam with modern interior spaces across America.',
        quote: 'True luxury is organic, patient, and deeply tied to the hands that shaped it.',
        quoteAuthor: 'Mai Nguyen, Creative Director',
        image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
        buttonText: 'Read Our Story',
        buttonUrl: '/about'
      },
      newsletterSection: {
        headline: 'Slow Living, Delivered to Your Inbox',
        subheadline: 'Join mindful homeowners discovering natural Vietnamese decor, artisan tours, and styling advice.',
        buttonText: 'Subscribe'
      },
      footerSection: {
        brandBio: 'VietCraft curates natural home decor inspired by Vietnamese artisanal heritage.',
        contactEmail: 'hello@vietcraft.com',
        copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`,
        socialLinks: {
          instagram: 'https://instagram.com/vietcrafthome',
          pinterest: 'https://pinterest.com/vietcrafthome',
          facebook: 'https://facebook.com/vietcrafthome'
        }
      },
      sectionOrder: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter'],
      isPublished: true
    });
  }

  sendSuccess(res, homepage, 'Admin homepage configuration retrieved');
};

export const adminUpdateHomepage = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };

    if (Array.isArray(data.featuredProductIds)) {
      data.featuredProductIds = data.featuredProductIds
        .map((p: any) => (typeof p === 'object' && p !== null ? p._id || p.id : p))
        .filter(Boolean);
    }
    if (data.materialSection && Array.isArray(data.materialSection.enabledMaterialIds)) {
      data.materialSection.enabledMaterialIds = data.materialSection.enabledMaterialIds
        .map((m: any) => (typeof m === 'object' && m !== null ? m._id || m.id : m))
        .filter(Boolean);
    }

    let homepage = await Homepage.findOne();

    if (!homepage) {
      homepage = await Homepage.create({
        heroSlides: [
          {
            title: 'Naturally Thoughtful Home Decor',
            subtitle: 'Artisanal Vietnamese craft, sustainable rattan, handcrafted ceramics, and timeless organic textures.',
            buttonText: 'Discover Materials',
            buttonUrl: '/discover',
            image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
            displayOrder: 0
          }
        ],
        materialSection: {
          headline: 'Handcrafted by Material',
          subheadline: 'Each collection honors ancestral Vietnamese techniques passed down across generations.',
          enabledMaterialIds: []
        },
        featuredProductIds: [],
        aboutSection: {
          title: 'Rooted in Vietnamese Craft Heritage',
          body: 'VietCraft was founded to bridge ancestral craft communities of Vietnam with modern interior spaces across America.',
          quote: 'True luxury is organic, patient, and deeply tied to the hands that shaped it.',
          quoteAuthor: 'Mai Nguyen, Creative Director',
          image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
          buttonText: 'Read Our Story',
          buttonUrl: '/about'
        },
        newsletterSection: {
          headline: 'Slow Living, Delivered to Your Inbox',
          subheadline: 'Join mindful homeowners discovering natural Vietnamese decor, artisan tours, and styling advice.',
          buttonText: 'Subscribe'
        },
        footerSection: {
          brandBio: 'VietCraft curates natural home decor inspired by Vietnamese artisanal heritage.',
          contactEmail: 'hello@vietcraft.com',
          copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`,
          socialLinks: {
            instagram: 'https://instagram.com/vietcrafthome',
            pinterest: 'https://pinterest.com/vietcrafthome',
            facebook: 'https://facebook.com/vietcrafthome'
          }
        },
        sectionOrder: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter'],
        isPublished: true,
        ...data
      });
    } else {
      homepage = await Homepage.findByIdAndUpdate(homepage._id, data, { new: true, runValidators: true });
    }

    if (homepage) {
      homepage = await Homepage.findById(homepage._id).populate('featuredProductIds materialSection.enabledMaterialIds');
    }

    sendSuccess(res, homepage, 'Homepage updated successfully');
  } catch (err: any) {
    sendError(res, err.errors ? Object.values(err.errors).map((e: any) => e.message).join(', ') : err.message, 400);
  }
};

