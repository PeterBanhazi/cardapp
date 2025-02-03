import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import Home from './views/home';
import MainWrapper from './layouts/MainWrapper';
import Login from './views/login';
import PrivateRoute from './layouts/PrivateRoute';
import Logout from './views/logout';
import Private from './views/private';
import Register from './views/register';

import WebSocketChat from './components/wstest';
import ChatComponent from './components/ChatComponent';
import Properties from './views/properties';
import Navbar from './components/Navbar';
import DashboardManager from './layouts/DashboardManager';
import Rules from './components/Rules';
import BottomFooter from './components/BottomFooter';
import MainDesignWrapper from './layouts/MainDesignWrapper';
import ChatLobby from './layouts/ChatLobby';
import TopList from './components/TopList';
import GameWrapper from './components/game/GameWrapper';

const App: React.FC = () => {
    return (
        <>
            <MainDesignWrapper>
                <BrowserRouter>
                    <MainWrapper>
                        <Navbar />
                        {/* <TestOne /> */}
                        {/* <JustAContainer /> */}

                        <DashboardManager>
                            <Routes>
                                <Route path="/" element={<GameWrapper />} />
                                <Route path="/lobby" element={<ChatLobby />} />
                                <Route path="/ranks" element={<TopList />} />
                                <Route
                                    path="/userproperties"
                                    element={<Properties />}
                                />

                                <Route path="/rules" element={<Rules />} />
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />
                                <Route
                                    path="/logout"
                                    element={<Logout isVisible={false} />}
                                />
                                <Route path="/private" element={<Private />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </DashboardManager>
                        <BottomFooter />
                    </MainWrapper>
                </BrowserRouter>
            </MainDesignWrapper>
        </>
    );
};

export default App;
