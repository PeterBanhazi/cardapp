import React from 'react';
import { PlayerStats } from '../utils/types';
import TennisPlayerCards from './TennisPlayerCards';

const OptionsMiddleContainer: React.FC<{
    players: PlayerStats[];
}> = ({ players }) => {
    return (
        <div className="w-full h-full p-4 overflow-y-auto border-2">
            <h3 className="text-lg font-semibold mb-4">Custom Players</h3>

            <TennisPlayerCards players={players} />
        </div>
    );
};

export default OptionsMiddleContainer;
