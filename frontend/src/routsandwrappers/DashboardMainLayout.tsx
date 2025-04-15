import { Routes, Route } from 'react-router-dom';
import GameWrapper from '../pages/GameWrapper';
import Rules from '../pages/Rules';
import TopList from '../features/ranks/TopList';
import Landing from '../pages/Landing';
import ChatLobby from '../pages/ChatLobby';

import Options from '../features/options/Options';
import DashboardManager from '../features/dashboard/DashboardManager';
import PrivateRoute from './PrivateRoute';
import MainWrapper from './MainAuthWrapper';
const DashboardMainLayout = () => {
    return (
        <div>
            <MainWrapper>
                <DashboardManager>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/lobby" element={<ChatLobby />} />
                        <Route path="/matches" element={<GameWrapper />} />
                        <Route path="/ranks" element={<TopList />} />
                        <Route path="/options" element={<Options />} />
                        <Route path="/rules" element={<Rules />} />
                    </Routes>
                </DashboardManager>
            </MainWrapper>
        </div>
    );
};

export default DashboardMainLayout;
