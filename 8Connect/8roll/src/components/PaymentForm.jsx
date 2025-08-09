// src/components/PaymentForm.jsx
import React, { useState, useEffect } from 'react';

export default function PaymentForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    student_id: '',
    course_id: '',
    payment_method_id: 1,
    payment_scheme_id: 1,
    amount_due: '',
    amount_paid: '',
    reference_number: '',
    payment_date: '',
    due_date: '',
    is_graduation_fee: 0,
    ...initial
  });

  useEffect(() => setForm(f => ({ ...f, ...initial })), [initial]);
  const h = e => setForm(s => ({ ...s, [e.target.name]: e.target.value }));

  const submit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label>Student ID<input name="student_id" value={form.student_id} onChange={h} required /></label>
      <label>Course ID<input name="course_id" value={form.course_id} onChange={h} /></label>
      <label>Payment method id<input name="payment_method_id" type="number" value={form.payment_method_id} onChange={h} /></label>
      <label>Payment scheme id<input name="payment_scheme_id" type="number" value={form.payment_scheme_id} onChange={h} /></label>
      <label>Amount due<input name="amount_due" type="number" value={form.amount_due} onChange={h} required /></label>
      <label>Amount paid<input name="amount_paid" type="number" value={form.amount_paid} onChange={h} required /></label>
      <label>Payment date<input name="payment_date" type="date" value={form.payment_date} onChange={h} required /></label>
      <label>Reference<input name="reference_number" value={form.reference_number} onChange={h} /></label>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
