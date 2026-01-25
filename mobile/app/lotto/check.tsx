import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDrawByRound } from '../../lib/lottoData';
import { LottoBall } from '../../components/shared/LottoBall';
import { Ionicons } from "@expo/vector-icons";

export default function CheckResultScreen() {
    const router = useRouter();
    const { round: roundStr, numbers: numbersStr } = useLocalSearchParams<{ round: string, numbers: string }>();
    const round = parseInt(roundStr || '0', 10);
    const myNumbers: number[][] = JSON.parse(numbersStr || '[]');

    const draw = getDrawByRound(round);

    const results = useMemo(() => {
        if (!draw) return null;

        const winningNumbers = [draw.번호1, draw.번호2, draw.번호3, draw.번호4, draw.번호5, draw.번호6];
        const bonus = draw.보너스;

        return myNumbers.map(set => {
            const matches = set.filter(n => winningNumbers.includes(n));
            const hasBonus = set.includes(bonus);
            let rank = '낙첨';
            let color = 'text-slate-400';

            switch (matches.length) {
                case 6: rank = '1등'; color = 'text-yellow-500'; break;
                case 5: rank = hasBonus ? '2등' : '3등'; color = hasBonus ? 'text-blue-500' : 'text-green-500'; break;
                case 4: rank = '4등'; color = 'text-indigo-500'; break;
                case 3: rank = '5등'; color = 'text-cyan-500'; break;
            }

            return { set, matches, hasBonus, rank, color };
        });
    }, [draw, myNumbers]);

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <View className="pt-14 pb-4 px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex-row items-center">
                <Pressable onPress={() => router.back()} className="p-2 -ml-2 mr-2">
                    <Ionicons name="arrow-back" size={24} color="#64748b" />
                </Pressable>
                <Text className="text-xl font-bold text-slate-900 dark:text-white">{round}회차 당첨 확인</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {!draw ? (
                    <View className="items-center py-20">
                        <Ionicons name="time-outline" size={64} color="#94a3b8" />
                        <Text className="text-xl font-bold text-slate-900 dark:text-white mt-6">미발표 회차입니다</Text>
                        <Text className="text-slate-500 text-center mt-2">
                            아직 추첨 결과가 나오지 않았습니다.{'\n'}
                            추첨일 이후 다시 확인해주세요.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="mb-8 items-center">
                            <Text className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">WINNING NUMBERS</Text>
                            <View className="flex-row gap-2">
                                {[draw.번호1, draw.번호2, draw.번호3, draw.번호4, draw.번호5, draw.번호6].map(n => (
                                    <LottoBall key={n} number={n} size="md" />
                                ))}
                                <View className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
                                <LottoBall number={draw.보너스} size="md" isBonus={true} />
                            </View>
                        </View>

                        <View className="gap-4">
                            <Text className="text-sm font-bold text-slate-500 mb-0 uppercase tracking-widest">MY NUMBERS</Text>
                            {results?.map((res, idx) => (
                                <View key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-row justify-between items-center">
                                    <View className="gap-2">
                                        <View className="flex-row gap-1">
                                            {res.set.map(n => {
                                                const isMatch = draw && [draw.번호1, draw.번호2, draw.번호3, draw.번호4, draw.번호5, draw.번호6].includes(n);
                                                const isBonus = draw && n === draw.보너스;
                                                // Highlight matches? Maybe just simpler ball
                                                return (
                                                    <View key={n} style={{ opacity: (isMatch || (isBonus && res.rank === '2등')) ? 1 : 0.3 }}>
                                                        <LottoBall number={n} size="sm" />
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    </View>
                                    <View className="items-end min-w-[50px]">
                                        <Text className={`font-black text-lg ${res.color}`}>{res.rank}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
