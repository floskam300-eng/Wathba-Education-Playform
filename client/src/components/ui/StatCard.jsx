import React from 'react';
import clsx from 'clsx';

export default function StatCard({ icon: Icon, label, value, color = 'navy', sub }) {
  const colors = {
    navy: 'bg-navy-500 text-white',
    orange: 'bg-orange-500 text-white',
    green: 'bg-green-600 text-white',
    purple: 'bg-purple-600 text-white',
    red: 'bg-red-600 text-white',
    teal: 'bg-teal-600 text-white',
  };

  return (
    <div className="card flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-200">
      <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg', colors[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="min-w-0">
        {/* gray-600 (#4B5563) on white = 7.2:1 ✓ */}
        <p className="text-gray-600 text-sm font-semibold">{label}</p>
        {/* navy-600 (#152540) on white = 17:1 ✓ */}
        <p className="text-2xl font-black text-navy-600">{value}</p>
        {/* gray-600 on white = 7.2:1 ✓ */}
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
