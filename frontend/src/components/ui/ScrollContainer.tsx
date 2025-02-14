import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const ScrollContainer: React.FC<{
    headertext: string;
    className?: string;
    children: React.ReactNode;
}> = ({ children, headertext, className = '' }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const [scrollHeight, setScrollHeight] = useState<number>(0);

    useEffect(() => {
        if (parentRef.current && headerRef.current) {
            const parentHeight = parentRef.current.clientHeight;
            const headerHeight = headerRef.current.clientHeight;
            setScrollHeight(parentHeight - headerHeight);
        }
    }, []);

    return (
        <div
            ref={parentRef}
            className={cn(
                'w-full flex flex-col bg-slate-200 bg-opacity-20 rounded-md h-40 border border-blue-200 shadow-md',
                className
            )}
        >
            <div
                ref={headerRef}
                className="bg-slate-200/40 pl-1.5 font-semibold w-full text-slate-800 "
            >
                {headertext}
            </div>

            <div
                className="w-full border border-slate-200/40 scrollbar-container overflow-y-auto flex-1 flex-grow min-h-0
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar]:h-2
                    
                        [&::-webkit-scrollbar-button]:h-0.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                      [&::-webkit-scrollbar-thumb]:bg-slate-300/30
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-thumb]:border-2
                        [&::-webkit-scrollbar-thumb]:border-solid
                        [&::-webkit-scrollbar-thumb]:border-transparent
                        [&::-webkit-scrollbar-thumb]:bg-clip-padding
                        [&::-webkit-scrollbar-thumb]:hover:bg-orange-100/60
                        "
                style={{ height: `${scrollHeight}px` }}
            >
                {children}
            </div>
        </div>
    );
};

export default ScrollContainer;
