import React from 'react';
import { cn } from "@/lib/utils";

// --- Shared Components ---
export const LottoBall: React.FC<{ number: number; size?: 'sm' | 'md' | 'lg'; isBonus?: boolean; className?: string }> = ({ number, size = 'md', isBonus = false, className }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };

  const getColorClass = (n: number, bonus: boolean) => {
    if (bonus) return 'text-purple-900'; // BG handled by SVG for bonus
    if (n <= 10) return 'bg-yellow-200 text-yellow-800';
    if (n <= 20) return 'bg-blue-200 text-blue-800';
    if (n <= 30) return 'bg-rose-200 text-rose-800';
    if (n <= 40) return 'bg-gray-200 text-gray-800';
    return 'bg-emerald-200 text-emerald-800';
  };

  if (isBonus) {
    const bunSizes = { sm: 'w-8 h-11 text-xs', md: 'w-10 h-14 text-base', lg: 'w-12 h-16 text-lg' };
    return (
      <div className={cn('relative flex items-center justify-center font-bold z-0', bunSizes[size], className)}>
        <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full text-purple-200 fill-current" style={{ zIndex: -1 }} preserveAspectRatio="none">
          {/* Stacked Pills Shape: Flat Top/Bottom, Rounded Sides */}
          <path d="M 25 15 L 75 15 C 95 15, 95 61, 80 65 C 95 69, 95 115, 75 115 L 25 115 C 5 115, 5 69, 20 65 C 5 61, 5 15, 25 15 Z" />
        </svg>
        <span className={cn(getColorClass(number, true), "z-10 relative")}>{number}</span>
      </div>
    );
  }

  return <div className={cn(sizes[size], getColorClass(number, false), 'font-bold rounded-full flex items-center justify-center', className)}>{number}</div>;
};
