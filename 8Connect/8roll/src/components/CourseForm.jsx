// src/components/CourseForm.jsx
import React, { useState, useEffect } from 'react';

export default function CourseForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    course_name: '',
    course_code: '',
    description: '',
    tuition_fee: '',
    duration_weeks: '',
    max_enrollees: '',
    start_date: '',
    end_date: '',
    ...initial
  });

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);

  const handleChange = e => setForm(s => ({ ...s, [e.target.name]: e.target.value }));
  const submit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label>Course name<input name="course_name" value={form.course_name} onChange={handleChange} required /></label>
      <label>Code<input name="course_code" value={form.course_code} onChange={handleChange} /></label>
      <label>Description<input name="description" value={form.description} onChange={handleChange} /></label>
      <label>Tuition fee<input name="tuition_fee" type="number" value={form.tuition_fee} onChange={handleChange} /></label>
      <label>Duration weeks<input name="duration_weeks" type="number" value={form.duration_weeks} onChange={handleChange} /></label>
      <label>Max enrollees<input name="max_enrollees" type="number" value={form.max_enrollees} onChange={handleChange} /></label>
      <label>Start date<input name="start_date" type="date" value={form.start_date} onChange={handleChange} /></label>
      <label>End date<input name="end_date" type="date" value={form.end_date} onChange={handleChange} /></label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
