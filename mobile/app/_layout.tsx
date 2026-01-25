import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

export default function Layout() {
    return (
        <SafeAreaProvider>
            <View className="flex-1 bg-slate-50 dark:bg-slate-950">
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
            </View>
        </SafeAreaProvider>
    );
}
