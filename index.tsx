
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import './index.css';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// --- Constants: Provided Historical Data Summary ---
const HISTORICAL_CONTEXT = `
Latest Rounds from User Data:
1203회 (2025-12-20): 10,13,22,25,32,45 + 보너스 16 [1등 총금액: 272억, 자동 10, 수동 4]
1202회 (2025-12-13): 5,12,21,33,37,40 + 보너스 7 [1등 총금액: 268억, 자동 8, 수동 6]
1201회 (2025-12-06): 7,9,24,27,35,36 + 보너스 37
`;

const PAST_WINNERS = [
  { round: 1203, numbers: [10, 13, 22, 25, 32, 45], bonus: 16 },
  { round: 1202, numbers: [5, 12, 21, 33, 37, 40], bonus: 7 },
  { round: 1201, numbers: [7, 9, 24, 27, 35, 36], bonus: 37 },
];

const checkPastMatch = (nums: number[]): number | null => {
    const sortedTarget = [...nums].sort((a, b) => a - b).join(',');
    for (const past of PAST_WINNERS) {
        const sortedPast = [...past.numbers].sort((a, b) => a - b).join(',');
        if (sortedTarget === sortedPast) return past.round;
    }
    return null;
};

// --- Helper: Highlight Numbers ---
const highlightNumbers = (text: string) => {
  if (!text || typeof text !== 'string') return text;
  const regex = /(\d+(?:[:~.]\d+)*)/g;
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} className="font-bold text-foreground">{part}</span> : part
  );
};

// --- Interfaces ---
interface LottoSet {
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  firstWinamnt?: number;
  firstAccumamnt?: number;
  firstPrzwnerCo?: number;
}

interface GeneratedSet {
  id: string;
  numbers: number[];
  reason?: string;
  sum?: number;
  matchRound?: number | null;
}

interface Insight {
  title: string;
  bullets?: string[];
  description?: string;
  tag: string;
}

interface AnalysisData {
  hotNumbers: { number: number; count: number }[];
  coldNumbers: { number: number; count: number }[];
  insights: Insight[];
}

