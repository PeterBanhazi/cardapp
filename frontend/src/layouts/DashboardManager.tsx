import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { DashboardContainer } from './DashboardContainer';
import { useDashboardStore } from '../store/store';
import { useBackendStatus } from '../store/useBackendStatus';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package
import Lobby from '../components/Lobby';
import TestOne from '../components/TestOne';
import TestTwo from '../components/TestTwo';
import TennisPlayersList from '../components/TennisPlayersList';
import Properties from '../views/properties';
import Private from '../views/private';
import Landing from '../components/Landing';
import TopList from '../components/TopList';
import TennisPlayerCreator from '../components/TennisPlayerCreator';
import GameWrapper from '../components/game/GameWrapper';
import ChatLobby from './ChatLobby';

interface DashboardManagerProps {
    children: React.ReactNode;
}

export const DashboardManager: React.FC<DashboardManagerProps> = ({
    children,
}) => {
    const location = useLocation();
    const {
        dashboards,
        removeDashboard,
        toggleCollapse,
        refreshDashboard,
        initializeDashboard,
    } = useDashboardStore();

    useEffect(() => {
        initializeDashboard();
    }, [initializeDashboard]);

    return (
        <div className="container mx-auto p-4 space-y-4">
            {dashboards.map((dashboard) => (
                <DashboardContainer
                    key={`${dashboard.id}-${dashboard.key}`}
                    id={dashboard.id}
                    title={dashboard.title}
                    status={dashboard.status}
                    isCollapsed={dashboard.isCollapsed}
                    onToggleCollapse={toggleCollapse}
                    onRefresh={refreshDashboard}
                    onClose={removeDashboard}
                >
                    {/* {dashboard.path === '/' && <Landing />} */}
                    {dashboard.path === '/' && <GameWrapper />}

                    {dashboard.path === '/ranks' && <TopList />}
                    {dashboard.path === '/lobby' && <ChatLobby />}
                    {dashboard.path === '/testone' && <TestOne />}
                    {dashboard.path === '/testtwo' && <TestTwo />}
                    {dashboard.path === '/players' && <TennisPlayersList />}
                    {dashboard.path === '/userproperties' && <Properties />}
                    {dashboard.path === '/private' && <Private />}

                    {/* {children} */}
                    {dashboard.path === '/add-player' && (
                        <TennisPlayerCreator
                            onClose={() => {
                                console.log('created well');
                            }}
                        />
                    )}
                    {/* {children} */}
                </DashboardContainer>
            ))}
        </div>
    );
};

export default DashboardManager;
