import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Users from './pages/Users';


function App() {

  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users" element={<Users />} />
      </Routes>
  );
}

export default App;
