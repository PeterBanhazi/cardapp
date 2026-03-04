import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainAuthWrapper from './providers/MainAuthProvider';

import Navbar from '../pages/Navbar';

import BottomFooter from '../pages/BottomFooter';
import MainDesignWrapper from './providers/MainDesignWrapper';

import { Notifications } from '../shared/components/ui/notifications';
import Landing from '../pages/Landing';

import Logout from '../features/auth/logout';
import TopList from '../features/ranks/Ranks';
import PrivateRoute from './routes/PrivateRoute';
import Options from '../features/options/Options';
import ChatLobby from '../pages/ChatLobby';
import DashboardManager from '../features/dashboard/DashboardManager';
import GameWrapper from '../pages/GameWrapper';
import Rules from '../pages/Rules';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ChatProvider } from './providers/ChatProvider';

const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <MainDesignWrapper>
                        <Notifications />

                        <MainAuthWrapper>
                            <WebSocketProvider>
                                <ChatProvider>
                                    <Navbar />
                                    <Routes>
                                        <Route path="/" element={<Landing />} />
                                        <Route
                                            path="/options"
                                            element={
                                                <PrivateRoute>
                                                    <DashboardManager>
                                                        <Options />
                                                    </DashboardManager>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/lobby"
                                            element={
                                                <PrivateRoute>
                                                    <DashboardManager>
                                                        <ChatLobby />
                                                    </DashboardManager>
                                                </PrivateRoute>
                                            }
                                        />{' '}
                                        <Route
                                            path="/lobby"
                                            element={
                                                <PrivateRoute>
                                                    <DashboardManager>
                                                        <ChatLobby />
                                                    </DashboardManager>
                                                </PrivateRoute>
                                            }
                                        />
                                        <Route
                                            path="/matches"
                                            element={
                                                <DashboardManager>
                                                    <GameWrapper />
                                                </DashboardManager>
                                            }
                                        />
                                        <Route
                                            path="/ranks"
                                            element={
                                                <DashboardManager>
                                                    <TopList />
                                                </DashboardManager>
                                            }
                                        />
                                        <Route
                                            path="/rules"
                                            element={
                                                <DashboardManager>
                                                    <Rules />
                                                </DashboardManager>
                                            }
                                        />
                                        <Route path="*" element={<Landing />} />
                                        {/* <Route path="/login" element={<Login />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                /> */}
                                        <Route
                                            path="/logout"
                                            element={
                                                <Logout isVisible={false} />
                                            }
                                        />
                                    </Routes>
                                </ChatProvider>
                            </WebSocketProvider>
                        </MainAuthWrapper>
                        <BottomFooter />
                    </MainDesignWrapper>
                </BrowserRouter>
            </QueryClientProvider>
        </>
    );
};

export default App;
