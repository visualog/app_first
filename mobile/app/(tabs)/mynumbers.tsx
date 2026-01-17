import { View, Text, SafeAreaView } from "react-native";

export default function MyNumbers() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
            <Text className="text-slate-900 text-xl font-bold">내 번호</Text>
            <Text className="text-slate-500 mt-2">저장된 번호 목록</Text>
        </SafeAreaView>
    );
}
