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

function App() {
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
                    <TennisPlayerCreator
                        onClose={() => console.log('created welll')}
                    />
                </div>
            </>
        </>
    );
}

export default App;
