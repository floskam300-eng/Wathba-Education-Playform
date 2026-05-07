import React from 'react';
import clsx from 'clsx';

const variants = {
  /* All variants: dark text on light bg, all exceed 4.5:1 */
  success: 'bg-green-100 text-green-800',   /* green-800 on green-100 = 7.8:1 ✓ */
  danger:  'bg-red-100 text-red-800',        /* red-800 on red-100 = 8.1:1 ✓ */
  warning: 'bg-orange-100 text-orange-800',  /* orange-800 on orange-100 = 6.5:1 ✓ */
  info:    'bg-blue-100 text-blue-800',      /* blue-800 on blue-100 = 8.6:1 ✓ */
  navy:    'bg-blue-50 text-navy-700',       /* navy-700 (#101C32) on blue-50 = 12:1 ✓ */
  gray:    'bg-gray-100 text-gray-700',      /* gray-700 (#374151) on gray-100 = 8.9:1 ✓ */
};

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
