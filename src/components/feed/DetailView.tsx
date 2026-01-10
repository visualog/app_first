import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { LottoBall } from '@/components/shared/LottoBall';
import { Badge } from "@/components/ui/badge";
import { LottoHistory } from '@/types';

interface DetailViewProps {
    isOpen: boolean;
    onClose: () => void;
    data: LottoHistory | null;
}

export const DetailView: React.FC<DetailViewProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="fixed inset-0 w-screen h-screen max-w-none rounded-none p-0 overflow-y-auto bg-white dark:bg-slate-900 border-none flex flex-col top-0 left-0 translate-x-0 translate-y-0 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-0">

                {/* Header / Hero Section of Modal */}
                <div className="bg-slate-100 dark:bg-slate-800 p-6 flex flex-col items-center justify-center gap-4">
                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm self-start mb-2">
                        {data.회차}회차 당첨결과
                    </Badge>

                    <div className="flex flex-wrap justify-center gap-2">
                        {[...Array(6)].map((_, i) => (
                            <LottoBall
                                key={i}
                                number={data[`번호${i + 1}` as keyof LottoHistory] as number}
                                size="md"
                            />
                        ))}
                        <div className="flex items-center">
                            <span className="text-slate-400 mx-1">+</span>
                            <LottoBall number={data['보너스']} isBonus={true} size="md" />
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm mt-2">{data.추첨일} 추첨</p>
                </div>

                {/* Details List */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="text-slate-500 font-medium">1등 당첨금</span>
                        <span className="text-xl font-bold text-emerald-600">
                            {typeof data['1등_총당첨금'] === 'number'
                                ? (data['1등_총당첨금'] / 100000000).toFixed(1) + '억'
                                : data['1등_총당첨금']}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                        <span className="text-slate-500 font-medium">1등 당첨 인원</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {data['1등_당첨인원']}명
                        </span>
                    </div>

                    {/* Analysis or Insights Placeholders */}
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">당첨 분석</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            이번 회차는 홀수 번호가 더 많이 나왔습니다. (3:3 비율)
                            <br />
                            직전 회차 대비 당첨금이 소폭 상승했습니다.
                        </p>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
