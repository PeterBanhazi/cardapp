import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlayerCardProps } from './TennisPlayerCards';

interface SortablePlayerCardProps {
    id: number;
    cardProps: PlayerCardProps;
}

export const SortablePlayerCard: React.FC<SortablePlayerCardProps> = ({
    id,
    cardProps,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    // Determine card border color based on cardtype
    const getBorderColor = () => {
        switch (cardProps.player.cardtype) {
            case 'FAVOURITE':
                return 'border-yellow-500';
            case 'DEFAULT':
                return 'border-blue-500';
            case 'CUSTOM':
                return 'border-purple-500';
            case 'CURRENT':
                return 'border-green-500';
            default:
                return 'border-gray-300';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 border-2 ${getBorderColor()} rounded-lg bg-white shadow-md cursor-move
                 hover:shadow-lg transition-shadow duration-200 select-none`}
        >
            <div className="flex flex-col">
                <div className="text-lg font-bold">{cardProps.player.name}</div>
                <div className="text-sm text-gray-600">
                    ID: {cardProps.player.id}
                </div>
                <div className="text-sm text-gray-600">
                    Type: {cardProps.player.cardtype}
                </div>
                {/* Add more player stats here */}
            </div>
        </div>
    );
};
