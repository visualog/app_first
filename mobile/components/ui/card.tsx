import * as React from "react"
import { Text, View, ViewProps } from "react-native"
import { cn } from "../../lib/utils"

interface CardProps extends ViewProps {
    borderRadius?: number;
}

// iOS의 borderCurve: 'continuous'를 사용하여 Apple 스타일의 둥근 모서리 구현
const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(({ className, style, borderRadius = 24, ...props }, ref) => {
    return (
        <View
            ref={ref}
            className={cn(className)}
            style={[{ borderRadius, borderCurve: 'continuous', overflow: 'hidden' }, style]}
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
