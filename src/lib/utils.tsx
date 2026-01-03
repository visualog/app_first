import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const highlightNumbers = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  const regex = /(\d+(?:[:~.]\d+)*)/g;
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} className="font-bold text-foreground">{part}</span> : part
  );
};

export const formatNumberToKorean = (num: number): string => {
  if (num === 0) return '0';
  const absNum = Math.abs(num);
  let result = '';
  if (absNum >= 100000000) {
    result = `${(absNum / 100000000).toFixed(1)}억`;
  } else if (absNum >= 10000) {
    result = `${(absNum / 10000).toFixed(0)}만`;
  } else {
    result = absNum.toString();
  }
  return num < 0 ? `-${result}` : result;
};

export const formatNumberWithCommas = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') {
    return '';
  }
  const number = Number(num);
  if (isNaN(number)) {
    return String(num); // Return original if not a valid number
  }
  return number.toLocaleString('ko-KR'); // Format with locale-specific commas
};