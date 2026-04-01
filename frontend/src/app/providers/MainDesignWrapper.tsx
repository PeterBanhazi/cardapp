import React from 'react';
import { useEffect, useState } from 'react';

const MainDesignWrapper = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    return (
        <div
            className={`w-screen h-screen bg-no-repeat bg-cover min-h-screen flex flex-col transition-opacity duration-200 ${
                mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
                backgroundImage: `url(./src/assets/bg/todor-dimov-XCTigZX4v9U-unsplash.webp`,
            }}
        >
            <div
                className="w-screen h-screen overflow-y-auto scrollbar-container max-h-screen
                    [&::-webkit-scrollbar]:w-5
                    md:[&::-webkit-scrollbar]:w-6
                    [&::-webkit-scrollbar]:h-2                   
                    [&::-webkit-scrollbar-button]:h-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-slate-300/50
                  [&::-webkit-scrollbar-thumb]:hover:bg-orange-200/80
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:border-8
                    [&::-webkit-scrollbar-thumb]:border-solid
                    [&::-webkit-scrollbar-thumb]:border-transparent
                    [&::-webkit-scrollbar-thumb]:bg-clip-padding                   
                    overflow-auto
            "
            >
                <div className="flex justify-center">
                    {/* left spacer */}
                    <div className="w-5 md:w-6 shrink-0" />

                    {/* content */}
                    <div className="w-full">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default MainDesignWrapper;
