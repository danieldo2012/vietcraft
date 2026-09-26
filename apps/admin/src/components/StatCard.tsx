import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  color?: 'forest' | 'clay' | 'sand' | 'blue';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'forest'
}) => {
  const colorStyles = {
    forest: 'bg-lotus-forest/10 text-lotus-forest',
    clay: 'bg-lotus-clay/10 text-lotus-clay',
    sand: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-50 text-blue-700'
  };

  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorStyles[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
