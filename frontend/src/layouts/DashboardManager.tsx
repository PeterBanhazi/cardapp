import React from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardContainer } from './DashboardContainer';
import { useDashboardStore } from '../store/store';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package
import Lobby from '../components/Lobby';
import TestOne from '../components/TestOne';
import TestTwo from '../components/TestTwo';
import TennisPlayersList from '../components/TennisPlayersList';
import Properties from '../views/properties';
import Private from '../views/private';

interface DashboardManagerProps {
    children: React.ReactNode;
}

export const DashboardManager: React.FC<DashboardManagerProps> = ({
    children,
}) => {
    const location = useLocation();
    const { dashboards, addDashboard, removeDashboard, toggleCollapse } =
        useDashboardStore();

    const handleNewRoute = (path: string, title: string) => {
        addDashboard({
            id: uuidv4(),
            path,
            title,
        });
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            {dashboards.map((dashboard) => (
                <DashboardContainer
                    key={dashboard.id}
                    id={dashboard.id}
                    title={dashboard.title}
                    isCollapsed={dashboard.isCollapsed}
                    onToggleCollapse={toggleCollapse}
                    onClose={removeDashboard}
                >
                    {dashboard.path === '/lobby' && <Lobby />}
                    {dashboard.path === '/testone' && <TestOne />}
                    {dashboard.path === '/testtwo' && <TestTwo />}
                    {dashboard.path === '/TennisPlayersList' && (
                        <TennisPlayersList />
                    )}
                    {dashboard.path === '/userproperties' && <Properties />}
                    {dashboard.path === '/private' && <Private />}
                    {/* {children} */}
                </DashboardContainer>
            ))}
        </div>
    );
};

export default DashboardManager;
