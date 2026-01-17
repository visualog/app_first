
export interface LottoHistory {
  '회차': number;
  '추첨일': string;
  '1등_총당첨금': number;
  '1등_당첨인원': number;
  '번호1': number;
  '번호2': number;
  '번호3': number;
  '번호4': number;
  '번호5': number;
  '번호6': number;
  '보너스': number;
}

export interface GeneratedSet { 
  id: string; 
  numbers: number[]; 
  reason?: string; 
  sum?: number; 
  matchRound?: number | null; 
}

export interface Insight { 
  title: string; 
  bullets?: string[]; 
  description?: string; 
  tag: string; 
}

export interface AnalysisData { 
  hotNumbers: { number: number; count: number }[]; 
  coldNumbers: { number: number; count: number }[]; 
  insights: Insight[]; 
}

export interface PrizeCardData { 
  title: string; 
  value: string; 
  comparisonText?: string; 
  comparisonValue?: number; 
  graphData?: number[]; 
  isTextOnly?: boolean; 
}
