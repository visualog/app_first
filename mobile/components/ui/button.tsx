import * as React from "react"
import { Text, Pressable, View } from "react-native"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-md transition-opacity disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary active:opacity-90",
                destructive: "bg-destructive active:opacity-90",
                outline: "border border-input bg-background active:bg-accent",
                secondary: "bg-secondary active:opacity-80",
                ghost: "active:bg-accent",
                link: "underline-offset-4 active:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const buttonTextVariants = cva(
    "text-sm font-medium",
    {
        variants: {
            variant: {
                default: "text-primary-foreground",
                destructive: "text-destructive-foreground",
                outline: "text-foreground",
                secondary: "text-secondary-foreground",
                ghost: "text-foreground",
                link: "text-primary underline",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface ButtonProps
    extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
    label?: string; // Optional helper if you just want text
    textClassName?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
    ({ className, variant, size, label, children, textClassName, ...props }, ref) => {
        return (
            <Pressable
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {label ? (
                    <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{label}</Text>
                ) : (
                    // If children are passed, we assume they handle text styling or are icons. 
                    // But for convenience we can try to wrap strings in Text.
                    React.Children.map(children, (child) => {
                        if (typeof child === 'string') {
                            return <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{child}</Text>
                        }
                        return child;
                    })
                )}
            </Pressable>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
