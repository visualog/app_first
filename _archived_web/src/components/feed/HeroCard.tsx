import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LottoBall } from "@/components/shared/LottoBall";
import { LottoHistory } from '@/types';

interface HeroCardProps {
    data: LottoHistory;
    onClick: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ data, onClick }) => {
    return (
        <Card
            className="w-full min-h-[520px] md:aspect-[4/5] relative overflow-hidden cursor-pointer group border-0 shadow-xl flex flex-col"
            onClick={onClick}
        >
            {/* Background Gradient & Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay" />

            <CardHeader className="relative z-10 flex flex-row justify-between items-start pt-6 px-6 shrink-0">
                <div className="flex flex-col gap-2">
                    <Badge variant="secondary" className="w-fit bg-yellow-400 text-yellow-900 hover:bg-yellow-500 font-bold px-3 py-1 text-sm">
                        최신 회차
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">
                        {data.회차}회
                    </h1>
                    <p className="text-purple-200 text-lg font-medium tracking-wide">
                        {data.추첨일}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 flex flex-col justify-end flex-1 p-6 gap-6">
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-purple-300 uppercase tracking-widest">당첨 번호</p>
                    <div className="grid grid-cols-6 gap-1 md:gap-3 w-full">
                        {[...Array(6)].map((_, i) => (
                            <LottoBall
                                key={i}
                                number={data[`번호${i + 1}` as keyof LottoHistory] as number}
                                size="lg"
                                className="w-full h-auto aspect-square text-xl md:text-3xl font-black"
                            />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-semibold text-purple-300 uppercase tracking-widest">보너스 번호</p>
                    <div className="flex items-center gap-3">
                        <LottoBall
                            number={data['보너스']}
                            size="lg"
                            isBonus={true}
                            className="w-14 h-14 text-xl md:w-20 md:h-20 md:text-3xl font-black"
                        />
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md">
                        상세 보기 <i className="fa-solid fa-arrow-right ml-2"></i>
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};
