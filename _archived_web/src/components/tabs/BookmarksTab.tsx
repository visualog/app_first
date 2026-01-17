import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LottoBall } from '@/components/shared';
import { GeneratedSet } from '@/types';

export const BookmarksTab: React.FC<{ bookmarks: GeneratedSet[], onRemove: (id: string) => void }> = ({ bookmarks, onRemove }) => (
    <div className="space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-bold">보관함</h2>
        {bookmarks.length === 0 ? (
            <Card><CardContent className="p-6"><p className="text-muted-foreground">보관된 번호가 없습니다.</p></CardContent></Card>
        ) : (
            <div className="space-y-4">
                {bookmarks.map(set => (
                    <Card key={set.id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex flex-wrap gap-2">{set.numbers.map((n, i) => <LottoBall key={i} number={n} size="sm" />)}</div>
                            <Button variant="ghost" size="icon" onClick={() => onRemove(set.id)}><i className="fas fa-trash-alt text-destructive"></i></Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
);
