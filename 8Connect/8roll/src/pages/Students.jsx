import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, User, BookOpen, Calendar, Users } from 'lucide-react';
import api from '../services/api';
import StudentForm from '../components/StudentForm';
import './Students.css'; // Import the CSS file

// StudentForm component with custom CSS
const EnhancedStudentForm = ({ initial, courses, onSubmit, onCancel }) => {
  return (
    <div className="sms-modal-body">
      <StudentForm
        initial={initial}
        courses={courses}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </div>
  );
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  // Load students
  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: search ? { q: search } : {} });
      console.log(res.data)
      setStudents(res.data || []);
    } catch (err) {
      alert('Error loading students: ' + (err.response?.data?.error || err.message));
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
      alert('Error loading courses: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    loadStudents();
    loadCourses(); // fetch courses at page load
  }, []);

  const handleCreate = async (payload) => {
    try {
      await api.post('/students', payload); // payload will now include course_id
      setShowForm(false);
      loadStudents();
    } catch (err) {
      alert('Create failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await api.put(`/students/${editing.student_id}`, payload);
      setEditing(null);
      setShowForm(false);
      loadStudents();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete student?')) return;
    try {
      await api.delete(`/students/${id}`);
      loadStudents();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadStudents();
    }
  };

  return (
    <div className="sms-app">
      <div className="sms-container">
        {/* Header */}
        <div className="sms-header">
          <div className="sms-header-title">
            <Users className="sms-header-icon" />
            <h1 className="sms-title">Students</h1>
          </div>
          <p className="sms-subtitle">Manage student information and enrollment</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="sms-controls">
          <div className="sms-search-group">
            <div className="sms-search-wrapper">
              <Search className="sms-search-icon" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="sms-search-input"
              />
            </div>
            <button
              onClick={loadStudents}
              className="sms-btn sms-btn-secondary"
            >
              Search
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="sms-btn sms-btn-primary sms-btn-with-icon"
          >
            <Plus className="sms-btn-icon" />
            Add Student
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="sms-modal">
            <div className="sms-modal-content">
              <div className="sms-modal-header">
                <h2 className="sms-modal-title">
                  {editing ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  className="sms-modal-close"
                >
                  ✕
                </button>
              </div>
              <div className="sms-modal-body">
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

        {/* Students Table */}
        <div className="sms-table-container">
          {loading ? (
            <div className="sms-loading">
              <div className="sms-spinner"></div>
              <span>Loading students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="sms-empty">
              <User className="sms-empty-icon" />
              <p className="sms-empty-title">No students found</p>
              <p className="sms-empty-text">Get started by adding your first student</p>
            </div>
          ) : (
            <div className="sms-table-wrapper">
              <table className="sms-table">
                <thead className="sms-table-header">
                  <tr>
                    <th className="sms-table-th">Student ID</th>
                    <th className="sms-table-th">Name</th>
                    <th className="sms-table-th">Details</th>
                    <th className="sms-table-th">Batch</th>
                    <th className="sms-table-th">Courses</th>
                    <th className="sms-table-th">Actions</th>
                  </tr>
                </thead>
                <tbody className="sms-table-body">
                  {students.map(student => (
                    <tr key={student.student_id} className="sms-table-row">
                      <td className="sms-table-td">
                        <div className="sms-student-id-wrapper">
                          <div className="sms-student-id">
                            {student.student_id?.slice(0, 15)}

                          </div>
                        </div>
                      </td>
                      <td className="sms-table-td">
                        <div className="sms-student-name">
                          {student.first_name} {student.middle_name} {student.last_name}
                        </div>
                      </td>
                      <td className="sms-table-td">
                        <div className="sms-student-age">Age: {student.age}</div>
                        <div className="sms-student-gender">{student.gender}</div>
                      </td>
                      <td className="sms-table-td">
                        <span className="sms-badge">
                          <Calendar className="sms-badge-icon" />
                          {student.batch_id}
                        </span>
                      </td>
                      <td className="sms-table-td">
                        <div className="sms-course-info">
                          <BookOpen className="sms-course-icon" />
                          {student.course_names || 'No courses assigned'}
                        </div>
                      </td>
                      <td className="sms-table-td">
                        <div className="sms-actions">
                          <button
                            onClick={() => { setEditing(student); setShowForm(true); }}
                            className="sms-btn-action sms-btn-edit"
                            title="Edit student"
                          >
                            <Edit2 className="sms-action-icon" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.student_id)}
                            className="sms-btn-action sms-btn-delete"
                            title="Delete student"
                          >
                            <Trash2 className="sms-action-icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {students.length > 0 && (
          <div className="sms-stats">
            Showing <span className="sms-stats-number">{students.length}</span> students
          </div>
        )}
      </div>
    </div>
  );
}