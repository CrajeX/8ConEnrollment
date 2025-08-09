// src/pages/Payments.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PaymentForm from '../components/PaymentForm';

export default function Payments() {
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { const res = await api.get('/payments'); setRows(res.data || []); }
    catch (err) { alert('Error loading payments'); }
  };

  useEffect(() => { load(); }, []);

  const create = async (payload) => { try { await api.post('/payments', payload); setShowForm(false); load(); } catch (e) { alert('Create failed'); } };
  const update = async (payload) => { try { await api.put(`/payments/${editing.payment_id}`, payload); setEditing(null); setShowForm(false); load(); } catch { alert('Update failed'); } };
  const remove = async (id) => { if (!confirm('Delete payment?')) return; try { await api.delete(`/payments/${id}`); load(); } catch { alert('Delete failed'); } };

  return (
    <div style={{ padding: 16 }}>
      <h2>Payments</h2>
      <button onClick={() => { setShowForm(true); setEditing(null); }}>Add Payment</button>

      {showForm && (
        <div style={{ marginTop: 12, border: '1px solid #ddd', padding: 12 }}>
          <PaymentForm initial={editing || {}} onSubmit={editing ? update : create} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr><th>ID</th><th>Student</th><th>Course</th><th>Paid</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.payment_id} style={{ borderTop: '1px solid #eee' }}>
              <td>{r.payment_id}</td>
              <td>{r.student_id} {r.student_name ? `— ${r.student_name}` : ''}</td>
              <td>{r.course_name}</td>
              <td>{r.amount_paid}</td>
              <td>{r.payment_date}</td>
              <td>
                <button onClick={() => { setEditing(r); setShowForm(true); }}>Edit</button>
                <button onClick={() => remove(r.payment_id)} style={{ marginLeft: 8 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
