import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LottoBall } from "@/components/shared/LottoBall";
import { LottoHistory } from '@/types';

interface StandardCardProps {
    data: LottoHistory;
    onClick: () => void;
}

export const StandardCard: React.FC<StandardCardProps> = ({ data, onClick }) => {
    return (
        <Card
            className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            <CardContent className="p-4 mobile-md:p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{data.회차}회</span>
                    </div>
                    <span className="text-xs mobile-lg:text-sm text-slate-400 font-normal">
                        {data.추첨일}
                    </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-y-3">
                    <div className="flex gap-1.5 mobile-md:gap-2 mobile-lg:gap-3">
                        {[...Array(6)].map((_, i) => (
                            <LottoBall
                                key={i}
                                number={data[`번호${i + 1}` as keyof LottoHistory] as number}
                                size="md"
                                className="w-10 h-10 text-base mobile-lg:w-11 mobile-lg:h-11 mobile-lg:text-lg transition-all"
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-400 font-medium hidden mobile-md:inline">보너스</span>
                        <LottoBall
                            number={data['보너스']}
                            size="md"
                            isBonus={true}
                            className="w-10 h-10 text-base mobile-lg:w-11 mobile-lg:h-11 mobile-lg:text-lg transition-all"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
