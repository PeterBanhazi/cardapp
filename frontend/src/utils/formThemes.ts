import { createTheme } from "flowbite-react";

export const customTheme = createTheme({
    label: {
        root: {
            base: 'text-sm font-medium',
            disabled: 'opacity-50',
            colors: {
                default: 'text-gray-900',
                error: 'text-red-700',
            },
        },
    },
    button: {
        color: {
            tennisprimary:
                'bg-orange-400 hover:bg-orange-300 text-slate-50 hover:cursor-pointer focus:ring-2 focus:ring-orange-500',
            secondary: 'bg-blue-500 hover:bg-blue-600',
        },
    },
    textInput: {
        base: 'block w-full',
        field: {
            base: '',
            input: {
                base: '',
                sizes: {
                    sm: 'text-sm',
                    md: 'text-base',
                },
                colors: {
                    tennisprimary:
                        'border-gray-300 bg-gray-50 focus:border-orange-500 focus:border focus:ring-orange-500',
                    error: 'border-red-500 bg-red-50',
                },
            },
        },
    },
});