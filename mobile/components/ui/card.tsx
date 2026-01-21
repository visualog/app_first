import * as React from "react"
import { Platform, StyleSheet, Text, View, ViewProps } from "react-native"
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { cn } from "../../lib/utils"
import ContinuousCardView from "../../modules/continuous-card"

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

interface CardProps extends ViewProps {
    borderRadius?: number;
}

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(({ className, style, borderRadius = 24, ...props }, ref) => {
    // Expo Go에서는 네이티브 모듈을 사용할 수 없으므로 일반 View로 폴백
    if (Platform.OS === 'ios' && !isExpoGo) {
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

    return (
        <View
            ref={ref}
            className={cn(
                className
            )}
            style={[{ borderRadius, borderStyle: 'solid', overflow: 'hidden' }, style]}
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
