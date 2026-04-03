import React, { useEffect, useRef, useState } from 'react';

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
        hideOnClick = false,
        isClickable = false,
    } = options;

    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState<'center' | 'left' | 'right'>(
        'center'
    );

    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const clickable = isClickable || !!onClick;

    // positioning
    useEffect(() => {
        if (!visible || !tooltipRef.current) return;

        const rect = tooltipRef.current.getBoundingClientRect();

        if (rect.right > window.innerWidth) {
            setPosition('right');
        } else if (rect.left < 0) {
            setPosition('left');
        } else {
            setPosition('center');
        }
    }, [visible]);

    // close on outside click + ESC
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setVisible(false);
            }
        };

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setVisible(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const handleClick = () => {
        if (onClick) onClick();
        if (hideOnClick) setVisible(false);
    };

    const tooltipPositionClass = {
        center: 'left-1/2 -translate-x-1/2',
        left: 'left-0',
        right: 'right-0',
    }[position];

    return (
        <div
            ref={wrapperRef}
            className="relative inline-block"
            onMouseEnter={() => tooltipIsActive && setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {/* Username */}
            <span
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : -1}
                aria-label={username}
                aria-describedby={
                    tooltipIsActive ? 'username-tooltip' : undefined
                }
                onClick={handleClick}
                onKeyDown={(e) => {
                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleClick();
                    }
                }}
                // ring black for accessibility tab button
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

            {/* Tooltip */}
            {tooltipIsActive && visible && (
                <div
                    ref={tooltipRef}
                    id="username-tooltip"
                    role="tooltip"
                    className={`
            absolute z-50 mt-1
            whitespace-nowrap rounded shadow-lg
            ${tooltipPositionClass}
            ${themeClasses[tooltipTheme]}
            ${sizeClasses[tooltipSize]}
          `}
                >
                    {username}
                </div>
            )}
        </div>
    );
};
