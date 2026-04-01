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
    spinner: {
        color: {
            cardAppPrimary:
                'fill-orange-500',
            secondary: 'bg-blue-500 hover:bg-blue-600',
        },
    },
    checkbox: {
        color: {
            cardAppPrimary:
                'w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring accent-yellow-400 focus:ring-brand-soft',
            secondary: 'bg-blue-500 hover:bg-blue-600',
        },
    },
    button: {
        color: {
            cardAppPrimary:
                'bg-orange-400 hover:bg-orange-300 text-slate-100 hover:cursor-pointer focus:ring-2 focus:ring-orange-200',
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
                    cardAppPrimary:
                        'border-gray-300 bg-gray-50 focus:border-orange-500 focus:border focus:ring-orange-500',
                    error: 'border-red-500 bg-red-50',
                },
            },
        },
    },
});