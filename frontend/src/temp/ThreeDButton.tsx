import React from 'react';
import { Friendship } from '../utils/types';
import { Dropdown } from 'flowbite-react';
import { yellow } from '@radix-ui/colors';
interface MenuFunctions {}

interface ThreeDButtonProps {
    name: string;
    color: string;
    dropdownitems: 'Aceept' | 'Reject' | 'Chat' | 'Play' | 'Delete' | 'Info';
    dropdown: MenuFunctions[];
}

const ThreeDButton: React.FC<{
    friendships: Friendship[];
}> = ({ friendships }) => {
    const colors = {
        red: 'from-red-400 to-red-600 hover:from-red-300 hover:to-red-500',
        green: 'from-green-400 to-green-600 hover:from-green-300 hover:to-green-500',
        yellow: 'from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500',
    };
    return (
        <div className="flex flex-col gap-1">
            {friendships.map((friend) => (
                <>
                    <div
                        key={friend.friend_username}
                        className={`relative       
      py-0.9 
      text-slate-100
      font-semibold 
      text-sm
      border-2
      rounded-lg
      transition-all 
      duration-200
      bg-gradient-to-br
     ${
         friend.status === `PENDING`
             ? colors.yellow
             : friend.status === 'ACCEPTED'
             ? colors.green
             : colors.red
     }
      border-2
      border-slate-400/30
      active:translate-y-0.5
      overflow-hidden
    `}
                    >
                        <span
                            className="
        absolute 
        inset-0 
        border-2
        bg-gradient-to-b 
        from-white/30 
        to-transparent
        rounded-lg
      "
                        />
                        <div className="rounded-lg px-1 flex items-center border-2">
                            <div>{friend.friend_username}</div>
                        </div>
                    </div>
                </>
            ))}
            theend
        </div>
    );
};
export default ThreeDButton;
