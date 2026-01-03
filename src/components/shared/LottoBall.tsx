import React from 'react';

// --- Shared Components ---
export const LottoBall: React.FC<{ number: number; size?: 'sm' | 'md' | 'lg'; isBonus?: boolean }> = ({ number, size = 'md', isBonus = false }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };
  const getColorClass = (n: number, bonus: boolean) => {
    if (bonus) return 'bg-purple-300 text-purple-900';
    if (n <= 10) return 'bg-yellow-200 text-yellow-800';
    if (n <= 20) return 'bg-blue-200 text-blue-800';
    if (n <= 30) return 'bg-rose-200 text-rose-800';
    if (n <= 40) return 'bg-gray-200 text-gray-800';
    return 'bg-emerald-200 text-emerald-800';
  };
  return <div className={`${sizes[size]} ${getColorClass(number, isBonus)} font-bold rounded-full flex items-center justify-center`}>{number}</div>;
};
