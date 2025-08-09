// controllers/coursesController.js
import pool from '../config/db.js';

export const createCourse = async (req, res) => {
  try {
    const { course_name, course_code, description, tuition_fee, duration_weeks, max_enrollees, start_date, end_date } = req.body;
    const sql = `INSERT INTO courses (course_name, course_code, description, tuition_fee, duration_weeks, max_enrollees, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(sql, [course_name, course_code, description, tuition_fee, duration_weeks, max_enrollees, start_date, end_date]);
    res.status(201).json({ message: 'Course created', course_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query('SELECT * FROM courses WHERE course_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = ['course_name','course_code','description','tuition_fee','duration_weeks','max_enrollees','current_enrollees','start_date','end_date','is_active'];
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
    const sql = `UPDATE courses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP() WHERE course_id = ?`;
    const [result] = await pool.query(sql, values);
    res.json({ message: 'Course updated', affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM courses WHERE course_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
