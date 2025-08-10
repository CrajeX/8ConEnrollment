import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, User, BookOpen, Calendar, Users, Pencil } from 'lucide-react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import './StudentsPage.css'; // Updated import to match CSS file name

// Toast component for notifications
const Toast = ({ message, type, onClose }) => (
  <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`}>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close">✕</button>
  </div>
);

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [sortField, setSortField] = useState('student_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: search ? { q: search } : {} });
      console.log(res.data);
      setStudents(res.data || []);
    } catch (err) {
      showToast('Error loading students: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load courses
  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data || []);
    } catch (err) {
      showToast('Error loading courses: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const handleCreate = async (payload) => {
    try {
      await api.post('/students', payload);
      setShowForm(false);
      loadStudents();
      showToast('Student created successfully!');
    } catch (err) {
      showToast('Create failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await api.put(`/students/${editing.student_id}`, payload);
      setEditing(null);
      setShowForm(false);
      loadStudents();
      showToast('Student updated successfully!');
    } catch (err) {
      showToast('Update failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents();
      showToast('Student deleted successfully!');
    } catch (err) {
      showToast('Delete failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadStudents();
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(new Set(students.map(s => s.student_id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    const comparison = aValue.toString().localeCompare(bValue.toString());
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="students-page">
      {/* Toast notifications */}
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-title-wrapper">
            <Users className="page-icon" />
            <div>
              <h1 className="page-title">Students</h1>
              <p className="page-description">Manage student information and enrollment</p>
            </div>
          </div>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{students.length}</span>
              <span className="stat-label">Total Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{selectedStudents.size}</span>
              <span className="stat-label">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Page Controls */}
      <div className="page-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
          </div>
          <button
            onClick={loadStudents}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : 'Search'}
          </button>
        </div>
        <div className="action-buttons">
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="btn btn-primary btn-with-icon"
          >
            <Plus className="btn-icon" />
            Add Student
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">
                {editing ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="modal-close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <StudentForm
                initial={editing || {}}
                courses={courses}
                onSubmit={editing ? handleUpdate : handleCreate}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="page-content-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <User className="empty-icon" />
            <p className="empty-title">No students found</p>
            <p className="empty-description">Get started by adding your first student</p>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              className="btn btn-primary btn-with-icon"
            >
              <Plus className="btn-icon" />
              Add Student
            </button>
          </div>
        ) : (
          <div className="table-section">
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedStudents.size === students.length && students.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>
                      <button 
                        className="sort-header" 
                        onClick={() => handleSort('student_id')}
                      >
                        Student ID
                        {sortField === 'student_id' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th>
                      <button 
                        className="sort-header" 
                        onClick={() => handleSort('first_name')}
                      >
                        Name
                        {sortField === 'first_name' && (
                          <span className="sort-indicator">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th>Details</th>
                    <th>Batch</th>
                    <th>Courses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map(student => (
                    <tr 
                      key={student.student_id} 
                      className={`table-row ${selectedStudents.has(student.student_id) ? 'selected' : ''}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="table-checkbox"
                          checked={selectedStudents.has(student.student_id)}
                          onChange={() => handleSelectStudent(student.student_id)}
                        />
                      </td>
                      <td>
                        <div className="student-id">
                          {student.student_id?.slice(0, 15)}
                        </div>
                      </td>
                      <td>
                        <div className="student-name">
                          {student.first_name} {student.middle_name} {student.last_name}
                        </div>
                      </td>
                      <td>
                        <div className="student-details">
                          <div className="detail-item">Age: {student.age}</div>
                          <div className="detail-item gender">{student.gender}</div>
                        </div>
                      </td>
                      <td>
                        <span className="batch-badge">
                          <Calendar className="badge-icon" />
                          {student.batch_id}
                        </span>
                      </td>
                      <td>
                        <div className="course-info">
                          <BookOpen className="course-icon" />
                          <span className="course-text">
                            {student.course_names || 'No courses assigned'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            onClick={() => { setEditing(student); setShowForm(true); }}
                            className="action-btn edit-btn"
                            title="Edit student"
                          >
                            <Edit2 className="action-icon" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.student_id)}
                            className="action-btn delete-btn"
                            title="Delete student"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="table-footer">
              <div className="results-count">
                Showing <strong>{students.length}</strong> students
                {selectedStudents.size > 0 && (
                  <span className="selection-count"> • {selectedStudents.size} selected</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}