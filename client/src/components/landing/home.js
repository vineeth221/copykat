import React, { useState, useEffect } from 'react';
import Navbar from '../navbar/Navbar';
import { AuthProvider } from '../../redux/AuthContext'; // Make sure AuthContext is imported properl
// import Header from './Header';
import Landing from './landing';
import Carousal from './carousal';
import RecentViews from './RecentViews';
import Footer from './footer';
import Brands from './brands';
import { useLocation } from 'react-router-dom';
import RecentViewsGrid from './ReviewGrid';

const Home = () => {
  const location = useLocation();

  return (
    <div>
    
        <>
        <AuthProvider> {/* Wrap your entire app with AuthProvider */}
          <div>
            <Navbar />
            {/* <Header/> */}
            <Landing/>
            <Carousal/>
            <RecentViews/>
            <RecentViewsGrid/>
            <Brands/>
            <Footer/>
          </div>
    </AuthProvider>
        </>
    </div>
  );
};

export default Home;
