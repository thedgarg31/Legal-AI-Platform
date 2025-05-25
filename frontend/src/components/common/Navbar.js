import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          ⚖️ Legal AI Platform
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            🏠 Home
          </Link>
          <Link to="/document-analysis" className="navbar-link">
            📄 Document Analysis
          </Link>
          <Link to="/chat" className="navbar-link">
            💬 Chat with PDF
          </Link>
          <Link to="/login" className="navbar-link">
            👤 Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

