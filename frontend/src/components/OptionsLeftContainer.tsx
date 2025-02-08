import React, { useState } from 'react';
import { PlayerStats } from '../utils/types';
import { Switch } from 'radix-ui';
import TennisPlayerCards from './TennisPlayerCards';
import TennisPlayerCreator from './TennisPlayerCreator';

const OptionsLeftContainer: React.FC<{
    player: PlayerStats;
    isOnline: boolean;
    rankPoints: number;
}> = ({ player, isOnline, rankPoints }) => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    return (
        <div className="w-full h-full p-1 flex flex-col gap-1 items-center justify-start bg-transparent border">
            <div className="text-lg font-semibold">
                Rank Points: {rankPoints}
            </div>

            <div>
                <form>
                    <div className="flex items-center">
                        <label
                            className={`pr-[15px] text-sm leading-none font-bold
            ${isOnline ? 'text-green-400' : 'text-gray-700'}`}
                            htmlFor="online-mode"
                        >
                            {isOnline ? 'Online' : 'Go Online!'}
                        </label>
                        <Switch.Root
                            className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-green-500"
                            id="online-mode"
                            checked={isOnline}
                            onCheckedChange={() => {
                                console.log('yes');
                            }}
                            style={{
                                WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
                            }}
                        >
                            <Switch.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
                        </Switch.Root>
                    </div>
                </form>
            </div>
            <div>
                <div className="relative"></div>
                <TennisPlayerCards players={[player]} />

                <div className="flex flex-row justify-self-center">
                    <button className="bg-slate-400 ">Option1</button>

                    <button>Option2</button>
                </div>
                <div>
                    <button
                        className="flex rounded-xl border-2 justify-self-center"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        Create
                    </button>
                    {isCreateOpen && (
                        <TennisPlayerCreator
                            onClose={() => setIsCreateOpen(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OptionsLeftContainer;
