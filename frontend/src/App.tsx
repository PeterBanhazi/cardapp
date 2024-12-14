// import './App.css';
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

function App() {
    const [isComponentVisible, setIsComponentVisible] = useState(false);
    const handleClick = () => {
        setIsComponentVisible(true);
    };

    return (
        <>
            <BrowserRouter>
                <MainWrapper>
                    <AppTopMenu />
                    <Routes>
                        <Route
                            path="/private"
                            element={
                                <PrivateRoute>
                                    <Private />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/" element={<Home isVisible={false} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/logout"
                            element={<Logout isVisible={false} />}
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                        {/* <Route
                            path="*"
                            element={<p>There's nothing here: 404!</p>}
                        /> */}
                        {/* <Route path="*" element={<NoMatch />} /> */}
                    </Routes>
                </MainWrapper>
            </BrowserRouter>
            <>
                <div
                    className="bg-no-repeat bg-cover min-h-screen"
                    style={{
                        backgroundImage: `url(./src/stacked-peaks-haikei.svg`,
                    }}
                >
                    <div>
                        <TennisPlayersList />{' '}
                    </div>
                    <div className="flex justify-center">
                        <TennisPlayerCards players={playerTopList.players} />
                    </div>
                    <PlayerOneCard players={playerTopList.players} />
                    <Button onClick={handleClick}>Create</Button>
                    {isComponentVisible && (
                        <TennisPlayerCreator
                            onClose={() => {
                                console.log('created well');
                                setIsComponentVisible(false);
                            }}
                        />
                    )}
                    {/* <WebSocketChat /> */}
                    {/* <ChatComponent username="User123" channelId="channel1" /> */}
                </div>
            </>
        </>
    );
}

export default App;
