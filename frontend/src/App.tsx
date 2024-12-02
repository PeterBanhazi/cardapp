// import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
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

import LoginExp from './components/LoginExp';

function App() {
    return (
        <>
            <BrowserRouter>
                <MainWrapper>
                    <Routes>
                        <Route
                            path="/private"
                            element={
                                <PrivateRoute>
                                    <Private />
                                </PrivateRoute>
                            }
                        />
                        {/* <Route path="/" element={<Home />} /> */}
                        <Route path="/" element={<AppTopMenu />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/logout" element={<Logout />} />
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
                    <div className="flex justify-center">
                        <TennisPlayerCards players={playerTopList.players} />
                    </div>
                    <PlayerOneCard players={playerTopList.players} />
                </div>
            </>
        </>
    );
}

export default App;
