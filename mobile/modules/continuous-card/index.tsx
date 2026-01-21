import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';
import { ViewProps, ColorValue, StyleSheet } from 'react-native';

export interface ContinuousCardViewProps extends ViewProps {
    borderRadius?: number;
    backgroundColor?: ColorValue;
    borderWidth?: number;
    borderColor?: ColorValue;
}

const NativeView: React.ComponentType<ContinuousCardViewProps> =
    requireNativeViewManager('ContinuousCard');

export default function ContinuousCardView({ style, ...props }: ContinuousCardViewProps) {
    // Extract backgroundColor from style if available to pass to native prop
    const flattenedStyle: any = StyleSheet.flatten(style);
    const bgColor = props.backgroundColor || flattenedStyle?.backgroundColor;

    return <NativeView {...props} style={style} backgroundColor={bgColor} />;
}
