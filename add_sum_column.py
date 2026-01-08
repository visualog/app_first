import csv
import os

INPUT_FILE = 'public/lotto_full_history.csv'
OUTPUT_FILE = 'public/lotto_full_history_with_sum.csv'

def calculate_sum(numbers_str):
    try:
        # "1,2,3,4,5,6" -> 21
        nums = [int(n.strip()) for n in numbers_str.split(',')]
        return sum(nums)
    except Exception as e:
        print(f"Error parsing numbers '{numbers_str}': {e}")
        return 0

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"File not found: {INPUT_FILE}")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as fin, \
         open(OUTPUT_FILE, 'w', encoding='utf-8', newline='') as fout:
        
        reader = csv.reader(fin)
        writer = csv.writer(fout)
        
        headers = next(reader)
        
        # Find indices
        try:
            winning_nums_idx = headers.index('당첨번호')
            bonus_idx = headers.index('보너스번호')
        except ValueError:
            print("Required columns not found")
            return

        # Insert new header
        # We want to insert AFTER bonus_idx
        new_headers = headers[:bonus_idx+1] + ['당첨번호_합계'] + headers[bonus_idx+1:]
        writer.writerow(new_headers)
        
        count = 0
        for row in reader:
            if len(row) > winning_nums_idx:
                winning_nums = row[winning_nums_idx]
                total_sum = calculate_sum(winning_nums)
                
                # Insert sum value
                new_row = row[:bonus_idx+1] + [str(total_sum)] + row[bonus_idx+1:]
                writer.writerow(new_row)
                count += 1
            else:
                writer.writerow(row)
            
    # Replace original
    os.replace(OUTPUT_FILE, INPUT_FILE)
    print(f"Processed {count} rows. Added '당첨번호_합계' column.")

if __name__ == "__main__":
    main()
