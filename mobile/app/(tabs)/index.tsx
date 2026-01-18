import { View, Text, StyleSheet, Dimensions, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LottoBall } from "../../components/shared/LottoBall";
import { getLottoHistory, LottoDrawData } from "../../lib/lottoData";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Get real lotto data (Full History)
const LOTTO_HISTORY = getLottoHistory();

// HeroCard: Latest draw with gradient background
const HeroCard = ({ data, onPress }: { data: LottoDrawData; onPress?: () => void }) => {
    const numbers = [data.번호1, data.번호2, data.번호3, data.번호4, data.번호5, data.번호6];

    return (
        <Pressable onPress={onPress}>
            <View className="w-full min-h-[400px] rounded-3xl overflow-hidden relative bg-indigo-900 mb-6">
                <View className="p-6 flex-1 justify-between relative z-10">
                    <View>
                        <View className="bg-yellow-400 self-start px-3 py-1 rounded-full mb-3">
                            <Text className="text-yellow-900 font-bold text-sm">최신 회차</Text>
                        </View>
                        <Text className="text-4xl font-black text-white tracking-tight">
                            {data.회차}회
                        </Text>
                        <Text className="text-purple-200 text-lg font-medium mt-1">
                            {data.추첨일}
                        </Text>
                    </View>

                    <View className="mt-8">
                        <Text className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-3">
                            당첨 번호
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {numbers.map((n, i) => (
                                <LottoBall key={i} number={n} size="lg" />
                            ))}
                        </View>
                    </View>

                    <View className="mt-6">
                        <Text className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-3">
                            보너스 번호
                        </Text>
                        <LottoBall number={data.보너스} size="lg" isBonus />
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

// StandardCard: Past draws in compact format
const StandardCard = ({ data, onPress }: { data: LottoDrawData; onPress?: () => void }) => {
    const numbers = [data.번호1, data.번호2, data.번호3, data.번호4, data.번호5, data.번호6];

    return (
        <Pressable onPress={onPress}>
            <View className="bg-white rounded-2xl p-4 border border-slate-200 mb-3">
                <View className="flex-row justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <Text className="text-xl font-bold text-slate-900">{data.회차}회</Text>
                    <Text className="text-sm text-slate-400">{data.추첨일}</Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row gap-1.5">
                        {numbers.map((n, i) => (
                            <LottoBall key={i} number={n} size="md" />
                        ))}
                    </View>
                    <View className="flex-row items-center gap-2 pl-2 border-l border-slate-100">
                        <Text className="text-xs text-slate-400 font-medium">보너스</Text>
                        <LottoBall number={data.보너스} size="md" isBonus />
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default function Index() {
    const insets = useSafeAreaInsets();
    const router = useRouter(); // Use router for navigation

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

    const renderHeader = () => (
        <View>
            {/* Page Title */}
            <View className="mb-4">
                <Text className="text-3xl font-black text-slate-900 tracking-tight">오늘의 로또</Text>
                <Text className="text-slate-500 text-sm font-medium">{today}</Text>
            </View>

            {/* Hero Card (Latest Draw) */}
            {latestDraw && <HeroCard data={latestDraw} onPress={() => goToDetail(latestDraw.회차)} />}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* FlatList for High Performance Rendering */}
            <FlatList
                data={pastDraws}
                keyExtractor={(item) => item.회차.toString()}
                renderItem={({ item }) => (
                    <StandardCard
                        data={item}
                        onPress={() => goToDetail(item.회차)}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{
                    paddingTop: insets.top + 20,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                windowSize={5}
                removeClippedSubviews={true}
            />

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