// --- Shared Components ---
const LottoBall: React.FC<{ number: number; size?: 'sm' | 'md' | 'lg' }> = ({ number, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const getColorClass = (n: number) => {
    if (n <= 10) return 'bg-yellow-400 text-yellow-900';
    if (n <= 20) return 'bg-blue-400 text-blue-900';
    if (n <= 30) return 'bg-rose-400 text-rose-900';
    if (n <= 40) return 'bg-gray-400 text-gray-900';
    return 'bg-emerald-400 text-emerald-900';
  };

  return (
    <div className={`${sizes[size]} ${getColorClass(number)} font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white/50`}>
      {number}
    </div>
  );
};

// 1. HOME TAB
const HomeTab = () => {
  const [currentRound, setCurrentRound] = useState(1203);
  const [data, setData] = useState<LottoSet | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRoundData = async (round: number) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using a simplified prompt for demonstration
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Lotto results for round ${round}. Context: ${HISTORICAL_CONTEXT}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: { type: Type.OBJECT, properties: { drwNo: { type: Type.INTEGER }, drwNoDate: { type: Type.STRING }, drwtNo1: { type: Type.INTEGER }, drwtNo2: { type: Type.INTEGER }, drwtNo3: { type: Type.INTEGER }, drwtNo4: { type: Type.INTEGER }, drwtNo5: { type: Type.INTEGER }, drwtNo6: { type: Type.INTEGER }, bnusNo: { type: Type.INTEGER }, firstAccumamnt: { type: Type.NUMBER }, firstPrzwnerCo: { type: Type.INTEGER } } }
        }
      });
      const text = response.text;
      if (text) setData(JSON.parse(text));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoundData(currentRound); }, [currentRound]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha" />
            <AvatarFallback>USER</AvatarFallback>
          </Avatar>
          <p className="font-medium">안녕하세요 <span className="font-bold">행운님</span></p>
        </div>
        <Button variant="ghost" size="icon"><i className="fa-regular fa-bell text-lg"></i></Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold leading-tight">이번 주 로또 리포트</h1>
        <p className="text-muted-foreground">최신 당첨 정보를 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="col-span-1 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">1등 총 당첨금</CardTitle>
            <CardDescription>First Prize Pool</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">{(data?.firstAccumamnt ? (data.firstAccumamnt / 100000000).toFixed(0) : 0)}억</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">1등 당첨 인원</CardTitle>
            <CardDescription>Number of Winners</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">{data?.firstPrzwnerCo || 0}명</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{currentRound}회 당첨번호</CardTitle>
          <CardDescription>{data?.drwNoDate || '...'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center items-center gap-3">
            {data ? (
                <>
                    {[data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].map((n, i) => (
                        <LottoBall key={i} number={n} size="md" />
                    ))}
                    <span className="text-2xl font-bold text-muted-foreground mx-2">+</span>
                    <LottoBall number={data.bnusNo} size="md" />
                </>
            ) : <p className="text-muted-foreground">로딩중...</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentRound(r => r - 1)} disabled={currentRound <= 1193}>이전</Button>
          <span className="text-sm font-medium text-muted-foreground">Round {currentRound}</span>
          <Button variant="outline" onClick={() => setCurrentRound(r => r + 1)} disabled={currentRound >= 1203}>다음</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// 2. ANALYSIS TAB
const AnalysisTab = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `...`, // Simplified prompt
        config: { /* ... schema ... */ }
      });
      // Mock data for UI demonstration
      setData({
          hotNumbers: [{number: 34, count: 180}, {number: 1, count: 178}, {number: 12, count: 177}, {number: 27, count: 176}, {number: 43, count: 175}, {number: 17, count: 174}],
          coldNumbers: [{number: 9, count: 130}, {number: 22, count: 132}, {number: 23, count: 135}, {number: 32, count: 138}, {number: 41, count: 139}, {number: 8, count: 140}],
          insights: [
              {title: "번호 합계 구간", bullets: ["최근 10주간 번호 합이 130-160 사이에서 자주 출현했습니다.", "다음 회차에서도 비슷한 구간을 노려보는 것이 좋습니다."], tag: "130 ~ 160"},
              {title: "홀짝 비율", bullets: ["최근 홀수와 짝수의 비율은 3:3 또는 4:2가 가장 많았습니다.", "극단적인 비율은 피하는 것이 현명합니다."], tag: "3:3 or 4:2"},
              {title: "연속 번호 패턴", bullets: ["연속 번호 출현 빈도가 감소하는 추세입니다.", "한 쌍 정도의 연속 번호는 고려해볼 만합니다."], tag: "1-2 쌍"},
          ]
      });
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold">데이터 분석</h2>
      <Card>
        <CardHeader>
          <CardTitle>AI 빅데이터 분석</CardTitle>
          <CardDescription>AI가 역대 패턴을 심층 분석하여 다음 회차의 번호를 예측합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
            {analyzing ? <><i className="fas fa-sync fa-spin mr-2"></i> 분석중...</> : '분석 실행하기'}
          </Button>
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <Card>
                  <CardHeader><CardTitle>최다 출현 (HOT)</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {data.hotNumbers.map((n, i) => <LottoBall key={i} number={n.number} size="sm" />)}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle>미출현 (COLD)</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {data.coldNumbers.map((n, i) => <LottoBall key={i} number={n.number} size="sm" />)}
                  </CardContent>
              </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>AI 핵심 인사이트</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {data.insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">{insight.title}</h4>
                    <Badge variant="secondary">{insight.tag}</Badge>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {insight.bullets?.map((bullet, i) => <li key={i}>{highlightNumbers(bullet)}</li>)}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};


