import React from 'react';

import { useLocation } from 'react-router-dom';
import GameWrapper from '../../components/game/GameWrapper';
import ChatLobby from '../../pages/ChatLobby';
import Rules from '../../pages/Rules';
import { useDashboardStore } from '../../store/store';
import Options from '../options/Options';
import TopList from '../ranks/TopList';
import { DashboardContainer } from './DashboardContainer';

// import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

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

    // useEffect(() => {
    //     // ### remove this for proper browser address handling
    //     initializeDashboard();
    // }, [initializeDashboard]);

    return (
        <div className="container mx-auto p-4 pt-0">
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

                    {dashboard.path === '/options' && <Options />}

                    {dashboard.path === '/rules' && <Rules />}

                    {/* {dashboard.path === '/add-player' && (
                        <TennisPlayerCreator
                            onClose={() => {
                                console.log('created well');
                            }}
                        />
                    )} */}
                    {/* {children} */}
                </DashboardContainer>
            ))}
        </div>
    );
};

export default DashboardManager;
