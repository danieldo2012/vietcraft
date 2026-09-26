import React from 'react';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AffiliateNotice: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-lotus-sand/20 border border-lotus-sand/40 text-xs text-lotus-charcoal/75">
        <Info className="w-4 h-4 text-lotus-clay flex-shrink-0" />
        <span>
          VietCraft is reader-supported. We may earn an affiliate commission when you buy through links on our site.{' '}
          <Link to="/affiliate-disclosure" className="text-lotus-forest font-semibold underline ml-1">
            Learn more
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-lotus-sand/50 shadow-sm space-y-2">
      <div className="flex items-center gap-2 text-lotus-forest font-serif font-bold text-base">
        <Info className="w-5 h-5 text-lotus-clay" />
        <span>Affiliate & Pricing Transparency</span>
      </div>
      <p className="text-xs text-lotus-charcoal/80 leading-relaxed">
        VietCraft curates artisanal, natural home decor. We participate in the Amazon Services LLC Associates Program.
        When you purchase items through our links, we may earn an advertising fee without any extra cost to you.
        We do not invent prices or ratings; all pricing and availability are determined directly by Amazon at the moment of checkout.
      </p>
      <Link to="/affiliate-disclosure" className="inline-block text-xs font-semibold text-lotus-clay hover:underline">
        Read our full FTC & Amazon compliance disclosure →
      </Link>
    </div>
  );
};
