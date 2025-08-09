// src/pages/Batches.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import BatchForm from '../components/BatchForm';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { const res = await api.get('/batches'); setBatches(res.data); }
    catch (err) { alert('Error loading batches'); }
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => { try { await api.post('/batches', payload); setShowForm(false); load(); } catch (e) { alert('Create error'); } };
  const update = async (payload) => { try { await api.put(`/batches/${editing.batch_id}`, payload); setEditing(null); setShowForm(false); load(); } catch { alert('Update error'); } };
  const remove = async (id) => { if (!confirm('Delete batch?')) return; try { await api.delete(`/batches/${id}`); load(); } catch { alert('Delete error'); } };

  return (
    <div style={{ padding: 16 }}>
      <h2>Batches</h2>
      <button onClick={() => { setShowForm(true); setEditing(null); }}>Add Batch</button>

      {showForm && (
        <div style={{ marginTop: 12, border: '1px solid #ddd', padding: 12 }}>
          <BatchForm initial={editing || {}} onSubmit={editing ? update : create} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <ul>
        {batches.map(b => (
          <li key={b.batch_id} style={{ margin: 8 }}>
            <strong>{b.batch_name}</strong> — {b.course_name || `course:${b.course_id}`} — {b.start_date} → {b.end_date}
            <div>
              <button onClick={() => { setEditing(b); setShowForm(true); }}>Edit</button>
              <button onClick={() => remove(b.batch_id)} style={{ marginLeft: 8 }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
