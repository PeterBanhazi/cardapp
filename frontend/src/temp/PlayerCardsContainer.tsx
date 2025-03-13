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
import TennisPlayerCards from './ui/TennisPlayerCards';
import { PlayerStats } from '../utils/types';
// Updated interface as provided

interface PlayerCardsContainerProps {
    players: PlayerStats[];
}

const LOCAL_STORAGE_KEY = 'playerCardsOrder';

export const PlayerCardsContainer: React.FC<PlayerCardsContainerProps> = ({
    players,
}) => {
    const [items, setItems] = useState<PlayerStats[]>([]);

    // Initialize sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // Only start dragging after moving 8px
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load cards and apply saved order on component mount
    useEffect(() => {
        // First, sort the players by cardtype and id
        const sortedPlayers = [...players].sort((a, b) => {
            // First sort by card type (FAVOURITE > DEFAULT > CUSTOM > CURRENT)
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
            return a.id - b.id;
        });

        // Try to get saved order from local storage
        const savedOrder = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (savedOrder) {
            try {
                // Parse saved order
                const orderMap = JSON.parse(savedOrder);

                // Create a map of player IDs to their position
                const idToPositionMap: Record<string, number> = {};
                Object.entries(orderMap).forEach(([id, position]) => {
                    idToPositionMap[String(id)] = Number(position);
                });

                // Sort players based on saved positions
                const orderedPlayers = [...players].sort((a, b) => {
                    const posA =
                        idToPositionMap[a.plusid] ?? Number.MAX_SAFE_INTEGER;
                    const posB =
                        idToPositionMap[b.plusid] ?? Number.MAX_SAFE_INTEGER;
                    return posA - posB;
                });

                setItems(orderedPlayers);
            } catch (e) {
                // If there's an error parsing the saved order, use the default sort
                setItems(sortedPlayers);
            }
        } else {
            // If no saved order, use the default sort
            setItems(sortedPlayers);
        }
    }, [players]);

    // Save current order to local storage whenever it changes
    const saveOrderToLocalStorage = (orderedItems: PlayerStats[]) => {
        const orderMap: Record<string, number> = {};
        orderedItems.forEach((item, index) => {
            orderMap[item.plusid] = index;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderMap));
    };

    // Handle the end of a drag event
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.plusid.toString() === active.id
                );
                const newIndex = items.findIndex(
                    (item) => item.plusid.toString() === over.id
                );

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Save the new order to local storage
                saveOrderToLocalStorage(newItems);

                return newItems;
            });
        }
    };

    return (
        <div className="w-full pt-1">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map((item) => item.plusid.toString())}
                    strategy={rectSortingStrategy}
                >
                    <div
                        className="self-center gap-2.5 pl-7 flex"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, 148px)',
                        }}
                    >
                        {items.map((player) => (
                            <TennisPlayerCards
                                key={player.plusid}
                                player={player}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
