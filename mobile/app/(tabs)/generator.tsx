import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Vibration, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { useColorScheme } from "nativewind";
import { LottoBall } from "../../components/shared/LottoBall";
import { ShareCard } from "../../components/shared/ShareCard";
import { useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import { useBookmarkStore } from "../../lib/bookmarkStore";
import { checkNumberCombinationExists, getRecommendedNumbers, getLatestDraw } from "../../lib/lottoData";

type GeneratorMode = 'random' | 'ai' | 'range';

import { useRouter } from 'expo-router';

export default function Generator() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
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

    // Sharing
    const shareRef = useRef<ViewShot>(null);
    const [shareData, setShareData] = useState<{ numbers: number[], round: number, date: string } | null>(null);

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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(async () => {
            let results: Array<{ numbers: number[], type: string }> = [];

            try {
                if (mode === 'random') results = generateRandom();
                else if (mode === 'ai') results = generateAI();
                else if (mode === 'range') results = generateRange();

                setGeneratedSets(results);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Strategy: Ask for review when user is happy (successful generation)
                // 30% chance to request review to avoid annoyance
                if (await StoreReview.hasAction()) {
                    if (Math.random() < 0.3) {
                        StoreReview.requestReview();
                    }
                }
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
            Haptics.selectionAsync();
        } else {
            addBookmark(numbers, latestRound);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleShare = async (numbers: number[]) => {
        setShareData({
            numbers,
            round: latestRound,
            date: new Date().toLocaleDateString('ko-KR')
        });

        // Small delay to allow render
        setTimeout(async () => {
            if (shareRef.current && shareRef.current.capture) {
                try {
                    const uri = await shareRef.current.capture();
                    await Sharing.shareAsync(uri);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (error) {
                    Alert.alert("오류", "이미지 공유 중 문제가 발생했습니다.");
                } finally {
                    setShareData(null); // Hide again
                }
            }
        }, 100);
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            {/* Hidden Share Card */}
            <View style={{ position: 'absolute', left: -9999, top: 0 }}>
                {shareData && (
                    <ShareCard
                        ref={shareRef}
                        numbers={shareData.numbers}
                        round={shareData.round}
                        date={shareData.date}
                    />
                )}
            </View>
            {/* Header / Tabs */}
            <View className="pt-14 pb-4 px-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-black text-slate-900 dark:text-white">번호 생성기</Text>
                    <Pressable
                        onPress={() => router.push("/qr")}
                        className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
                    >
                        <Ionicons name="qr-code-outline" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
                    </Pressable>
                </View>

                <View className="flex-row bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
                    <Pressable
                        onPress={() => switchMode('random')}
                        className={`flex-1 py-2.5 items-center rounded-lg ${mode === 'random' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${mode === 'random' ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>🎲 랜덤</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => switchMode('ai')}
                        className={`flex-1 py-2.5 items-center rounded-lg ${mode === 'ai' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${mode === 'ai' ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>🤖 AI 추천</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => switchMode('range')}
                        className={`flex-1 py-2.5 items-center rounded-lg ${mode === 'range' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${mode === 'range' ? 'text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>📊 합계 범위</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Description */}
                <View className="mb-8 items-center">
                    {mode === 'random' && (
                        <Text className="text-slate-500 dark:text-slate-400 text-center leading-5">완전한 무작위 번호를 5게임 생성합니다.{'\n'}운에 모든 것을 맡겨보세요!</Text>
                    )}
                    {mode === 'ai' && (
                        <Text className="text-slate-500 dark:text-slate-400 text-center leading-5">역대 당첨 데이터를 분석하여{'\n'}자주 나오는 번호와 미출현 번호를 조합합니다.</Text>
                    )}
                    {mode === 'range' && (
                        <View className="w-full items-center">
                            <Text className="text-slate-500 dark:text-slate-400 text-center leading-5 mb-4">설정된 합계 범위 내에서 번호를 생성합니다.{'\n'}보통 120~160 사이가 가장 많이 당첨됩니다.</Text>

                            <View className="flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4">
                                <View className="items-center">
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 mb-1">최소 합계</Text>
                                    <TextInput
                                        value={minSum}
                                        onChangeText={setMinSum}
                                        keyboardType="numeric"
                                        className="bg-slate-100 dark:bg-slate-800 w-20 px-3 py-2 rounded-lg text-center font-bold text-lg text-slate-700 dark:text-white"
                                        maxLength={3}
                                    />
                                </View>
                                <Text className="text-slate-300 dark:text-slate-600 font-bold text-xl">~</Text>
                                <View className="items-center">
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 mb-1">최대 합계</Text>
                                    <TextInput
                                        value={maxSum}
                                        onChangeText={setMaxSum}
                                        keyboardType="numeric"
                                        className="bg-slate-100 dark:bg-slate-800 w-20 px-3 py-2 rounded-lg text-center font-bold text-lg text-slate-700 dark:text-white"
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
                    className={`w-full py-5 rounded-3xl items-center justify-center mb-8 shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] ${isGenerating ? 'bg-indigo-300 dark:bg-slate-700' : 'bg-indigo-600 dark:bg-indigo-600'}`}
                >
                    <View className="flex-row items-center gap-2">
                        {isGenerating ? (
                            <Text className="text-white font-bold text-lg">생성중...</Text>
                        ) : (
                            <>
                                <Ionicons name="flash" size={24} color="white" />
                                <Text className="text-white font-bold text-lg">번호 생성하기</Text>
                            </>
                        )}
                    </View>
                </Pressable>

                {/* Results List */}
                {generatedSets.length > 0 && (
                    <View className="gap-3">
                        <Text className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 ml-1">생성 결과 ({generatedSets.length}게임)</Text>
                        {generatedSets.map((set, idx) => {
                            const bookmarked = isBookmarked(set.numbers);
                            const isAI = set.type === 'AI 추천';

                            return (
                                <Animated.View
                                    key={idx}
                                    entering={FadeInUp.delay(idx * 100).springify()}
                                    layout={Layout.springify()}
                                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row justify-between items-center shadow-sm"
                                >
                                    <View>
                                        <View className="flex-row gap-1.5 mb-2">
                                            {set.numbers.map(n => (
                                                <LottoBall key={n} number={n} size="sm" />
                                            ))}
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <View className={`px-2 py-0.5 rounded ${isAI ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                <Text className={`text-[10px] font-bold ${isAI ? 'text-purple-600 dark:text-purple-300' : 'text-slate-500 dark:text-slate-400'}`}>{set.type}</Text>
                                            </View>
                                            <Text className="text-slate-300 dark:text-slate-600 text-xs font-medium">SUM: {set.numbers.reduce((a, b) => a + b, 0)}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row">
                                        <Pressable
                                            onPress={() => handleShare(set.numbers)}
                                            className="p-3"
                                        >
                                            <Ionicons name="share-social-outline" size={24} color="#94a3b8" />
                                        </Pressable>

                                        <Pressable
                                            onPress={() => toggleBookmark(set.numbers)}
                                            className="p-3 -mr-3"
                                        >
                                            <Ionicons
                                                name={bookmarked ? "bookmark" : "bookmark-outline"}
                                                size={28}
                                                color={bookmarked ? "#4f46e5" : "#cbd5e1"}
                                            />
                                        </Pressable>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}


