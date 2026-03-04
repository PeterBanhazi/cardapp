import { Button, TextInput } from 'flowbite-react';
import React from 'react';

// From https://www.material-tailwind.com/docs/html/input
const InviteInput = () => {
    return (
        <div className="w-full">
            <div className="relative">
                <input
                    type="text"
                    maxLength={20}
                    className="w-full h-7 bg-slate-200 placeholder:text-slate-500 text-slate-800 text-sm font-medium border border-slate-200 rounded-md pl-2 pr-7 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Add Username"
                />
                <button
                    className="absolute right-1 top-[3px] rounded bg-slate-600 py-[0px] px-1 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                >
                    ➜
                </button>
            </div>
        </div>
    );
};

export default InviteInput;
