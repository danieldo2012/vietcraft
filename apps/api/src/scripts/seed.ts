import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { ENV } from '../config/env';
import {
  User,
  Material,
  Category,
  Product,
  Post,
  Homepage,
  Setting,
  SiteSettings,
  HeaderSettings,
  FooterSettings,
  Page,
  ContactMessage,
  Newsletter
} from '../models';
import { MATERIALS, CATEGORIES, AFFILIATE_DISCLOSURE, SITE_DEFAULTS } from '@vietcraft/shared';
import { slugify } from '../utils/slugify';
import { calculateReadingTime } from '../utils/readingTime';
import { amazonProductService } from '../services/AmazonProductService';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Material.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Post.deleteMany({}),
      Homepage.deleteMany({}),
      Setting.deleteMany({}),
      SiteSettings.deleteMany({}),
      HeaderSettings.deleteMany({}),
      FooterSettings.deleteMany({}),
      Page.deleteMany({}),
      ContactMessage.deleteMany({}),
      Newsletter.deleteMany({})
    ]);

    // 1. Seed Admin User
    console.log('👤 Creating initial admin user...');
    const adminUser = await User.create({
      name: ENV.INITIAL_ADMIN_NAME,
      email: ENV.INITIAL_ADMIN_EMAIL.toLowerCase(),
      password: ENV.INITIAL_ADMIN_PASSWORD,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // 2. Seed Materials
    console.log('🌿 Creating 6 foundational materials...');
    const materialImages: Record<string, string> = {
      'rattan-bamboo': 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1000&q=80',
      'ceramics': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
      'lacquer': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      'wood': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80',
      'woven-fibers': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      'silk': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80'
    };

    const materialDocs = await Material.insertMany(
      MATERIALS.map((mat, index) => ({
        ...mat,
        coverImage: materialImages[mat.slug] || 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1000&q=80',
        displayOrder: index,
        isActive: true,
        seo: {
          title: `${mat.name} Home Decor & Craft Heritage | VietCraft`,
          description: mat.shortDescription,
          keywords: [mat.name.toLowerCase(), 'vietnamese craftsmanship', 'sustainable home decor']
        }
      }))
    );
    console.log(`✅ Created ${materialDocs.length} materials`);

    // Map material by slug for easy lookup
    const materialMap = new Map(materialDocs.map((m) => [m.slug, m._id]));

    // 3. Seed Categories
    console.log('🏷️ Creating 8 product categories...');
    const categoryDocs = await Category.insertMany(
      CATEGORIES.map((cat, index) => ({
        ...cat,
        displayOrder: index,
        isActive: true
      }))
    );
    console.log(`✅ Created ${categoryDocs.length} categories`);

    // Map category by slug
    const categoryMap = new Map(categoryDocs.map((c) => [c.slug, c._id]));

    // 4. Seed Products (14 Curated Products)
    console.log('🛍️ Creating curated products with valid Amazon ASINs...');
    const sampleProducts = [
      {
        title: 'Phú Vinh Radial Bamboo Pendant Light',
        slug: 'phu-vinh-radial-bamboo-pendant-light',
        shortDescription: 'Hand-woven concentric bamboo chandelier casting gentle geometric shadows.',
        description: 'Handcrafted by master artisans in Phú Vinh village outside Hanoi, this radial pendant lantern is shaped from split, smoked bamboo. The open weave permits ambient light to filter softly across dining tables and reading nooks, invoking warm tropical evenings.',
        material: materialMap.get('rattan-bamboo'),
        category: categoryMap.get('lighting'),
        asin: 'B09X1K87B2',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09X1K87B2'),
        price: 128.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['lighting', 'bamboo', 'pendant', 'dining room', 'artisan'],
        dimensions: { height: 16, width: 22, depth: 22, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80', alt: 'Bamboo pendant light hanging above wooden table', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80', alt: 'Detail of woven bamboo lattice', isPrimary: false }
        ]
      },
      {
        title: 'Bát Tràng Fluted Celadon Stoneware Vase',
        slug: 'bat-trang-fluted-celadon-stoneware-vase',
        shortDescription: 'Wheel-thrown ceramic vessel finished in a delicate pale green river glaze.',
        description: 'Dating back to ancestral kilns of the 14th century, Bát Tràng stoneware is revered for its tactile weight and earthy balance. This fluted vase is wheel-thrown from local Red River clay and wood-fired to achieve a subtle jade-green crackle celadon patina.',
        material: materialMap.get('ceramics'),
        category: categoryMap.get('vases'),
        asin: 'B08J45MN91',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B08J45MN91'),
        price: 74.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['ceramics', 'vase', 'celadon', 'stoneware', 'shelf styling'],
        dimensions: { height: 11, width: 6.5, depth: 6.5, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80', alt: 'Fluted celadon ceramic vase on stone ledge', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80', alt: 'Ceramic vase with dried botanicals', isPrimary: false }
        ]
      },
      {
        title: 'Hạ Thái Gold Leaf Lacquered Serving Tray',
        slug: 'ha-thai-gold-leaf-lacquered-serving-tray',
        shortDescription: 'Multi-coat natural resin tray polished with crushed eggshell and gold leaf accents.',
        description: 'Over thirty days of curing in humidity chambers give this Hạ Thái lacquer tray its deep glass-like sheen. Crafted from sustainably harvested wood and finished with genuine Vietnamese sap resin, it transitions effortlessly from a tabletop centerpiece to an exquisite cocktail server.',
        material: materialMap.get('lacquer'),
        category: categoryMap.get('kitchen-dining'),
        asin: 'B07V9P32LW',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B07V9P32LW'),
        price: 89.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['lacquer', 'tray', 'gold leaf', 'tableware', 'entertaining'],
        dimensions: { height: 1.5, width: 18, depth: 12, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80', alt: 'Glossy handcrafted lacquer tray on linen table', isPrimary: true }
        ]
      },
      {
        title: 'Kim Sơn Spiral Braided Seagrass Storage Basket',
        slug: 'kim-son-spiral-braided-seagrass-storage-basket',
        shortDescription: 'Durable sun-cured seagrass storage vessel with braided carrying handles.',
        description: 'Woven by women’s artisan guilds in Kim Sơn along the northern coastline, each basket transforms resilient wild marsh grasses into an indispensable storage solution. Perfect for rolled linen throws, hearthside kindling, or potted indoor fiddle leaf figs.',
        material: materialMap.get('woven-fibers'),
        category: categoryMap.get('baskets'),
        asin: 'B08K2N71Z4',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B08K2N71Z4'),
        price: 52.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['seagrass', 'basket', 'storage', 'living room', 'natural fibers'],
        dimensions: { height: 14, width: 16, depth: 16, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1595991209266-5ff5a3a2f008?auto=format&fit=crop&w=1000&q=80', alt: 'Woven seagrass basket with cozy blankets', isPrimary: true }
        ]
      },
      {
        title: 'Mã Châu Handloom Raw Silk Cushion Cover',
        slug: 'ma-chau-handloom-raw-silk-cushion-cover',
        shortDescription: 'Textured tussah silk square cushion dyed with crushed walnut shells.',
        description: 'Woven in the ancient silk quarter of Mã Châu along the Thu Bồn River, this cushion cover celebrates the slubby, organic hand of wild raw silk. Plant-based walnut dyeing produces warm biscuit tones that age with serene character.',
        material: materialMap.get('silk'),
        category: categoryMap.get('textiles'),
        asin: 'B09F5T67GH',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09F5T67GH'),
        price: 46.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: false,
        status: 'active' as const,
        tags: ['silk', 'cushion', 'pillow cover', 'botanical dye', 'textiles'],
        dimensions: { height: 20, width: 20, depth: 1, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80', alt: 'Raw silk cushion on linen sofa', isPrimary: true }
        ]
      },
      {
        title: 'Reclaimed Teak Wood Pedestal Fruit Bowl',
        slug: 'reclaimed-teak-wood-pedestal-fruit-bowl',
        shortDescription: 'Turned teakwood footed centerpiece finished in cold-pressed tung oil.',
        description: 'Crafted from salvaged old-growth teak timbers in Central Vietnam, this pedestal bowl showcases golden honey hues and dark wood grain. Sculpted on traditional foot-treadle lathes and hand-rubbed with food-safe plant oils.',
        material: materialMap.get('wood'),
        category: categoryMap.get('kitchen-dining'),
        asin: 'B07W4R8K9P',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B07W4R8K9P'),
        price: 68.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['wood', 'pedestal bowl', 'teak', 'kitchen', 'centerpiece'],
        dimensions: { height: 6, width: 12, depth: 12, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80', alt: 'Handcrafted wood pedestal bowl with citrus', isPrimary: true }
        ]
      },
      {
        title: 'Open-Lattice Woven Bamboo Floor Lamp',
        slug: 'open-lattice-woven-bamboo-floor-lamp',
        shortDescription: 'Architectural tripod floor lamp with double-walled woven bamboo diffuser.',
        description: 'Standing proudly on dark-stained acacia wood legs, this floor lamp features an intricately split bamboo diffuser that casts organic amber warmth across living rooms and reading areas.',
        material: materialMap.get('rattan-bamboo'),
        category: categoryMap.get('lighting'),
        asin: 'B09L3M98XY',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09L3M98XY'),
        price: 165.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: false,
        status: 'active' as const,
        tags: ['floor lamp', 'bamboo', 'lighting', 'living room'],
        dimensions: { height: 54, width: 18, depth: 18, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80', alt: 'Bamboo floor lamp glowing in cozy room', isPrimary: true }
        ]
      },
      {
        title: 'Phù Lãng Natural Ash-Glaze Ceramic Teapot',
        slug: 'phu-lang-natural-ash-glaze-ceramic-teapot',
        shortDescription: 'Wood-fired stoneware teapot with woven bamboo side handle.',
        description: 'Phù Lãng pottery is distinguished by its direct wood-firing technique and dark honey glaze formulated from river clay and rice husk ash. Includes a handcrafted curved bamboo handle that protects fingers while pouring.',
        material: materialMap.get('ceramics'),
        category: categoryMap.get('kitchen-dining'),
        asin: 'B08Y8L45BC',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B08Y8L45BC'),
        price: 82.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['ceramics', 'teapot', 'tea ceremony', 'wood fired'],
        dimensions: { height: 7, width: 8, depth: 5.5, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80', alt: 'Stoneware teapot with bamboo handle', isPrimary: true }
        ]
      },
      {
        title: 'Tiered Water Hyacinth Laundry Hamper',
        slug: 'tiered-water-hyacinth-laundry-hamper',
        shortDescription: 'Structured tall storage hamper with removable unbleached cotton liner.',
        description: 'Woven over a concealed powder-coated steel frame, this water hyacinth hamper keeps bedroom and bathroom essentials tidy while introducing rich organic texture. Features a fitted lid and breathable cotton insert.',
        material: materialMap.get('woven-fibers'),
        category: categoryMap.get('baskets'),
        asin: 'B07D2N96KL',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B07D2N96KL'),
        price: 94.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: false,
        status: 'active' as const,
        tags: ['water hyacinth', 'hamper', 'laundry', 'organization'],
        dimensions: { height: 26, width: 17, depth: 17, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80', alt: 'Natural woven water hyacinth hamper', isPrimary: true }
        ]
      },
      {
        title: 'Mother-of-Pearl Inlaid Black Lacquer Jewelry Box',
        slug: 'mother-of-pearl-inlaid-black-lacquer-jewelry-box',
        shortDescription: 'Traditional jewelry casket inlaid with iridescent sea snail shell petals.',
        description: 'Exemplifying the royal lacquer craft of Huế and Hạ Thái, this keepsake box requires weeks of precision shell carving and wet-sanding under charcoal. Lined in plush crimson silk velvet.',
        material: materialMap.get('lacquer'),
        category: categoryMap.get('decorative-objects'),
        asin: 'B08M5Z98TY',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B08M5Z98TY'),
        price: 115.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['lacquer', 'jewelry box', 'mother of pearl', 'keepsake'],
        dimensions: { height: 4, width: 8, depth: 6, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', alt: 'Inlaid black lacquer decorative box', isPrimary: true }
        ]
      },
      {
        title: 'Sculpted Solid Acacia Wood Low Stool',
        slug: 'sculpted-solid-acacia-wood-low-stool',
        shortDescription: 'Curved saddle stool crafted from a single block of plantation acacia.',
        description: 'Designed as a versatile meditation perch, plant plinth, or fireside footstool. Hand-carved with gentle finger grips beneath the seat and finished with natural beeswax.',
        material: materialMap.get('wood'),
        category: categoryMap.get('furniture'),
        asin: 'B09B8N54X1',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09B8N54X1'),
        price: 145.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['furniture', 'wood', 'stool', 'seating', 'sculptural'],
        dimensions: { height: 18, width: 16, depth: 12, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1000&q=80', alt: 'Curved wooden stool on neutral rug', isPrimary: true }
        ]
      },
      {
        title: 'Botanical Indigo Hand-Dyed Silk Throw',
        slug: 'botanical-indigo-hand-dyed-silk-throw',
        shortDescription: 'Deep indigo and white resist-dyed mulberry silk blanket with eyelash fringe.',
        description: 'Dyed using fermented leaves of the Indigofera tinctoria plant in Northern mountain highlands, this luxurious silk throw transitions through gradient blues that reflect misty valley mornings.',
        material: materialMap.get('silk'),
        category: categoryMap.get('textiles'),
        asin: 'B09Q1V44RT',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09Q1V44RT'),
        price: 120.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: false,
        status: 'active' as const,
        tags: ['silk', 'throw', 'indigo', 'textiles', 'blanket'],
        dimensions: { height: 70, width: 50, depth: 0.1, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80', alt: 'Indigo dyed silk textile draped on chair', isPrimary: true }
        ]
      },
      {
        title: 'Hand-Woven Split Rattan Wall Disc Trio',
        slug: 'hand-woven-split-rattan-wall-disc-trio',
        shortDescription: 'Set of three concentric round woven wall medallions in varying natural tones.',
        description: 'Add dimensional organic warmth to entryway walls, bedroom headboards, or open hallways. Each circular plate features distinct radial starburst patterns woven by hand from peeled rattan reeds.',
        material: materialMap.get('rattan-bamboo'),
        category: categoryMap.get('wall-decor'),
        asin: 'B08T7N12SD',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B08T7N12SD'),
        price: 78.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: true,
        status: 'active' as const,
        tags: ['wall decor', 'rattan', 'wall art', 'boho modern'],
        dimensions: { height: 24, width: 24, depth: 2, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80', alt: 'Woven wall basket decor arrangement', isPrimary: true }
        ]
      },
      {
        title: 'Lái Thiêu Hand-Painted Terracotta Planter',
        slug: 'lai-thieu-hand-painted-terracotta-planter',
        shortDescription: 'Glazed earthenware planter featuring subtle brushwork botanical motifs.',
        description: 'Preserving Southern Vietnamese kiln pottery traditions from Bình Dương, this substantial ceramic planter offers optimal root aeration and enduring outdoor/indoor aesthetic balance.',
        material: materialMap.get('ceramics'),
        category: categoryMap.get('decorative-objects'),
        asin: 'B09S4M87ZQ',
        affiliateUrl: amazonProductService.buildAffiliateUrl('B09S4M87ZQ'),
        price: 62.0,
        currency: 'USD',
        priceSource: 'manual_entry' as const,
        featured: false,
        status: 'active' as const,
        tags: ['planter', 'ceramics', 'pottery', 'indoor plant'],
        dimensions: { height: 9, width: 10, depth: 10, unit: 'in' },
        images: [
          { url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80', alt: 'Terracotta ceramic plant pot on console table', isPrimary: true }
        ]
      }
    ];

    const productDocs = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${productDocs.length} curated products`);

    // 5. Seed Articles (13 High-Quality Editorial Stories)
    console.log('📰 Creating 13 authentic editorial articles...');
    const sampleArticles = [
      {
        title: 'The Living Art of Sơn Ta: Inside Hanoi’s Ancestral Lacquer Village',
        slug: 'the-living-art-of-son-ta-inside-hanois-ancestral-lacquer-village',
        excerpt: 'How twenty painstaking layers of natural tree sap and charcoal water-polishing produce Vietnam’s most prized luminous finishes.',
        content: `
          <p>Thirty kilometers south of Hanoi lies Hạ Thái, an ancient craft enclave where quiet courtyards hum with the rhythm of sanding blocks and drying chambers. Here, the art of lacquer—known locally as <em>Sơn Ta</em>—has flourished since the 17th century.</p>
          <h2>The Alchemy of Tree Resin</h2>
          <p>Unlike Western synthetic varnishes, authentic Vietnamese lacquer begins in the forested hills of Phú Thọ. Workers tap the bark of the indigenous lacquer tree (<em>Toxicodendron succedaneum</em>) in the pre-dawn mist to gather milky sap. When allowed to rest, this liquid cures into a hard, glossy polymer with unmatched organic depth.</p>
          <p>The process is an exercise in sublime patience. A single bowl or tray undergoes up to twenty applications of lacquer. Between each layer, the object is placed inside a dark, humid drying cabinet where water vapor triggers curing. Once dry, artisans polish the surface under cold running water using charcoal stones and water-sandpaper.</p>
          <blockquote>"Modern life rushes toward the immediate. Sơn Ta teaches us that true depth cannot be hurried. It requires time, humidity, and the steady breath of the artisan."</blockquote>
          <h2>Integrating Lacquer into Contemporary Interiors</h2>
          <p>In modern homes, Vietnamese lacquer serves as a luminous counterpoint to matte linen, raw stone, and pale oak. A single lacquer tray on a travertine coffee table catches afternoon sunlight, while decorative boxes provide tactile intimacy on bedside tables.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Linh Tran',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Vietnamese architectural historian and curator based between Hanoi and New York.'
        },
        material: materialMap.get('lacquer'),
        tags: ['lacquer', 'artisans', 'hanoi', 'craft heritage', 'slow living'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        relatedProducts: [productDocs[2]._id, productDocs[9]._id]
      },
      {
        title: 'From Riverbanks to Sanctuaries: The Enduring Beauty of Vietnamese Rattan',
        slug: 'from-riverbanks-to-sanctuaries-the-enduring-beauty-of-vietnamese-rattan',
        excerpt: 'Why split bamboo and wild rattan continue to define the warm, textural aesthetic of modern mindful living.',
        content: `
          <p>There is an innate warmth in a room touched by woven rattan. Light passes through its woven reeds in soft lattices, casting gentle shadows that drift across walls as the sun shifts. For Vietnamese villagers in Chương Mỹ, bamboo and rattan are not merely raw materials; they are an extension of the earth’s natural rhythm.</p>
          <h2>Sustainable Harvesting in River Valleys</h2>
          <p>Bamboo is among the fastest growing plants on planet Earth, capable of renewing itself within seasons without depleting forest canopies. Harvested by hand along riverbanks, the culms are smoked over rice chaff fires to impart natural pest resistance and a golden caramel hue.</p>
          <h2>Caring for Natural Woven Pieces</h2>
          <p>Because bamboo and rattan are living organic fibers, they thrive with gentle care. Dust weekly with a soft brush, and lightly wipe with a damp cotton cloth. In dry climates, a subtle misting of water restores suppleness and prevents brittle strands.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'David Hayes',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          bio: 'Interior stylist and advocate for renewable, biophilic design.'
        },
        material: materialMap.get('rattan-bamboo'),
        tags: ['rattan', 'bamboo', 'sustainability', 'living room', 'lighting'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        relatedProducts: [productDocs[0]._id, productDocs[6]._id, productDocs[12]._id]
      },
      {
        title: 'Earth, Ash, and Flame: Understanding Bát Tràng Stoneware Glazes',
        slug: 'earth-ash-and-flame-understanding-bat-trang-stoneware-glazes',
        excerpt: 'A deep dive into historical Red River clay deposits and high-temperature wood firings that produce ethereal crackle glazes.',
        content: `
          <p>Seven centuries of smoke, heat, and clay define Bát Tràng, a riverside village nestled along the Red River delta outside Hanoi. Long before industrial kilns arrived, potters here gathered local river sediments, pure spring water, and botanical ash to concoct glazes that mimic jade, river ice, and weathered stone.</p>
          <h2>The Magic of Crackle Glazes (Men Rạn)</h2>
          <p>Among Vietnam’s most celebrated ceramic achievements is <em>men rạn</em>—the intentional, microscopic crazing created by subtle thermal contraction between clay body and glaze during cooling. The resulting hairline web is traditionally rubbed with dark tea leaf liquor to accentuate each delicate fracture.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Linh Tran',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Vietnamese architectural historian and curator based between Hanoi and New York.'
        },
        material: materialMap.get('ceramics'),
        tags: ['ceramics', 'bat trang', 'pottery', 'wabi sabi', 'vases'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
        relatedProducts: [productDocs[1]._id, productDocs[7]._id]
      },
      {
        title: 'Slow Interiors: 7 Principles of Decorating with Natural Materials',
        slug: 'slow-interiors-7-principles-of-decorating-with-natural-materials',
        excerpt: 'How to create calm, restorative living spaces that honor craftsmanship, materiality, and emotional resonance.',
        content: `
          <p>Our homes should be sanctuaries of decompression, shielded from the relentless blue glow and synthetic hurry of the outside world. Slow decorating is not about achieving catalog perfection; it is about filling our rooms with objects that carry stories, tactile warmth, and organic grace.</p>
          <h2>1. Layer Contrasting Textures</h2>
          <p>Pair the cool, glazed surface of ceramics with the fibrous tactility of woven seagrass and the velvety drape of wild raw silk. Contrast creates richness without requiring visual clutter.</p>
          <h2>2. Choose Longevity Over Fast Trends</h2>
          <p>Invest in heirloom pieces made by human hands from renewable timber and clay. These materials develop patina rather than wear out.</p>
          <h2>3. Celebrate Natural Asymmetry</h2>
          <p>Allow the natural grain of live-edge wood or slight variations in hand-thrown pottery to shine. Imperfection is the fingerprint of human labor.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          bio: 'Mindful living consultant and editorial writer.'
        },
        material: materialMap.get('wood'),
        tags: ['slow living', 'interior design', 'mindful home', 'styling tips'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
        relatedProducts: [productDocs[5]._id, productDocs[10]._id]
      },
      {
        title: 'The Forgotten Handlooms of Mã Châu: A Heritage of Wild Silk',
        slug: 'the-forgotten-handlooms-of-ma-chau-a-heritage-of-wild-silk',
        excerpt: 'Discovering ancient mulberry orchards and botanical dye pits along the Thu Bồn River in Hội An.',
        content: `
          <p>While Hoi An’s ancient town lantern alleys draw travelers from around the globe, just across the Thu Bồn river sits Mã Châu. Here, women operate centuries-old wooden shuttle looms, spinning fine mulberry and tussah silks that breathe with natural softness.</p>
          <h2>Botanical Color Alchemy</h2>
          <p>Rather than synthetic dyes, Mã Châu artisans utilize gardenia fruits, yam roots, and crushed mahogany bark to tint silk with nuanced earth tones that never overwhelm a room.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Linh Tran',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Vietnamese architectural historian and curator based between Hanoi and New York.'
        },
        material: materialMap.get('silk'),
        tags: ['silk', 'textiles', 'hoi an', 'botanical dyes'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        relatedProducts: [productDocs[4]._id, productDocs[11]._id]
      },
      {
        title: 'Styling with Organic Form: How to Curate Sculptural Wood in Modern Spaces',
        slug: 'styling-with-organic-form-how-to-curate-sculptural-wood-in-modern-spaces',
        excerpt: 'Transform your tabletops and mantels with live-edge pedestals, turned bowls, and tactile grain.',
        content: `
          <p>Wood is the bridge between architecture and the forest. When introduced to minimalist rooms, turned wood bowls and carved stools break up rigid rectilinear lines with fluid, organic silhouettes.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'David Hayes',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          bio: 'Interior stylist and advocate for renewable, biophilic design.'
        },
        material: materialMap.get('wood'),
        tags: ['wood', 'sculptural', 'centerpiece', 'styling'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
        relatedProducts: [productDocs[5]._id, productDocs[10]._id]
      },
      {
        title: 'The Gentle Warmth of Hand-Woven Water Hyacinth',
        slug: 'the-gentle-warmth-of-hand-woven-water-hyacinth',
        excerpt: 'How an invasive aquatic weed became Vietnam’s most successful eco-friendly craft export.',
        content: `
          <p>In the serpentine waterways of the Mekong Delta, water hyacinth was once regarded as an overgrown nuisance. Today, cooperative weaving communities harvest, wash, and sun-dry the resilient stalks into luxurious, thick braids for storage hampers and rugs.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          bio: 'Mindful living consultant and editorial writer.'
        },
        material: materialMap.get('woven-fibers'),
        tags: ['woven fibers', 'mekong delta', 'sustainability', 'storage'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
        relatedProducts: [productDocs[3]._id, productDocs[8]._id]
      },
      {
        title: 'A Guide to Caring for Authentic Lacquerware',
        slug: 'a-guide-to-caring-for-authentic-lacquerware',
        excerpt: 'Simple ritual practices to preserve the mirror-like luster of Vietnamese natural resin across decades.',
        content: `
          <p>Natural lacquer is remarkably durable, resistant to water, alcohol, and mild heat. Follow these essential guidelines to ensure your trays and boxes retain their museum-quality depth for generations.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Linh Tran',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Vietnamese architectural historian and curator based between Hanoi and New York.'
        },
        material: materialMap.get('lacquer'),
        tags: ['lacquer', 'care guide', 'maintenance', 'heirloom'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24),
        relatedProducts: [productDocs[2]._id, productDocs[9]._id]
      },
      {
        title: 'Bringing the Outside In: Biophilic Design Inspired by Indochine Architecture',
        slug: 'bringing-the-outside-in-biophilic-design-inspired-by-indochine-architecture',
        excerpt: 'Cross-ventilation, shaded courtyards, and organic materials that harmonize tropical ease with modern living.',
        content: `
          <p>Traditional Vietnamese homes blur the boundaries between living spaces and garden courtyards. Louvered teak shutters, split bamboo blinds, and potted palms offer timeless lessons for biophilic architecture.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'David Hayes',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          bio: 'Interior stylist and advocate for renewable, biophilic design.'
        },
        material: materialMap.get('rattan-bamboo'),
        tags: ['biophilic', 'indochine', 'architecture', 'plant styling'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
        relatedProducts: [productDocs[0]._id, productDocs[6]._id]
      },
      {
        title: 'Why Fast Furniture is Fading: The Case for Artisan-Made Home Decor',
        slug: 'why-fast-furniture-is-fading-the-case-for-artisan-made-home-decor',
        excerpt: 'Discarded particle board landfills vs. generational craft. Why conscious homeowners are turning back to natural roots.',
        content: `
          <p>The average piece of flat-pack composite furniture lasts less than four years before ending up in landfill. Discover how handmade artisanal craft changes our relationship with the objects we touch every day.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          bio: 'Mindful living consultant and editorial writer.'
        },
        material: materialMap.get('wood'),
        tags: ['sustainability', 'slow home', 'conscious living', 'eco friendly'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 32),
        relatedProducts: [productDocs[10]._id]
      },
      {
        title: 'Lighting with Texture: How Woven Lamps Transform Evening Ambience',
        slug: 'lighting-with-texture-how-woven-lamps-transform-evening-ambience',
        excerpt: 'Say goodbye to harsh downlights. Learn how bamboo and rattan diffusers create soothing, restorative lighting schemes.',
        content: `
          <p>Lighting is the single most transformative element in any interior. A woven pendant lamp softens harsh glare into a dappled, golden glow that mimics firelight.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'David Hayes',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          bio: 'Interior stylist and advocate for renewable, biophilic design.'
        },
        material: materialMap.get('rattan-bamboo'),
        tags: ['lighting', 'ambience', 'bamboo lamps', 'evening lighting'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
        relatedProducts: [productDocs[0]._id, productDocs[6]._id]
      },
      {
        title: 'The Red River Clay Tradition: Visiting Phù Lãng’s Wood-Fired Kilns',
        slug: 'the-red-river-clay-tradition-visiting-phu-langs-wood-fired-kilns',
        excerpt: 'Rustic, unpretentious, and deeply grounded: why terracotta and ash stoneware from Bắc Ninh are gaining global acclaim.',
        content: `
          <p>While Bát Tràng specializes in fine porcelain and celadon glazes, nearby Phù Lãng is famous for its dark, rugged earthenware fired with local eucalyptus wood.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Linh Tran',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Vietnamese architectural historian and curator based between Hanoi and New York.'
        },
        material: materialMap.get('ceramics'),
        tags: ['ceramics', 'phu lang', 'terracotta', 'craft village'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 38),
        relatedProducts: [productDocs[7]._id, productDocs[13]._id]
      },
      {
        title: 'Wabi-Sabi and Vietnamese Craft: Embracing Natural Imperfection',
        slug: 'wabi-sabi-and-vietnamese-craft-embracing-natural-imperfection',
        excerpt: 'Discovering the quiet poetry of cracked clay, hand-whittled joinery, and the gentle weathering of natural materials.',
        content: `
          <p>Across East Asia, reverence for natural decay and weathered texture reminds us of our own transient nature. In Vietnamese craft traditions, no two handmade objects are ever identical—and that is where their spirit lives.</p>
        `,
        featuredImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
          bio: 'Mindful living consultant and editorial writer.'
        },
        material: materialMap.get('ceramics'),
        tags: ['wabi sabi', 'philosophy', 'mindfulness', 'natural decor'],
        status: 'published' as const,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 42),
        relatedProducts: [productDocs[1]._id]
      }
    ];

    const postDocs = await Post.insertMany(
      sampleArticles.map((post) => ({
        ...post,
        readingTime: calculateReadingTime(post.content),
        seo: {
          title: `${post.title} | VietCraft Blog`,
          description: post.excerpt,
          keywords: post.tags,
          ogImage: post.featuredImage
        }
      }))
    );
    console.log(`✅ Created ${postDocs.length} editorial articles`);

    // 6. Seed Homepage Configuration
    console.log('🏠 Creating dynamic homepage configuration...');
    const featuredProductIds = productDocs.filter((p) => p.featured).slice(0, 8).map((p) => p._id);
    const enabledMaterialIds = materialDocs.map((m) => m._id);

    await Homepage.create({
      heroSlides: [
        {
          title: 'Naturally Thoughtful Living',
          subtitle: 'Timeless home decor handcrafted from Vietnamese rattan, ceramics, lacquer, and wild silk.',
          buttonText: 'Explore Collections',
          buttonUrl: '/discover',
          image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80',
          displayOrder: 0
        },
        {
          title: 'Ancestral Craft, Mindful Spaces',
          subtitle: 'Curated natural materials and artisanal stories connecting US homes with Vietnam’s master craft guilds.',
          buttonText: 'Browse Curated Products',
          buttonUrl: '/products',
          image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1600&q=80',
          displayOrder: 1
        },
        {
          title: 'The Art of Slow Living',
          subtitle: 'Read in-depth guides, artisan profiles, and organic styling tips for your sanctuary.',
          buttonText: 'Read the Journal',
          buttonUrl: '/articles/the-living-art-of-son-ta-inside-hanois-ancestral-lacquer-village',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
          displayOrder: 2
        }
      ],
      materialSection: {
        headline: 'Discover by Material',
        subheadline: 'Each raw fiber and natural medium holds generations of sustainable cultural heritage.',
        enabledMaterialIds
      },
      featuredProductIds,
      aboutSection: {
        title: 'About VietCraft',
        body: 'VietCraft was born from a deep reverence for Vietnam’s ancient craft enclaves—where whole villages dedicate themselves to the mastery of a single material, whether it is split bamboo in Chương Mỹ, natural wood-ash ceramics in Bát Tràng, or raw silk in Hội An. We bridge these mindful makers with American homes seeking timeless, organic beauty.',
        quote: 'True luxury is quiet, patient, and intimately connected with the hands that created it.',
        quoteAuthor: 'Mai Nguyen, Founder & Creative Director',
        image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1000&q=80',
        buttonText: 'Discover Our Story',
        buttonUrl: '/about'
      },
      newsletterSection: {
        headline: 'Slow Living, Delivered to Your Inbox',
        subheadline: 'Join over 14,000 mindful homeowners receiving our monthly craft journals, styling guides, and quiet inspirations.',
        buttonText: 'Subscribe'
      },
      footerSection: {
        brandBio: 'VietCraft is a natural home decor blog and Amazon affiliate discovery platform celebrating Vietnamese craftsmanship and sustainable living.',
        contactEmail: SITE_DEFAULTS.contactEmail,
        copyrightText: `© ${new Date().getFullYear()} VietCraft. All rights reserved.`,
        socialLinks: SITE_DEFAULTS.socialLinks
      },
      sectionOrder: ['hero', 'materials', 'featuredProducts', 'about', 'newsletter'],
      isPublished: true
    });
    console.log('✅ Created homepage configuration');

    // 7. Seed Site Settings
    console.log('⚙️ Creating site settings & affiliate disclosure...');
    await SiteSettings.create({
      siteName: 'VietCraft',
      tagline: 'Natural Living & Vietnamese Craftsmanship',
      brandDescription: SITE_DEFAULTS.brandDescription,
      logo: '',
      logoAlt: 'VietCraft Natural Living',
      favicon: '',
      contactEmail: 'contact@vietcraft.com',
      contactPhone: '+1 (800) 555-CRAFT',
      address: 'Hanoi Artisan Guild, Vietnam & Distribution Center, USA',
      socialLinks: [
        { platform: 'Instagram', label: 'Instagram', url: SITE_DEFAULTS.socialLinks.instagram, isActive: true, order: 0 },
        { platform: 'Pinterest', label: 'Pinterest', url: SITE_DEFAULTS.socialLinks.pinterest, isActive: true, order: 1 },
        { platform: 'Facebook', label: 'Facebook', url: SITE_DEFAULTS.socialLinks.facebook, isActive: true, order: 2 },
        { platform: 'Twitter', label: 'Twitter', url: SITE_DEFAULTS.socialLinks.twitter, isActive: true, order: 3 }
      ],
      defaultTitle: 'VietCraft | Natural Home Decor & Vietnamese Craftsmanship',
      defaultMetaDescription: SITE_DEFAULTS.brandDescription,
      defaultOGImage: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?auto=format&fit=crop&w=1200&q=80',
      twitterHandle: '@vietcraft',
      privacyPolicy: '/privacy-policy',
      terms: '/terms',
      affiliateDisclosure: AFFILIATE_DISCLOSURE.full,
      googleAnalyticsId: '',
      metaPixelId: ''
    });
    console.log('✅ Created site settings');

    // 8. Seed Header Settings (Dedicated Header CMS)
    console.log('🧭 Creating Header CMS configuration...');
    const discoverMenuItems = materialDocs.map((mat, idx) => ({
      label: mat.name,
      url: `/discover/${mat.slug}`,
      materialSlug: mat.slug,
      order: idx,
      isActive: true
    }));

    await HeaderSettings.create({
      logo: '',
      logoText: 'VietCraft',
      logoAlt: 'VietCraft Natural Decor',
      logoUrl: '/',
      showLogo: true,
      navigationItems: [
        { id: 'nav-home', label: 'Home', url: '/', type: 'link', order: 0, isActive: true, openInNewTab: false },
        { id: 'nav-discover', label: 'Discover', url: '/discover', type: 'dropdown', order: 1, isActive: true, openInNewTab: false },
        { id: 'nav-products', label: 'Products', url: '/products', type: 'link', order: 2, isActive: true, openInNewTab: false },
        { id: 'nav-articles', label: 'Journal', url: '/articles', type: 'link', order: 3, isActive: true, openInNewTab: false },
        { id: 'nav-about', label: 'About Us', url: '/about', type: 'link', order: 4, isActive: true, openInNewTab: false }
      ],
      discoverMenu: {
        showDiscover: true,
        label: 'Discover',
        items: discoverMenuItems
      },
      headerCTA: {
        showCTA: true,
        label: 'Explore Journal',
        url: '/articles'
      },
      searchSettings: {
        showSearch: true,
        searchPlaceholder: 'Search handcrafted items, articles, materials...',
        searchPageTitle: 'Search VietCraft Collection',
        searchEmptyStateMessage: 'No handcrafted results found matching your inquiry.'
      },
      stickyHeader: true,
      mobileMenu: true
    });
    console.log('✅ Created Header CMS settings');

    // 9. Seed Footer Settings (Dedicated Footer CMS)
    console.log('🦶 Creating Footer CMS configuration...');
    await FooterSettings.create({
      logo: '',
      logoAlt: 'VietCraft Natural Living',
      description:
        'Discover natural beauty, thoughtful living, and timeless home decor inspired by Vietnam. We curate authentic artisanal craftsmanship—rattan, ceramics, lacquer, and wild silk—for mindful living spaces across the United States.',
      columns: [
        {
          id: 'col-explore',
          title: 'Explore',
          order: 0,
          links: [
            { id: 'link-products', label: 'All Decor Items', url: '/products', openInNewTab: false, isActive: true, order: 0 },
            { id: 'link-discover', label: 'Discover Materials', url: '/discover', openInNewTab: false, isActive: true, order: 1 },
            { id: 'link-journal', label: 'Artisan Journal', url: '/articles', openInNewTab: false, isActive: true, order: 2 }
          ]
        },
        {
          id: 'col-materials',
          title: 'Materials',
          order: 1,
          links: [
            { id: 'link-rattan', label: 'Rattan & Bamboo', url: '/discover/rattan-bamboo', openInNewTab: false, isActive: true, order: 0 },
            { id: 'link-ceramics', label: 'Ceramics', url: '/discover/ceramics', openInNewTab: false, isActive: true, order: 1 },
            { id: 'link-lacquer', label: 'Lacquer', url: '/discover/lacquer', openInNewTab: false, isActive: true, order: 2 },
            { id: 'link-wood', label: 'Wood', url: '/discover/wood', openInNewTab: false, isActive: true, order: 3 },
            { id: 'link-woven', label: 'Woven Fibers', url: '/discover/woven-fibers', openInNewTab: false, isActive: true, order: 4 },
            { id: 'link-silk', label: 'Silk', url: '/discover/silk', openInNewTab: false, isActive: true, order: 5 }
          ]
        },
        {
          id: 'col-about',
          title: 'About & Legal',
          order: 2,
          links: [
            { id: 'link-about', label: 'Our Story', url: '/about', openInNewTab: false, isActive: true, order: 0 },
            { id: 'link-affiliate', label: 'Affiliate Disclosure', url: '/affiliate-disclosure', openInNewTab: false, isActive: true, order: 1 },
            { id: 'link-privacy', label: 'Privacy Policy', url: '/privacy-policy', openInNewTab: false, isActive: true, order: 2 },
            { id: 'link-terms', label: 'Terms of Service', url: '/terms', openInNewTab: false, isActive: true, order: 3 }
          ]
        }
      ],
      socialLinks: [
        { platform: 'Instagram', label: 'VietCraft Instagram', url: 'https://instagram.com/vietcrafthome', icon: 'Instagram', isActive: true, order: 0 },
        { platform: 'Pinterest', label: 'VietCraft Pinterest', url: 'https://pinterest.com/vietcrafthome', icon: 'Sparkles', isActive: true, order: 1 },
        { platform: 'Facebook', label: 'VietCraft Facebook', url: 'https://facebook.com/vietcrafthome', icon: 'Facebook', isActive: true, order: 2 }
      ],
      contactInformation: {
        email: 'hello@vietcraft.com',
        phone: '+1 (800) 555-CRAFT',
        address: 'Hanoi Artisan Guild, Vietnam & Distribution Center, USA',
        businessHours: 'Mon - Fri: 9:00 AM - 6:00 PM EST'
      },
      newsletter: {
        title: 'Join Our Slow Living Community',
        description: 'Weekly curated essays on ancient craft villages, slow interiors, and intentional living.',
        placeholder: 'Enter your email address',
        buttonLabel: 'Subscribe',
        successMessage: 'Thank you for joining our slow living community!',
        errorMessage: 'Subscription failed. Please try again.',
        privacyText: 'Zero spam. Unsubscribe anytime.'
      },
      copyright: {
        copyrightText: '© 2026 VietCraft. Handcrafted with reverence for Vietnamese artisans. All rights reserved.'
      },
      legalLinks: [
        { id: 'leg-affiliate', label: 'Affiliate Disclosure', url: '/affiliate-disclosure', openInNewTab: false, isActive: true },
        { id: 'leg-privacy', label: 'Privacy Policy', url: '/privacy-policy', openInNewTab: false, isActive: true },
        { id: 'leg-terms', label: 'Terms of Service', url: '/terms', openInNewTab: false, isActive: true }
      ]
    });
    console.log('✅ Created Footer CMS settings');

    // 10. Seed CMS Pages (About, Privacy Policy, Terms, Affiliate Disclosure)
    console.log('📄 Creating dynamic CMS pages...');
    await Page.insertMany([
      {
        title: 'About VietCraft',
        slug: 'about',
        content: `## Our Philosophy\n\nAt VietCraft, we believe true luxury is quiet, patient, and deeply rooted in the hands of artisans who have honed their craft across generations. We connect mindful homeowners and interior designers with Vietnam’s historic artisan craft villages—communities that have cultivated sustainable materials for over a millennium.\n\n### Ancestral Vietnamese Craft Heritage\n\nFrom the ancient ceramic kilns of Bát Tràng along the Red River to the natural smoked bamboo weavers of Phú Vinh and the mulberry silk looms of Mã Châu, Vietnamese craftsmanship is inherently sustainable. It relies on natural drying, sun-bleaching, plant dyes, and hand carving rather than chemical synthetics and industrial mass production.\n\n### Our Mission & Curatorial Standards\n\nVietCraft exists to honor this cultural lineage while helping you curate tranquil living spaces that breathe serenity. Every product highlighted in our catalog is vetted for:\n\n* **Authentic Material Integrity:** Pure bamboo, seasoned acacia, terracotta, unbleached river seagrass, or hand-loomed silk.\n* **Ethical Production:** Direct collaboration with artisan collectives or certified fair-trade workshops.\n* **Timeless Aesthetics:** Organic silhouettes that complement contemporary wabi-sabi, Japandi, and organic modern interiors.\n\n### Environmental Reverence\n\nFast home decor depletes forests and fills landfills. By celebrating long-lasting, renewable natural decor pieces that age with character and develop a rich patina over decades, we champion a deliberate, slow approach to furnishing our homes.`,
        featuredImage: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=80',
        seoTitle: 'About VietCraft | Vietnamese Craftsmanship & Natural Home Decor',
        seoDescription: 'Discover the story behind VietCraft. We connect mindful US homeowners with ancient Vietnamese artisan traditions and sustainable home decor.',
        ogImage: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=80',
        status: 'published',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Affiliate Disclosure',
        slug: 'affiliate-disclosure',
        content: `## FTC Compliance & Affiliate Disclosure\n\nVietCraft is a reader-supported publication and product discovery platform dedicated to natural home decor and Vietnamese craftsmanship. In compliance with the Federal Trade Commission (FTC) guidelines, please understand the following regarding links and recommendations on this website.\n\n### Amazon Associates Program Participation\n\nVietCraft is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for websites to earn advertising fees and commissions by advertising and linking to Amazon.com. As an Amazon Associate, VietCraft earns from qualifying purchases.\n\n### What This Means For You\n\nWhen you click an affiliate product link on VietCraft and make a purchase on Amazon, we may earn a small referral commission. **This occurs at absolutely no additional cost to you.** The purchase price is identical whether you use our link or navigate to Amazon directly.\n\n### Uncompromising Editorial Independence\n\nOur recommendations are guided strictly by aesthetic merit, material quality, and artisanal authenticity. We never accept payment for biased 5-star reviews or guaranteed endorsements. Our editorial team selects and features decor objects that uphold the ethos of sustainable Vietnamese craftsmanship regardless of affiliate fee tiers.\n\n### Pricing & Availability Notice\n\nProduct prices, promotions, and availability on Amazon are subject to change without notice. The price and availability displayed on Amazon.com at the time of checkout will govern your purchase.`,
        featuredImage: '',
        seoTitle: 'Affiliate Disclosure | VietCraft Amazon Associates Policy',
        seoDescription: 'Read the VietCraft FTC affiliate disclosure and Amazon Associates compliance statement regarding product links and editorial independence.',
        status: 'published',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: `## VietCraft Privacy Policy\n\n**Effective Date:** January 1, 2026\n\nVietCraft respects your privacy and is dedicated to protecting any personal information you share with us while exploring our natural home decor journal and product discovery platform.\n\n### Information We Collect\n\n* **Voluntary Information:** When you subscribe to our newsletter or submit a contact inquiry, we collect your email address, name, and message content.\n* **Outbound Click Data:** When you click an affiliate product link, we record an anonymized click timestamp and ASIN identifier to monitor reader interest.\n* **Standard Log & Analytics Data:** Standard browser information (user agent, IP address, device type, referring URLs) collected anonymously through Google Analytics when enabled.\n\n### How We Use Information\n\n* To deliver our weekly artisanal newsletter to subscribed readers.\n* To respond to customer inquiries and artisan partnership inquiries.\n* To improve website navigation and editorial relevance.\n* We **never sell, rent, or trade** your personal contact details to third parties.\n\n### Cookies and External Services\n\nVietCraft uses functional cookies to remember UI preferences. Amazon.com utilizes cookies to attribute affiliate referral purchases according to their standard privacy policies.\n\n### Contact Us\n\nIf you have any questions regarding this Privacy Policy, please contact us at hello@vietcraft.com.`,
        featuredImage: '',
        seoTitle: 'Privacy Policy | VietCraft',
        seoDescription: 'VietCraft privacy policy explaining how we collect, protect, and respect your personal information.',
        status: 'published',
        publishedAt: new Date().toISOString()
      },
      {
        title: 'Terms of Service',
        slug: 'terms',
        content: `## VietCraft Terms of Service\n\n**Last Updated:** January 1, 2026\n\nWelcome to VietCraft. By accessing or using our website, you agree to be bound by these Terms of Service.\n\n### 1. Website Purpose & Informational Role\n\nVietCraft is a content publication and affiliate discovery portal. We curate and showcase authentic Vietnamese craftsmanship and natural home decor products sold by third-party retailers including Amazon.com. VietCraft is not the seller of record for featured physical products.\n\n### 2. Intellectual Property\n\nAll editorial articles, original photography, site designs, illustrations, and logos on VietCraft are the property of VietCraft and protected by applicable copyright laws. You may quote short excerpts with explicit attribution and backlink to the original article.\n\n### 3. Outbound Links & Third-Party Merchants\n\nVietCraft contains links to third-party merchant platforms. We are not responsible for inspecting, evaluating, or warranting the offerings of these independent sellers or the content of their websites.\n\n### 4. Limitation of Liability\n\nIn no event shall VietCraft or its operators be liable for any direct, indirect, incidental, or consequential damages arising from the use of our website or reliance on information presented herein.\n\n### 5. Governing Law\n\nThese terms shall be governed by and construed in accordance with the laws of the United States. For any inquiries, reach us at hello@vietcraft.com.`,
        featuredImage: '',
        seoTitle: 'Terms of Service | VietCraft',
        seoDescription: 'Review the terms and conditions governing the use of VietCraft home decor publication and discovery service.',
        status: 'published',
        publishedAt: new Date().toISOString()
      }
    ]);
    console.log('✅ Created 4 core CMS pages (About, Disclosure, Privacy, Terms)');

    // 8. Seed Newsletter Subscribers
    console.log('📬 Adding initial newsletter subscribers...');
    await Newsletter.insertMany([
      { email: 'sarah.home@example.com', status: 'subscribed', source: 'homepage' },
      { email: 'james.decor@example.com', status: 'subscribed', source: 'article_cta' },
      { email: 'clara.mindful@example.com', status: 'subscribed', source: 'homepage' }
    ]);
    console.log('✅ Added newsletter subscribers');

    console.log('\n✨ Database seeding completed successfully! ✨');
    console.log('----------------------------------------------------');
    console.log(`Admin Login Email: ${adminUser.email}`);
    console.log(`Admin Password:    ${ENV.INITIAL_ADMIN_PASSWORD}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// Run directly when script is executed
seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal seed error:', err);
    process.exit(1);
  });

