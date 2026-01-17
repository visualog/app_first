import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LottoBall } from '@/components/shared';
import { LottoHistory, AnalysisData, Insight } from '@/types';
import { highlightNumbers } from '@/lib/utils'; // Assuming this is moved to utils

export const AnalysisTab: React.FC<{ lottoHistory: LottoHistory[] }> = ({ lottoHistory }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);

  const handleAnalyze = () => {
    if (lottoHistory.length === 0) return;
    setAnalyzing(true);
    const numberCounts: { [key: number]: number } = {};
    for (let i = 1; i <= 45; i++) numberCounts[i] = 0;
    lottoHistory.forEach(row => { for (let i = 1; i <= 6; i++) { const num = row[`번호${i}` as keyof LottoHistory] as number; if (num) numberCounts[num]++; } });
    const sortedNumbers = Object.entries(numberCounts).sort(([, countA], [, countB]) => countA - countB);
    const coldNumbers = sortedNumbers.slice(0, 6).map(([num, count]) => ({ number: Number(num), count }));
    const hotNumbers = sortedNumbers.slice(-6).reverse().map(([num, count]) => ({ number: Number(num), count }));
    const insights: Insight[] = [
        {title: "번호 합계 구간", bullets: ["최근 10주간 번호 합이 130-160 사이에서 자주 출현했습니다.", "다음 회차에서도 비슷한 구간을 노려보는 것이 좋습니다."], tag: "130 ~ 160"},
        {title: "홀짝 비율", bullets: ["최근 홀수와 짝수의 비율은 3:3 또는 4:2가 가장 많았습니다.", "극단적인 비율은 피하는 것이 현명합니다."], tag: "3:3 or 4:2"},
        {title: "연속 번호 패턴", bullets: ["연속 번호 출현 빈도가 감소하는 추세입니다.", "한 쌍 정도의 연속 번호는 고려해볼 만합니다."], tag: "1-2 쌍"},
    ];
    setTimeout(() => { setData({ hotNumbers, coldNumbers, insights }); setAnalyzing(false); }, 1500);
  };

  return (
    <>
      <h2 className="text-2xl font-bold">데이터 분석</h2>
      <Card>
        <div className="flex flex-col gap-4">
            <CardHeader>
                <CardTitle>전체 회차 데이터 분석</CardTitle>
                <CardDescription>{`총 ${lottoHistory.length}회차의 데이터를 기반으로 번호 출현 빈도를 분석합니다.`}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleAnalyze} disabled={analyzing || lottoHistory.length === 0} className="w-full" size="xl">
                    {analyzing ? <><i className="fas fa-sync fa-spin mr-2"></i> 분석중...</> : '분석 실행하기'}
                </Button>
            </CardContent>
        </div>
      </Card>
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <Card><div className="flex flex-col gap-2"><CardHeader><CardTitle>최다 출현 (HOT)</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{data.hotNumbers.map((n, i) => <LottoBall key={i} number={n.number} size="sm" />)}</CardContent></div></Card>
              <Card><div className="flex flex-col gap-2"><CardHeader><CardTitle>미출현 (COLD)</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{data.coldNumbers.map((n, i) => <LottoBall key={i} number={n.number} size="sm" />)}</CardContent></div></Card>
          </div>
          <Card>
            <div className="flex flex-col gap-4">
                <CardHeader><CardTitle>AI 핵심 인사이트 (예시)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {data.insights.map((insight, idx) => (
                        <div key={idx} className="p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center mb-2"><h4 className="font-bold">{insight.title}</h4><Badge variant="secondary">{insight.tag}</Badge></div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{insight.bullets?.map((bullet, i) => <li key={i}>{highlightNumbers(bullet)}</li>)}</ul>
                        </div>
                    ))}
                </CardContent>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};
