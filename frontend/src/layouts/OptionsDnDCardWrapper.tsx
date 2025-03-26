import React, { useState, useEffect } from 'react';
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
    UniqueIdentifier,
    TouchSensor,
    DragOverEvent,
    MeasuringStrategy,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { FaArrowsRotate } from 'react-icons/fa6';

import { PlayerStats } from '../utils/types';
import TennisPlayerCards from '../components/ui/TennisPlayerCards';
import DraggablePlayerCard from './DraggablePlayerCard';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';
import OptionsLeftContainer from '../components/OptionsLeftContainer';

interface PlayerCardsContainerProps {
    userName: string;
    playerCards: PlayerStats[];
    currentCardId: number;
    isOnline: boolean;
    rankPoints: number;
    currentPlayer: PlayerStats[];
}

const OptionsDnDCardWrapper: React.FC<PlayerCardsContainerProps> = ({
    userName,
    playerCards,
    currentCardId,
    isOnline,
    rankPoints,
    currentPlayer,
}) => {
    const LOCAL_STORAGE_KEY = `${userName}_playerCardsOrder`;
    const [items, setItems] = useState<PlayerStats[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [listReset, setListReset] = useState<boolean>(false);

    const [isClicked, setIsClicked] = useState(false);

    const handleListReset = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setListReset((value) => !value);
    };

    // Initialize sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                // Only start dragging after moving 8px
                distance: 6,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load cards and apply saved order on component mount
    useEffect(() => {
        // Sort the players by cardtype and id
        const sortedPlayers = [...playerCards].sort((a, b) => {
            // sort by card type (FAVOURITE > DEFAULT > CUSTOM > CURRENT)
            const typeOrder = {
                FAVOURITE: 0,
                DEFAULT: 1,
                CUSTOM: 2,
                CURRENT: 3,
            };

            if (typeOrder[a.cardtype] !== typeOrder[b.cardtype]) {
                return typeOrder[a.cardtype] - typeOrder[b.cardtype];
            }

            // sort by id (ascending)
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
                        idToPositionMap[a.id] ?? Number.MAX_SAFE_INTEGER;
                    const posB =
                        idToPositionMap[b.id] ?? Number.MAX_SAFE_INTEGER;
                    return posA - posB;
                });

                setItems(orderedPlayers);
                setIsClicked(false);
            } catch (e) {
                // If there's an error parsing the saved order, use the default sort
                setItems(sortedPlayers);
                setIsClicked(true);
            }
        } else {
            // If no saved order, use the default sort
            setItems(sortedPlayers);
            setIsClicked(true);
        }
    }, [playerCards, listReset]);

    // Save current order to local storage whenever it changes
    const saveOrderToLocalStorage = (orderedItems: PlayerStats[]) => {
        const orderMap: Record<string, number> = {};
        orderedItems.forEach((item, index) => {
            orderMap[item.id] = index;
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orderMap));
        setIsClicked(false);
    };

    // Handle the drag events
    const handleDragStart = (event: DragStartEvent) => {
        setIsDragging(true);
        setActiveId(event.active.id);
    };
    const activeDraggingCard: PlayerStats | undefined = items.find(
        (item) => item.id === activeId
    );
    // const handleDragOver = (event: DragOverEvent) => {
    //     // Check if hovering over drop zone
    //     if (event.over && event.over.id === 'doppable') {
    //         setIsOverDropZone(true);
    //     } else {
    //         setIsOverDropZone(false);
    //     }
    // };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.id === 'droppable') {
            const nextCard = items.find((item) => item.id === active.id);

            if (nextCard) handleChooseClick(nextCard.id);
        } else if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id
                );
                const newIndex = items.findIndex((item) => item.id === over.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                saveOrderToLocalStorage(newItems);

                return newItems;
            });
        }

        setIsDragging(false);
        setActiveId(null);
        setIsOverDropZone(false);
    };

    const queryClient = useQueryClient();

    const chooseCurrentPlayerMutation = useMutation({
        mutationFn: (newCurrentPlayer: number): any =>
            useAxios().patch('options/', {
                current_player_id_change: newCurrentPlayer,
            }),
        // make sure to _return_ the Promise from the query invalidation
        // so that the mutation stays in `pending` state until the refetch is finished
        onSuccess: () => {
            console.log('megtortent');
        },
        onSettled: async () => {
            return await queryClient.invalidateQueries({
                queryKey: ['userproperties'],
            });
        },
    });

    const { isPending, submittedAt, variables, mutate, isError } =
        chooseCurrentPlayerMutation;

    const handleChooseClick = (id: number): void => {
        mutate(id);
    };
    // const curr = currentPlayer;
    return (
        <div className="">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                // onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                    },
                }}
            >
                <div className="flex">
                    <div className="w-[150px] h-[592px] pt-1">
                        <OptionsLeftContainer
                            currentPlayer={currentPlayer}
                            currentCardId={currentCardId}
                            isOnline={isOnline}
                            rankPoints={rankPoints}
                            isDragging={isDragging}
                        >
                            <FaArrowsRotate
                                size="23"
                                onClick={handleListReset}
                                className={`text-slate-800 ${
                                    !isClicked
                                        ? 'hover:animate-spin hover:text-slate-600 cursor-pointer'
                                        : 'cursor-not-allowed hover:normal-case'
                                }`}
                            />
                        </OptionsLeftContainer>
                    </div>
                    <div className="w-3.5 2xl:w-8"></div>
                    <div className="w-full h-full">
                        <div
                            className="w-[418px] h-[604px] sm:w-[200px] md:w-[368px] lg:w-[520px] xl:w-[836px] 2xl:w-[996px]
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
                                items={items.map((item) => item.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div
                                    className="pt-1 self-center gap-2.5 pl-7 flex"
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fit, 148px)',
                                    }}
                                >
                                    {items.map((player) => (
                                        <DraggablePlayerCard
                                            key={player.id}
                                            id={player.id}
                                            currentCardId={currentCardId}
                                            isSortable={true}
                                            item={player}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </div>
                    </div>
                </div>
                <DragOverlay>
                    {activeDraggingCard ? (
                        <TennisPlayerCards
                            currentCardId={currentCardId}
                            player={activeDraggingCard}
                            isSortable={true}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default OptionsDnDCardWrapper;
