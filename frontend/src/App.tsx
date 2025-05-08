import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainWrapper from './routsandwrappers/MainAuthWrapper';

import Register from './features/app/register';

import WebSocketChat from './temp/wstest';
import ChatComponent from './components/ChatComponent';

import Navbar from './pages/Navbar';

import BottomFooter from './pages/BottomFooter';
import MainDesignWrapper from './routsandwrappers/MainDesignWrapper';

import DashboardMainLayout from './routsandwrappers/DashboardMainLayout';
import { Notifications } from './components/ui/notifications';
import Landing from './pages/Landing';
import Login from './features/app/login';
import Logout from './features/app/logout';
import TopList from './features/ranks/Ranks';
import PrivateRoute from './routsandwrappers/PrivateRoute';

const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <MainDesignWrapper>
                        <Notifications />

                        <MainWrapper>
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Landing />} />
                                <Route
                                    path="*"
                                    element={<DashboardMainLayout />}
                                />
                                {/* <Route path="/login" element={<Login />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                /> */}
                                <Route
                                    path="/logout"
                                    element={<Logout isVisible={false} />}
                                />
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
