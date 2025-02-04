import { Routes, Route } from 'react-router-dom';
import GameWrapper from '../components/game/GameWrapper';
import Rules from '../components/Rules';
import TopList from '../components/TopList';

import ChatLobby from './ChatLobby';
import DashboardManager from './DashboardManager';
import React from 'react';
import Options from '../views/Options';

const DashboardMainLayout = () => {
    return (
        <div>
            <DashboardManager>
                <Routes>
                    <Route path="/" element={<GameWrapper />} />
                    <Route path="/lobby" element={<ChatLobby />} />
                    <Route path="/ranks" element={<TopList />} />
                    <Route path="/options" element={<Options />} />

                    <Route path="/rules" element={<Rules />} />
                </Routes>
            </DashboardManager>
        </div>
    );
};

export default DashboardMainLayout;
