import { Scrollbars } from 'rc-scrollbars';
import { useState } from 'react';

type ScrollAreaProps = {
    children: React.ReactNode;
    variant?: 'default' | 'mini';
    autoHide?: boolean;
    hoverEffect?: boolean;
    className?: string;
    paddingRight?: number;
    autoScroll?: boolean;
};

export default function ScrollArea({
    children,
    variant = 'default',
    autoHide = false,
    hoverEffect = false,
    className,
    paddingRight = 0,
    autoScroll = false,
}: ScrollAreaProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [hasScroll, setHasScroll] = useState(false);

    const isMini = variant === 'mini';

    const baseColor = isMini
        ? 'rgba(203,213,225,0.3)' // slate-300/30
        : 'rgba(203,213,225,0.5)'; // slate-300/50

    const hoverColor = isMini
        ? 'rgba(245, 245, 244,0.7)' // orange-100/60
        : 'rgba(254,215,170,0.8)'; // orange-200/80

    const activeColor = hoverEffect && isHovered ? hoverColor : baseColor;

    const trackWidth = isMini ? 8 : 24; // px (w-2 vs w-6)
    const borderSize = isMini ? 2 : 8;
    const trackOffset = isMini ? 2 : 8;
    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={className}
        >
            <Scrollbars
                onUpdate={(values) => {
                    setHasScroll(values.scrollHeight > values.clientHeight);
                }}
                autoHide={autoHide}
                style={{ width: '100%', height: '100%' }}
                renderTrackVertical={({ style, ...props }) => (
                    <div
                        {...props}
                        style={{
                            ...style,
                            right: 0,
                            top: trackOffset,
                            bottom: trackOffset,
                            width: trackWidth,
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
                            border: `${borderSize}px solid transparent`,
                            backgroundClip: 'padding-box',
                            transition: 'background-color 0.2s',
                        }}
                    />
                )}
            >
                {/* helper for padding prevents overlapping */}
                <div
                    style={{
                        paddingRight:
                            autoScroll && !hasScroll ? 0 : paddingRight,
                    }}
                >
                    {children}
                </div>
            </Scrollbars>
        </div>
    );
}
