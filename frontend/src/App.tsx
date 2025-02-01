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
                                <Route
                                    path="/userproperties"
                                    element={<Properties />}
                                />
                                <Route path="/private" element={<Private />} />
                                <Route path="/rules" element={<Rules />} />
                            </Routes>
                        </DashboardManager>
                        <BottomFooter />
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
                            <Route path="/userproperties" />
                            <Route path="/private" element={<Private />} />
                            <Route path="/lobby" />
                            <Route path="/ranks" />
                            <Route path="/rules" />
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
            </MainDesignWrapper>
        </>
    );
};

export default App;
