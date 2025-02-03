// Lobby.tsx
import React from 'react';

const Rules: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <img
                src="src\assets\bg\mario-gogh-MpmAzASjUaM-unsplash.jpg"
                alt="Rules"
                className="w-full max-w-md rounded-lg shadow-xl shadow-black"
            />
            <div className="mt-4 mx-14 text-center">
                <h2 className="text-2xl font-bold text-start mt-2">
                    Welcome to the Lobby
                </h2>
                <p className="mt-2 text-start">Your lobby text here</p>
                <p className="mt-2 text-justify">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Voluptas dicta assumenda veniam nisi modi rem minima maxime
                    culpa, voluptates quae obcaecati consectetur, in aut. Ipsam
                    ab modi incidunt deleniti voluptas. Lorem ipsum dolor sit
                    amet, consectetur adipisicing elit. Maxime quo beatae
                    laudantium? Corrupti commodi, repellendus officia
                    necessitatibus doloribus cum rerum distinctio, consequatur
                    libero minima ducimus ex tenetur recusandae, non explicabo.
                    Perspiciatis repellat cum ullam, expedita saepe, temporibus
                    explicabo laudantium ut doloremque maxime error quidem
                    molestiae sint sequi quibusdam deleniti iusto aperiam
                    voluptatem incidunt. Minus dicta, dolore rerum itaque
                    eligendi ipsa. Dolorem, minima soluta ex excepturi tempora,
                    nemo magni, perspiciatis illo architecto qui deleniti. Minus
                    quod iure similique iste eveniet, illo harum et sunt
                    delectus soluta ullam corrupti? Alias, laudantium quod?
                </p>
            </div>
        </div>
    );
};

export default Rules;
