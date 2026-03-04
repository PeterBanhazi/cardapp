import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { PlayerStats } from '../../../shared/types/types';
import { CSS } from '@dnd-kit/utilities';
import TennisPlayerCards from './TennisPlayerCards';

const DraggablePlayerCard: React.FC<{
    id: number;

    item: PlayerStats;
    currentCardId: number;
    isSortable: boolean;
    isInCurrentContainer?: boolean;
}> = ({
    id,

    item,
    currentCardId,
    isSortable,
    isInCurrentContainer = false,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({
        id: item.id,
        disabled: false,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="touch-manipulation relative"
        >
            <TennisPlayerCards
                player={item}
                isInCurrentContainer={isInCurrentContainer}
                currentCardId={currentCardId}
                isSortable={isSortable}
            />
        </div>
    );
};
export default DraggablePlayerCard;
