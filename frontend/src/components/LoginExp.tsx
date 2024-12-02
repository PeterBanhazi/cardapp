import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { login, register, setUser, logout } from '../utils/auth';
import Home from '../views/home';
import MainWrapper from '../layouts/MainWrapper';

import PrivateRoute from '../layouts/PrivateRoute';
import Logout from '../views/logout';
import Private from '../views/private';
import Register from '../views/register';

const LoginExp = () => {
    return (
        <div>
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
                        <Route path="/" element={<Home />} />
                    </Routes>
                </MainWrapper>
            </BrowserRouter>
        </div>
    );
};

export default LoginExp;
