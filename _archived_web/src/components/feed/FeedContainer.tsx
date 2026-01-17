import React, { useState } from 'react';
import { HeroCard } from './HeroCard';
import { StandardCard } from './StandardCard';
import { AnalysisCard } from './AnalysisCard';
import { DetailView } from './DetailView';
import { LottoHistory } from '@/types';

interface FeedContainerProps {
    history: LottoHistory[];
    onCardClick: (item: LottoHistory) => void;
}

export const FeedContainer: React.FC<FeedContainerProps> = ({ history }) => {
    const [selectedDraw, setSelectedDraw] = useState<LottoHistory | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    if (!history || history.length === 0) return null;

    const latestDraw = history[0];
    const pastDraws = history.slice(1);

    const handleCardClick = (draw: LottoHistory) => {
        setSelectedDraw(draw);
        setIsDetailOpen(true);
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 p-5 pb-24">

            {/* Detail Modal */}
            <DetailView
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                data={selectedDraw}
            />

            {/* 1. Hero Section (Latest Draw) */}
            <section>
                <div className="mb-4 pl-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">오늘의 로또</h2>
                    <p className="text-slate-500 text-sm font-medium">{new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
                </div>
                <HeroCard data={latestDraw} onClick={() => handleCardClick(latestDraw)} />
            </section>

            {/* 2. Interleaved Feed (Analysis + Past Draws) */}
            <section className="flex flex-col gap-4">
                {/* Analysis: Short-term (2 Weeks) */}
                <AnalysisCard
                    type="short-term"
                    title="최근 당첨 추세 (2주)"
                    description="최근 번호 출현 빈도 및 홀짝 패턴 분석."
                />

                {pastDraws.map((draw, index) => {
                    const elements = [];

                    // Example Injection Logic: Insert Analysis every 5 items
                    if (index > 0 && index % 5 === 0) {
                        elements.push(
                            <AnalysisCard
                                key={`analysis-${index}`}
                                type={index % 10 === 0 ? 'long-term' : 'mid-term'}
                                title={index % 10 === 0 ? "연간 리포트" : "월간 하이라이트"}
                                description={index % 10 === 0 ? "올해 가장 큰 당첨금 기록 모음." : "이번 달 핫 & 콜드 번호 분석."}
                            />
                        );
                    }

                    elements.push(
                        <StandardCard
                            key={draw.회차}
                            data={draw}
                            onClick={() => handleCardClick(draw)}
                        />
                    );

                    return elements;
                })}
            </section>
        </div>
    );
};
