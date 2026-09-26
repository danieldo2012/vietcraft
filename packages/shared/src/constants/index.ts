export const MATERIALS = [
  {
    name: 'Rattan & Bamboo',
    slug: 'rattan-bamboo',
    shortDescription: 'Flexible, sustainable, and handcrafted from renewable fast-growing stalks of Vietnam’s northern provinces.',
    description: 'Rattan and bamboo have defined Vietnamese vernacular architecture and daily household craft for over a millennium. Sourced from the lush river valleys of Phú Vinh and Chuông villages, each shoot is carefully cured through smoking and sun-bleaching before master artisans weave intricate patterns that blend organic texture with enduring strength.',
    craftingTechniques: ['Hand-splitting', 'Natural smoking & curing', 'Radial frame weaving', 'Beeswax sealing'],
    originRegions: ['Phú Vinh (Chương Mỹ, Hanoi)', 'Xuân Lai (Bắc Ninh)']
  },
  {
    name: 'Ceramics',
    slug: 'ceramics',
    shortDescription: 'Kiln-fired earthenware and stoneware finished with ancestral wood-ash and river-silt glazes.',
    description: 'Dating back to the Lý and Trần dynasties of the 10th-14th centuries, Vietnamese ceramics embody the elemental harmony of Red River white clay, pure spring water, and high-temperature wood firings. From Bát Tràng to Phù Lãng, each vessel carries the subtle variations of hand-thrown wheel work and natural earth pigment glazes.',
    craftingTechniques: ['Wheel throwing', 'Natural crackle glazing', 'Reduction wood firing', 'Hand carving'],
    originRegions: ['Bát Tràng (Gia Lâm, Hanoi)', 'Phù Lãng (Quế Võ, Bắc Ninh)', 'Lái Thiêu (Bình Dương)']
  },
  {
    name: 'Lacquer',
    slug: 'lacquer',
    shortDescription: 'Deep, luminous layers of natural resin harvested from Vietnamese lacquer trees (Sơn Phú Thọ).',
    description: 'Sơn Ta—indigenous Vietnamese natural lacquer—is derived from the sap of Toxicodendron succedaneum trees cultivated in Phú Thọ hills. Unlike synthetic finishes, authentic lacquer requires up to twenty painstakingly applied coats, each cured in high humidity and polished under running water with charcoal and eggshell inlay to reveal profound depth and glass-like luster.',
    craftingTechniques: ['Multi-coat sap application', 'Mother-of-pearl inlay', 'Charcoal water-polishing', 'Eggshell mosaic'],
    originRegions: ['Hạ Thái (Thường Tín, Hanoi)', 'Bình Đức (Bình Dương)']
  },
  {
    name: 'Wood',
    slug: 'wood',
    shortDescription: 'Reclaimed teak, jackfruit wood, and sustainably managed acacia sculpted into timeless organic silhouettes.',
    description: 'Vietnamese woodworking honors the natural grain, knots, and organic contours of mature timber. From traditional mortise-and-tenon joinery practiced without metal nails to fluid, sculptural turning, artisans transform resilient hardwoods into tactile vessels, pedestal bowls, and sculptural furniture finished solely with natural nut oils.',
    craftingTechniques: ['Mortise & tenon joinery', 'Lathe turning', 'Live-edge surfacing', 'Cold-pressed tung oil burnishing'],
    originRegions: ['Đồng Kỵ (Bắc Ninh)', 'Chàng Sơn (Thạch Thất, Hanoi)', 'Kim Bồng (Hội An, Quảng Nam)']
  },
  {
    name: 'Woven Fibers',
    slug: 'woven-fibers',
    shortDescription: 'Water hyacinth, seagrass, and jute harvested from the Mekong Delta and coastal salt marshes.',
    description: 'Along the serpentine waterways of the Mekong Delta and coastal Kim Sơn, resilient aquatic fibers are harvested, washed, and dried beneath the tropical sun. Women’s weaving cooperatives spin these supple strands into durable, tactile floor rugs, nested storage bins, and sculptural wall hangings that infuse modern interiors with earthy warmth.',
    craftingTechniques: ['Sun-drying', 'Braided rope twisting', 'Coil stitching', 'Open-lattice looping'],
    originRegions: ['Kim Sơn (Ninh Bình)', 'Đồng Tháp (Mekong Delta)', 'Bến Tre (Mekong Delta)']
  },
  {
    name: 'Silk',
    slug: 'silk',
    shortDescription: 'Wild tussah and mulberry silk spun on wooden handlooms with natural plant botanical dyes.',
    description: 'From the banks of the Nhuệ River in Vạn Phúc to the ancient riverside looms of Mã Châu in Hội An, Vietnamese silk weaving is an art of delicate touch and luminous reflection. Silkworms nurtured on fresh mulberry leaves yield fine, breathable threads that take vibrant tints from indigo leaves, yam roots, and gardenia pods.',
    craftingTechniques: ['Mulberry reeling', 'Wooden frame shuttle weaving', 'Botanical vat dyeing', 'Jacquard loom patterning'],
    originRegions: ['Vạn Phúc (Hà Đông, Hanoi)', 'Mã Châu (Duy Xuyên, Quảng Nam)', 'Bảo Lộc (Lâm Đồng)']
  }
] as const;

