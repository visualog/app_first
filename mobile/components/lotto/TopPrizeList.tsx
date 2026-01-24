import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { LottoDrawData } from "../../lib/lottoData";
import { Card } from "../ui/card";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface TopPrizeListProps {
    history: LottoDrawData[];
}

export const TopPrizeList = ({ history }: TopPrizeListProps) => {
    const router = useRouter();

    // Sort by 1st prize amount descending and take top 6
    // Filter out entries where prize is 0 or undefined
    const topPrizes = [...history]
        .filter(d => (d["1등_1게임당당첨금액"] || 0) > 0)
        .sort((a, b) => (b["1등_1게임당당첨금액"] || 0) - (a["1등_1게임당당첨금액"] || 0))
        .slice(0, 6);

    const formatCurrency = (amount: number) => {
        // Format to Korean Won (e.g., 400억 5,000만) roughly or just locale string
        // Simple locale string for now: 40,050,000,000
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount).replace('₩', '') + '원';
    };

    const formatSimpleCurrency = (amount: number) => {
        // e.g. 407억
        const billion = Math.floor(amount / 100000000);
        const remainder = Math.floor((amount % 100000000) / 10000);
        return `${billion}억${remainder > 0 ? ` ${remainder}만` : ''}`;
    };

    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between px-1 mb-4">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="trophy" size={20} color="#f59e0b" />
                    <Text className="text-lg font-bold text-slate-900">역대 1등 최고 당첨금</Text>
                </View>
                <Text className="text-xs text-slate-400 font-medium">1인당 수령액 기준</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
            >
                {topPrizes.map((data, index) => {
                    const rank = index + 1;
                    const prize = data["1등_1게임당당첨금액"] || 0;

                    return (
                        <Pressable
                            key={data.회차}
                            onPress={() => router.push(`/lotto/${data.회차}`)}
                        >
                            <Card className="w-[160px] p-4 bg-white border border-slate-100 shadow-sm">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className={`w-6 h-6 rounded-full items-center justify-center ${rank <= 3 ? 'bg-amber-100' : 'bg-slate-100'}`}>
                                        <Text className={`text-xs font-bold ${rank <= 3 ? 'text-amber-600' : 'text-slate-500'}`}>{rank}</Text>
                                    </View>
                                    <Text className="text-xs text-slate-400">{data.회차}회</Text>
                                </View>

                                <Text className="text-lg font-black text-indigo-900 mb-1 leading-tight">
                                    {formatSimpleCurrency(prize)}
                                </Text>
                                <Text className="text-[10px] text-slate-400">
                                    {data.추첨일}
                                </Text>
                            </Card>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};
