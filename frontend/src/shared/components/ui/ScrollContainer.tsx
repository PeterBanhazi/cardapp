import React, { useRef } from 'react';
import { cn } from '../../../lib/utils';
import ScrollArea from './ScrollArea';

const ScrollContainer: React.FC<{
    headertext: JSX.Element;
    className?: string;
    children: React.ReactNode;
}> = ({ children, headertext, className = '' }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    // ###For dynamic resize:
    //
    //
    //
    // const [scrollHeight, setScrollHeight] = useState<number>(0);

    // // useLayoutEffect(() => {
    // //     if (parentRef.current && headerRef.current) {
    // //         const parentHeight = parentRef.current.clientHeight;
    // //         const headerHeight = headerRef.current.clientHeight;
    // //         setScrollHeight(parentHeight - headerHeight);
    // //     }
    // // }, []);

    return (
        <div
            ref={parentRef}
            className={cn(
                'w-full flex flex-col bg-slate-200/20 rounded-md h-40 border border-blue-200 shadow-md',
                className
            )}
        >
            <div
                ref={headerRef}
                className="bg-slate-200/40 pl-1.5 font-semibold w-full text-slate-800"
            >
                {headertext}
            </div>
            <ScrollArea
                variant="mini"
                hoverEffect
                autoScroll
                className="w-full flex-1 flex-grow min-h-0"
                paddingRight={5}
            >
                {children}
            </ScrollArea>
        </div>
    );
};

export default ScrollContainer;
