import useAxios from '@/core/utils/useAxios';
import { Button, TextInput } from 'flowbite-react';
import React, { useState } from 'react';

type Props = {
    onSubmit: (value: string) => void;
};
// From https://www.material-tailwind.com/docs/html/input
const InviteInput = ({ onSubmit }: Props) => {
    const [value, setValue] = useState('');

    // egyszerű sanitize
    const sanitize = (input: string) => {
        return input.trim().replace(/[<>]/g, '');
    };

    const handleSubmit = () => {
        const sanitized = sanitize(value);

        if (sanitized.length < 4) return;

        onSubmit(sanitized);
        setValue('');
    };

    const isValid = value.trim().length >= 4;

    return (
        <div className="w-full">
            <div className="relative">
                <input
                    type="text"
                    onSubmit={handleSubmit}
                    id="requestInput"
                    name="requestInput"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    className="w-full h-7 bg-slate-200 placeholder:text-slate-500 text-slate-800 text-sm font-medium border border-slate-200 rounded-md pl-[6px] pt-[6px]  transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    placeholder="Add Email or User"
                />
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="absolute right-1 rounded cursor-pointer bg-slate-600 px-0.5 py-0 mt-[3px] border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                >
                    ➜
                </button>
            </div>
        </div>
    );
};

export default InviteInput;
