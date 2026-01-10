#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
동행복권(로또6/45) 과거 데이터 '공식 통계 전체' 수집 스크립트 (Resume 완전 적용 버전)

✅ Resume 동작
- lotto_full_history.csv 에 이미 저장된 최대 '회차'를 읽어, 그 다음 회차부터 자동 재개
- first_prize_shops_by_draw.csv 도 이미 저장된 회차를 읽어, 그 다음 회차부터 자동 재개
- first_prize_shop_counts.csv 는 (상호,주소) 기준 누적 집계를 이어서 갱신

출력 파일
1) lotto_full_history.csv
2) first_prize_shops_by_draw.csv
3) first_prize_shop_counts.csv

사용
- pip install requests beautifulsoup4
- python collect_lotto_full_resume.py
"""

import csv
import os
import re
import time
from typing import Dict, Any, Optional, List, Tuple
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup


# -----------------------------
# 설정
# -----------------------------
API_URL = "https://www.dhlottery.co.kr/common.do"  # getLottoNumber
BYWIN_URL = "https://www.dhlottery.co.kr/gameResult.do?method=byWin"
TOPSTORE_PC_URL = "https://www.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645"
TOPSTORE_M_URL = "https://m.dhlottery.co.kr/store.do?method=topStore&pageGubun=L645"

START_DRAW = 1
END_DRAW = None  # None이면 최신 회차 자동 탐색

TIMEOUT_SEC = 10
MAX_RETRIES = 3
REQUEST_DELAY_SEC = 0.3

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
)

OUT_FULL = "lotto_full_history.csv"
OUT_SHOPS_BY_DRAW = "first_prize_shops_by_draw.csv"
OUT_SHOP_COUNTS = "first_prize_shop_counts.csv"

FULL_HEADER = [
    "추첨일","회차","당첨번호","보너스번호",
    "1등_총당첨금액","1등_당첨게임수","1등_1게임당당첨금액",
    "2등_총당첨금액","2등_당첨게임수","2등_1게임당당첨금액",
    "3등_총당첨금액","3등_당첨게임수","3등_1게임당당첨금액",
    "4등_총당첨금액","4등_당첨게임수","4등_1게임당당첨금액",
    "5등_총당첨금액","5등_당첨게임수","5등_1게임당당첨금액",
    "자동","반자동","수동",
    "총판매금액"
]

SHOPS_BY_DRAW_HEADER = ["회차","등위","상호","구분","주소","구글맵링크"]
SHOP_COUNTS_HEADER = ["상호","주소","1등_배출횟수","구글맵링크"]


# -----------------------------
# 유틸
# -----------------------------
def ensure_csv(path: str, header: List[str]) -> None:
    if not os.path.exists(path):
        with open(path, "w", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow(header)


def to_int(x: Any) -> int:
    if x is None:
        return 0
    s = re.sub(r"[^\d]", "", str(x))
    return int(s) if s else 0


def make_google_map_link(address: str) -> str:
    if not address:
        return ""
    return "https://www.google.com/maps/search/?api=1&query=" + quote(address)


def request_with_retry(session: requests.Session, url: str, params: Dict[str, Any]) -> Optional[requests.Response]:
    headers = {"User-Agent": USER_AGENT}
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            r = session.get(url, params=params, timeout=TIMEOUT_SEC, headers=headers)
            r.raise_for_status()
            return r
        except Exception as e:
            if attempt == MAX_RETRIES:
                print(f"❌ 요청 실패: {url} params={params} err={e}")
                return None
            time.sleep(0.5 * attempt)
    return None


def norm_key(name: str, addr: str) -> Tuple[str, str]:
    n = re.sub(r"\s+", " ", (name or "").strip())
    a = re.sub(r"\s+", " ", (addr or "").strip())
    return (n, a)


def get_last_saved_draw_from_full(csv_path: str) -> int:
    """lotto_full_history.csv 에서 최대 회차를 읽음."""
    if not os.path.exists(csv_path):
        return 0
    last = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return 0
        # '회차' 컬럼이 없으면 재개 불가
        if "회차" not in reader.fieldnames:
            return 0
        for row in reader:
            try:
                last = max(last, int(str(row.get("회차", "")).replace("회", "").strip()))
            except Exception:
                continue
    return last


def get_last_saved_draw_from_shops(csv_path: str) -> int:
    """first_prize_shops_by_draw.csv 에서 최대 회차를 읽음."""
    if not os.path.exists(csv_path):
        return 0
    last = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return 0
        if "회차" not in reader.fieldnames:
            return 0
        for row in reader:
            try:
                last = max(last, int(str(row.get("회차", "")).replace("회", "").strip()))
            except Exception:
                continue
    return last


# -----------------------------
# 1) API: 당첨번호/1등/판매금액
# -----------------------------
def fetch_api_draw(session: requests.Session, draw_no: int) -> Optional[Dict[str, Any]]:
    r = request_with_retry(session, API_URL, {"method": "getLottoNumber", "drwNo": draw_no})
    if not r:
        return None
    try:
        data = r.json()
    except Exception:
        return None
    if data.get("returnValue") != "success":
        return None
    return data


def find_latest_draw(session: requests.Session, start_hint: int = 1200) -> int:
    """API를 이용해 최신 회차를 빠르게 찾음(지수 증가 + 이분 탐색)."""
    lo = max(1, int(start_hint))
    if fetch_api_draw(session, lo) is None:
        lo = 1
        if fetch_api_draw(session, lo) is None:
            return 0

    step = 1
    hi = lo
    while True:
        cand = hi + step
        ok = fetch_api_draw(session, cand) is not None
        time.sleep(REQUEST_DELAY_SEC)
        if not ok:
            hi = cand
            break
        hi = cand
        step *= 2

    left = max(1, hi - step)
    right = hi
    last_success = left

    while left > 1 and fetch_api_draw(session, left) is None:
        left = max(1, left - step)
        time.sleep(REQUEST_DELAY_SEC)

    while left <= right:
        mid = (left + right) // 2
        ok = fetch_api_draw(session, mid) is not None
        time.sleep(REQUEST_DELAY_SEC)
        if ok:
            last_success = mid
            left = mid + 1
        else:
            right = mid - 1

    return last_success


# -----------------------------
# 2) byWin: 1~5등 + 자동/반자동/수동
# -----------------------------
def parse_bywin(session: requests.Session, draw_no: int) -> Dict[str, Any]:
    r = request_with_retry(session, BYWIN_URL, {"drwNo": draw_no})
    if not r:
        return {}

    soup = BeautifulSoup(r.text, "html.parser")
    result: Dict[str, Any] = {}

    prize_table = None
    for t in soup.find_all("table"):
        th_text = " ".join(th.get_text(" ", strip=True) for th in t.find_all("th"))
        if (("등위" in th_text) or ("순위" in th_text)) and (("총당첨금액" in th_text) or ("당첨금액" in th_text)):
            prize_table = t
            break

    if prize_table:
        rows = (prize_table.find("tbody").find_all("tr") if prize_table.find("tbody") else prize_table.find_all("tr"))
        for row in rows:
            cols = [c.get_text(" ", strip=True) for c in row.find_all(["td", "th"])]
            if len(cols) < 4:
                continue
            m = re.search(r"([1-5])", cols[0])
            if not m:
                continue
            k = int(m.group(1))
            result[f"{k}등_총당첨금액"] = to_int(cols[1])
            result[f"{k}등_당첨게임수"] = to_int(cols[2])
            result[f"{k}등_1게임당당첨금액"] = to_int(cols[3])

    text = soup.get_text("\n", strip=True)
    auto = semi = manual = None

    for line in text.splitlines():
        if ("자동" in line) and ("수동" in line) and ("반자동" in line):
            a = re.search(r"자동\s*([0-9,]+)", line)
            s = re.search(r"반자동\s*([0-9,]+)", line)
            m = re.search(r"수동\s*([0-9,]+)", line)
            if a and s and m:
                auto, semi, manual = to_int(a.group(1)), to_int(s.group(1)), to_int(m.group(1))
                break

    if auto is None or semi is None or manual is None:
        for t in soup.find_all("table"):
            t_text = t.get_text(" ", strip=True)
            if ("자동" in t_text) and ("수동" in t_text) and ("반자동" in t_text):
                tds = [td.get_text(" ", strip=True) for td in t.find_all("td")]
                joined = " | ".join(tds)
                a = re.search(r"자동\s*\|\s*([0-9,]+)", joined)
                s = re.search(r"반자동\s*\|\s*([0-9,]+)", joined)
                m = re.search(r"수동\s*\|\s*([0-9,]+)", joined)
                if a and s and m:
                    auto, semi, manual = to_int(a.group(1)), to_int(s.group(1)), to_int(m.group(1))
                    break

    result["자동"] = "" if auto is None else auto
    result["반자동"] = "" if semi is None else semi
    result["수동"] = "" if manual is None else manual

    return result


# -----------------------------
# 3) 1등 배출점: topStore
# -----------------------------
def parse_topstore_html(html: str, draw_no: int) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")

    target = None
    for t in soup.find_all("table"):
        th_text = " ".join(th.get_text(" ", strip=True) for th in t.find_all("th"))
        if (("상호" in th_text) or ("상호명" in th_text)) and ("구분" in th_text) and (("소재지" in th_text) or ("주소" in th_text)):
            target = t
            break

    if not target:
        return []

    body = target.find("tbody") or target
    rows = body.find_all("tr")

    shops: List[Dict[str, Any]] = []
    for row in rows:
        cols = [c.get_text(" ", strip=True) for c in row.find_all("td")]
        if len(cols) < 3:
            continue

        if len(cols) >= 4:
            name = cols[1]
            mode = cols[2]
            addr = cols[3]
        else:
            name, mode, addr = cols[0], cols[1], cols[2]

        shops.append({
            "회차": draw_no,
            "등위": 1,
            "상호": name,
            "구분": mode,
            "주소": addr,
            "구글맵링크": make_google_map_link(addr),
        })

    return shops


def fetch_first_prize_shops(session: requests.Session, draw_no: int) -> List[Dict[str, Any]]:
    r = request_with_retry(session, TOPSTORE_M_URL, {"method": "topStore", "pageGubun": "L645", "drwNo": draw_no})
    if r:
        shops = parse_topstore_html(r.text, draw_no)
        if shops:
            return shops

    r2 = request_with_retry(session, TOPSTORE_PC_URL, {"method": "topStore", "pageGubun": "L645", "drwNo": draw_no})
    if r2:
        return parse_topstore_html(r2.text, draw_no)

    return []


# -----------------------------
# 메인 수집
# -----------------------------
def collect(start_draw: int = START_DRAW, end_draw: Optional[int] = END_DRAW) -> None:
    ensure_csv(OUT_FULL, FULL_HEADER)
    ensure_csv(OUT_SHOPS_BY_DRAW, SHOPS_BY_DRAW_HEADER)

    # Resume: 이미 저장된 마지막 회차를 읽어서 start_draw를 자동 조정
    last_full = get_last_saved_draw_from_full(OUT_FULL)
    last_shops = get_last_saved_draw_from_shops(OUT_SHOPS_BY_DRAW)

    last_saved = max(last_full, last_shops)
    if last_saved > 0:
        start_draw = max(int(start_draw), last_saved + 1)
        print(f"🔁 Resume: 이미 {last_saved}회까지 저장됨 → {start_draw}회부터 재개")

    shop_counts: Dict[Tuple[str, str], int] = {}

    # 누적 집계 이어가기
    if os.path.exists(OUT_SHOP_COUNTS):
        with open(OUT_SHOP_COUNTS, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                key = norm_key(row.get("상호", ""), row.get("주소", ""))
                shop_counts[key] = int(row.get("1등_배출횟수", "0") or 0)

    with requests.Session() as session:
        if end_draw is None:
            end_draw = find_latest_draw(session, start_hint=max(1200, last_saved))
            print(f"🔎 최신 회차(자동 탐색): {end_draw}")

        if start_draw > end_draw:
            print(f"✅ 이미 최신({end_draw}회)까지 수집되어 있습니다. 종료합니다.")
            return

        for draw_no in range(int(start_draw), int(end_draw) + 1):
            api = fetch_api_draw(session, draw_no)
            time.sleep(REQUEST_DELAY_SEC)

            if not api:
                print(f"⚠️ API 실패: {draw_no}회")
                continue

            base = {
                "추첨일": api.get("drwNoDate", ""),
                "회차": draw_no,
                "당첨번호": ",".join(str(api.get(f"drwtNo{i}", "")) for i in range(1, 7)),
                "보너스번호": api.get("bnusNo", ""),
                "1등_총당첨금액": to_int(api.get("firstAccumamnt", 0)),
                "1등_당첨게임수": to_int(api.get("firstPrzwnerCo", 0)),
                "1등_1게임당당첨금액": to_int(api.get("firstWinamnt", 0)),
                "총판매금액": to_int(api.get("totSellamnt", 0)),
            }

            bywin = parse_bywin(session, draw_no)
            time.sleep(REQUEST_DELAY_SEC)

            full_row = {h: "" for h in FULL_HEADER}
            full_row.update(base)
            full_row.update(bywin)

            with open(OUT_FULL, "a", newline="", encoding="utf-8") as f:
                w = csv.DictWriter(f, fieldnames=FULL_HEADER)
                w.writerow(full_row)

            shops = fetch_first_prize_shops(session, draw_no)
            time.sleep(REQUEST_DELAY_SEC)

            if shops:
                with open(OUT_SHOPS_BY_DRAW, "a", newline="", encoding="utf-8") as f:
                    w = csv.DictWriter(f, fieldnames=SHOPS_BY_DRAW_HEADER)
                    for s in shops:
                        w.writerow(s)
                        key = norm_key(s["상호"], s["주소"])
                        shop_counts[key] = shop_counts.get(key, 0) + 1

            print(f"✅ {draw_no}회 수집 완료 (1등 배출점 {len(shops)}곳)")

    with open(OUT_SHOP_COUNTS, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=SHOP_COUNTS_HEADER)
        w.writeheader()
        for (name, addr), cnt in sorted(shop_counts.items(), key=lambda x: x[1], reverse=True):
            w.writerow({
                "상호": name,
                "주소": addr,
                "1등_배출횟수": cnt,
                "구글맵링크": make_google_map_link(addr),
            })

    print("🎉 완료!")
    print(f"- 회차별 통계: {OUT_FULL}")
    print(f"- 회차별 1등 배출점: {OUT_SHOPS_BY_DRAW}")
    print(f"- 1등 배출점 누적: {OUT_SHOP_COUNTS}")


if __name__ == "__main__":
    collect()
