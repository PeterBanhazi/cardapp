import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';

// Define types for our card and props
interface Card {
    id: string;
    title: string;
    content: string;
}

interface DraggableGridProps {
    initialCards: Card[];
    onOrderChange?: (cards: Card[]) => void;
}

// Card component with drag functionality
const DraggableCard: React.FC<{ card: Card; index: number }> = ({
    card,
    index,
}) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={card}
            id={card.id}
            dragControls={dragControls}
            drag
            className="bg-white rounded-lg shadow-md p-4 cursor-move w-[148px]"
        >
            <div
                className="flex items-center justify-between"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <div>
                    <h3 className="font-bold text-lg">{card.title}</h3>
                    <p className="text-gray-600 mt-2">{card.content}</p>
                </div>
                <div className="text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                        />
                    </svg>
                </div>
            </div>
        </Reorder.Item>
    );
};

// Main Grid Component
const DraggableGrid: React.FC<DraggableGridProps> = ({
    initialCards,
    onOrderChange,
}) => {
    const [cards, setCards] = useState<Card[]>(initialCards);

    const handleReorder = (newOrder: Card[]) => {
        setCards(newOrder);
        if (onOrderChange) {
            onOrderChange(newOrder);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Reorder.Group
                // axis="y"
                values={cards}
                onReorder={handleReorder}
                className="self-center gap-2 pl-7 flex flex-row flex-wrap justify-start content-start"
            >
                {cards.map((card, index) => (
                    <DraggableCard key={card.id} card={card} index={index} />
                ))}
            </Reorder.Group>
        </div>
    );
};

// Example usage
const DragDropExample: React.FC = () => {
    const sampleCards: Card[] = [
        { id: '1', title: 'Card 1', content: 'This is the first card' },
        { id: '2', title: 'Card 2', content: 'This is the second card' },
        { id: '3', title: 'Card 3', content: 'This is the third card' },
        { id: '4', title: 'Card 4', content: 'This is the fourth card' },
        { id: '5', title: 'Card 5', content: 'This is the fifth card' },
        { id: '6', title: 'Card 6', content: 'This is the sixth card' },
    ];

    const handleOrderChange = (newOrder: Card[]) => {
        console.log('New order:', newOrder);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Drag to Reorder Cards
            </h1>
            <DraggableGrid
                initialCards={sampleCards}
                onOrderChange={handleOrderChange}
            />
        </div>
    );
};

export default DragDropExample;
