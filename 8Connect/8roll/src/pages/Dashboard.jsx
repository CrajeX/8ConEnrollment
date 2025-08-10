import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
// This is your dashboard layout component that will wrap your existing routing
const Dashboard8Connect = ({ children, currentPath = '/' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', icon: '🏠', path: '/' },
    { name: 'Students', icon: '👨‍🎓', path: '/students' },
    { name: 'Courses', icon: '📚', path: '/courses' },
    { name: 'Batches', icon: '👥', path: '/batches' },
    { name: 'Payments', icon: '💳', path: '/payments' },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const getPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.name : '8Connect';
  };

  return (
    <div className="dashboard">
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">8Connect</h1>
          <button
            className="close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="nav-menu">
        {navigationItems.map((item) => (
            <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={handleNavClick}
            >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
            </Link>
            ))}
        </nav>

        <div className="user-profile">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <h4>Admin</h4>
            <p>8Connect</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Navigation */}
        <div className="top-nav">
          <div className="top-nav-content">
            <div className="top-nav-left">
              <button
                className="burger-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <h2 className="top-nav-title">{getPageTitle()}</h2>
            </div>

            <div className="top-nav-right">
              <button className="notification-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="m13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="notification-dot"></span>
              </button>
              <div className="user-avatar">AD</div>
            </div>
          </div>
        </div>

        {/* Page Content Container */}
        <main className="page-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Example usage component - shows how to integrate with your existing routing
const ExampleApp = () => {
  // Sample page components
  const DashboardPage = () => (
    <div className="page-container">
      <h2>Dashboard</h2>
      <p>Welcome to the 8Connect Dashboard</p>
      <div className="stats-grid">
        <div className="stat-card">
          <h4 className="stat-title">Total Students</h4>
          <div className="stat-content">
            <p className="stat-value">2,543</p>
            <span className="stat-change positive">+12%</span>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="stat-title">Active Courses</h4>
          <div className="stat-content">
            <p className="stat-value">45</p>
            <span className="stat-change positive">+8%</span>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="stat-title">Batches</h4>
          <div className="stat-content">
            <p className="stat-value">123</p>
            <span className="stat-change negative">-3%</span>
          </div>
        </div>
        <div className="stat-card">
          <h4 className="stat-title">Revenue</h4>
          <div className="stat-content">
            <p className="stat-value">₹45,231</p>
            <span className="stat-change positive">+5%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Students = () => (
    <div className="page-container">
      <h2>Students Management</h2>
      <p>Manage all student records and information here.</p>
      <div className="placeholder-content">
        Students page content goes here
      </div>
    </div>
  );

  return (
    <Dashboard8Connect currentPath="/">
      <DashboardPage />
    </Dashboard8Connect>
  );
};

export default Dashboard8Connect;