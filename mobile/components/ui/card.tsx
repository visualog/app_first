import * as React from "react"
import { Platform, StyleSheet, Text, View, ViewProps } from "react-native"
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { cn } from "../../lib/utils"
import ContinuousCardView from "../../modules/continuous-card"

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// ContinuousCard 네이티브 모듈 사용 가능 여부 확인
// 개발 빌드에서만 사용하고, Release 빌드나 Expo Go에서는 일반 View 사용
const canUseContinuousCard = Platform.OS === 'ios' && !isExpoGo && __DEV__;

interface CardProps extends ViewProps {
    borderRadius?: number;
}

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(({ className, style, borderRadius = 24, ...props }, ref) => {
    // ContinuousCard 네이티브 모듈 사용 가능한 경우에만 사용
    if (canUseContinuousCard) {
        const flattenedStyle: any = StyleSheet.flatten(style);
        const borderWidth = flattenedStyle?.borderWidth;
        const borderColor = flattenedStyle?.borderColor;

        return (
            <ContinuousCardView
                borderRadius={borderRadius}
                borderWidth={borderWidth}
                borderColor={borderColor}
                style={[{ overflow: 'hidden' }, style]}
                className={cn(
                    "border border-border bg-card shadow-sm",
                    className
                )}
                {...props}
            />
        )
    }

    // 폴백: 일반 View 사용
    return (
        <View
            ref={ref}
            className={cn(
                className
            )}
            style={[{ borderRadius, borderCurve: 'continuous', borderStyle: 'solid', overflow: 'hidden' }, style]}
            {...props}
        />
    )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentPropsWithoutRef<typeof Text>>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn("text-2xl font-semibold leading-none tracking-tight text-foreground", className)}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<React.ElementRef<typeof Text>, React.ComponentPropsWithoutRef<typeof Text>>(({ className, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn("flex-row items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
