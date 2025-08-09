// src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CourseForm from '../components/CourseForm';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      alert('Error loading courses');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => {
    try {
      await api.post('/courses', payload);
      setShowForm(false);
      load();
    } catch (err) { alert('Create failed'); }
  };

  const update = async (payload) => {
    try {
      await api.put(`/courses/${editing.course_id}`, payload);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) { alert('Update failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete course?')) return;
    try { await api.delete(`/courses/${id}`); load(); } catch (err) { alert('Delete failed'); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Courses</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setEditing(null); setShowForm(true); }}>Add Course</button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 12, border: '1px solid #ddd', padding: 12 }}>
          <CourseForm initial={editing || {}} onSubmit={editing ? update : create} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <ul>
        {courses.map(c => (
          <li key={c.course_id} style={{ marginBottom: 8 }}>
            <strong>{c.course_name}</strong> — {c.course_code} — ₱{c.tuition_fee}
            <div>
              <button onClick={() => { setEditing(c); setShowForm(true); }}>Edit</button>
              <button onClick={() => remove(c.course_id)} style={{ marginLeft: 8 }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
