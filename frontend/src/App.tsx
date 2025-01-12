import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import Home from './views/home';
import MainWrapper from './layouts/MainWrapper';
import Login from './views/login';
import PrivateRoute from './layouts/PrivateRoute';
import Logout from './views/logout';
import Private from './views/private';
import Register from './views/register';

import AppTopMenu from './components/AppTopMenu';
import playerTopList from './assets/tennis-players-data.json';
import TennisPlayerCards from './components/TennisPlayerCards';
import PlayerOneCard from './components/PlayerOneCard';
import TennisPlayersList from './components/TennisPlayersList';
import TennisPlayerCreator from './components/TennisPlayerCreator';
import WebSocketChat from './components/wstest';
import ChatComponent from './components/ChatComponent';
import { Button } from 'flowbite-react';
import { useState } from 'react';
import Properties from './views/properties';
import TopList from './components/Toplist';
import Navbar from './components/Navbar';
import TestOne from './components/TestOne';
import TestTwo from './components/TestTwo';
import DashboardManager from './layouts/DashboardManager';
import Lobby from './components/Lobby';
import { ListPlayerCards } from './components/ListPlayerCards';

const App: React.FC = () => {
    return (
        <>
            <div
                className="bg-no-repeat bg-cover min-h-screen"
                style={{
                    backgroundImage: `url(./src/assets/bg/todor-dimov-XCTigZX4v9U-unsplash.jpg`,
                }}
            >
                <BrowserRouter>
                    <MainWrapper>
                        <Navbar />
                        {/* <TestOne /> */}

                        <DashboardManager>
                            <Routes>
                                <Route
                                    path="/userproperties"
                                    element={<Properties />}
                                />
                                <Route path="/private" element={<Private />} />
                                <Route path="/lobby" element={<Lobby />} />
                                <Route path="/testone" element={<TestOne />} />
                                <Route path="/testtwo" element={<TestTwo />} />
                                <Route
                                    path="/TennisPlayersList"
                                    element={<TennisPlayersList />}
                                />
                            </Routes>
                        </DashboardManager>
                        <Routes>
                            {/* <Route
                                path="/userproperties"
                                element={
                                    <PrivateRoute>
                                        <Properties />
                                    </PrivateRoute>
                                }
                            /> */}
                            {/* <Route
                                path="/private"
                                element={
                                    <PrivateRoute>
                                        <Private />
                                    </PrivateRoute>
                                }
                            /> */}

                            <Route
                                path="/"
                                element={<Home isVisible={true} />}
                            />
                            <Route path="/lobby" />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/logout"
                                element={<Logout isVisible={false} />}
                            />
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </MainWrapper>
                </BrowserRouter>
            </div>
        </>
    );
};

export default App;
