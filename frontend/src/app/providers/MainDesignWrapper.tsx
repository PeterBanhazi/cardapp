import React from 'react';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'flowbite-react';
import { customTheme } from '../../shared/formThemes';
import ScrollArea from '@/shared/components/ui/ScrollArea';

// ThemeProvider for custom colors
// Splash like effect on load to prevent blinking
// Main background
// Main scrollbar + spacers

const MainDesignWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <ThemeProvider theme={customTheme}>
            <div
                className={`w-screen h-screen bg-no-repeat bg-cover min-h-screen flex flex-col transition-opacity duration-200 ${
                    mounted ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    backgroundImage: `url(./src/assets/bg/todor-dimov-XCTigZX4v9U-unsplash.webp`,
                }}
            >
                <ScrollArea
                    paddingRight={20}
                    centerOnScrollbar
                    className="w-screen h-screen max-h-screen"
                >
                    <div className="w-full">{children}</div>
                </ScrollArea>
            </div>
        </ThemeProvider>
    );
};

export default MainDesignWrapper;
