import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainWrapper from './layouts/MainWrapper';
import Login from './views/login';
import PrivateRoute from './layouts/PrivateRoute';
import Logout from './views/logout';
import Private from './views/private';
import Register from './views/register';

import WebSocketChat from './components/wstest';
import ChatComponent from './components/ChatComponent';

import Navbar from './components/Navbar';

import BottomFooter from './components/BottomFooter';
import MainDesignWrapper from './layouts/MainDesignWrapper';

import DashboardMainLayout from './layouts/DashboardMainLayout';
import { Notifications } from './components/ui/notifications';

const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <MainDesignWrapper>
                        <Notifications />
                        <Navbar />
                        <MainWrapper>
                            <Routes>
                                <Route
                                    path="*"
                                    element={<DashboardMainLayout />}
                                />
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
                            </Routes>
                        </MainWrapper>
                        <BottomFooter />
                    </MainDesignWrapper>
                </BrowserRouter>
            </QueryClientProvider>
        </>
    );
};

export default App;
