import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { View, ViewProps, ColorValue, StyleSheet } from 'react-native';

export interface ContinuousCardViewProps extends ViewProps {
    borderRadius?: number;
    backgroundColor?: ColorValue;
    borderWidth?: number;
    borderColor?: ColorValue;
}

// 네이티브 모듈 로딩 시도 - 실패하면 null
let NativeView: React.ComponentType<ContinuousCardViewProps> | null = null;
try {
    NativeView = requireNativeViewManager('ContinuousCard');
} catch (e) {
    // 네이티브 모듈이 없으면 fallback 사용
    console.log('ContinuousCard native module not available, using fallback');
}

export default function ContinuousCardView({ style, borderRadius, ...props }: ContinuousCardViewProps) {
    const flattenedStyle: any = StyleSheet.flatten(style);
    const bgColor = props.backgroundColor || flattenedStyle?.backgroundColor;

    // 네이티브 모듈 사용 가능하면 사용
    if (NativeView) {
        return <NativeView {...props} style={style} borderRadius={borderRadius} backgroundColor={bgColor} />;
    }

    // Fallback: 일반 View 사용 (borderCurve: 'continuous' 지원)
    return (
        <View
            {...props}
            style={[
                {
                    borderRadius,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    backgroundColor: bgColor,
                },
                style,
            ]}
        />
    );
}

