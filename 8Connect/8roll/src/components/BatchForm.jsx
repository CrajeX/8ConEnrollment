// src/components/BatchForm.jsx
import React, { useEffect, useState } from 'react';

export default function BatchForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    batch_name: '',
    course_id: '',
    start_date: '',
    end_date: '',
    max_students: 30,
    instructor_name: '',
    is_active: 1,
    ...initial
  });
  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);
  const h = e => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label>Batch name<input name="batch_name" value={form.batch_name} onChange={h} required /></label>
      <label>Course ID<input name="course_id" value={form.course_id} onChange={h} /></label>
      <label>Start date<input name="start_date" type="date" value={form.start_date} onChange={h} /></label>
      <label>End date<input name="end_date" type="date" value={form.end_date} onChange={h} /></label>
      <label>Max students<input name="max_students" type="number" value={form.max_students} onChange={h} /></label>
      <label>Instructor<input name="instructor_name" value={form.instructor_name} onChange={h} /></label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
