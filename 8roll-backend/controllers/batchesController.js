// controllers/batchesController.js
import pool from '../config/db.js';

export const createBatch = async (req, res) => {
  try {
    const { batch_name, course_id, start_date, end_date, max_students, instructor_name, is_active } = req.body;
    const sql = `INSERT INTO batches (batch_name, course_id, start_date, end_date, max_students, instructor_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [batch_name, course_id, start_date, end_date, max_students || 30, instructor_name || null, is_active || 1]);
    res.status(201).json({ message: 'Batch created', batch_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBatches = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT b.*, c.course_name FROM batches b LEFT JOIN courses c ON b.course_id = c.course_id ORDER BY b.start_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT b.*, c.course_name FROM batches b LEFT JOIN courses c ON b.course_id = c.course_id WHERE batch_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Batch not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = ['batch_name','course_id','start_date','end_date','max_students','current_students','instructor_name','is_active'];
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
    const sql = `UPDATE batches SET ${fields.join(', ')}, created_at = created_at WHERE batch_id = ?`; // keep created_at unchanged
    const [result] = await pool.query(sql, values);
    res.json({ message: 'Batch updated', affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM batches WHERE batch_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Batch not found' });
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
