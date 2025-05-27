import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import LawyerRegistration from './pages/LawyerRegistration';
import FindLawyers from './pages/FindLawyers';
import ChatRoom from './pages/ChatRoom';
import LawyerDashboard from './pages/LawyerDashboard';
import DocumentAnalysisPage from './pages/DocumentAnalysis'; // NEW IMPORT
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/lawyer-registration" element={<LawyerRegistration />} />
              <Route path="/lawyers" element={<FindLawyers />} />
              <Route path="/chat/:lawyerId" element={<ChatRoom />} />
              <Route path="/lawyer-dashboard/:lawyerId" element={<LawyerDashboard />} />
              <Route path="/document-analysis" element={<DocumentAnalysisPage />} /> {/* NEW ROUTE */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