export const CATEGORIES = [
  { name: 'Lighting', slug: 'lighting', description: 'Pendant lamps, table lamps, and woven lanterns casting warm organic light.' },
  { name: 'Baskets', slug: 'baskets', description: 'Storage vessels, laundry hampers, and market totes woven from natural reeds.' },
  { name: 'Wall Decor', slug: 'wall-decor', description: 'Woven fans, lacquer panels, carved wood reliefs, and woven fiber discs.' },
  { name: 'Vases', slug: 'vases', description: 'Ceramic vessels, stoneware urns, and minimalist terracotta styling objects.' },
  { name: 'Furniture', slug: 'furniture', description: 'Accent chairs, side tables, coffee tables, and benches in rattan, bamboo, and wood.' },
  { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Wood serving boards, ceramic tableware, lacquer trays, and woven placemats.' },
  { name: 'Textiles', slug: 'textiles', description: 'Handloom silk cushions, linen throws, and natural dyed woven runners.' },
  { name: 'Decorative Objects', slug: 'decorative-objects', description: 'Sculptural stone, wood pedestals, lacquer boxes, and curated accents.' }
] as const;

export const DESIGN_COLORS = {
  warmIvory: '#F7F4EE',
  deepForest: '#26382E',
  naturalSand: '#D8C6A8',
  clay: '#A76D52',
  charcoal: '#252525',
  white: '#FFFFFF'
} as const;

export const AFFILIATE_DISCLOSURE = {
  short: 'VietCraft is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.',
  full: 'VietCraft is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. As an Amazon Associate, we earn from qualifying purchases.\n\nAll prices and availability displayed on VietCraft are accurate as of the last timestamp indicated and are subject to change. Any price and availability information displayed on Amazon.com at the time of purchase will govern the purchase of this product. We never accept payment for biased positive reviews.'
};

export const SITE_DEFAULTS = {
  siteName: 'VietCraft',
  brandTagline: 'Natural Home Decor Inspired by Vietnamese Craftsmanship',
  brandDescription: 'VietCraft curates timeless home decor crafted from renewable natural materials—rattan, ceramics, lacquer, wood, woven fibers, and silk. Discover authentic Vietnamese artisanal traditions tailored for the modern, mindful home.',
  contactEmail: 'contact@vietcraft.com',
  socialLinks: {
    instagram: 'https://instagram.com/vietcrafthome',
    pinterest: 'https://pinterest.com/vietcrafthome',
    facebook: 'https://facebook.com/vietcrafthome',
    twitter: 'https://twitter.com/vietcraft'
  }
};
