import mongoose, { Document, Schema, Model } from 'mongoose';
import { AboutSectionConfig, FooterSectionConfig, HeroSlide, MaterialSectionConfig, NewsletterSectionConfig } from '@vietcraft/shared';

export interface IHomepageDocument extends Document {
  heroSlides: HeroSlide[];
  materialSection: MaterialSectionConfig;
  featuredProductIds: mongoose.Types.ObjectId[];
  aboutSection: AboutSectionConfig;
  newsletterSection: NewsletterSectionConfig;
  footerSection: FooterSectionConfig;
  sectionOrder: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<HeroSlide>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    buttonText: { type: String, required: true },
    buttonUrl: { type: String, required: true },
    image: { type: String, required: true },
    displayOrder: { type: Number, default: 0 }
  },
  { _id: true }
);

const HomepageSchema = new Schema<IHomepageDocument>(
  {
    heroSlides: [HeroSlideSchema],
    materialSection: {
      headline: { type: String, required: true },
      subheadline: { type: String, required: true },
      enabledMaterialIds: [{ type: Schema.Types.ObjectId, ref: 'Material' }]
    },
    featuredProductIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    aboutSection: {
      title: { type: String, required: true },
      body: { type: String, required: true },
      quote: { type: String, required: true },
      quoteAuthor: { type: String, required: true },
      image: { type: String, required: true },
      buttonText: { type: String, required: true },
      buttonUrl: { type: String, required: true }
    },
    newsletterSection: {
      headline: { type: String, required: true },
      subheadline: { type: String, required: true },
      buttonText: { type: String, required: true }
    },
    footerSection: {
      brandBio: { type: String, required: true },
      contactEmail: { type: String, required: true },
      copyrightText: { type: String, required: true },
      socialLinks: {
        instagram: String,
        pinterest: String,
        facebook: String,
        twitter: String
      }
    },
    sectionOrder: {
      type: [String],
      default: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter']
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Homepage: Model<IHomepageDocument> = mongoose.model<IHomepageDocument>('Homepage', HomepageSchema);
