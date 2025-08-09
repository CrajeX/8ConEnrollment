// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Batches from './pages/Batches';
import Payments from './pages/Payments';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <nav style={{ width: 220, padding: 16, borderRight: '1px solid #eee' }}>
          <h3>8Connect</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/">Students</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/batches">Batches</Link></li>
            <li><Link to="/payments">Payments</Link></li>
          </ul>
        </nav>
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
