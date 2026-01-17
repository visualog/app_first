import { View, Text, SafeAreaView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Search() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-5">
                <Text className="text-3xl font-bold text-slate-900 mb-4">검색</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl p-3 gap-3">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="회차, 번호 검색"
                        className="flex-1 text-base text-slate-900"
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}
