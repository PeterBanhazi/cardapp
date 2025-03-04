import React, { useState, useEffect, ReactNode } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { PlayerStats } from '../utils/types';
import TennisPlayerCards from '../components/ui/TennisPlayerCards';
import DraggablePlayerCard from './DraggablePlayerCard';
import { DraggableElement } from '@dnd-kit/core/dist/store';

interface PlayerCardsContainerProps {
    playerCards: PlayerStats[];
    currentCardId: number;
    children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'playerCardsOrder';
const OptionsDnDCardWrapper: React.FC<PlayerCardsContainerProps> = ({
    children,
    playerCards,
    currentCardId,
}) => {
    const [items, setItems] = useState<PlayerStats[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [activeId, setActiveId] = useState(null);

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
        const sortedPlayers = [...playerCards].sort((a, b) => {
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
                const orderedPlayers = [...playerCards].sort((a, b) => {
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
    }, [playerCards]);

    // Save current order to local storage whenever it changes
    const saveOrderToLocalStorage = (orderedItems: PlayerStats[]) => {
        const orderMap: Record<string, number> = {};
        orderedItems.forEach((item, index) => {
            orderMap[item.plusid] = index;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderMap));
    };

    // Handle the end of a drag event
    function handleDragStart(event: DragStartEvent) {
        setIsDragging(true);
        setActiveId(event.active.id);
    }
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
                setIsDragging(false);
                setActiveId(null);
                return newItems;
            });
        }
    };
    return (
        <div className="">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="flex">
                    {children}
                    <div className="w-3.5 2xl:w-8"></div>
                    <div className="w-full h-full">
                        <div
                            className="pt-1 w-[418px] h-[604px] sm:w-[200px] md:w-[368px] lg:w-[520px] xl:w-[836px] 2xl:w-[996px]
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
                        "
                        >
                            <SortableContext
                                items={items.map((item) =>
                                    item.plusid.toString()
                                )}
                                strategy={rectSortingStrategy}
                            >
                                <div
                                    className="self-center gap-2.5 pl-7 flex overflow-clip"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, 148px)',
                                    }}
                                >
                                    {items.map((player) => (
                                        <DraggablePlayerCard
                                            key={player.plusid}
                                            id={player.plusid}
                                            currentCardId={currentCardId}
                                        >
                                            <TennisPlayerCards
                                                player={player}
                                                currentCardId={currentCardId}
                                            />
                                        </DraggablePlayerCard>
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    </div>
                </div>
                <DragOverlay>
                    {isDragging && activeId ? (
                        <TennisPlayerCards
                            currentCardId={currentCardId}
                            player={
                                items.find(
                                    (item) => item.plusid === activeId
                                ) || items[0]
                            }
                            // ### above things could have occur errors !!!!!!!!!!
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default OptionsDnDCardWrapper;
