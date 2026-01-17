import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface BookmarkItem {
    id: string; // timestamp based ID
    numbers: number[]; // 6 numbers
    sum: number;
    targetRound?: number; // 생성 당시 목표로 했던 회차 (optional)
    createdAt: number;
}

interface BookmarkState {
    bookmarks: BookmarkItem[];
    addBookmark: (numbers: number[], targetRound?: number) => void;
    removeBookmark: (id: string) => void;
    isBookmarked: (numbers: number[]) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
    persist(
        (set, get) => ({
            bookmarks: [],

            addBookmark: (numbers, targetRound) => {
                const newBookmark: BookmarkItem = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    numbers: [...numbers].sort((a, b) => a - b),
                    sum: numbers.reduce((a, b) => a + b, 0),
                    targetRound,
                    createdAt: Date.now(),
                };

                set((state) => ({
                    bookmarks: [newBookmark, ...state.bookmarks],
                }));
            },

            removeBookmark: (id) => {
                set((state) => ({
                    bookmarks: state.bookmarks.filter((item) => item.id !== id),
                }));
            },

            isBookmarked: (numbers) => {
                const sortedInput = JSON.stringify([...numbers].sort((a, b) => a - b));
                return get().bookmarks.some(
                    (item) => JSON.stringify(item.numbers) === sortedInput
                );
            },
        }),
        {
            name: 'lotto-bookmarks-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
