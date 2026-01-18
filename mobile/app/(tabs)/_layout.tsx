import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
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
