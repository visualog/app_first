import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HomeTab } from '@/components/tabs/HomeTab';
import { AnalysisTab } from '@/components/tabs/AnalysisTab';
import { GenerateTab } from '@/components/tabs/GenerateTab';
import { BookmarksTab } from '@/components/tabs/BookmarksTab';
import { LottoHistory, GeneratedSet } from '@/types';

export function App() {
  const [bookmarks, setBookmarks] = useState<GeneratedSet[]>([]);
  const [lottoHistory, setLottoHistory] = useState<LottoHistory[]>([]);
  const [loading, setLoading] = useState(true);

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
          };
        }).filter(Boolean);
        const sortedData = (transformedData as LottoHistory[]).sort((a, b) => b['회차'] - a['회차']);
        setLottoHistory(sortedData); setLoading(false);
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

  if (loading) {
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
    <div className="min-h-screen bg-background text-foreground">
      <Tabs defaultValue="home" className="lg:flex">
        {/* --- Sidebar Navigation (Desktop) --- */}
        <TabsList className="hidden lg:flex lg:flex-col lg:w-60 lg:p-4 lg:border-r lg:items-start lg:gap-2">
          <h1 className="text-2xl font-bold px-4 py-2">Lotto Master</h1>
          {navTriggers}
        </TabsList>

        {/* --- Main Content Area --- */}
        <main className="flex-grow p-4 pb-20 lg:pb-6 lg:p-6 max-w-4xl mx-auto">
          <TabsContent value="home" className="flex flex-col gap-6 animate-fadeIn overflow-x-visible"><HomeTab lottoHistory={lottoHistory} /></TabsContent>
          <TabsContent value="analysis" className="space-y-6 animate-fadeIn"><AnalysisTab lottoHistory={lottoHistory} /></TabsContent>
          <TabsContent value="generate"><GenerateTab onSave={saveToBookmarks} lottoHistory={lottoHistory} /></TabsContent>
          <TabsContent value="bookmarks"><BookmarksTab bookmarks={bookmarks} onRemove={removeFromBookmarks} /></TabsContent>
        </main>

        {/* --- Bottom Navigation (Mobile) --- */}
        <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-4 h-14 rounded-full bg-muted p-1 shadow-lg">
              {navTriggers}
            </TabsList>
          </div>
        </div>
      </Tabs>
    </div>
  );
};