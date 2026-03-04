import React from 'react';
import { PlayerStats } from '../utils/types';
import TennisPlayerCards from '../shared/components/ui/TennisPlayerCards';

const PlayerCardDisplay: React.FC<{
    item: PlayerStats;
    onSelect?: () => void;
    isInCurrentContainer?: boolean;
    currentCardId: number;
    isSortable?: boolean;
}> = ({
    item,
    onSelect,
    isInCurrentContainer = true,
    currentCardId,
    isSortable = false,
}) => {
    return (
        <div>
            <TennisPlayerCards
                player={item}
                isInCurrentContainer={isInCurrentContainer}
                currentCardId={currentCardId}
                isSortable={isSortable}
            />
        </div>
    );
};

export default PlayerCardDisplay;
