/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import MapPage from './pages/MapPage';
import SkillHub from './pages/SkillHub';
import AuthPage from './pages/Auth';
import ProfilePage from './pages/Profile';
import PortfolioPage from './pages/Portfolio';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/skills" element={<SkillHub />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            {/* Catch-all route redirects to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        {/* Simple Footer for attribution */}
        <footer className="py-6 border-t border-slate-200 bg-white text-center text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} LOMA - Local Opportunities Map App Ghana</p>
          <p className="mt-1">Connecting youth with meaningful opportunities.</p>
        </footer>
      </div>
    </Router>
  );
}