// 3. GENERATE TAB
const GenerateTab: React.FC<{ onSave: (set: GeneratedSet) => void }> = ({ onSave }) => {
  const [generated, setGenerated] = useState<GeneratedSet[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [minSum, setMinSum] = useState<number>(100);
  const [maxSum, setMaxSum] = useState<number>(170);

  const handleGenerate = async (mode: 'random' | 'ai' | 'sum') => {
    setIsGenerating(true);
    setGenerated([]);
    // Mock generation for UI
    await new Promise(r => setTimeout(r, 1000));
    let newSets: GeneratedSet[] = [];
     Array.from({length: 3}, (_, i) => {
        const nums = new Set<number>();
        while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
        const sorted = Array.from(nums).sort((a,b) => a-b);
        const s = sorted.reduce((a, b) => a + b, 0);
        newSets.push({ id: `${mode}-${Date.now()}-${i}`, numbers: sorted, reason: `${mode} 조합`, sum: s, matchRound: checkPastMatch(sorted) });
    });
    setGenerated(newSets);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold">번호 생성</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" size="lg" onClick={() => handleGenerate('random')}>랜덤 생성</Button>
        <Button variant="outline" size="lg" onClick={() => handleGenerate('ai')}>AI 추천</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>합계 구간 설정</CardTitle>
          <CardDescription>원하는 합계 범위를 직접 지정하여 생성합니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Input type="number" value={minSum} onChange={e => setMinSum(Number(e.target.value))} placeholder="최소값" />
          <span className="text-muted-foreground">-</span>
          <Input type="number" value={maxSum} onChange={e => setMaxSum(Number(e.target.value))} placeholder="최대값" />
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={() => handleGenerate('sum')}>범위 내 번호 생성</Button>
        </CardFooter>
      </Card>

      {isGenerating && <div className="text-center p-10">생성중...</div>}
      
      <div className="space-y-4">
        {generated.map(set => (
          <Card key={set.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <CardTitle className="text-base">{set.reason}</CardTitle>
                 {set.matchRound ? (
                    <Badge variant="destructive">기록 있음 ({set.matchRound}회)</Badge>
                 ) : (
                    <Badge variant="secondary">새로운 조합</Badge>
                 )}
              </div>
              <CardDescription>합계: {set.sum}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 justify-center">
              {set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full" onClick={() => onSave(set)}>보관함에 저장</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};


// 4. BOOKMARKS TAB
const BookmarksTab: React.FC<{ bookmarks: GeneratedSet[], onRemove: (id: string) => void }> = ({ bookmarks, onRemove }) => (
    <div className="space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-bold">보관함</h2>
        {bookmarks.length === 0 ? (
            <Card className="text-center p-12">
                <CardContent>
                    <p className="text-muted-foreground">보관된 번호가 없습니다.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="space-y-4">
                {bookmarks.map(set => (
                    <Card key={set.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                                {set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onRemove(set.id)}>
                                <i className="fas fa-trash-alt text-destructive"></i>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
);


// --- APP ---
const App = () => {
  const [bookmarks, setBookmarks] = useState<GeneratedSet[]>([]);

  useEffect(() => {
      const saved = localStorage.getItem('lotto_bookmarks');
      if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setBookmarks(parsed);
      }
  }, []);

  const saveToBookmarks = (set: GeneratedSet) => {
      if (bookmarks.find(b => b.id === set.id)) return;
      const updated = [set, ...bookmarks];
      setBookmarks(updated);
      localStorage.setItem('lotto_bookmarks', JSON.stringify(updated));
  };

  const removeFromBookmarks = (id: string) => {
      const updated = bookmarks.filter(b => b.id !== id);
      setBookmarks(updated);
      localStorage.setItem('lotto_bookmarks', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background text-foreground flex flex-col p-4 pb-8"> {/* pb-20으로 변경 */}
      <Tabs defaultValue="home" className="flex flex-col flex-grow relative">
        <div className="flex-grow overflow-y-auto">
          <TabsContent value="home" className="flex-grow"><HomeTab /></TabsContent>
          <TabsContent value="analysis" className="flex-grow"><AnalysisTab /></TabsContent>
          <TabsContent value="generate" className="flex-grow"><GenerateTab onSave={saveToBookmarks} /></TabsContent>
          <TabsContent value="bookmarks" className="flex-grow"><BookmarksTab bookmarks={bookmarks} onRemove={removeFromBookmarks} /></TabsContent>
        </div>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md"> {/* bottom-0으로 변경, px-4 제거 */}
          <TabsList className="grid w-full grid-cols-4 h-14 rounded-full bg-muted p-1 shadow-lg">
            <TabsTrigger value="home"><i className="fa-solid fa-trophy text-xl"></i></TabsTrigger>
            <TabsTrigger value="analysis"><i className="fa-solid fa-database text-xl"></i></TabsTrigger>
            <TabsTrigger value="generate"><i className="fa-solid fa-fan text-xl"></i></TabsTrigger>
            <TabsTrigger value="bookmarks"><i className="fa-solid fa-heart text-xl"></i></TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
