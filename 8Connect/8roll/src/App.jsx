// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
// Import the dashboard layout
import Students from './pages/Students';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import Payments from './pages/Payments';

// Create a wrapper component that uses useLocation
const DashboardWithRouting = () => {
  const location = useLocation();

  return (
    <Dashboard currentPath={location.pathname}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/payments" element={<Payments />} />
      </Routes>
    </Dashboard>
  );
};

export default function App() {
  return (
    <Router>
      <DashboardWithRouting />
    </Router>
  );
}