import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { PlayerStats } from '../utils/types';
import { SortablePlayerCard } from './ui/SortablePlayerCard';

export interface PlayerCardProps {
    player: PlayerStats;
    cardtype: 'DEFAULT' | 'CUSTOM' | 'FAVOURITE' | 'CURRENT';
}

interface PlayerCardsContainerProps {
    cards: PlayerCardProps[];
}

const LOCAL_STORAGE_KEY = 'playerCardsOrder';

export const PlayerCardsContainer: React.FC<PlayerCardsContainerProps> = ({
    cards,
}) => {
    const [items, setItems] = useState<PlayerCardProps[]>([]);

    // Initialize sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load cards and apply saved order on component mount
    useEffect(() => {
        // First, sort the cards by type and id
        const sortedCards = [...cards].sort((a, b) => {
            // First sort by card type (FAVOURITE > DEFAULT > CUSTOM)
            const typeOrder = {
                FAVOURITE: 0,
                DEFAULT: 1,
                CUSTOM: 2,
                CURRENT: 3,
            };

            if (typeOrder[a.cardtype] !== typeOrder[b.cardtype]) {
                return typeOrder[a.cardtype] - typeOrder[b.cardtype];
            }

            // Then sort by id (ascending)
            return a.player.id - b.player.id;
        });

        // Try to get saved order from local storage
        const savedOrder = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (savedOrder) {
            try {
                // Parse saved order
                const orderMap = JSON.parse(savedOrder);

                // Create a map of card IDs to their position
                const idToPositionMap: Record<number, number> = {};
                Object.entries(orderMap).forEach(([id, position]) => {
                    idToPositionMap[Number(id)] = Number(position);
                });

                // Sort cards based on saved positions
                const orderedCards = [...sortedCards].sort((a, b) => {
                    const posA =
                        idToPositionMap[a.player.id] ?? Number.MAX_SAFE_INTEGER;
                    const posB =
                        idToPositionMap[b.player.id] ?? Number.MAX_SAFE_INTEGER;
                    return posA - posB;
                });

                setItems(orderedCards);
            } catch (e) {
                // If there's an error parsing the saved order, use the default sort
                setItems(sortedCards);
            }
        } else {
            // If no saved order, use the default sort
            setItems(sortedCards);
        }
    }, [cards]);

    // Save current order to local storage whenever it changes
    const saveOrderToLocalStorage = (orderedItems: PlayerCardProps[]) => {
        const orderMap: Record<number, number> = {};
        orderedItems.forEach((item, index) => {
            orderMap[item.player.id] = index;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderMap));
    };

    // Handle the end of a drag event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.player.id === active.id
                );
                const newIndex = items.findIndex(
                    (item) => item.player.id === over.id
                );

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save the new order to local storage
                saveOrderToLocalStorage(newItems);

                return newItems;
            });
        }
    };

    return (
        <div className="w-full p-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((item) => item.player.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-screen overflow-y-auto p-2">
                        {items.map((card) => (
                            <SortablePlayerCard
                                key={card.player.id}
                                id={card.player.id}
                                cardProps={card}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
