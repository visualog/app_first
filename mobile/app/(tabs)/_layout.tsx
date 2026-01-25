import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    if (Platform.OS === 'ios') {
        return (
            <NativeTabs>
                <NativeTabs.Trigger name="index">
                    <Label>홈</Label>
                    <Icon sf="rectangle.stack.fill" fallback="home" />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="generator">
                    <Label>생성</Label>
                    <Icon sf="sparkles.2" fallback="flash" />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="mynumbers">
                    <Label>내 번호</Label>
                    <Icon sf="tray.fill" fallback="layers" />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="bookmarks">
                    <Label>북마크</Label>
                    <Icon sf="heart.circle.fill" fallback="bookmark" />
                </NativeTabs.Trigger>

                <NativeTabs.Trigger name="search">
                    <Label>검색</Label>
                    <Icon sf="magnifyingglass" fallback="search" />
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    }

    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'black' }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: '홈',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="generator"
                options={{
                    title: '생성',
                    tabBarIcon: ({ color }) => <Ionicons name="flash" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="mynumbers"
                options={{
                    title: '내 번호',
                    tabBarIcon: ({ color }) => <Ionicons name="layers" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="bookmarks"
                options={{
                    title: '북마크',
                    tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: '검색',
                    tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
