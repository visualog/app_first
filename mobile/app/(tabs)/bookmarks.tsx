import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBookmarkStore, BookmarkItem } from "../../lib/bookmarkStore";
import { LottoBall } from "../../components/shared/LottoBall";

// Card component for each bookmark
const BookmarkCard = ({ item, onDelete }: { item: BookmarkItem; onDelete: (id: string) => void }) => {
    const date = new Date(item.createdAt).toLocaleDateString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <View className="bg-white p-5 rounded-2xl border border-slate-100 mb-3 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <View className="flex-row items-center gap-2 mb-1">
                        <View className="bg-indigo-50 px-2 py-0.5 rounded-md">
                            <Text className="text-indigo-600 text-[10px] font-bold">생성 조합</Text>
                        </View>
                        {item.targetRound && (
                            <Text className="text-slate-400 text-xs text font-medium">
                                {item.targetRound}회차 기반
                            </Text>
                        )}
                    </View>
                    <Text className="text-slate-300 text-xs">{date}</Text>
                </View>

                <Pressable onPress={() => onDelete(item.id)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color="#cbd5e1" />
                </Pressable>
            </View>

            <View className="flex-row justify-between items-center">
                <View className="flex-row gap-1.5">
                    {item.numbers.map((n) => (
                        <LottoBall key={n} number={n} size="sm" />
                    ))}
                </View>
                <View className="items-end">
                    <Text className="text-[10px] text-slate-400 font-bold mb-0.5">SUM</Text>
                    <Text className="text-slate-700 font-bold text-lg">{item.sum}</Text>
                </View>
            </View>
        </View>
    );
};

export default function Bookmarks() {
    const insets = useSafeAreaInsets();
    const { bookmarks, removeBookmark } = useBookmarkStore();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View className="px-6 py-4 mb-2">
                <Text className="text-3xl font-black text-slate-900">북마크</Text>
                <Text className="text-slate-500 font-medium">저장된 행운의 번호 {bookmarks.length}개</Text>
            </View>

            {bookmarks.length === 0 ? (
                <View className="flex-1 items-center justify-center pb-20 opacity-50">
                    <Ionicons name="bookmark-outline" size={48} color="#cbd5e1" />
                    <Text className="text-slate-400 mt-4 text-center">
                        아직 저장된 번호가 없습니다.{"\n"}
                        회차별 상세화면에서 번호를 생성해보세요!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BookmarkCard item={item} onDelete={removeBookmark} />
                    )}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingBottom: insets.bottom + 100,
                    }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
});
