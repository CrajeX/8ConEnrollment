// routes/students.js (or wherever your routes are defined)
import express from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  enrollStudentInCourse,
  getTradingLevels,
  getLearningStyles,
  // ... other imports
} from '../controllers/studentsController.js';

const router = express.Router();

// Existing student routes
router.post('/', createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.post('/:student_id/enroll', enrollStudentInCourse);

// New routes for dropdown data
router.get('/data/trading-levels', getTradingLevels);
router.get('/data/learning-styles', getLearningStyles);

export default router;