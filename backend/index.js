
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';
import schedule from 'node-schedule';
import { fetchLatestLottoData } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, '../public');
const LOTTO_FILE = path.join(PUBLIC_DIR, 'lotto_full_history.csv');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Helper: Read and Parse CSV
const readLottoHistory = () => {
    if (!fs.existsSync(LOTTO_FILE)) return [];
    try {
        const content = fs.readFileSync(LOTTO_FILE, 'utf8');
        const parsed = Papa.parse(content, { header: true, dynamicTyping: true, skipEmptyLines: true });
        return parsed.data;
    } catch (err) {
        console.error("Read CSV error:", err);
        return [];
    }
};

// Helper: Save CSV
const saveLottoHistory = (data) => {
    try {
        const csv = Papa.unparse(data, { quotes: false });
        fs.writeFileSync(LOTTO_FILE, csv, 'utf8');
        console.log("Saved CSV successfully.");
        return true;
    } catch (err) {
        console.error("Save CSV error:", err);
        return false;
    }
};

// Core Logic: Update Data
const updateLottoData = async () => {
    console.log("[Scheduler] Checking for updates...");

    // 1. Get last round from File
    const history = readLottoHistory();
    if (history.length === 0) {
        console.log("[Scheduler] No history found. Skipping update.");
        return;
    }

    // Sort just in case
    history.sort((a, b) => b['회차'] - a['회차']);
    const lastRound = history[0]['회차'];

    // 2. Fetch Latest from Web
    const latestData = await fetchLatestLottoData();
    if (!latestData) {
        console.log("[Scheduler] Failed to fetch data from web.");
        return;
    }

    if (latestData['회차'] > lastRound) {
        console.log(`[Scheduler] New round found: ${latestData['회차']} (Last: ${lastRound})`);

        // 3. Add New Data
        // Ensure keys match the CSV headers exactly.
        // We need to match the key order ideally, but PapaParse unparse handles objects.
        // But headers might be missing in latestData if not careful.
        // Let's assume fetchLatestLottoData returns correct keys.

        // Add to history
        history.unshift(latestData);
        // Only keep unique rounds (just in case)
        const uniqueHistory = [];
        const seen = new Set();
        for (const item of history) {
            if (!seen.has(item['회차'])) {
                uniqueHistory.push(item);
                seen.add(item['회차']);
            }
        }

        // Save
        saveLottoHistory(uniqueHistory);
        console.log(`[Scheduler] Updated to Round ${latestData['회차']}`);
    } else {
        console.log(`[Scheduler] Up to date (Web: ${latestData['회차']}, File: ${lastRound})`);
    }
};

// API: Manual Merge (Existing)
app.post('/api/merge-lotto', (req, res) => {
    try {
        const { fragmentData } = req.body;
        if (!fragmentData || !Array.isArray(fragmentData)) return res.status(400).json({ error: 'Invalid data' });

        const history = readLottoHistory();
        const existingDraws = new Set(history.map(row => row['회차']));

        let added = 0;
        let updated = 0;

        fragmentData.forEach(newRow => {
            if (existingDraws.has(newRow['회차'])) {
                const idx = history.findIndex(r => r['회차'] === newRow['회차']);
                if (idx !== -1) {
                    history[idx] = { ...history[idx], ...newRow };
                    updated++;
                }
            } else {
                history.push(newRow);
                added++;
            }
        });

        history.sort((a, b) => b['회차'] - a['회차']);
        saveLottoHistory(history);

        res.json({ success: true, message: `Added ${added}, Updated ${updated}` });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Scheduler: Run every Saturday at 21:00 (KST is UTC+9)
// Server timezone matters. Assuming system is KST or we handle it.
// Cron format: Minute Hour DayofMonth Month DayofWeek
// 21:00 Saturday = '0 21 * * 6'
schedule.scheduleJob('0 21 * * 6', () => {
    console.log("[Scheduler] Triggered scheduled update.");
    updateLottoData();
});

// Catch-up: Run on startup to check if we missed anything
console.log("[System] Initial catch-up check...");
updateLottoData(); // Run once asynchronously on start

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});
