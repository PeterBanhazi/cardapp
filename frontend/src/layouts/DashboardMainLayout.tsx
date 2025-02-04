import { Routes, Route } from 'react-router-dom';
import GameWrapper from '../components/game/GameWrapper';
import Rules from '../components/Rules';
import TopList from '../components/TopList';
import Login from '../views/login';
import Logout from '../views/logout';
import Private from '../views/private';
import Properties from '../views/properties';
import Register from '../views/register';
import ChatLobby from './ChatLobby';
import DashboardManager from './DashboardManager';
import React from 'react';

const DashboardMainLayout = () => {
    return (
        <div>
            <DashboardManager>
                <Routes>
                    <Route path="/" element={<GameWrapper />} />
                    <Route path="/lobby" element={<ChatLobby />} />
                    <Route path="/ranks" element={<TopList />} />
                    <Route path="/userproperties" element={<Properties />} />

                    <Route path="/rules" element={<Rules />} />
                </Routes>
            </DashboardManager>
        </div>
    );
};

export default DashboardMainLayout;
