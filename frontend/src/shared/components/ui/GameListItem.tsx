import React, { useEffect, useRef, useState } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { GameListItemData } from '@/features/options/mockGames';

export interface GameListItemProps {
    game: GameListItemData;
    onInfo?: (gameId: string) => void;
    onReplay?: (gameId: string) => void;
}

const GameListItem: React.FC<GameListItemProps> = ({
    game,
    onInfo,
    onReplay,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const colors = {
        win: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200/30',
        lose: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200/30',
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                buttonRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative">
            {isDropdownOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-5 mt-2 w-28 bg-white rounded-md z-10 border shadow-sm"
                >
                    <div className="py-1">
                        <button
                            onClick={() =>
                                handleAction(() => onReplay?.(game.game_id))
                            }
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Replay
                        </button>

                        <button
                            onClick={() =>
                                handleAction(() => onInfo?.(game.game_id))
                            }
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                            <Info className="w-4 h-4 mr-2" />
                            Info
                        </button>
                    </div>
                </div>
            )}

            <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                ref={buttonRef}
                className={`relative
                    text-slate-900
                    font-semibold
                    text-sm
                    rounded-md
                    transition-all
                    duration-300
                    bg-gradient-to-br
                    ${game.result === 'won' ? colors.win : colors.lose}
                    border-slate-400/50
                    active:translate-y-[2px]
                `}
            >
                <span
                    className="
                        absolute inset-0
                        ring-1 ring-slate-800
                        bg-gradient-to-b from-white/30 to-transparent
                        rounded-md cursor-pointer
                    "
                />

                <div className="pl-1 mr-0.5 overflow-hidden flex items-center gap-1">
                    {game.opponent}
                </div>
            </div>
        </div>
    );
};

export default GameListItem;
