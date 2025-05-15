import React from 'react';

const MainDesignWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="w-screen h-screen bg-no-repeat bg-cover min-h-screen"
            style={{
                backgroundImage: `url(./src/assets/bg/todor-dimov-XCTigZX4v9U-unsplash.webp`,
            }}
        >
            <div
                className="scrollbar-container max-h-screen overflow-y-auto
                    [&::-webkit-scrollbar]:w-6
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
                {children}
            </div>
        </div>
    );
};

export default MainDesignWrapper;
