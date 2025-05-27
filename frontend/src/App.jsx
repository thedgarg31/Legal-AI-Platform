import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import LawyerRegistration from './pages/LawyerRegistration';
import FindLawyers from './pages/FindLawyers';
import ChatRoom from './pages/ChatRoom';
import LawyerDashboard from './pages/LawyerDashboard';
import DocumentAnalysisPage from './pages/DocumentAnalysis';
import ChatHistory from './pages/ChatHistory';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/lawyer-registration" element={<LawyerRegistration />} />
                <Route path="/lawyers" element={<FindLawyers />} />
                <Route 
                  path="/chat/:lawyerId" 
                  element={
                    <ProtectedRoute>
                      <ChatRoom />
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
                <Route path="/lawyer-dashboard/:lawyerId" element={<LawyerDashboard />} />
                <Route 
                  path="/document-analysis" 
                  element={
                    <ProtectedRoute>
                      <DocumentAnalysisPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
