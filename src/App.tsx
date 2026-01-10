import React, { useState, useEffect, createContext, useContext } from 'react';
import Papa from 'papaparse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeTab } from '@/components/tabs/HomeTab';
import { AnalysisTab } from '@/components/tabs/AnalysisTab';
import { GenerateTab } from '@/components/tabs/GenerateTab';
import { BookmarksTab } from '@/components/tabs/BookmarksTab';
import { LiquidTabbar } from '@/components/layout/LiquidTabbar';
import { LottoHistory, GeneratedSet } from '@/types';

// --- Context Setup ---
interface LottoContextType {
  history: LottoHistory[];
  lottoData: LottoHistory | null;
  loading: boolean;
}

const LottoContext = createContext<LottoContextType | undefined>(undefined);

export const useLottoData = () => {
  const context = useContext(LottoContext);
  if (!context) {
    throw new Error('useLottoData must be used within a LottoProvider'); // Or generic App wrapper
  }
  return context;
};

export function App() {
  const [bookmarks, setBookmarks] = useState<GeneratedSet[]>([]);
  const [lottoHistory, setLottoHistory] = useState<LottoHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('lotto_bookmarks');
    if (savedBookmarks) {
      const parsed = JSON.parse(savedBookmarks);
      if (Array.isArray(parsed)) setBookmarks(parsed);
    }
    Papa.parse('/lotto_full_history.csv', {
      download: true, header: true, dynamicTyping: true,
      complete: (results) => {
        const transformedData = (results.data as any[]).map(row => {
          if (!row['회차']) return null;
          const numbers = String(row['당첨번호']).split(',').map(Number);
          return {
            '회차': row['회차'], '추첨일': row['추첨일'], '1등_총당첨금': row['1등_총당첨금액'], '1등_당첨인원': row['1등_당첨게임수'],
            '번호1': numbers[0], '번호2': numbers[1], '번호3': numbers[2], '번호4': numbers[3], '번호5': numbers[4], '번호6': numbers[5],
            '보너스': row['보너스번호'],
            '등위별_당첨금액_1등': row['1등_1게임당당첨금액'], // Mapping for detail views if needed
            '등위별_당첨자수_1등': row['1등_당첨게임수']
          };
        }).filter(Boolean);
        const sortedData = (transformedData as LottoHistory[]).sort((a, b) => b['회차'] - a['회차']);
        setLottoHistory(sortedData);
        setLoading(false);
      },
      error: (err) => { console.error("CSV 파싱 에러:", err); setLoading(false); }
    });
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

  if (loading && lottoHistory.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">로딩중...</div>
  }

  const navTriggers = (
    <>
      <TabsTrigger value="home" className="w-full justify-center lg:justify-start gap-2">
        <i className="fa-solid fa-trophy text-xl"></i> <span className="hidden lg:inline">홈</span>
      </TabsTrigger>
      <TabsTrigger value="analysis" className="w-full justify-center lg:justify-start gap-2">
        <i className="fa-solid fa-database text-xl"></i> <span className="hidden lg:inline">분석</span>
      </TabsTrigger>
      <TabsTrigger value="generate" className="w-full justify-center lg:justify-start gap-2">
        <i className="fa-solid fa-fan text-xl"></i> <span className="hidden lg:inline">생성</span>
      </TabsTrigger>
      <TabsTrigger value="bookmarks" className="w-full justify-center lg:justify-start gap-2">
        <i className="fa-solid fa-heart text-xl"></i> <span className="hidden lg:inline">보관함</span>
      </TabsTrigger>
    </>
  );

  return (
    <LottoContext.Provider value={{ history: lottoHistory, lottoData: lottoHistory[0] || null, loading }}>
      <div className="min-h-screen bg-background text-foreground">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="lg:flex">
          {/* --- Sidebar Navigation (Desktop) --- */}
          <TabsList className="hidden lg:flex lg:flex-col lg:w-60 lg:p-4 lg:border-r lg:items-start lg:gap-2">
            <h1 className="text-2xl font-bold px-4 py-2">Lotto Master</h1>
            {navTriggers}
          </TabsList>

          {/* --- Main Content Area --- */}
          <main className="flex-grow p-0 pb-32 lg:pb-6 lg:p-6 max-w-4xl mx-auto w-full">
            <TabsContent value="home" className="flex flex-col gap-6 animate-fadeIn overflow-x-visible mt-0">
              <HomeTab />
            </TabsContent>
            {/* Analysis Tab Removed as per request */}
            <TabsContent value="generate" className="p-4"><GenerateTab onSave={saveToBookmarks} lottoHistory={lottoHistory} /></TabsContent>
            <TabsContent value="bookmarks" className="p-4"><BookmarksTab bookmarks={bookmarks} onRemove={removeFromBookmarks} /></TabsContent>
          </main>

          {/* --- Bottom Navigation (Mobile: Liquid Style) --- */}
          <LiquidTabbar activeTab={activeTab} onTabChange={setActiveTab} />
        </Tabs>
      </div>
    </LottoContext.Provider>
  );
};