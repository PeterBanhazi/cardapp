import React from 'react';
import {
    ChevronDown,
    ChevronUp,
    X,
    RefreshCw,
    MessageSquare,
    AlertTriangle,
    Signal,
} from 'lucide-react';
import { useDashboardStore } from '../store/store';

import { DashboardStatus } from '../store/store';
import { useNavigate } from 'react-router-dom';
interface DashboardContainerProps {
    id: string;
    title: string;
    isCollapsed: boolean;
    status?: DashboardStatus;
    onToggleCollapse: (id: string) => void;
    onRefresh: (id: string) => void;
    onClose: (id: string) => void;
    children: React.ReactNode;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
    id,
    title,
    isCollapsed,
    status,
    onToggleCollapse,
    onRefresh,
    onClose,
    children,
}) => {
    const handleHeaderClick = (e: React.MouseEvent) => {
        // Prevent toggling when clicking buttons
        if (!(e.target as HTMLElement).closest('button')) {
            onToggleCollapse(id);
        }
    };

    const { dashboards } = useDashboardStore();
    const navigate = useNavigate();
    return (
        <div className="w-full mb-4 h-full bg-stone-200/30 border border-slate-200/40 rounded-b-lg shadow-lg">
            <div
                className={`flex items-center h-8 justify-between px-4 py-2 bg-gray-200 cursor-pointer 
            hover:bg-gray-100 transition-colors ${
                isCollapsed ? 'rounded-b-lg' : ''
            }`}
                onClick={handleHeaderClick}
            >
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-700">
                        {title}
                    </h2>
                </div>
                <div className=" flex ">
                    {/* Status Indicators */}
                    <div className="flex items-center justify-end space-x-3 ml-4">
                        {status?.hasNewMessage && (
                            <MessageSquare
                                className="w-4 h-4 text-blue-500"
                                aria-label="New Message"
                            />
                        )}
                        {status?.hasWarning && (
                            <AlertTriangle
                                className="w-4 h-4 text-yellow-500"
                                aria-label="Warning"
                            />
                        )}
                        <Signal
                            className={`w-4 h-4 ${
                                status?.connectionStatus === 'connected'
                                    ? 'text-green-500'
                                    : status?.connectionStatus === 'pending'
                                      ? 'text-yellow-500'
                                      : 'text-red-500'
                            }`}
                            aria-label="Connection Status"
                        />
                    </div>
                    <div className="w-6"></div>
                    {/* Control buttons - now in their own div to prevent click propagation */}
                    <div
                        className="flex items-center space-x-2"
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            onClick={() => onRefresh(id)}
                            className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                            aria-label="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                if (dashboards.length === 1) {
                                    navigate('/');
                                }
                                if (
                                    dashboards.length > 1 &&
                                    id === dashboards[0].id
                                ) {
                                    navigate(dashboards[1].path);
                                }

                                onClose(id);
                            }}
                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isCollapsed ? 'max-h-0' : 'max-h-screen'
                }`}
            >
                <div className="p-3">{children}</div>
            </div>
        </div>
    );
};
