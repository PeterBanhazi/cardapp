import React from 'react';
import { PlayerStats } from '../utils/types';
import TennisPlayerCards from './ui/TennisPlayerCards';

const OptionsMiddleContainer: React.FC<{
    all_players: PlayerStats[];
}> = ({ all_players }) => {
    return (
        <div
            className="h-full w-full
                    scrollbar-container max-h-screen overflow-y-auto
                    [&::-webkit-scrollbar]:w-7
                    [&::-webkit-scrollbar]:h-2
                   
                    [&::-webkit-scrollbar-button]:h-0.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-slate-300/30

                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:border-8
                    [&::-webkit-scrollbar-thumb]:border-solid
                    [&::-webkit-scrollbar-thumb]:border-transparent
                    [&::-webkit-scrollbar-thumb]:bg-clip-padding
                    [&::-webkit-scrollbar-thumb]:hover:bg-orange-100/60
                    overflow-auto"
        >
            <div
                className="justify-center gap-2 pl-7"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, 148px)',
                }}
            >
                {all_players.map((elem, index) => (
                    <TennisPlayerCards
                        key={index}
                        player={elem}
                        cardtype={elem.cardtype}
                    />
                ))}
            </div>
        </div>
    );
};

export default OptionsMiddleContainer;
