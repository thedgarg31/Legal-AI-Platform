import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import DocumentAnalysis from './pages/DocumentAnalysis';
import ChatWithPDF from './ChatWithPDF';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/document-analysis" element={<DocumentAnalysis />} />
            <Route path="/chat" element={<ChatWithPDF />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
