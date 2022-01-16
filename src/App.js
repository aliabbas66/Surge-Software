// import logo from './logo.svg';
// import './App.css';
import React, { useState }  from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from "react-router-dom";

import Dashboard from './screens/admin panel/DashboardScreen';
import LoginScreen from './screens/admin panel/LoginScreen';
import Frontend from "./screens/frontened/FrontendScreen";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="frontend" element={<Frontend />} />
        </Routes>
    );
}

export default App;
