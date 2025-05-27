import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    return isAuthenticated ? children : <Login />;
};

export default PrivateRoute;
