import React from 'react';

const CurrentCardDropZone: React.FC<{
    isOver: boolean;
    children: React.ReactNode;
}> = ({ isOver = true, children }) => {
    return (
        <div
            data-id="drop-zone"
            id="drop-zone"
            className={`${
                isOver
                    ? 'shadow-[0_0_10px_rgba(255,255,255,0.9)] shadow-slate-100 transition-shadow duration-100'
                    : ''
            }`}
        >
            Drop me here
            {children}
        </div>
    );
};

export default CurrentCardDropZone;
