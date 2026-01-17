import React from 'react';
import { View, Text, Dimensions } from 'react-native';

interface SumComparisonProps {
    currentSum: number;
    prevSum: number;
}

const BAR_MAX_WIDTH = 120; // Max width for the bar
const MAX_POSSIBLE_SUM = 255; // (40+41+42+43+44+45) approx max sum in lotto

export function SumComparison({ currentSum, prevSum }: SumComparisonProps) {
    // Calculate percentage for bar width
    // Normalize against a reasonable max to visually show difference
    const currentPercent = Math.min((currentSum / MAX_POSSIBLE_SUM) * 100, 100);
    const prevPercent = Math.min((prevSum / MAX_POSSIBLE_SUM) * 100, 100);

    const diff = currentSum - prevSum;
    const isIncrease = diff > 0;

    return (
        <View className="bg-slate-50 w-full rounded-3xl p-6 mb-6">
            <Text className="text-slate-900 text-lg font-bold mb-6">당첨 번호 합계 분석</Text>

            <View className="flex-row items-center justify-between mb-2">
                {/* Previous Round */}
                <View className="items-center flex-1">
                    <Text className="text-slate-400 text-xs font-semibold mb-2">지난 회차</Text>
                    <View className="h-32 bg-slate-200 w-12 rounded-full justify-end overflow-hidden relative">
                        <View
                            style={{ height: `${prevPercent}%` }}
                            className="bg-slate-300 w-full rounded-b-full absolute bottom-0"
                        />
                    </View>
                    <Text className="text-slate-500 font-bold mt-3 text-lg">{prevSum}</Text>
                </View>

                {/* VS Badge */}
                <View className="bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 items-center z-10 mx-2">
                    <Text className={`text-sm font-bold ${isIncrease ? 'text-red-500' : diff < 0 ? 'text-blue-500' : 'text-slate-500'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                    </Text>
                </View>

                {/* Current Round */}
                <View className="items-center flex-1">
                    <Text className="text-indigo-500 text-xs font-bold mb-2">이번 회차</Text>
                    <View className="h-32 bg-indigo-100 w-12 rounded-full justify-end overflow-hidden relative shadow-inner">
                        <View
                            style={{ height: `${currentPercent}%` }}
                            className="bg-indigo-500 w-full rounded-b-full absolute bottom-0"
                        />
                    </View>
                    <Text className="text-slate-900 font-black mt-3 text-2xl">{currentSum}</Text>
                </View>
            </View>
        </View>
    );
}
