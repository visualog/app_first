
import puppeteer from 'puppeteer';

const URL = 'https://www.dhlottery.co.kr/gameResult.do?method=byWin';

// Helper to remove commas and non-numeric chars (except dot if needed, but we want ints)
const cleanInt = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, ''), 10);
};

export async function fetchLatestLottoData() {
    console.log('[Scraper] Starting browser...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Block images/css to speed up
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('[Scraper] Navigating to result page...');
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('[Scraper] Extracting data...');
        const data = await page.evaluate(() => {
            // Helper
            const cleanInt = (str) => parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;

            // 1. Draw No & Date
            const drawNoEl = document.querySelector('.win_result strong');
            const dateEl = document.querySelector('.win_result .desc');

            if (!drawNoEl || !dateEl) return null;

            const drawNo = cleanInt(drawNoEl.innerText);
            // Date format: (2026년 01월 03일 추첨)
            const dateText = dateEl.innerText;
            const dateMatch = dateText.match(/(\d{4})년 (\d{2})월 (\d{2})일/);
            const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

            // 2. Winning Numbers
            const numEls = document.querySelectorAll('.win_result .num.win p .ball_645');
            const bonusEl = document.querySelector('.win_result .num.bonus p .ball_645');

            const winningNums = Array.from(numEls).map(el => el.innerText).join(', ');
            const bonus = bonusEl ? bonusEl.innerText : '';

            // 3. Prizes (Amount, Count, Per Person)
            // The table structure:
            // tbody -> tr (1st), tr (2nd), ...
            const rows = document.querySelectorAll('.tbl_data.tbl_data_col tbody tr');
            if (rows.length < 5) return null;

            const getRowData = (tr) => {
                const tds = tr.querySelectorAll('td');
                // td[1]: Total Prize, td[2]: Winners, td[3]: Per Person
                return {
                    total: cleanInt(tds[1].innerText),
                    count: cleanInt(tds[2].innerText),
                    perPerson: cleanInt(tds[3].innerText)
                };
            };

            const rank1 = getRowData(rows[0]);
            const rank2 = getRowData(rows[1]);
            const rank3 = getRowData(rows[2]);
            const rank4 = getRowData(rows[3]);
            const rank5 = getRowData(rows[4]);

            // 4. Auto / Manual / Semi-Auto (From 1st prize row remarks or additional parsing)
            // The site updated. Usually it's in the 1st row's 'Remarks' (비고) column (td[5]) if present,
            // OR sometimes in a separate table.

            // Checking the 1st row '비고' column for Auto/Manual text
            // "자동 9, 수동 1"
            let auto = 0, semi = 0, manual = 0;
            const remarkTd = rows[0].querySelectorAll('td')[5]; // Index might vary
            if (remarkTd) {
                const text = remarkTd.innerText;
                // Parse "자동N", "수동M", "반자동K"
                // Example: "자동10" or "자동10수동3"
                // Wait, typically the text is just simple like "자동10"
                // Let's look for robust parsing or check if there is a separate table?
                // Previously scraper used "byWin" page which has a specific pattern.
                // Assuming standard "자동 9" "수동 1" pattern in the remark or checking the dedicated table if exists.

                // Let's look for specific regex in the whole cell text
                const autoMatch = text.match(/자동\s*(\d+)/);
                const semiMatch = text.match(/반자동\s*(\d+)/);
                const manualMatch = text.match(/수동\s*(\d+)/);

                if (autoMatch) auto = parseInt(autoMatch[1], 10);
                if (semiMatch) semi = parseInt(semiMatch[1], 10);
                if (manualMatch) manual = parseInt(manualMatch[1], 10);
            }

            // 5. Total Sales
            // Usually in a separate list item or table footer, but on "byWin" page strings like "총판매금액" exist?
            // "1등 배출점" logic is complicated.
            // Let's find "총판매금액" by searching lists
            let sales = 0;
            const listItems = document.querySelectorAll('.list_text_common > li');
            for (let li of listItems) {
                if (li.innerText.includes('총판매금액')) {
                    const strong = li.querySelector('strong');
                    if (strong) sales = cleanInt(strong.innerText);
                    break;
                }
            }

            return {
                '회차': drawNo,
                '추첨일': date,
                '당첨번호': winningNums, // "1, 2, 3, 4, 5, 6" format to match CSV (comma separated)
                '보너스번호': bonus,
                '1등_총당첨금액': rank1.total,
                '1등_당첨게임수': rank1.count,
                '1등_1게임당당첨금액': rank1.perPerson,
                '2등_총당첨금액': rank2.total,
                '2등_당첨게임수': rank2.count,
                '2등_1게임당당첨금액': rank2.perPerson,
                '3등_총당첨금액': rank3.total,
                '3등_당첨게임수': rank3.count,
                '3등_1게임당당첨금액': rank3.perPerson,
                '4등_총당첨금액': rank4.total,
                '4등_당첨게임수': rank4.count,
                '4등_1게임당당첨금액': rank4.perPerson,
                '5등_총당첨금액': rank5.total,
                '5등_당첨게임수': rank5.count,
                '5등_1게임당당첨금액': rank5.perPerson,
                '자동': auto,
                '반자동': semi,
                '수동': manual,
                '총판매금액': sales
            };
        });

        if (data) {
            // Calculate Sum
            const nums = data['당첨번호'].split(',').map(s => parseInt(s.trim(), 10));
            data['당첨번호_합계'] = nums.reduce((a, b) => a + b, 0);
        }

        console.log(`[Scraper] Retrieved data for Round ${data ? data['회차'] : 'Unknown'}`);
        return data;

    } catch (e) {
        console.error('[Scraper] Error:', e);
        return null;
    } finally {
        await browser.close();
    }
}
