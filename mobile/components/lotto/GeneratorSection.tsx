import React, { useState } from 'react';
import { View, Text, Pressable, Alert, Vibration } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LottoBall } from "../shared/LottoBall";
import { checkNumberCombinationExists } from "../../lib/lottoData";
import { useBookmarkStore } from "../../lib/bookmarkStore";

interface GeneratorSectionProps {
    targetSum: number;
    currentRound: number;
}

export function GeneratorSection({ targetSum, currentRound }: GeneratorSectionProps) {
    const [generatedSets, setGeneratedSets] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Bookmark store
    const { addBookmark, isBookmarked, removeBookmark, bookmarks } = useBookmarkStore();

    // Helper: Generate a random set with target sum
    const generateRandomSet = (target: number): number[] | null => {
        let attempts = 0;
        const maxAttempts = 5000; // Safety break

        while (attempts < maxAttempts) {
            attempts++;
            const numbers = new Set<number>();
            while (numbers.size < 6) {
                numbers.add(Math.floor(Math.random() * 45) + 1);
            }
            const arr = Array.from(numbers).sort((a, b) => a - b);
            const sum = arr.reduce((a, b) => a + b, 0);

            if (sum === target) {
                // Check if this specific combination exists in history
                if (!checkNumberCombinationExists(arr)) {
                    return arr;
                }
            }
        }
        return null; // Failed to find match
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Delay to show loading state / animation feeling
        setTimeout(() => {
            const newSets: number[][] = [];
            for (let i = 0; i < 3; i++) {
                const set = generateRandomSet(targetSum);
                if (set) newSets.push(set);
            }

            if (newSets.length < 3) {
                Alert.alert("알림", "조건에 맞는 번호를 모두 찾지 못했습니다. 다시 시도해주세요.");
            }

            setGeneratedSets(newSets);
            setIsGenerating(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
    };

    const toggleBookmark = (numbers: number[]) => {
        if (isBookmarked(numbers)) {
            // Find ID to remove (inefficient but safe)
            const item = bookmarks.find(b => JSON.stringify(b.numbers) === JSON.stringify(numbers));
            if (item) removeBookmark(item.id);
        } else {
            addBookmark(numbers, currentRound);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    return (
        <View className="w-full mb-10">
            {/* Title & Desc */}
            <View className="mb-6">
                <Text className="text-slate-900 dark:text-white text-lg font-bold">합계 기반 번호 생성</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    이번 회차 합계({targetSum})와 동일하지만,{"\n"}
                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold">역대 1등 당첨 내역에는 없는</Text> 번호를 추천합니다.
                </Text>
            </View>

            {/* Generate Button */}
            <Pressable
                onPress={handleGenerate}
                disabled={isGenerating}
                className={`w-full py-4 rounded-2xl items-center justify-center mb-8 ${isGenerating ? 'bg-indigo-300' : 'bg-indigo-600 shadow-lg shadow-indigo-200'}`}
            >
                <View className="flex-row items-center gap-2">
                    <Ionicons name="sparkles" size={20} color="white" />
                    <Text className="text-white font-bold text-lg">
                        {isGenerating ? "생성중..." : "번호 3개 생성하기"}
                    </Text>
                </View>
            </Pressable>

            {/* Result List */}
            <View className="gap-4">
                {generatedSets.map((set, idx) => {
                    const bookmarked = isBookmarked(set);
                    return (
                        <Animated.View
                            key={idx}
                            entering={FadeInUp.delay(idx * 100).springify()}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between shadow-sm"
                        >
                            <View className="flex-row gap-1.5 ">
                                {set.map((n) => (
                                    <LottoBall key={n} number={n} size="sm" />
                                ))}
                            </View>

                            <Pressable
                                onPress={() => toggleBookmark(set)}
                                className="p-2"
                            >
                                <Ionicons
                                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                                    size={24}
                                    color={bookmarked ? "#4f46e5" : "#cbd5e1"}
                                />
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
        </View >
    );
}
