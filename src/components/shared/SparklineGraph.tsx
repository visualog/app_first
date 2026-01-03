import React from 'react';

export const SparklineGraph: React.FC<{ data: number[] }> = ({ data }) => {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  return (
    <div className="flex items-end h-8 gap-1">
      {data.map((val, index) => {
        const height = maxVal === 0 ? 0 : ((val - minVal + 1) / (maxVal - minVal + 1)) * 100;
        return <div key={index} className={`w-2 rounded-t-sm ${index === data.length - 1 ? 'bg-primary' : 'bg-muted-foreground/30'}`} style={{ height: `${height < 10 ? 10 : height}%` }} />;
      })}
    </div>
  );
};
