import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getDrawByRound, getDrawByRound as getDraw } from "../../lib/lottoData";
import { LottoBall } from "../../components/shared/LottoBall";
import { SumComparison } from "../../components/lotto/SumComparison";
import { GeneratorSection } from "../../components/lotto/GeneratorSection";

export default function LottoDetailScreen() {
    const { round } = useLocalSearchParams<{ round: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const roundNumber = parseInt(round || '0', 10);
    const data = getDraw(roundNumber);

    // Previous Round Data for Comparison
    const prevData = getDraw(roundNumber - 1);

    if (!data) return null;

    const numbers = [data.번호1, data.번호2, data.번호3, data.번호4, data.번호5, data.번호6];
    const currentSum = numbers.reduce((a, b) => a + b, 0);

    let prevSum = 0;
    if (prevData) {
        prevSum = [prevData.번호1, prevData.번호2, prevData.번호3, prevData.번호4, prevData.번호5, prevData.번호6].reduce((a, b) => a + b, 0);
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom + 40,
                }}
            >
                {/* 1. Header (Floating Back Button) */}
                <View className="px-6 py-4 flex-row items-center justify-between">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </Pressable>
                </View>

                {/* 2. Title Section */}
                <View className="items-center mt-2 mb-10 px-6">
                    <View className="bg-indigo-50 px-4 py-1.5 rounded-full mb-4">
                        <Text className="text-indigo-600 font-bold text-sm tracking-wide">{data.추첨일}</Text>
                    </View>
                    <Text className="text-6xl font-black text-slate-900 tracking-tighter mb-2">
                        {data.회차}<Text className="text-4xl font-bold text-slate-300">회</Text>
                    </Text>
                    <Text className="text-slate-400 font-medium">당첨 결과</Text>
                </View>

                {/* 3. Winning Numbers (One Row) */}
                <View className="mb-0">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10, gap: 12, alignItems: 'center' }}
                    >
                        {numbers.map((n, i) => (
                            <View key={i} className="scale-110">
                                <LottoBall number={n} size="lg" />
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-6">
                    {/* 4. Bonus Number (Moved Below) */}
                    <View className="items-center mb-12 mt-4">
                        <View className="bg-slate-50 rounded-2xl p-6 w-full items-center">
                            <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">
                                BONUS NUMBER
                            </Text>
                            <View className="scale-125">
                                <LottoBall number={data.보너스} size="lg" isBonus />
                            </View>
                            <Text className="text-purple-300 font-bold text-xl mt-3">{data.보너스}</Text>
                        </View>
                    </View>

                    {/* 5. Analysis Section */}
                    {prevData && (
                        <SumComparison currentSum={currentSum} prevSum={prevSum} />
                    )}

                    {/* 6. Generator Section */}
                    <GeneratorSection targetSum={currentSum} currentRound={data.회차} />
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff', // Clean white background as requested
    },
    scrollView: {
        flex: 1,
    },
});
