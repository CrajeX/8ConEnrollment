// controllers/paymentsController.js
import pool from '../config/db.js';

/**
 * Create payment.
 * Note: the original SQL dump has a trigger that updates students.balance on insert.
 * This controller inserts a payment and returns inserted payment_id.
 */
export const createPayment = async (req, res) => {
  try {
    const {
      student_id, course_id = null, payment_method_id, payment_scheme_id,
      amount_due, amount_paid, reference_number = null, payment_date,
      due_date = null, is_graduation_fee = 0, is_verified = 0, notes = null
    } = req.body;

    const sql = `INSERT INTO payments
      (student_id, course_id, payment_method_id, payment_scheme_id, amount_due, amount_paid, reference_number, payment_date, due_date, is_graduation_fee, is_verified, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.query(sql, [
      student_id, course_id, payment_method_id, payment_scheme_id,
      amount_due, amount_paid, reference_number, payment_date, due_date, is_graduation_fee, is_verified, notes
    ]);

    res.status(201).json({ message: 'Payment created', payment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = `SELECT p.*, pm.method_name, ps.scheme_name, vs.full_name AS student_name, c.course_name
               FROM payments p
               LEFT JOIN payment_methods pm ON p.payment_method_id = pm.method_id
               LEFT JOIN payment_schemes ps ON p.payment_scheme_id = ps.scheme_id
               LEFT JOIN v_student_summary vs ON p.student_id = vs.student_id
               LEFT JOIN courses c ON p.course_id = c.course_id`;
    const params = [];

    if (student_id) {
      sql += ' WHERE p.student_id = ?';
      params.push(student_id);
    }
    sql += ' ORDER BY p.payment_date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const id = req.params.id;
    // Allow updating these fields
    const allowed = ['amount_due','amount_paid','payment_method_id','payment_scheme_id','reference_number','is_verified','notes','payment_date','due_date'];
    const fields = [];
    const values = [];
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(req.body[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });
    values.push(id);
    const sql = `UPDATE payments SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP() WHERE payment_id = ?`;
    const [result] = await pool.query(sql, values);
    res.json({ message: 'Payment updated', affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM payments WHERE payment_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
