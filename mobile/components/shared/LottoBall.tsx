import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * LottoBall component matching design-refresh branch:
 * - Color-coded backgrounds based on number range
 * - Bonus ball uses 호리병 (peanut) shape with purple background
 * Refactored to use standard StyleSheet to avoid NativeWind context crashes.
 */
export const LottoBall: React.FC<{
    number: number;
    size?: 'sm' | 'md' | 'lg';
    isBonus?: boolean;
    style?: any; // Allow external styles override
}> = ({ number, size = 'md', isBonus = false, style }) => {

    const getSize = () => {
        switch (size) {
            case 'sm': return { width: 32, height: 32, fontSize: 12 };
            case 'lg': return { width: 48, height: 48, fontSize: 18 };
            default: return { width: 40, height: 40, fontSize: 16 };
        }
    };

    // Bonus Ball (Peanut Shape)
    if (isBonus) {
        const bonusSize = () => {
            switch (size) {
                case 'sm': return { width: 32, height: 44, fontSize: 12 };
                case 'lg': return { width: 48, height: 64, fontSize: 18 };
                default: return { width: 40, height: 56, fontSize: 16 };
            }
        };
        const dim = bonusSize();

        return (
            <View style={[{ width: dim.width, height: dim.height, alignItems: 'center', justifyContent: 'center' }, style]}>
                <View style={StyleSheet.absoluteFill}>
                    <Svg viewBox="0 0 100 130" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                        <Path
                            fill="rgb(233, 213, 255)"
                            d="M 25 15 L 75 15 C 95 15, 95 61, 80 65 C 95 69, 95 115, 75 115 L 25 115 C 5 115, 5 69, 20 65 C 5 61, 5 15, 25 15 Z"
                        />
                    </Svg>
                </View>
                <Text style={{ fontSize: dim.fontSize, fontWeight: 'bold', color: '#581c87' }}>{number}</Text>
            </View>
        );
    }

    // Regular Ball
    const getColors = (n: number) => {
        if (n <= 10) return { bg: '#fef08a', text: '#854d0e' }; // yellow-200, yellow-800
        if (n <= 20) return { bg: '#bfdbfe', text: '#1e40af' }; // blue-200, blue-800
        if (n <= 30) return { bg: '#fecdd3', text: '#9f1239' }; // rose-200, rose-800
        if (n <= 40) return { bg: '#e5e7eb', text: '#1f2937' }; // gray-200, gray-800
        return { bg: '#a7f3d0', text: '#065f46' }; // emerald-200, emerald-800
    };

    const dim = getSize();
    const colors = getColors(number);

    return (
        <View style={[
            {
                width: dim.width,
                height: dim.height,
                borderRadius: dim.width / 2,
                backgroundColor: colors.bg,
                alignItems: 'center',
                justifyContent: 'center'
            },
            style
        ]}>
            <Text style={{ fontSize: dim.fontSize, fontWeight: 'bold', color: colors.text }}>
                {number}
            </Text>
        </View>
    );
};
