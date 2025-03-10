import React, { ReactElement, ReactInstance, ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggablePlayerCard(props: {
    id: any;
    children: any;
    currentCardId: number;
}) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: {
            index: props.id,
        },
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </div>
    );
}
