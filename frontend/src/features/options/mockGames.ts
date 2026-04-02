// mockGames.ts

export type GameResult = 'won' | 'lost';

export interface GameListItemData {
    game_id: string;
    opponent: string;
    result: GameResult;
}


const names = [
    'Alice', 'Bob', 'Charlie', 'Dave', 'Eve',
    'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy',
    'Mallory', 'Niaj', 'Olivia', 'Peggy', 'Rupert',
    'Sybil', 'Trent', 'Uma', 'Victor', 'Wendy',
];

export const mockGames: GameListItemData[] = Array.from({ length: 20 }).map(
    (_, i) => ({
        game_id: `my uuudid_${i}`,
        opponent: names[i],
        result: i < 4 ? 'won' : 'lost', // 4 win, rest lose
    })
);