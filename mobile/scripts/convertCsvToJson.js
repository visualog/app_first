const fs = require('fs');

const csv = fs.readFileSync('/Users/visualog/Documents/GitHub/expo/mobile/assets/data/lotto_full_history.csv', 'utf-8');
const lines = csv.trim().split('\n').slice(1); // Skip header
const parsed = [];

for (const line of lines) {
    // Regex to match: date, round, "numbers", bonus, sum, prize1_total, prize1_count, prize1_per_game
    // Note: CSV values might not have quotes except winning numbers.
    // Example: 2026-01-24,1208,"6, 27, 30, 36, 38, 42",25,179,30010281750,6,5001713625,...
    const match = line.match(/^([^,]+),(\d+),"([^"]+)",(\d+),(\d+),(\d+),(\d+),(\d+)/);

    if (!match) continue;

    const [, 추첨일, 회차, numbersStr, 보너스, , , , prize1] = match;
    const numbers = numbersStr.split(',').map(n => parseInt(n.trim(), 10));
    if (numbers.length !== 6) continue;

    parsed.push({
        회차: parseInt(회차, 10),
        추첨일: 추첨일.trim(),
        번호1: numbers[0], 번호2: numbers[1], 번호3: numbers[2],
        번호4: numbers[3], 번호5: numbers[4], 번호6: numbers[5],
        보너스: parseInt(보너스, 10),
        "1등_1게임당당첨금액": parseInt(prize1, 10)
    });
}

// Sort descending by 회차
parsed.sort((a, b) => b.회차 - a.회차);

fs.writeFileSync('/Users/visualog/Documents/GitHub/expo/mobile/assets/data/lotto_history.json', JSON.stringify(parsed, null, 2));
console.log('Converted', parsed.length, 'records. Latest:', parsed[0]);
