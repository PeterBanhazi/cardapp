import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

type TooltipTheme = 'light' | 'dark';
type TooltipSize = 'sm' | 'md' | 'lg';

type UsernameProps = {
    username: string;
    options: {
        maxWidth: number;
        tooltipTheme?: TooltipTheme;
        tooltipSize?: TooltipSize;
        tooltipIsActive?: boolean;
        hideOnClick?: boolean;
        isClickable?: boolean;
    };
    className?: string;
    onClick?: () => void;
};

const sizeClasses: Record<TooltipSize, string> = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
};

const themeClasses: Record<TooltipTheme, string> = {
    light: 'bg-white text-gray-700 border border-gray-300',
    dark: 'bg-gray-800 text-white',
};

export const UsernameWrapper: React.FC<UsernameProps> = ({
    username,
    options,
    className = '',
    onClick,
}) => {
    const {
        maxWidth,
        tooltipTheme = 'dark',
        tooltipSize = 'md',
        tooltipIsActive = false,
        isClickable = false,
    } = options;

    const clickable = isClickable || !!onClick;

    const handleClick = () => {
        if (onClick) onClick();
    };

    const span = (
        <span
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : -1}
            aria-label={username}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className={`
                block truncate min-w-0
                ${clickable ? 'cursor-pointer' : 'cursor-default'}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-black
                ${className}
            `}
            style={{ maxWidth }}
        >
            {username}
        </span>
    );

    if (!tooltipIsActive) {
        return <div className="relative inline-block">{span}</div>;
    }

    return (
        <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>{span}</Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side="bottom"
                        sideOffset={4}
                        className={`
                            z-50 whitespace-nowrap rounded shadow-lg
                            ${themeClasses[tooltipTheme]}
                            ${sizeClasses[tooltipSize]}
                            animate-in fade-in-0 zoom-in-95
                            data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                        `}
                    >
                        {username}
                        <Tooltip.Arrow
                            className={
                                tooltipTheme === 'dark'
                                    ? 'fill-gray-800'
                                    : 'fill-white'
                            }
                        />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};
