import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Vibration, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LottoBall } from "../../components/shared/LottoBall";
import { useBookmarkStore } from "../../lib/bookmarkStore";
import { checkNumberCombinationExists, getRecommendedNumbers, getLatestDraw } from "../../lib/lottoData";

type GeneratorMode = 'random' | 'ai' | 'range';

export default function Generator() {
    const [mode, setMode] = useState<GeneratorMode>('random');
    const [generatedSets, setGeneratedSets] = useState<Array<{ numbers: number[], type: string }>>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Range State
    const [minSum, setMinSum] = useState<string>("100");
    const [maxSum, setMaxSum] = useState<string>("170");

    // Store
    const { addBookmark, isBookmarked, removeBookmark, bookmarks } = useBookmarkStore();

    // Derived Data
    const latestDraw = getLatestDraw();
    const latestRound = latestDraw ? latestDraw.회차 + 1 : 0;

    // Logic: clear results when switching tabs
    const switchMode = (newMode: GeneratorMode) => {
        setMode(newMode);
        setGeneratedSets([]);
    };

    const generateRandom = () => {
        const sets: number[][] = [];
        for (let i = 0; i < 5; i++) {
            const numbers = new Set<number>();
            while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);
            sets.push(Array.from(numbers).sort((a, b) => a - b));
        }
        return sets.map(s => ({ numbers: s, type: '랜덤' }));
    };

    const generateAI = () => {
        const sets: number[][] = [];
        for (let i = 0; i < 5; i++) {
            sets.push(getRecommendedNumbers());
        }
        return sets.map(s => ({ numbers: s, type: 'AI 추천' }));
    };

    const generateRange = () => {
        const min = parseInt(minSum, 10) || 0;
        const max = parseInt(maxSum, 10) || 255;

        if (min > max) {
            Alert.alert("오류", "최소 합계가 최대 합계보다 클 수 없습니다.");
            return [];
        }

        const sets: number[][] = [];
        let attempts = 0;

        // Try to generate 5 sets
        while (sets.length < 5 && attempts < 1000) {
            attempts++;
            const numbers = new Set<number>();
            while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);
            const arr = Array.from(numbers).sort((a, b) => a - b);
            const sum = arr.reduce((a, b) => a + b, 0);

            if (sum >= min && sum <= max) {
                if (!checkNumberCombinationExists(arr)) {
                    sets.push(arr);
                }
            }
        }

        if (sets.length === 0) {
            Alert.alert("알림", "조건에 맞는 번호를 찾기 어렵습니다. 범위를 넓혀보세요.");
        }

        return sets.map(s => ({ numbers: s, type: `합계 ${min}~${max}` }));
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        Vibration.vibrate(50);

        setTimeout(() => {
            let results: Array<{ numbers: number[], type: string }> = [];

            try {
                if (mode === 'random') results = generateRandom();
                else if (mode === 'ai') results = generateAI();
                else if (mode === 'range') results = generateRange();

                setGeneratedSets(results);
            } catch (e) {
                console.error(e);
                Alert.alert("오류", "번호 생성 중 문제가 발생했습니다.");
            } finally {
                setIsGenerating(false);
            }
        }, 500);
    };

    const toggleBookmark = (numbers: number[]) => {
        if (isBookmarked(numbers)) {
            const item = bookmarks.find(b => JSON.stringify(b.numbers) === JSON.stringify(numbers));
            if (item) removeBookmark(item.id);
        } else {
            addBookmark(numbers, latestRound);
            Vibration.vibrate(20);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / Tabs */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>번호 생성기</Text>

                <View style={styles.tabsContainer}>
                    <Pressable
                        onPress={() => switchMode('random')}
                        style={[styles.tab, mode === 'random' && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, mode === 'random' && styles.tabTextActive]}>🎲 랜덤</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => switchMode('ai')}
                        style={[styles.tab, mode === 'ai' && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, mode === 'ai' && styles.tabTextActive]}>🤖 AI 추천</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => switchMode('range')}
                        style={[styles.tab, mode === 'range' && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, mode === 'range' && styles.tabTextActive]}>📊 합계 범위</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Description */}
                <View style={styles.descriptionContainer}>
                    {mode === 'random' && (
                        <Text style={styles.descriptionText}>완전한 무작위 번호를 5게임 생성합니다.{'\n'}운에 모든 것을 맡겨보세요!</Text>
                    )}
                    {mode === 'ai' && (
                        <Text style={styles.descriptionText}>역대 당첨 데이터를 분석하여{'\n'}자주 나오는 번호와 미출현 번호를 조합합니다.</Text>
                    )}
                    {mode === 'range' && (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <Text style={[styles.descriptionText, { mb: 16 }]}>설정된 합계 범위 내에서 번호를 생성합니다.{'\n'}보통 120~160 사이가 가장 많이 당첨됩니다.</Text>

                            <View style={styles.rangeInputContainer}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>최소 합계</Text>
                                    <TextInput
                                        value={minSum}
                                        onChangeText={setMinSum}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        maxLength={3}
                                    />
                                </View>
                                <Text style={styles.rangeSeparator}>~</Text>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.inputLabel}>최대 합계</Text>
                                    <TextInput
                                        value={maxSum}
                                        onChangeText={setMaxSum}
                                        keyboardType="numeric"
                                        style={styles.input}
                                        maxLength={3}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Generate Button */}
                <Pressable
                    onPress={handleGenerate}
                    disabled={isGenerating}
                    style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {isGenerating ? (
                            <Text style={styles.generateButtonText}>생성중...</Text>
                        ) : (
                            <>
                                <Ionicons name="flash" size={24} color="white" />
                                <Text style={styles.generateButtonText}>번호 생성하기</Text>
                            </>
                        )}
                    </View>
                </Pressable>

                {/* Results List */}
                {generatedSets.length > 0 && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsTitle}>생성 결과 ({generatedSets.length}게임)</Text>
                        {generatedSets.map((set, idx) => {
                            const bookmarked = isBookmarked(set.numbers);
                            return (
                                <View key={idx} style={styles.resultCard}>
                                    <View>
                                        <View style={styles.lottoBallContainer}>
                                            {set.numbers.map(n => (
                                                <LottoBall key={n} number={n} size="sm" />
                                            ))}
                                        </View>
                                        <View style={styles.resultMeta}>
                                            <View style={[styles.badge, set.type === 'AI 추천' ? styles.badgeAI : styles.badgeDefault]}>
                                                <Text style={[styles.badgeText, set.type === 'AI 추천' ? styles.badgeTextAI : styles.badgeTextDefault]}>{set.type}</Text>
                                            </View>
                                            <Text style={styles.sumText}>SUM: {set.numbers.reduce((a, b) => a + b, 0)}</Text>
                                        </View>
                                    </View>

                                    <Pressable
                                        onPress={() => toggleBookmark(set.numbers)}
                                        style={styles.bookmarkButton}
                                    >
                                        <Ionicons
                                            name={bookmarked ? "bookmark" : "bookmark-outline"}
                                            size={28}
                                            color={bookmarked ? "#4f46e5" : "#cbd5e1"}
                                        />
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        padding: 4,
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabActive: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
    },
    tabText: {
        fontWeight: 'bold',
        color: '#94a3b8',
    },
    tabTextActive: {
        color: '#4f46e5',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    descriptionContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    descriptionText: {
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    rangeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 16,
    },
    inputWrapper: {
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#f1f5f9',
        width: 80,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
        color: '#334155',
    },
    rangeSeparator: {
        color: '#cbd5e1',
        fontWeight: 'bold',
        fontSize: 20,
    },
    generateButton: {
        width: '100%',
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        backgroundColor: '#4f46e5',
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    generateButtonDisabled: {
        backgroundColor: '#a5b4fc',
    },
    generateButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
    },
    resultsContainer: {
        gap: 12,
    },
    resultsTitle: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        marginLeft: 4,
    },
    resultCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 12,
    },
    lottoBallContainer: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeDefault: {
        backgroundColor: '#f1f5f9',
    },
    badgeAI: {
        backgroundColor: '#f3e8ff',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    badgeTextDefault: {
        color: '#64748b',
    },
    badgeTextAI: {
        color: '#9333ea',
    },
    sumText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '500',
    },
    bookmarkButton: {
        padding: 12,
        marginRight: -12,
    },
});
