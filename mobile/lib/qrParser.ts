export interface QRParsedData {
    round: number;
    numbers: number[][]; // Array of 6-number arrays
}

export function parseLottoQR(url: string): QRParsedData | null {
    try {
        // Expected format: http://m.dhlottery.co.kr/?v=0861q041118223644q...
        const regex = /v=([0-9q]+)/;
        const match = url.match(regex);

        if (!match) return null;

        const rawData = match[1];
        const parts = rawData.split('q');

        if (parts.length < 2) return null;

        const roundStr = parts[0]; // First part is round (e.g. 0861)
        const round = parseInt(roundStr, 10);

        const numbers: number[][] = [];

        // Remaining parts are number sets
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            // Format: 041118223644 (12 digits, 2 digits per number)
            // Sometimes it might have extra checksum at the end? Usually standard is 6 numbers * 2 digits = 12 chars.
            // But let's handle variable length if standard changes, though current logic handles standard.
            // Actually, some old formats might be different, but let's target the current standard.

            // Check if part is purely numeric
            if (!/^\d+$/.test(part)) continue;

            // Extract 6 pairs
            const set: number[] = [];
            for (let j = 0; j < 12; j += 2) {
                const numStr = part.substring(j, j + 2);
                set.push(parseInt(numStr, 10));
            }

            // Basic validation
            if (set.length === 6 && set.every(n => n >= 1 && n <= 45)) {
                numbers.push(set.sort((a, b) => a - b));
            }
        }

        if (numbers.length === 0) return null;

        return { round, numbers };
    } catch (e) {
        console.error("QR Parse Error", e);
        return null;
    }
}
