import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import DocumentAnalysis from './pages/DocumentAnalysis';
import ChatWithPDF from './ChatWithPDF';
import LawyerHub from './pages/LawyerHub';
import LawyerProfile from './pages/LawyerProfile';
import LawyerRegistration from './pages/LawyerRegistration';
import ChatRoom from './pages/ChatRoom';
import LawyerDashboard from './pages/LawyerDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Existing Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/document-analysis" element={<DocumentAnalysis />} />
            <Route path="/chat" element={<ChatWithPDF />} />
            
            {/* New Lawyer Hub Routes */}
            <Route path="/lawyers" element={<LawyerHub />} />
            <Route path="/lawyers/:id" element={<LawyerProfile />} />
            <Route path="/lawyer/register" element={<LawyerRegistration />} />
            <Route path="/chat/:lawyerId" element={<ChatRoom />} />
            <Route path="/lawyer-dashboard/:lawyerId" element={<LawyerDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
