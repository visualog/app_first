import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalysisCardProps {
    title: string;
    description: string;
    type: 'short-term' | 'mid-term' | 'long-term';
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, description, type }) => {
    const bgColors = {
        'short-term': 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100',
        'mid-term': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100',
        'long-term': 'bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100',
    };

    return (
        <Card className={`w-full border-none shadow-none ${bgColors[type]}`}>
            <CardHeader className="pt-6 px-6 pb-2">
                <p className="text-xs font-bold uppercase opacity-60 tracking-wider text-current">분석</p>
                <CardTitle className="text-lg md:text-xl font-bold text-current leading-tight">
                    {title}
                </CardTitle>
                <CardDescription className="text-current opacity-80 text-sm">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {/* Placeholder for Chart/Graph */}
                <div className="h-24 w-full bg-white/40 dark:bg-black/20 rounded-lg flex items-center justify-center border-2 border-dashed border-current/20">
                    <span className="text-xs font-medium opacity-60">차트 준비중</span>
                </div>
            </CardContent>
        </Card>
    );
};
