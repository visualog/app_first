import { Tabs } from "expo-router";
import { GlassTabBar } from "../../components/navigation/GlassTabBar";

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <GlassTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 0,
                },
                tabBarBackground: () => null,
            }}
        >
            <Tabs.Screen name="index" options={{ title: "홈" }} />
            <Tabs.Screen name="generator" options={{ title: "생성" }} />
            <Tabs.Screen name="mynumbers" options={{ title: "내 번호" }} />
            <Tabs.Screen name="bookmarks" options={{ title: "북마크" }} />
            <Tabs.Screen name="search" options={{ title: "검색" }} />
        </Tabs>
    );
}
