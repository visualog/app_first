import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LottoBall, SparklineGraph } from '@/components/shared';
import { LottoHistory, PrizeCardData } from '@/types';
import { formatNumberToKorean, formatNumberWithCommas } from '@/lib/utils';

const PrizeInfoCard: React.FC<{ data: PrizeCardData }> = ({ data }) => {
  const { title, value, comparisonText, comparisonValue, graphData, isTextOnly } = data;
  const isUp = comparisonValue && comparisonValue > 0;
  const isDown = comparisonValue && comparisonValue < 0;
  return (
    <Card className="p-4 flex-none w-[66%] min-[375px]:w-[40%] md:w-auto snap-center flex flex-col justify-between gap-y-4">
      <div className="flex flex-col gap-2">
        <CardDescription>{title}</CardDescription>
        <p className="text-2xl font-semibold leading-none tracking-tight"><strong>{value}</strong></p>
        <div className="flex items-center text-sm">
          {comparisonText && (
            <span className={`${isUp ? 'text-green-500' : isDown ? 'text-red-500' : 'text-muted-foreground'} flex items-center`}>
              {isUp && <i className="fas fa-caret-up mr-1"></i>}
              {isDown && <i className="fas fa-caret-down mr-1"></i>}
              {comparisonText}
            </span>
          )}
        </div>
      </div>
      {!isTextOnly && graphData && graphData.length > 0 && <SparklineGraph data={graphData} />}
    </Card>
  );
};

const PrizeInfoCardSlider: React.FC<{ lottoHistory: LottoHistory[]; currentRoundIndex: number }> = ({ lottoHistory, currentRoundIndex }) => {
  const latestData = lottoHistory[currentRoundIndex];
  const previousData = lottoHistory[currentRoundIndex + 1];

  const getComparison = (current: number, previous: number) => {
    if (!previous) return { comparisonText: '', comparisonValue: 0 };
    const diff = current - previous;
    const formattedDiff = formatNumberToKorean(diff);
    return { comparisonText: `${diff > 0 ? '+' : ''}${formattedDiff}`, comparisonValue: diff };
  };

  const getGraphData = (key: keyof LottoHistory | '1인당_당첨금' | '번호_합계', numRounds: number = 5): number[] => {
    return lottoHistory.slice(currentRoundIndex, currentRoundIndex + numRounds)
      .map(round => {
        if (key === '1인당_당첨금') return round['1등_총당첨금'] / round['1등_당첨인원'];
        if (key === '번호_합계') return [1, 2, 3, 4, 5, 6].reduce((sum, i) => sum + (round[`번호${i}` as keyof LottoHistory] as number || 0), 0);
        return round[key] as number;
      }).reverse();
  };

  const cardsData: PrizeCardData[] = [
    { title: "1등 총 당첨금액", value: `${formatNumberToKorean(latestData['1등_총당첨금'])}원`, ...getComparison(latestData['1등_총당첨금'], previousData ? previousData['1등_총당첨금'] : 0), graphData: getGraphData('1등_총당첨금') },
    { title: "1등 당첨 인원", value: `${formatNumberWithCommas(latestData['1등_당첨인원'])}명`, ...getComparison(latestData['1등_당첨인원'], previousData ? previousData['1등_당첨인원'] : 0), graphData: getGraphData('1등_당첨인원') },
    { title: "1인당 1등 당첨금", value: `${formatNumberToKorean(latestData['1등_총당첨금'] / latestData['1등_당첨인원'])}원`, ...getComparison(latestData['1등_총당첨금'] / latestData['1등_당첨인원'], previousData ? (previousData['1등_총당첨금'] / previousData['1등_당첨인원']) : 0), graphData: getGraphData('1인당_당첨금') },
    { title: "1등 번호 합계", value: `${formatNumberWithCommas([1, 2, 3, 4, 5, 6].reduce((sum, i) => sum + (latestData[`번호${i}` as keyof LottoHistory] as number || 0), 0))}`, ...getComparison([1, 2, 3, 4, 5, 6].reduce((sum, i) => sum + (latestData[`번호${i}` as keyof LottoHistory] as number || 0), 0), previousData ? [1, 2, 3, 4, 5, 6].reduce((sum, i) => sum + (previousData[`번호${i}` as keyof LottoHistory] as number || 0), 0) : 0), graphData: getGraphData('번호_합계') },
  ];

  return <div className="flex flex-col gap-2">
    <h3 className="text-xl font-bold hidden">당첨 정보</h3>
    {/* Prize Info Cards - Split Layout based on Breakpoint to ensure Viewport Behavior */}

    {/* Mobile View: Horizontal Scroll (Flex) - Full Bleed with -mx-4 */}
    <div id="prize-card-slider-mobile" className="flex md:hidden overflow-x-auto pb-4 gap-4 px-4 -mx-4 snap-x snap-mandatory hide-scrollbar">
      {cardsData.map((data, index) => (
        <PrizeInfoCard
          key={`mobile-${index}`}
          data={data}
        />
      ))}
    </div>

    {/* Desktop View: Grid Layout (Hidden on Mobile) */}
    <div id="prize-card-slider-desktop" className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 px-4">
      {cardsData.map((data, index) => (
        <PrizeInfoCard
          key={`desktop-${index}`}
          data={data}
        />
      ))}
    </div>
  </div>

};

export const HomeTab: React.FC<{ lottoHistory: LottoHistory[] }> = ({ lottoHistory }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  if (lottoHistory.length === 0) return <div className="text-center p-10">데이터를 불러오는 중입니다...</div>;
  const latestData = lottoHistory[currentRoundIndex];
  const totalRounds = lottoHistory.length;

  return (
    <>
      <div className="flex items-center justify-between lg:hidden">
        <h1 className="text-4xl font-bold">홈</h1>
        <div className="p-1 bg-slate-400 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" className="object-contain" />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:gap-8">
        <div className="flex flex-col gap-4">
          <Card className="col-span-2 flex flex-col gap-8 lg:p-8">
            <div className="flex items-center justify-around">
              <Button variant="ghost" size="icon" onClick={() => setCurrentRoundIndex(i => Math.min(i + 1, totalRounds - 1))} disabled={currentRoundIndex >= totalRounds - 1}>
                <i className="fa-solid fa-chevron-left"></i>
              </Button>
              <div className="text-center">
                <h4 className="text-xl font-semibold text-foreground">{latestData['회차']}회</h4>
                <p className="text-sm text-muted-foreground">{latestData['추첨일']}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCurrentRoundIndex(i => Math.max(i - 1, 0))} disabled={currentRoundIndex <= 0}>
                <i className="fa-solid fa-chevron-right"></i>
              </Button>
            </div>
            <CardContent className="flex flex-wrap justify-center items-center gap-2">
              {[...Array(6)].map((_, i) => (<LottoBall key={i} number={latestData[`번호${i + 1}` as keyof LottoHistory] as number} size="lg" className="w-12 h-12 text-xl lg:w-16 lg:h-16 lg:text-3xl" />))}
              <div className="flex items-center gap-1 lg:gap-2">
                <i className="fa-solid fa-plus text-xl font-bold text-slate-300 lg:text-2xl"></i>
                <LottoBall number={latestData['보너스']} size="lg" isBonus={true} className="w-12 h-12 text-xl lg:w-16 lg:h-16 lg:text-3xl" />
              </div>
            </CardContent>
          </Card>
        </div>
        <PrizeInfoCardSlider lottoHistory={lottoHistory} currentRoundIndex={currentRoundIndex} />
      </div>
    </>
  );
};
