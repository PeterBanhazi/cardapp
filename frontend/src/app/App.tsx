import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '../shared/components/ui/notifications';

import MainAuthWrapper from './providers/MainAuthProvider';
import MainDesignWrapper from './providers/MainDesignWrapper';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ChatProvider } from './providers/ChatProvider';

import PrivateRoute from './routes/PrivateRoute';

import Navbar from '../pages/Navbar';
import Footer from '../pages/Footer';
import Landing from '../pages/Landing';
import TopList from '../features/ranks/Ranks';

import Options from '../features/options/Options';
import ChatLobby from '../pages/ChatLobby';
import DashboardManager from '../features/dashboard/DashboardManager';
import GameWrapper from '../pages/GameWrapper';
import Rules from '../pages/Rules';

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
                                    <main className="flex-1 min-h-[50vh]">
                                        <Routes>
                                            <Route
                                                path="/"
                                                element={<Landing />}
                                            />
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
                                            <Route
                                                path="*"
                                                element={<Landing />}
                                            />
                                        </Routes>
                                    </main>
                                </ChatProvider>
                            </WebSocketProvider>
                        </MainAuthWrapper>
                        <Footer />
                    </MainDesignWrapper>
                </BrowserRouter>
            </QueryClientProvider>
        </>
    );
};

export default App;
