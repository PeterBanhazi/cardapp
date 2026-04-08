/// TODO: use middle-truncate on listitems gameid:

// const middleTruncate = (str: string, max = 12) => {
//   if (str.length <= max) return str;
//   const half = Math.floor((max - 3) / 2);
//   return str.slice(0, half) + "..." + str.slice(-half);
// };

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Info, RotateCcw } from 'lucide-react';
import { GameListItemData } from '@/features/options/mockGames';

export interface GameListItemProps {
    game: GameListItemData;
    onInfo?: (gameId: string) => void;
    onReplay?: (gameId: string) => void;
}

const menuItemBase =
    'flex items-center px-4 py-2 text-sm text-gray-700 w-full cursor-pointer select-none outline-none rounded-sm transition-colors duration-100 hover:bg-gray-100 focus:bg-gray-100';

const GameListItem: React.FC<GameListItemProps> = ({
    game,
    onInfo,
    onReplay,
}) => {
    const colors = {
        win: 'from-teal-200 to-green-500 hover:from-green-400 hover:to-teal-300 hover:ring-1 ring-inset ring-slate-200/30',
        lose: 'from-red-300 to-red-600 hover:from-red-500 hover:to-rose-400 hover:ring-1 ring-inset ring-slate-200/30',
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <div
                    className={`
                        relative
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
                        cursor-pointer
                        select-none
                        outline-none
                    `}
                >
                    <span
                        className="
                            absolute inset-0
                            ring-1 ring-slate-800
                            bg-gradient-to-b from-white/30 to-transparent
                            rounded-md pointer-events-none
                        "
                    />
                    <div className="pl-1 mr-0.5 overflow-hidden flex items-center gap-1">
                        {game.opponent}
                    </div>
                </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="
                        z-50 min-w-[7rem] w-28 bg-white rounded-md border shadow-sm py-1
                        animate-in fade-in-0 zoom-in-95
                        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                    "
                >
                    <DropdownMenu.Item
                        className={menuItemBase}
                        onSelect={() => onReplay?.(game.game_id)}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Replay
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        className={menuItemBase}
                        onSelect={() => onInfo?.(game.game_id)}
                    >
                        <Info className="w-4 h-4 mr-2" /> Info
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default GameListItem;
