import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import './index.css';

// --- Constants: Provided Historical Data Summary ---
const HISTORICAL_CONTEXT = `
Latest Rounds from User Data:
1203회 (2025-12-20): 10,13,22,25,32,45 + 보너스 16 [1등 총금액: 272억, 자동 10, 수동 4]
1202회 (2025-12-13): 5,12,21,33,37,40 + 보너스 7 [1등 총금액: 268억, 자동 8, 수동 6]
1201회 (2025-12-06): 7,9,24,27,35,36 + 보너스 37
1200회 (2025-11-29): 1,2,4,16,20,32 + 보너스 45
1199회 (2025-11-22): 16,24,25,30,31,32 + 보너스 7
1198회 (2025-11-15): 26,30,33,38,39,41 + 보너스 21
1197회 (2025-11-08): 1,5,7,26,28,43 + 보너스 30
1196회 (2025-11-01): 8,12,15,29,40,45 + 보너스 14
1195회 (2025-10-25): 3,15,27,33,34,36 + 보너스 37
1194회 (2025-10-18): 3,13,15,24,33,37 + 보너스 2
1193회 (2025-10-11): 6,9,16,19,24,28 + 보너스 17
`;

const PAST_WINNERS = [
  { round: 1203, numbers: [10, 13, 22, 25, 32, 45], bonus: 16 },
  { round: 1202, numbers: [5, 12, 21, 33, 37, 40], bonus: 7 },
  { round: 1201, numbers: [7, 9, 24, 27, 35, 36], bonus: 37 },
  { round: 1200, numbers: [1, 2, 4, 16, 20, 32], bonus: 45 },
  { round: 1199, numbers: [16, 24, 25, 30, 31, 32], bonus: 7 },
  { round: 1198, numbers: [26, 30, 33, 38, 39, 41], bonus: 21 },
  { round: 1197, numbers: [1, 5, 7, 26, 28, 43], bonus: 30 },
  { round: 1196, numbers: [8, 12, 15, 29, 40, 45], bonus: 14 },
  { round: 1195, numbers: [3, 15, 27, 33, 34, 36], bonus: 37 },
  { round: 1194, numbers: [3, 13, 15, 24, 33, 37], bonus: 2 },
  { round: 1193, numbers: [6, 9, 16, 19, 24, 28], bonus: 17 },
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
  // Matches numbers, ranges (e.g., 100~120), or ratios (4:2)
  const regex = /(\d+(?:[:~.]\d+)*)/g;
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <span key={i} className="font-extrabold text-slate-900">{part}</span> : part
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
    sm: 'w-8 h-8 text-[13px]',
    md: 'w-12 h-12 text-[18px]',
    lg: 'w-14 h-14 text-[22px]',
  };

  // Lotto color logic for hover state
  const getHoverColorClass = (n: number) => {
    if (n <= 10) return 'hover:border-yellow-400 hover:text-yellow-600'; // 1-10 Yellow
    if (n <= 20) return 'hover:border-blue-400 hover:text-blue-600';     // 11-20 Blue
    if (n <= 30) return 'hover:border-rose-400 hover:text-rose-600';      // 21-30 Red
    if (n <= 40) return 'hover:border-slate-400 hover:text-slate-600';    // 31-40 Black (Gray)
    return 'hover:border-emerald-400 hover:text-emerald-600';            // 41-45 Green
  };

  return (
    <div className={`${sizes[size]} bg-white text-slate-800 font-extrabold rounded-full flex items-center justify-center shadow-sm border border-slate-100 transition-all duration-300 ease-out hover:scale-125 hover:-rotate-12 hover:shadow-md cursor-pointer z-10 hover:z-20 ${getHoverColorClass(number)}`}>
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
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `로또 결과 정보: ${round}회. 히스토리 컨텍스트: ${HISTORICAL_CONTEXT}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              drwNo: { type: Type.INTEGER },
              drwNoDate: { type: Type.STRING },
              drwtNo1: { type: Type.INTEGER },
              drwtNo2: { type: Type.INTEGER },
              drwtNo3: { type: Type.INTEGER },
              drwtNo4: { type: Type.INTEGER },
              drwtNo5: { type: Type.INTEGER },
              drwtNo6: { type: Type.INTEGER },
              bnusNo: { type: Type.INTEGER },
              firstWinamnt: { type: Type.NUMBER },
              firstAccumamnt: { type: Type.NUMBER },
              firstPrzwnerCo: { type: Type.INTEGER }
            }
          }
        }
      });
      const text = response.text;
      if (text) setData(JSON.parse(text));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoundData(currentRound); }, [currentRound]);

  return (
    <div className="space-y-8 pb-20 animate-fadeIn">
      {/* Profile Header */}
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Samantha" alt="profile" />
          </div>
          <p className="text-[16px] text-slate-800 font-medium">안녕하세요 <span className="font-bold">행운님</span></p>
        </div>
        <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors">
          <i className="fa-regular fa-bell text-[20px]"></i>
        </button>
      </div>

      {/* Main Title */}
      <div className="px-2">
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight">이번 주 로또 리포트를<br />한눈에 확인하세요</h1>
      </div>

      {/* Grid Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Card: Prize Info */}
        <div className="bg-[#e0f2fe] p-6 rounded-[32px] space-y-4 flex flex-col justify-between shadow-sm border border-[#bae6fd] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-coins text-[#0284c7]"></i>
            </div>
            <div>
                <p className="text-[16px] font-bold text-slate-800 leading-none">{(data?.firstAccumamnt ? (data.firstAccumamnt / 100000000).toFixed(0) : 0)}억</p>
                <p className="text-[12px] text-slate-500">1등 총 당첨금</p>
            </div>
          </div>
          <div className="h-20 flex items-end gap-2 px-1">
             <div className="w-2 h-12 bg-[#0284c7] rounded-full"></div>
             <div className="w-2 h-16 bg-[#0284c7] rounded-full"></div>
             <div className="w-2 h-10 bg-[#0284c7] rounded-full"></div>
             <div className="w-2 h-14 bg-[#0284c7] rounded-full"></div>
             <div className="w-2 h-12 bg-slate-300 rounded-full"></div>
             <div className="w-2 h-8 bg-slate-300 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Right Card: Winners Info */}
        <div className="bg-[#f3e8ff] p-6 rounded-[32px] space-y-4 flex flex-col justify-between shadow-sm border border-[#e9d5ff] hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-users text-[#9333ea]"></i>
            </div>
            <div>
                <p className="text-[16px] font-bold text-slate-800 leading-none">{data?.firstPrzwnerCo || 0}명</p>
                <p className="text-[12px] text-slate-500">1등 당첨 인원</p>
            </div>
          </div>
          <div className="h-20 flex items-center justify-center">
            <svg viewBox="0 0 100 40" className="w-full h-full text-[#9333ea]" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M0 30 Q 25 10, 50 30 T 100 20" strokeLinecap="round" />
                <circle cx="85" cy="23" r="3" fill="white" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Full Row: Numbers Result */}
        <div className="col-span-2 bg-[#f0fdf4] p-6 rounded-[32px] shadow-sm border border-[#dcfce7]">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <i className="fa-solid fa-star text-[#16a34a]"></i>
                </div>
                <div>
                    <p className="text-[16px] font-bold text-slate-800 leading-none">{currentRound}회 당첨번호</p>
                    <p className="text-[12px] text-slate-500">{data?.drwNoDate || '-'}</p>
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {data && [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6].map((n, i) => (
                    <LottoBall key={i} number={n} size="md" />
                ))}
                <div className="flex items-center text-slate-300 px-1">+</div>
                {data && <LottoBall number={data.bnusNo} size="md" />}
            </div>

            <div className="flex items-center justify-between px-2">
                <button 
                  disabled={currentRound <= 1193}
                  onClick={() => setCurrentRound(r => r - 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-500 disabled:opacity-30 active:scale-95 transition-transform"
                >이전</button>
                <p className="text-[12px] font-bold text-slate-400">Round {currentRound}</p>
                <button 
                  disabled={currentRound >= 1203}
                  onClick={() => setCurrentRound(r => r + 1)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-500 disabled:opacity-30 active:scale-95 transition-transform"
                >다음</button>
            </div>
        </div>
      </div>

      {/* Daily Recommendations */}
      <div className="space-y-4 px-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-slate-900 hidden">추천 서비스</h3>
          <button className="text-[13px] text-slate-400 font-bold">전체보기</button>
        </div>
        
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-wand-magic-sparkles text-emerald-600"></i>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-800 leading-none">AI 행운 번호</p>
              <p className="text-[13px] text-slate-500">통계 기반의 최적 조합 생성</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-300 text-[14px]"></i>
        </div>

        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-chart-pie text-sky-600"></i>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-800 leading-none">정밀 데이터 분석</p>
              <p className="text-[13px] text-slate-500">역대 미출현 번호 추적</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-300 text-[14px]"></i>
        </div>
      </div>
    </div>
  );
};

// 2. ANALYSIS TAB
const AnalysisTab = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [resultKey, setResultKey] = useState(0);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `전체 로또 데이터(1회~1203회)를 분석해서 다음 3가지 항목을 JSON으로 반환해.
        1. hotNumbers: 가장 많이 나온 번호 6개와 횟수.
        2. coldNumbers: 가장 적게 나온(오랫동안 안나온) 번호 6개와 횟수.
        3. insights: 다음 회차 예상을 위한 핵심 분석 포인트 3~4개. 
           - title: 짧은 제목 (예: 합계 구간 예측, 홀짝 패턴 등)
           - bullets: 핵심 분석 내용 2~3가지를 간결한 문장(bullet point) 리스트로 작성. (한글)
           - tag: 시각적으로 강조할 핵심 숫자나 키워드 (예: "합계 140~160", "홀짝 4:2", "끝수 5")
        Context: ${HISTORICAL_CONTEXT}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hotNumbers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, count: { type: Type.INTEGER } } } },
              coldNumbers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, count: { type: Type.INTEGER } } } },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tag: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const text = response.text;
      if (text) {
        setData(JSON.parse(text));
        setResultKey(prev => prev + 1);
      }
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  const getTagColor = (i: number) => {
      const colors = [
          'bg-emerald-100 text-emerald-700 border-emerald-200',
          'bg-sky-100 text-sky-700 border-sky-200',
          'bg-violet-100 text-violet-700 border-violet-200',
          'bg-rose-100 text-rose-700 border-rose-200'
      ];
      return colors[i % colors.length];
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
        <h2 className="text-[24px] font-bold text-slate-900 px-2 mt-4">데이터 분석</h2>
        
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="w-16 h-16 bg-[#f0fdf4] text-emerald-600 rounded-[20px] flex items-center justify-center text-2xl mb-4 shadow-inner transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <i className="fas fa-microchip"></i>
            </div>
            <p className="text-[16px] font-bold text-slate-800">1203회 빅데이터 분석</p>
            <p className="text-[13px] text-slate-400 mt-2 mb-6">AI가 역대 패턴을 심층 분석합니다.</p>
            
            <button 
              onClick={handleAnalyze} 
              disabled={analyzing} 
              className="relative overflow-hidden w-full py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
            >
                {/* Shine Animation Overlay */}
                {!analyzing && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine-slow pointer-events-none" />}
                
                {analyzing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt text-yellow-400"></i>} 
                <span className="relative z-10">분석 실행하기</span>
            </button>
        </div>

        {data && (
            <div key={resultKey} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#fff7ed] p-6 rounded-[28px] border border-[#ffedd5] shadow-sm animate-card-pop" style={{ animationDelay: '0ms' }}>
                        <h4 className="text-[13px] font-bold text-[#ea580c] mb-4">최다 출현 (HOT)</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.hotNumbers?.map((n, i) => <LottoBall key={i} number={n.number} size="md" />)}
                        </div>
                    </div>
                    <div className="bg-[#eff6ff] p-6 rounded-[28px] border border-[#dbeafe] shadow-sm animate-card-pop" style={{ animationDelay: '150ms' }}>
                        <h4 className="text-[13px] font-bold text-[#2563eb] mb-4">미출현 (COLD)</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.coldNumbers?.map((n, i) => <LottoBall key={i} number={n.number} size="md" />)}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm animate-card-pop animate-bg-flash" style={{ animationDelay: '300ms' }}>
                    <h4 className="text-[13px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-lightbulb text-amber-400"></i> AI 핵심 인사이트
                    </h4>
                    <div className="space-y-3">
                        {data.insights?.map((insight, idx) => (
                            <div key={idx} className="flex flex-col gap-3 p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold text-slate-800">{insight.title}</span>
                                    <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${getTagColor(idx)} whitespace-nowrap`}>
                                        {insight.tag}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                  {(insight.bullets || []).map((bullet, bIdx) => (
                                    <li key={bIdx} className="text-[13px] text-slate-600 leading-relaxed flex items-start gap-2">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                                      <span>{highlightNumbers(bullet)}</span>
                                    </li>
                                  ))}
                                  {!insight.bullets && insight.description && (
                                    <li className="text-[13px] text-slate-600 leading-relaxed">
                                      {highlightNumbers(insight.description)}
                                    </li>
                                  )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
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
    try {
        let newSets: GeneratedSet[] = [];
        if (mode === 'random') {
            await new Promise(r => setTimeout(r, 800));
            newSets = Array.from({length: 3}, (_, i) => {
                const nums = new Set<number>();
                while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
                const sorted = Array.from(nums).sort((a,b) => a-b);
                const s = sorted.reduce((a, b) => a + b, 0);
                return { id: `rnd-${Date.now()}-${i}`, numbers: sorted, reason: "행운의 랜덤 조합", sum: s, matchRound: checkPastMatch(sorted) };
            });
        } else if (mode === 'sum') {
             await new Promise(r => setTimeout(r, 800));
             for (let i = 0; i < 3; i++) {
                let attempts = 0;
                while (attempts < 5000) {
                    const nums = new Set<number>();
                    while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
                    const sorted = Array.from(nums).sort((a,b) => a-b);
                    const s = sorted.reduce((a, b) => a + b, 0);
                    if (s >= minSum && s <= maxSum) {
                        newSets.push({ id: `sum-${Date.now()}-${i}`, numbers: sorted, reason: `합계 ${s} (범위: ${minSum}~${maxSum})`, sum: s, matchRound: checkPastMatch(sorted) });
                        break;
                    }
                    attempts++;
                }
            }
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `히스토리 패턴을 분석해 3개의 조합을 생성해줘. Context: ${HISTORICAL_CONTEXT}`,
                config: { 
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      sets: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: { numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }, reason: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                }
            });
            const text = response.text;
            if (text) {
              const data = JSON.parse(text);
              if (data.sets && Array.isArray(data.sets)) {
                newSets = data.sets.map((s: any, i: number) => ({ 
                  ...s, id: `ai-${Date.now()}-${i}`, sum: s.numbers.reduce((a:any,b:any)=>a+b,0), matchRound: checkPastMatch(s.numbers)
                }));
              }
            }
        }
        setGenerated(newSets || []);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
        <h2 className="text-[24px] font-bold text-slate-900 px-2 mt-4">번호 생성</h2>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleGenerate('random')} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95 group">
                <div className="w-12 h-12 bg-[#f0f9ff] text-sky-600 rounded-[16px] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-dice"></i>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-800 leading-none">AI 행운 번호</p>
              <p className="text-[13px] text-slate-500">통계 기반의 최적 조합 생성</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-300 text-[14px]"></i>
        </div>

        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-chart-pie text-sky-600"></i>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-800 leading-none">정밀 데이터 분석</p>
              <p className="text-[13px] text-slate-500">역대 미출현 번호 추적</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-slate-300 text-[14px]"></i>
        </div>
      </div>
    </div>
  );
};

// 2. ANALYSIS TAB
const AnalysisTab = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [resultKey, setResultKey] = useState(0);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `전체 로또 데이터(1회~1203회)를 분석해서 다음 3가지 항목을 JSON으로 반환해.
        1. hotNumbers: 가장 많이 나온 번호 6개와 횟수.
        2. coldNumbers: 가장 적게 나온(오랫동안 안나온) 번호 6개와 횟수.
        3. insights: 다음 회차 예상을 위한 핵심 분석 포인트 3~4개.
           - title: 짧은 제목 (예: 합계 구간 예측, 홀짝 패턴 등)
           - bullets: 핵심 분석 내용 2~3가지를 간결한 문장(bullet point) 리스트로 작성. (한글)
           - tag: 시각적으로 강조할 핵심 숫자나 키워드 (예: "합계 140~160", "홀짝 4:2", "끝수 5")
        Context: ${HISTORICAL_CONTEXT}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hotNumbers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, count: { type: Type.INTEGER } } } },
              coldNumbers: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { number: { type: Type.INTEGER }, count: { type: Type.INTEGER } } } },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tag: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const text = response.text;
      if (text) {
        setData(JSON.parse(text));
        setResultKey(prev => prev + 1);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const getTagColor = (i: number) => {
      const colors = [
          'bg-emerald-100 text-emerald-700 border-emerald-200',
          'bg-sky-100 text-sky-700 border-sky-200',
          'bg-violet-100 text-violet-700 border-violet-200',
          'bg-rose-100 text-rose-700 border-rose-200'
      ];
      return colors[i % colors.length];
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
        <h2 className="text-[24px] font-bold text-slate-900 px-2 mt-4">데이터 분석</h2>
        
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="w-16 h-16 bg-[#f0fdf4] text-emerald-600 rounded-[20px] flex items-center justify-center text-2xl mb-4 shadow-inner transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <i className="fas fa-microchip"></i>
            </div>
            <p className="text-[16px] font-bold text-slate-800">1203회 빅데이터 분석</p>
            <p className="text-[13px] text-slate-400 mt-2 mb-6">AI가 역대 패턴을 심층 분석합니다.</p>
            
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="relative overflow-hidden w-full py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
            >
                {/* Shine Animation Overlay */}
                {!analyzing && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shine-slow pointer-events-none" />}
                
                {analyzing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt text-yellow-400"></i>}
                <span className="relative z-10">분석 실행하기</span>
            </button>
        </div>

        {data && (
            <div key={resultKey} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#fff7ed] p-6 rounded-[28px] border border-[#ffedd5] shadow-sm animate-card-pop" style={{ animationDelay: '0ms' }}>
                        <h4 className="text-[13px] font-bold text-[#ea580c] mb-4">최다 출현 (HOT)</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.hotNumbers?.map((n, i) => <LottoBall key={i} number={n.number} size="md" />)}
                        </div>
                    </div>
                    <div className="bg-[#eff6ff] p-6 rounded-[28px] border border-[#dbeafe] shadow-sm animate-card-pop" style={{ animationDelay: '150ms' }}>
                        <h4 className="text-[13px] font-bold text-[#2563eb] mb-4">미출현 (COLD)</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.coldNumbers?.map((n, i) => <LottoBall key={i} number={n.number} size="md" />)}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm animate-card-pop animate-bg-flash" style={{ animationDelay: '300ms' }}>
                    <h4 className="text-[13px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-lightbulb text-amber-400"></i> AI 핵심 인사이트
                    </h4>
                    <div className="space-y-3">
                        {data.insights?.map((insight, idx) => (
                            <div key={idx} className="flex flex-col gap-3 p-5 rounded-[24px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-bold text-slate-800">{insight.title}</span>
                                    <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full border ${getTagColor(idx)} whitespace-nowrap`}>
                                        {insight.tag}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                  {(insight.bullets || []).map((bullet, bIdx) => (
                                    <li key={bIdx} className="text-[13px] text-slate-600 leading-relaxed flex items-start gap-2">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                                      <span>{highlightNumbers(bullet)}</span>
                                    </li>
                                  ))}
                                  {!insight.bullets && insight.description && (
                                    <li className="text-[13px] text-slate-600 leading-relaxed">
                                      {highlightNumbers(insight.description)}
                                    </li>
                                  )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
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
    try {
        let newSets: GeneratedSet[] = [];
        if (mode === 'random') {
            await new Promise(r => setTimeout(r, 800));
            newSets = Array.from({length: 3}, (_, i) => {
                const nums = new Set<number>();
                while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
                const sorted = Array.from(nums).sort((a,b) => a-b);
                const s = sorted.reduce((a, b) => a + b, 0);
                return { id: `rnd-${Date.now()}-${i}`, numbers: sorted, reason: "행운의 랜덤 조합", sum: s, matchRound: checkPastMatch(sorted) };
            });
        } else if (mode === 'sum') {
             await new Promise(r => setTimeout(r, 800));
             for (let i = 0; i < 3; i++) {
                let attempts = 0;
                while (attempts < 5000) {
                    const nums = new Set<number>();
                    while(nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
                    const sorted = Array.from(nums).sort((a,b) => a-b);
                    const s = sorted.reduce((a, b) => a + b, 0);
                    if (s >= minSum && s <= maxSum) {
                        newSets.push({ id: `sum-${Date.now()}-${i}`, numbers: sorted, reason: `합계 ${s} (범위: ${minSum}~${maxSum})`, sum: s, matchRound: checkPastMatch(sorted) });
                        break;
                    }
                    attempts++;
                }
            }
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `히스토리 패턴을 분석해 3개의 조합을 생성해줘. Context: ${HISTORICAL_CONTEXT}`,
                config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      sets: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: { numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }, reason: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                }
            });
            const text = response.text;
            if (text) {
              const data = JSON.parse(text);
              if (data.sets && Array.isArray(data.sets)) {
                newSets = data.sets.map((s: any, i: number) => ({
                  ...s, id: `ai-${Date.now()}-${i}`, sum: s.numbers.reduce((a:any,b:any)=>a+b,0), matchRound: checkPastMatch(s.numbers)
                }));
              }
            }
        }
        setGenerated(newSets || []);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
        <h2 className="text-[24px] font-bold text-slate-900 px-2 mt-4">번호 생성</h2>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleGenerate('random')} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95 group">
                <div className="w-12 h-12 bg-[#f0f9ff] text-sky-600 rounded-[16px] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform"><i className="fas fa-dice"></i></div>
                <span className="text-[13px] font-bold text-slate-800">랜덤 생성</span>
            </button>
            <button onClick={() => handleGenerate('ai')} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex flex-col items-center hover:bg-slate-50 transition-all active:scale-95 group">
                <div className="w-12 h-12 bg-[#fdf2f8] text-pink-600 rounded-[16px] flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform"><i className="fas fa-sparkles"></i></div>
                <span className="text-[13px] font-bold text-slate-800">AI 추천</span>
            </button>
        </div>

        {/* New Sum Range Card */}
        <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ecfccb] flex items-center justify-center text-lime-600">
                    <i className="fa-solid fa-calculator"></i>
                </div>
                <div>
                    <h3 className="text-[16px] font-bold text-slate-800">합계 구간 설정</h3>
                    <p className="text-[12px] text-slate-500">원하는 합계 범위를 직접 지정하세요</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[24px]">
                <div className="flex-1">
                    <label className="text-[12px] font-bold text-slate-400 block mb-1">최소값</label>
                    <input
                        type="number"
                        value={minSum}
                        onChange={(e) => setMinSum(Number(e.target.value))}
                        className="w-full bg-transparent text-[20px] font-bold text-slate-800 outline-none border-b border-slate-200 focus:border-lime-500 transition-colors p-1"
                    />
                </div>
                <div className="text-slate-300 font-bold text-xl">~</div>
                <div className="flex-1 text-right">
                    <label className="text-[12px] font-bold text-slate-400 block mb-1">최대값</label>
                    <input
                        type="number"
                        value={maxSum}
                        onChange={(e) => setMaxSum(Number(e.target.value))}
                        className="w-full bg-transparent text-[20px] font-bold text-slate-800 outline-none border-b border-slate-200 focus:border-lime-500 transition-colors p-1 text-right"
                    />
                </div>
            </div>

            <button onClick={() => handleGenerate('sum')} className="w-full py-4 bg-[#bef264] text-lime-950 font-bold rounded-[20px] text-[16px] hover:bg-[#a3e635] transition-all shadow-sm active:scale-95">
                범위 내 번호 생성하기
            </button>
        </div>

        {isGenerating && (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>
        )}

        <div className="space-y-4">
            {generated?.map(set => (
                <div key={set.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                         <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${set.matchRound ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                             {set.matchRound ? `${set.matchRound}회 당첨기록 있음` : '새로운 조합'}
                         </span>
                         <span className="text-[12px] text-slate-400 font-bold">Sum: {set.sum}</span>
                    </div>
                    <div className="flex gap-2 justify-center">
                        {set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{set.reason}</p>
                    <button onClick={() => onSave(set)} className="w-full py-3 bg-slate-100 text-slate-800 font-bold rounded-xl text-[13px] hover:bg-slate-200 transition-all active:scale-95">보관함에 저장</button>
                </div>
            )) || []}
        </div>
    </div>
  );
};

// 4. BOOKMARKS TAB
const BookmarksTab: React.FC<{ bookmarks: GeneratedSet[], onRemove: (id: string) => void }> = ({ bookmarks, onRemove }) => (
    <div className="space-y-6 pb-20 animate-fadeIn">
        <h2 className="text-[24px] font-bold text-slate-900 px-2 mt-4">보관함</h2>
        {bookmarks.length === 0 ? (
            <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm text-center">
                <i className="fa-regular fa-folder-open text-slate-200 text-4xl mb-4"></i>
                <p className="text-slate-400 font-bold text-[16px]">비어 있습니다.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {bookmarks?.map(set => (
                    <div key={set.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}
                            </div>
                            <p className="text-[12px] text-slate-400 font-bold">합계 {set.sum}</p>
                        </div>
                        <button onClick={() => onRemove(set.id)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:text-rose-500 flex items-center justify-center transition-all active:scale-90">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                )) || []}
            </div>
        )}
    </div>
);

// --- APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'analysis' | 'generate' | 'bookmarks'>('home');
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
    <div className="min-h-screen max-w-md mx-auto bg-[#f8fafc] flex flex-col relative px-4 overflow-hidden">
      <main className="flex-1 pt-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'analysis' && <AnalysisTab />}
        {activeTab === 'generate' && <GenerateTab onSave={saveToBookmarks} />}
        {activeTab === 'bookmarks' && <BookmarksTab bookmarks={bookmarks} onRemove={removeFromBookmarks} />}
      </main>

      {/* Floating Pill Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] h-[72px] bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex items-center justify-around px-4 z-50">
        <button onClick={() => setActiveTab('home')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${activeTab === 'home' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fa-solid fa-house"></i>
        </button>
        <button onClick={() => setActiveTab('analysis')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${activeTab === 'analysis' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fa-solid fa-chart-line"></i>
        </button>
        <button onClick={() => setActiveTab('generate')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${activeTab === 'generate' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fa-solid fa-wand-sparkles"></i>
        </button>
        <button onClick={() => setActiveTab('bookmarks')} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${activeTab === 'bookmarks' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            <i className="fa-solid fa-bookmark"></i>
        </button>
      </nav>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);