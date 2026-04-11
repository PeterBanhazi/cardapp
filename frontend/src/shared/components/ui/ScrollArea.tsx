import { Scrollbars } from 'rc-scrollbars';
import { useEffect, useRef, useState } from 'react';

// overcomplicated scrollbar

type ScrollAreaProps = {
    children: React.ReactNode;
    variant?: 'default' | 'mini' | 'thick';
    autoHide?: boolean;
    hoverEffect?: boolean;
    className?: string;
    paddingRight?: number;
    autoScroll?: boolean;
    centerOnScrollbar?: boolean;
};

export default function ScrollArea({
    children,
    variant = 'default',
    autoHide = false,
    hoverEffect = false,
    className,
    paddingRight = 0,
    autoScroll = false,
    centerOnScrollbar = false,
}: ScrollAreaProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [hasScroll, setHasScroll] = useState(false);
    const scrollRef = useRef<Scrollbars>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    // resize observer to make scrollbar size accurately updated on
    // scrollarea container change

    useEffect(() => {
        if (!contentRef.current) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                scrollRef.current?.update();
            });
        });
        observer.observe(contentRef.current);

        return () => observer.disconnect();
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        const view = scrollRef.current?.view;

        if (!view) return;

        // check the actual container(view) to prevent global scrolling
        // requestAnimationFrame for prevent frame jitter
        if (!view.contains(e.target as Node)) {
            requestAnimationFrame(() => {
                view.scrollTop += e.deltaY;
            });
        }
    };

    const variants = {
        mini: {
            trackWidth: 8,
            border: 2,
            base: 'rgba(203,213,225,0.3)',
            hover: 'rgba(245, 245, 244,0.7)',
            offset: 2,
        },
        default: {
            trackWidth: 24,
            border: 8,
            base: 'rgba(203,213,225,0.5)',
            hover: 'rgba(254,215,170,0.8)',
            offset: 8,
        },
        thick: {
            trackWidth: 30,
            border: 10,
            base: 'rgba(203,213,225,0.6)',
            hover: 'rgba(245, 245, 244,0.6)',
            offset: 2,
        },
    } as const;

    const config = variants[variant];

    const showRightSpacer = !(autoScroll && !hasScroll);
    const showLeftSpacer = centerOnScrollbar && showRightSpacer;
    const activeColor = hoverEffect && isHovered ? config.hover : config.base;

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onWheel={handleWheel}
            className={className}
        >
            <Scrollbars
                // setHasScroll changes only when need to update the value with a new one
                onUpdate={(values) => {
                    const next = values.scrollHeight > values.clientHeight;
                    setHasScroll((prev) => (prev !== next ? next : prev));
                }}
                autoHide={autoHide}
                ref={scrollRef}
                style={{ width: '100%', height: '100%' }}
                renderTrackVertical={({ style, ...props }) => (
                    <div
                        {...props}
                        style={{
                            ...style,
                            right: 0,
                            top: config.offset,
                            bottom: config.offset,
                            width: config.trackWidth,
                        }}
                    />
                )}
                renderThumbVertical={({ style, ...props }) => (
                    <div
                        {...props}
                        style={{
                            ...style,
                            backgroundColor: activeColor,
                            borderRadius: '9999px',
                            border: `${config.border}px solid transparent`,
                            backgroundClip: 'padding-box',
                            transition: 'background-color 0.2s',
                        }}
                    />
                )}
            >
                <div className="flex">
                    {/* LEFT spacer */}
                    {showLeftSpacer && (
                        <div
                            style={{ width: paddingRight }}
                            className="shrink-0"
                        />
                    )}

                    {/* content */}
                    <div ref={contentRef} className="flex-1 min-w-0">
                        {children}
                    </div>

                    {/* RIGHT spacer */}
                    {showRightSpacer && (
                        <div
                            style={{ width: paddingRight }}
                            className="shrink-0"
                        />
                    )}
                </div>
            </Scrollbars>
        </div>
    );
}
