import React from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface DashboardContainerProps {
    id: string;
    title: string;
    isCollapsed: boolean;
    onToggleCollapse: (id: string) => void;
    onClose: (id: string) => void;
    children: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
    id,
    title,
    isCollapsed,
    onToggleCollapse,
    onClose,
    children,
}) => {
    return (
        <div className="w-full mb-4 bg-white rounded-b-lg shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
                <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onToggleCollapse(id)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        {isCollapsed ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronUp className="w-5 h-5" />
                        )}
                    </button>
                    <button
                        onClick={() => onClose(id)}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isCollapsed ? 'max-h-0' : 'max-h-fit'
                }`}
            >
                <div className="p-1">{children}</div>
            </div>
        </div>
    );
};
