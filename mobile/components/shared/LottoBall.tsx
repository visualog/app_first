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

    // Bonus Ball (New Shape)
    if (isBonus) {
        // New SVG is 48x48 (Square), so we use square dimensions
        const bonusSize = () => {
            switch (size) {
                case 'sm': return { width: 32, height: 32, fontSize: 12 };
                case 'lg': return { width: 48, height: 48, fontSize: 18 };
                default: return { width: 40, height: 40, fontSize: 16 };
            }
        };
        const dim = bonusSize();

        return (
            <View style={[{ width: dim.width, height: dim.height, alignItems: 'center', justifyContent: 'center' }, style]}>
                <View style={StyleSheet.absoluteFill}>
                    <Svg viewBox="0 0 48 48" style={{ width: '100%', height: '100%' }}>
                        <Path
                            fill="rgb(233, 213, 255)"
                            d="M33 4C39.0751 4 44 8.92487 44 15C44 18.722 42.1495 22.0095 39.3203 24C42.1495 25.9905 44 29.278 44 33C44 39.0751 39.0751 44 33 44H15C8.92487 44 4 39.0751 4 33C4 32.8387 4.00484 32.6782 4.01172 32.5186C4.00441 32.3466 4 32.1737 4 32V16C4 15.8259 4.00438 15.6527 4.01172 15.4805C4.00486 15.3212 4 15.161 4 15C4 8.92487 8.92487 4 15 4H33Z"
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
