import Layout from "./Layout.jsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect } from "react";

import Home from "./Home";
import CarDetails from "./CarDetails";
import Services from "./Services";
import AddBusiness from "./AddBusiness";
import BusinessDetails from "./BusinessDetails";
import Documentation from "./Documentation";
import Profile from "./Profile";
import Admin from "./Admin";
import AddCar from "./AddCar";
import Compare from "./Compare";
import Favorites from "./Favorites";
import LikeGate from "./LikeGate";
import Statistics from "./Statistics";
import Login from "./Login";
import ResetPassword from "./ResetPassword";
import Chat from "./Chat";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    CarDetails: CarDetails,
    
    Services: Services,
    
    AddBusiness: AddBusiness,
    
    BusinessDetails: BusinessDetails,
    
    Documentation: Documentation,
    
    Profile: Profile,
    
    Admin: Admin,
    
    AddCar: AddCar,
    
    Compare: Compare,
    
    Favorites: Favorites,
    
    Statistics: Statistics,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Хуудас өөрчлөгдөхөд дээд хэсэгт scroll хийх
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname, location.search]);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/CarDetails" element={<CarDetails />} />
                <Route path="/Services" element={<Services />} />
                <Route path="/BusinessDetails" element={<BusinessDetails />} />
                <Route path="/Documentation" element={<Documentation />} />
                <Route path="/LikeGate" element={<LikeGate />} />
                <Route path="/Statistics" element={
                    <ProtectedRoute requireAdmin={true}>
                        <Statistics />
                    </ProtectedRoute>
                } />
                <Route path="/Compare" element={<Compare />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/__/auth/action" element={<ResetPassword />} />
                
                {/* Protected routes (require login) */}
                <Route path="/Profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/AddCar" element={
                    <ProtectedRoute>
                        <AddCar />
                    </ProtectedRoute>
                } />
                <Route path="/AddBusiness" element={
                    <ProtectedRoute>
                        <AddBusiness />
                    </ProtectedRoute>
                } />
                <Route path="/Favorites" element={
                    <ProtectedRoute>
                        <Favorites />
                    </ProtectedRoute>
                } />
                
                {/* Admin only routes */}
                <Route path="/Admin" element={
                    <ProtectedRoute requireAdmin={true}>
                        <Admin />
                    </ProtectedRoute>
                } />
                
                {/* Chat route */}
                <Route path="/Chat" element={
                    <ProtectedRoute requireAdmin={true}>
                        <Chat />
                    </ProtectedRoute>
                } />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}