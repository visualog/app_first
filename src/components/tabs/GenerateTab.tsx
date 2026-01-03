import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LottoBall } from '@/components/shared';
import { LottoHistory, GeneratedSet } from '@/types';

export const GenerateTab: React.FC<{ onSave: (set: GeneratedSet) => void, lottoHistory: LottoHistory[] }> = ({ onSave, lottoHistory }) => {
  const [generated, setGenerated] = useState<GeneratedSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [minSum, setMinSum] = useState<number>(100);
  const [maxSum, setMaxSum] = useState<number>(170);

  const checkPastMatch = (nums: number[]): number | null => {
      const sortedTarget = [...nums].sort((a, b) => a - b).join(',');
      for (const past of lottoHistory) {
          const pastNumbers = [past['번호1'], past['번호2'], past['번호3'], past['번호4'], past['번호5'], past['번호6']];
          const sortedPast = [...pastNumbers].sort((a, b) => a - b).join(',');
          if (sortedTarget === sortedPast) return past['회차'];
      }
      return null;
  };

  const handleGenerate = async (mode: 'random' | 'ai' | 'sum') => {
    setIsGenerating(true); setGenerated([]); await new Promise(r => setTimeout(r, 1000));
    let newSets: GeneratedSet[] = [];

    if (mode === 'sum') {
        const maxAttempts = 10000;
        let attempts = 0;
        while(newSets.length < 3 && attempts < maxAttempts) {
            const nums = new Set<number>();
            while(nums.size < 6) {
                nums.add(Math.floor(Math.random() * 45) + 1);
            }
            const sorted = Array.from(nums).sort((a,b) => a-b);
            const s = sorted.reduce((a, b) => a + b, 0);
            if (s >= minSum && s <= maxSum) {
                newSets.push({ id: `${mode}-${Date.now()}-${newSets.length}`, numbers: sorted, reason: `합계(${minSum}~${maxSum}) 조합`, sum: s, matchRound: checkPastMatch(sorted) });
            }
            attempts++;
        }
    } else {
        Array.from({length: 3}, (_, i) => {
            const nums = new Set<number>();
            while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
            const sorted = Array.from(nums).sort((a,b) => a-b);
            const s = sorted.reduce((a, b) => a + b, 0);
            newSets.push({ id: `${mode}-${Date.now()}-${i}`, numbers: sorted, reason: `${mode === 'ai' ? 'AI' : '랜덤'} 조합`, sum: s, matchRound: checkPastMatch(sorted) });
        });
    }

    setGenerated(newSets); setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold">번호 생성</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" size="lg" onClick={() => handleGenerate('random')}>랜덤 생성</Button>
        <Button variant="outline" size="lg" onClick={() => handleGenerate('ai')}>AI 추천</Button>
      </div>
      <Card>
        <div className="flex flex-col gap-4">
            <CardHeader><CardTitle>합계 구간 설정</CardTitle><CardDescription>원하는 합계 범위를 직접 지정하여 생성합니다.</CardDescription></CardHeader>
            <CardContent className="flex items-center gap-4"><Input type="number" value={minSum} onChange={e => setMinSum(Number(e.target.value))} placeholder="최소값" /><span className="text-muted-foreground">-</span><Input type="number" value={maxSum} onChange={e => setMaxSum(Number(e.target.value))} placeholder="최대값" /></CardContent>
            <CardFooter><Button className="w-full" onClick={() => handleGenerate('sum')} size="xl">범위 내 번호 생성</Button></CardFooter>
        </div>
      </Card>
      {isGenerating && <div className="text-center p-10">생성중...</div>}
      <div className="space-y-4">
        {generated.map(set => (
          <Card key={set.id}>
            <div className="flex flex-col gap-4">
                <CardHeader><div className="flex justify-between items-center"><CardTitle className="text-base">{set.reason}</CardTitle>{set.matchRound ? (<Badge variant="destructive">기록 있음 ({set.matchRound}회)</Badge>) : (<Badge variant="secondary">새로운 조합</Badge>)}</div><CardDescription>합계: {set.sum}</CardDescription></CardHeader>
                <CardContent className="flex flex-wrap gap-2 justify-center">{set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}</CardContent>
                <CardFooter><Button variant="secondary" className="w-full" onClick={() => onSave(set)}>보관함에 저장</Button></CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
