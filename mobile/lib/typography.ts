/**
 * Apple HIG Typography System for iOS
 * https://developer.apple.com/design/human-interface-guidelines/typography
 * 
 * Based on iOS Dynamic Type - Default/Large size category
 * All values in points (pt)
 */

// Text Styles based on Apple HIG Dynamic Type specifications
export const TYPOGRAPHY = {
    // Large Title: 34pt Regular, Bold for emphasized
    largeTitle: {
        fontSize: 34,
        lineHeight: 41,
        letterSpacing: 0.37,
        fontWeight: '400' as const,
        fontWeightEmphasized: '700' as const,
    },

    // Title 1: 28pt Regular, Bold for emphasized
    title1: {
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: 0.36,
        fontWeight: '400' as const,
        fontWeightEmphasized: '700' as const,
    },

    // Title 2: 22pt Regular, Bold for emphasized
    title2: {
        fontSize: 22,
        lineHeight: 28,
        letterSpacing: 0.35,
        fontWeight: '400' as const,
        fontWeightEmphasized: '700' as const,
    },

    // Title 3: 20pt Regular, Semibold for emphasized
    title3: {
        fontSize: 20,
        lineHeight: 25,
        letterSpacing: 0.38,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Headline: 17pt Semibold (always emphasized style)
    headline: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.41,
        fontWeight: '600' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Body: 17pt Regular, Semibold for emphasized
    body: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.41,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Callout: 16pt Regular, Semibold for emphasized
    callout: {
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: -0.32,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Subhead: 15pt Regular, Semibold for emphasized
    subhead: {
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.24,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Footnote: 13pt Regular, Semibold for emphasized
    footnote: {
        fontSize: 13,
        lineHeight: 18,
        letterSpacing: -0.08,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Caption 1: 12pt Regular, Semibold for emphasized
    caption1: {
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: 0,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },

    // Caption 2: 11pt Regular, Semibold for emphasized (minimum readable)
    caption2: {
        fontSize: 11,
        lineHeight: 13,
        letterSpacing: 0.07,
        fontWeight: '400' as const,
        fontWeightEmphasized: '600' as const,
    },
} as const;

// Semantic color tokens for text (adapts to light/dark mode)
export const TEXT_COLORS = {
    primary: '#000000',           // Label color
    secondary: 'rgba(60, 60, 67, 0.6)',   // Secondary label
    tertiary: 'rgba(60, 60, 67, 0.3)',    // Tertiary label
    quaternary: 'rgba(60, 60, 67, 0.18)', // Quaternary label
} as const;

// App-specific accent color (used sparingly per HIG guidelines)
export const ACCENT_COLOR = "#D4A853";  // Golden/Amber tone for Lotto app
export const ACCENT_COLOR_LIGHT = "rgba(212, 168, 83, 0.15)";

export type TypographyStyle = keyof typeof TYPOGRAPHY;
