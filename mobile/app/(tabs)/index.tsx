import { useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LottoBall } from "../../components/shared/LottoBall";
import { getLottoHistory, LottoDrawData } from "../../lib/lottoData";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

// Get real lotto data (Full History)
const LOTTO_HISTORY = getLottoHistory();

import { Card } from "../../components/ui/card";
import { TopPrizeList } from "../../components/lotto/TopPrizeList";

// PrizeBarGraph: Visualize 1st prize winning amount for the last 6 draws
const PrizeBarGraph = ({ history }: { history: LottoDrawData[] }) => {
    const recentHistory = history.slice(0, 6).reverse(); // Reverse to show chronologically (oldest to newest)
    const maxPrize = Math.max(...recentHistory.map(d => d["1등_1게임당당첨금액"] || 0));

    return (
        <View className="mt-8 border-t border-white/10 pt-4">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white/60 text-[10px] font-bold tracking-tight">최근 6회차 1등 당첨금 추이</Text>
                <Text className="text-white/40 text-[9px] font-medium">(단위: 원)</Text>
            </View>
            <View className="flex-row items-end justify-between h-16">
                {recentHistory.map((draw, idx) => {
                    const prize = draw["1등_1게임당당첨금액"] || 0;
                    const height = maxPrize > 0 ? (prize / maxPrize) * 100 : 0;
                    const isLatest = idx === 5;

                    return (
                        <View key={draw.회차} className="items-center flex-1">
                            {/* Bar Tooltip/Value (Optional, but let's keep it simple first) */}
                            <View
                                style={{ height: `${Math.max(height, 5)}%` }}
                                className={`w-[14px] rounded-t-[2px] ${isLatest ? 'bg-lime-300' : 'bg-indigo-300/40'}`}
                            />
                            <Text className={`text-[9px] mt-1.5 ${isLatest ? 'text-lime-300 font-bold' : 'text-white/30'}`}>
                                {draw.회차}회
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// HeroCard: Latest draw with gradient background
const HeroCard = ({ data, history, onPress }: { data: LottoDrawData; history: LottoDrawData[]; onPress?: () => void }) => {
    const numbers = [data.번호1, data.번호2, data.번호3, data.번호4, data.번호5, data.번호6];

    return (
        <Pressable onPress={onPress}>
            <Card borderRadius={40} className="w-full min-h-[400px] overflow-hidden relative bg-indigo-900 mb-6 border-0 shadow-2xl shadow-indigo-500/20">
                <View className="p-6 flex-1 relative z-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-5xl font-black text-white tracking-tighter">
                                {data.회차}
                            </Text>
                            <Text className="text-xl font-bold text-white/70">회</Text>
                        </View>
                        <View className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                            <Text className="text-white/80 font-bold text-[10px]">추첨일 · {data.추첨일}</Text>
                        </View>
                    </View>

                    <View>
                        <View className="flex-row justify-between mb-4">
                            {numbers.map((n, i) => (
                                <LottoBall key={i} number={n} size="lg" />
                            ))}
                        </View>
                        <View className="flex-row items-center justify-end gap-2 pr-1">
                            <Text className="text-white/30 text-xl font-light">+</Text>
                            <LottoBall number={data.보너스} size="lg" isBonus />
                        </View>
                    </View>

                    {/* Bar Graph Section */}
                    <PrizeBarGraph history={history} />
                </View>
            </Card>
        </Pressable>
    );
};

// StandardCard: Past draws in compact format
const StandardCard = ({ data, onPress }: { data: LottoDrawData; onPress?: () => void }) => {
    const numbers = [data.번호1, data.번호2, data.번호3, data.번호4, data.번호5, data.번호6];

    return (
        <Pressable onPress={onPress}>
            <Card borderRadius={16} className="bg-white p-4 border border-slate-200 mb-3">
                <View className="flex-row justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <Text className="text-xl font-bold text-slate-900">{data.회차}회</Text>
                    <Text className="text-sm text-slate-400">{data.추첨일}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    {numbers.map((n, i) => (
                        <LottoBall key={i} number={n} size="md" />
                    ))}
                    <Text className="text-slate-400 text-xl font-medium mb-1">+</Text>
                    <LottoBall number={data.보너스} size="md" isBonus />
                </View>
            </Card>
        </Pressable>
    );
};

export default function Index() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);

    const latestDraw = LOTTO_HISTORY[0];
    const pastDraws = LOTTO_HISTORY.slice(1);

    const today = new Date().toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const goToDetail = (round: number) => {
        router.push(`/lotto/${round}`);
    };

    // 탭 재클릭 시 상단으로 스크롤
    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
            // 이미 홈 화면에 있을 때 탭을 누르면 상단으로 스크롤
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            {/* ScrollView with ref for manual scroll-to-top */}
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{
                    paddingTop: insets.top + 20,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Page Title */}
                <View className="mb-4">
                    <Text className="text-3xl font-black text-slate-900 tracking-tight">오늘의 로또</Text>
                    <Text className="text-slate-500 text-sm font-medium">{today}</Text>
                </View>

                {/* Hero Card (Latest Draw) */}
                {latestDraw && (
                    <HeroCard
                        data={latestDraw}
                        history={LOTTO_HISTORY}
                        onPress={() => goToDetail(latestDraw.회차)}
                    />
                )}

                {/* Top Prize List */}
                <TopPrizeList history={LOTTO_HISTORY} />

                {/* Past Draws */}
                {pastDraws.map((item) => (
                    <StandardCard
                        key={item.회차}
                        data={item}
                        onPress={() => goToDetail(item.회차)}
                    />
                ))}
            </ScrollView>

            {/* Top Fade Gradient Overlay */}
            <LinearGradient
                colors={[
                    'rgba(248, 250, 252, 1)',
                    'rgba(248, 250, 252, 0.95)',
                    'rgba(248, 250, 252, 0.85)',
                    'rgba(248, 250, 252, 0.70)',
                    'rgba(248, 250, 252, 0.50)',
                    'rgba(248, 250, 252, 0.30)',
                    'rgba(248, 250, 252, 0.15)',
                    'rgba(248, 250, 252, 0.05)',
                    'rgba(248, 250, 252, 0)',
                ]}
                locations={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 1]}
                style={[styles.gradient, { top: 0, height: 100 }]}
                pointerEvents="none"
            />

            {/* Bottom Fade Gradient Overlay */}
            <LinearGradient
                colors={[
                    'rgba(248, 250, 252, 0)',
                    'rgba(248, 250, 252, 0.05)',
                    'rgba(248, 250, 252, 0.15)',
                    'rgba(248, 250, 252, 0.30)',
                    'rgba(248, 250, 252, 0.50)',
                    'rgba(248, 250, 252, 0.70)',
                    'rgba(248, 250, 252, 0.85)',
                    'rgba(248, 250, 252, 0.95)',
                    'rgba(248, 250, 252, 1)',
                ]}
                locations={[0, 0.25, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                style={[styles.gradient, { bottom: 0, height: 120 }]}
                pointerEvents="none"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 10,
    },
});
