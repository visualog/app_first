// Lotto data service - loads parsed lotto history data
import lottoData from '../assets/data/lotto_history.json';

export interface LottoDrawData {
    회차: number;
    추첨일: string;
    번호1: number;
    번호2: number;
    번호3: number;
    번호4: number;
    번호5: number;
    번호6: number;
    보너스: number;
}

// Type assertion for imported JSON data
const LOTTO_HISTORY: LottoDrawData[] = lottoData as LottoDrawData[];

export function getLottoHistory(): LottoDrawData[] {
    return LOTTO_HISTORY;
}

export function getLatestDraw(): LottoDrawData | null {
    return LOTTO_HISTORY.length > 0 ? LOTTO_HISTORY[0] : null;
}

export function getRecentDraws(count: number = 10): LottoDrawData[] {
    return LOTTO_HISTORY.slice(0, count);
}

export function getDrawByRound(round: number): LottoDrawData | undefined {
    return LOTTO_HISTORY.find(draw => draw.회차 === round);
}

export function checkNumberCombinationExists(numbers: number[]): boolean {
    // Sort input numbers for consistent comparison
    const sortedInput = [...numbers].sort((a, b) => a - b);

    return LOTTO_HISTORY.some(draw => {
        return (
            draw.번호1 === sortedInput[0] &&
            draw.번호2 === sortedInput[1] &&
            draw.번호3 === sortedInput[2] &&
            draw.번호4 === sortedInput[3] &&
            draw.번호5 === sortedInput[4] &&
            draw.번호6 === sortedInput[5]
        );
    });
}

// Cache frequencies to avoid recalculating on every generation call
let cachedFrequencies: { [key: number]: number } | null = null;

/**
 * Calculates the frequency of each number (1-45) in the entire history.
 * Uses caching for performance.
 */
export function getNumberFrequencies(): { [key: number]: number } {
    if (cachedFrequencies) return cachedFrequencies;

    const frequencies: { [key: number]: number } = {};
    for (let i = 1; i <= 45; i++) {
        frequencies[i] = 0;
    }

    LOTTO_HISTORY.forEach(draw => {
        // Direct access is faster
        if (frequencies[draw.번호1] !== undefined) frequencies[draw.번호1]++;
        if (frequencies[draw.번호2] !== undefined) frequencies[draw.번호2]++;
        if (frequencies[draw.번호3] !== undefined) frequencies[draw.번호3]++;
        if (frequencies[draw.번호4] !== undefined) frequencies[draw.번호4]++;
        if (frequencies[draw.번호5] !== undefined) frequencies[draw.번호5]++;
        if (frequencies[draw.번호6] !== undefined) frequencies[draw.번호6]++;
    });

    cachedFrequencies = frequencies;
    return frequencies;
}

/**
 * Generates recommended numbers based on frequency analysis.
 * Strategy: Mix of "Hot" (frequent) and "Cold" (infrequent) numbers.
 * - 60% chance to pick from top 50% frequent numbers
 * - 40% chance to pick from bottom 50% frequent numbers
 */
export function getRecommendedNumbers(): number[] {
    const freqs = getNumberFrequencies();

    // Sort numbers by frequency
    const sortedNumbers = Object.keys(freqs)
        .map(Number)
        .sort((a, b) => freqs[b] - freqs[a]);

    const hotNumbers = sortedNumbers.slice(0, 22); // Top half
    const coldNumbers = sortedNumbers.slice(22);   // Bottom half

    // Retry checking history combination
    for (let attempt = 0; attempt < 50; attempt++) {
        const resultSet = new Set<number>();

        while (resultSet.size < 6) {
            const isHot = Math.random() < 0.6; // 60% chance for Hot
            const sourceArray = isHot ? hotNumbers : coldNumbers;
            const randomNum = sourceArray[Math.floor(Math.random() * sourceArray.length)];

            resultSet.add(randomNum);
        }

        const numbers = Array.from(resultSet).sort((a, b) => a - b);

        if (!checkNumberCombinationExists(numbers)) {
            return numbers;
        }
    }

    // Fallback if unique combination not found quickly
    const numbers = new Set<number>();
    while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);
    return Array.from(numbers).sort((a, b) => a - b);
}
