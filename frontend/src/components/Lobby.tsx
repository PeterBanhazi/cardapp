// Lobby.tsx
import React from 'react';

const Lobby: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <img
                src="/assets/react.svg"
                alt="Lobby"
                className="w-full max-w-2xl rounded-lg shadow-lg"
            />
            <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold">Welcome to the Lobby</h2>
                <p className="mt-2">Your lobby text here</p>
            </div>
        </div>
    );
};

export default Lobby;
