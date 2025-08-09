// routes/students.js
import express from 'express';
import {
  createStudent, getStudents, getStudentById, updateStudent, deleteStudent,
  enrollStudentInCourse,
  checkPotentialDuplicates,
  addCompetencyAssessment,
  getStudentCourseCompetency
} from '../controllers/studentsController.js';

const router = express.Router();

// Create new student (course enrollment is optional)
router.post('/', createStudent);

// Get all students with optional filtering
router.get('/', getStudents);

// Check for potential duplicate students before creating
router.get('/check-duplicates', checkPotentialDuplicates);

// Get student by ID
router.get('/:id', getStudentById);

// Update student details
router.put('/:id', updateStudent);

// Delete student
router.delete('/:id', deleteStudent);

// Enroll existing student in additional course
router.post('/:student_id/enroll', enrollStudentInCourse);

// Get student's competency progress for specific course
router.get('/:student_id/courses/:course_id/competency', getStudentCourseCompetency);

// Add competency assessment (can also be in a separate competency routes file)
router.post('/competency-assessments', addCompetencyAssessment);

// router.post('/', createStudent);
// router.get('/', getStudents);
// router.get('/:id', getStudentById);
// router.put('/:id', updateStudent);
// router.delete('/:id', deleteStudent);

export default router;
