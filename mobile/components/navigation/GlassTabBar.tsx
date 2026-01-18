import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Platform, Animated, Dimensions, PanResponder, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { SymbolView, SFSymbol } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ----------------------------------------------------------------------
// 🔧 설정 및 디자인
// ----------------------------------------------------------------------

const TAB_BAR_HEIGHT = 64;
const MARGIN_H = 20;
const GAP = 12;

const SEARCH_BTN_SIZE = TAB_BAR_HEIGHT;
const SEARCH_BTN_RADIUS = SEARCH_BTN_SIZE / 2;

const MAIN_PILL_WIDTH = SCREEN_WIDTH - (MARGIN_H * 2) - SEARCH_BTN_SIZE - GAP;
const MAIN_TAB_COUNT = 4;
const TAB_ITEM_WIDTH = MAIN_PILL_WIDTH / MAIN_TAB_COUNT;

const ICON_MAP: Record<string, { active: keyof typeof Ionicons.glyphMap, inactive: keyof typeof Ionicons.glyphMap, sfSymbol?: SFSymbol }> = {
    index: { active: "home", inactive: "home-outline", sfSymbol: "rectangle.stack.fill" },
    generator: { active: "flash", inactive: "flash-outline", sfSymbol: "sparkles.2" },
    mynumbers: { active: "layers", inactive: "layers-outline", sfSymbol: "tray.fill" },
    bookmarks: { active: "bookmark", inactive: "bookmark-outline", sfSymbol: "heart.circle.fill" },
    search: { active: "search", inactive: "search-outline", sfSymbol: "magnifyingglass" },
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Animation Values
    const translateX = useRef(new Animated.Value(0)).current;
    const indicatorScale = useRef(new Animated.Value(1)).current;
    const isDragging = useRef(false);

    const activeIndex = state.index;
    const isValidMainTab = activeIndex < MAIN_TAB_COUNT;

    // 1. 상태 동기화
    useEffect(() => {
        if (!isDragging.current && isValidMainTab) {
            Animated.spring(translateX, {
                toValue: activeIndex * TAB_ITEM_WIDTH,
                friction: 12, tension: 100, useNativeDriver: true,
            }).start();
        }
    }, [activeIndex, isValidMainTab]);

    // 2. 제스처 핸들러
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: () => {
                isDragging.current = true;
                Animated.spring(indicatorScale, {
                    toValue: 1.15, friction: 12, tension: 120, useNativeDriver: true
                }).start();
                translateX.stopAnimation((value) => {
                    translateX.setOffset(value);
                    translateX.setValue(0);
                });
            },

            onPanResponderMove: (e, gestureState) => {
                translateX.setValue(gestureState.dx);
            },

            onPanResponderRelease: (e, gestureState) => {
                isDragging.current = false;
                translateX.flattenOffset();

                Animated.spring(indicatorScale, {
                    toValue: 1.0, friction: 12, tension: 120, useNativeDriver: true
                }).start();

                if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
                    const touchX = e.nativeEvent.locationX;
                    const index = Math.floor(touchX / TAB_ITEM_WIDTH);
                    const clampedIndex = Math.max(0, Math.min(MAIN_TAB_COUNT - 1, index));
                    navigateToIndex(clampedIndex);
                } else {
                    translateX.stopAnimation((finalVal) => {
                        const predictedIndex = Math.round(finalVal / TAB_ITEM_WIDTH);
                        const clampedIndex = Math.max(0, Math.min(MAIN_TAB_COUNT - 1, predictedIndex));
                        navigateToIndex(clampedIndex);
                    });
                }
            },
            onPanResponderTerminate: () => {
                isDragging.current = false;
                translateX.flattenOffset();
                Animated.spring(indicatorScale, { toValue: 1.0, useNativeDriver: true }).start();
                if (isValidMainTab) {
                    Animated.spring(translateX, {
                        toValue: activeIndex * TAB_ITEM_WIDTH,
                        useNativeDriver: true,
                    }).start();
                }
            }
        })
    ).current;

    const navigateToIndex = (index: number) => {
        const route = state.routes[index];
        if (!route) return;
        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
        if (!event.defaultPrevented) navigation.navigate(route.name);
        Animated.spring(translateX, { toValue: index * TAB_ITEM_WIDTH, friction: 12, tension: 100, useNativeDriver: true }).start();
    };

    return (
        <View style={[styles.containerWrapper, { paddingBottom: 20 }]}>

            {/* 1. 메인 알약 (Main Pill) */}
            <View style={[styles.glassContainer, { width: MAIN_PILL_WIDTH, height: TAB_BAR_HEIGHT, borderRadius: 36 }]}>
                <View style={[styles.glassInner, { borderRadius: 36 }]} {...panResponder.panHandlers}>
                    <BlurView intensity={Platform.OS === 'ios' ? 50 : 80} tint="light" style={StyleSheet.absoluteFill} />

                    {isValidMainTab && (
                        <Animated.View
                            style={[
                                styles.activeIndicator,
                                { width: TAB_ITEM_WIDTH, transform: [{ translateX }, { scale: indicatorScale }] }
                            ]}
                        >
                            <BlurView intensity={Platform.OS === 'ios' ? 20 : 40} tint="default" style={StyleSheet.absoluteFill} />
                            <View style={styles.indicatorBorder} />
                        </Animated.View>
                    )}

                    <View style={styles.tabRow} pointerEvents="none">
                        {state.routes.slice(0, MAIN_TAB_COUNT).map((route: any, index: number) => {
                            const { options } = descriptors[route.key];
                            const label = options.title ?? route.name;
                            const isFocused = state.index === index;
                            const icons = ICON_MAP[route.name] || { active: "help", inactive: "help-outline" };

                            return (
                                <View key={route.key} style={[styles.tabItem, { width: TAB_ITEM_WIDTH }]}>
                                    <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                                        {Platform.OS === 'ios' && icons.sfSymbol ? (
                                            <SymbolView
                                                name={icons.sfSymbol}
                                                size={24}
                                                tintColor={isFocused ? "#007AFF" : "#333333"}
                                                style={{ width: 24, height: 24 }}
                                            />
                                        ) : (
                                            <Ionicons name={isFocused ? icons.active : icons.inactive} size={24} color={isFocused ? "#007AFF" : "#333333"} />
                                        )}
                                        <Text style={[styles.tabLabel, { color: isFocused ? "#007AFF" : "#333333" }]}>{label}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* 2. 간격 */}
            <View style={{ width: GAP }} />

            {/* 3. 검색 버튼 (Search Circle) */}
            <View style={[styles.glassContainer, { width: SEARCH_BTN_SIZE, height: SEARCH_BTN_SIZE, borderRadius: SEARCH_BTN_RADIUS }]}>
                <View style={[styles.glassInner, { borderRadius: SEARCH_BTN_RADIUS }]}>
                    <BlurView intensity={Platform.OS === 'ios' ? 50 : 80} tint="light" style={StyleSheet.absoluteFill} />
                    <Pressable
                        onPress={() => navigation.navigate('search')}
                        style={({ pressed }) => [
                            styles.searchBtnInner,
                            { opacity: pressed ? 0.7 : 1 }
                        ]}
                    >
                        {Platform.OS === 'ios' ? (
                            <View style={{ position: 'absolute', top: 18, left: 18, width: 28, height: 28 }}>
                                <SymbolView
                                    name="magnifyingglass"
                                    size={28}
                                    tintColor={state.index === 4 ? "#007AFF" : "#333333"}
                                    style={{ width: 28, height: 28 }}
                                />
                            </View>
                        ) : (
                            <Ionicons
                                name={state.index === 4 ? "search" : "search-outline"}
                                size={28}
                                color={state.index === 4 ? "#007AFF" : "#333333"}
                            />
                        )}
                    </Pressable>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
        paddingHorizontal: MARGIN_H,
        zIndex: 1000,
    },

    // Shared Shadows & Backgrounds
    glassContainer: {
        backgroundColor: 'rgba(255,255,255,0.75)',
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    },
    glassInner: {
        flex: 1,
        width: '100%', height: '100%', // Explicit dimensions to prevent collapse
        overflow: 'hidden',
    },

    // Search Button specific
    searchBtnInner: {
        flex: 1,
        width: '100%', height: '100%', // Fill the parent
        alignItems: 'center', justifyContent: 'center',
    },

    tabRow: { flexDirection: 'row', height: '100%', alignItems: 'center' },
    tabItem: { height: '100%', alignItems: 'center', justifyContent: 'center' },

    activeIndicator: {
        position: 'absolute', top: 4, bottom: 4, left: 0, borderRadius: 32,
        backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden', zIndex: 0,
    },
    indicatorBorder: {
        flex: 1, borderRadius: 32,
    },

    iconContainer: { alignItems: 'center', justifyContent: 'center', gap: 3 },
    activeIconContainer: { transform: [{ scale: 1.05 }] },
    tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: -0.2 },
});
