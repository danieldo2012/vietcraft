import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { Post } from '@vietcraft/shared';

interface ArticleCardProps {
  article: Post;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const materialName =
    typeof article.material === 'object' && article.material !== null
      ? (article.material as any).name
      : null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-lotus-sand/40 overflow-hidden hover:border-lotus-sand hover:shadow-lg transition-all duration-300">
      <Link to={`/articles/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-lotus-sand/20">
        <img
          src={article.featuredImage}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {materialName && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-lotus-ivory/95 backdrop-blur-sm border border-lotus-sand/60 text-[11px] font-medium text-lotus-forest">
            {materialName}
          </span>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center gap-3 text-xs text-lotus-charcoal/50 mb-2.5">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && <span className="w-1 h-1 rounded-full bg-lotus-sand" />}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-lotus-clay" />
              {article.readingTime || 5} min read
            </span>
          </div>

          <Link to={`/articles/${article.slug}`}>
            <h3 className="font-serif text-xl font-bold text-lotus-charcoal group-hover:text-lotus-forest transition-colors leading-snug">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-lotus-charcoal/70 line-clamp-2 mt-2 leading-relaxed font-light">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-5 mt-4 border-t border-lotus-sand/20 flex items-center justify-between">
          <span className="text-xs text-lotus-forest font-medium">By {article.author?.name || 'VietCraft'}</span>
          <Link
            to={`/articles/${article.slug}`}
            className="text-xs font-semibold text-lotus-clay group-hover:text-lotus-clay-dark flex items-center gap-1"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};
