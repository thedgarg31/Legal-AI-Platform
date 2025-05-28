import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PersistLogin from './components/PersistLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import FindLawyers from './pages/FindLawyers';
import Chat from './pages/ChatRoom';
import ChatHistory from './pages/ChatHistory';
import LawyerDashboard from './pages/LawyerDashboard';
import Profile from './pages/Profile';
import DocumentAnalysis from './pages/DocumentAnalysis';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import LawyerRegistration from './pages/LawyerRegistration';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Wrap everything in PersistLogin */}
              <Route element={<PersistLogin />}>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/lawyers" element={<FindLawyers />} />
                <Route path="/lawyer-registration" element={<LawyerRegistration />} />
                <Route path="/services" element={<Services />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:lawyerId" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat-history" 
                  element={
                    <ProtectedRoute>
                      <ChatHistory />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/document-analysis" 
                  element={
                    <ProtectedRoute>
                      <DocumentAnalysis />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/lawyer-dashboard/:lawyerId" 
                  element={
                    <ProtectedRoute requireLawyer={true}>
                      <LawyerDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
