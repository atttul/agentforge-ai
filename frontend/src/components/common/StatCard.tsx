import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  change?: string;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  color = 'from-purple-600/20 to-blue-600/20 border-purple-500/30',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 shadow-lg backdrop-blur-md ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-100">{value}</h3>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
        <div className="rounded-lg bg-slate-800/80 p-3 text-purple-400 shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );
};
