// controllers/studentsController.js
import pool from '../config/db.js';

// Helper function to calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Create student
// Refactored Create student - creates student first, then handles enrollment
export const createStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const {
      student_id: incomingStudentId,
      first_name = '',
      middle_name = '',
      last_name = '',
      email: incomingEmail,
      age: manualAge,
      gender,
      birth_date,
      birth_place,
      phone_number,
      address,
      background,
      goals,
      course_id,
      trading_level_id,
      learning_style_id,
      device_availability,
      rating,
    } = req.body;

    if (!first_name?.trim() || !last_name?.trim()) {
      throw new Error('First name and last name are required');
    }

    // Calculate age first
    const calculatedAge = calculateAge(birth_date);
    const finalAge = calculatedAge || manualAge || null;

    // Generate student_id FIRST
    const student_id = incomingStudentId?.trim()
      ? incomingStudentId.trim()
      : `STU${Date.now()}`.slice(0, 20);

    // Check if this exact student_id already exists
    const [existingStudentCheck] = await conn.query(
      'SELECT student_id FROM students WHERE student_id = ? LIMIT 1',
      [student_id]
    );
    if (existingStudentCheck.length > 0) {
      throw new Error(`Student ID ${student_id} already exists`);
    }

    // Create unique username
    const baseUsername = `${first_name}${middle_name}${last_name}`.replace(/\s+/g, '').toLowerCase();
    let username = baseUsername || `user${Date.now()}`;
    let suffix = 0;
    while (true) {
      const [exists] = await conn.query('SELECT 1 FROM accounts WHERE username = ? LIMIT 1', [username]);
      if (exists.length === 0) break;
      suffix++;
      username = `${baseUsername}${suffix}`;
    }

    // Create unique email
    let email = incomingEmail?.trim() || `${username}@no-reply.8connect.local`;
    let emailSuffix = 0;
    while (true) {
      const [exists] = await conn.query('SELECT 1 FROM accounts WHERE email = ? LIMIT 1', [email]);
      if (exists.length === 0) break;
      emailSuffix++;
      const parts = email.split('@');
      email = `${parts[0]}${emailSuffix}@${parts[1]}`;
    }

    // Create account
    const role_id = 1; // student
    const [accResult] = await conn.query(
      `INSERT INTO accounts (username, email, role_id, is_active)
       VALUES (?, ?, ?, 1)`,
      [username, email, role_id]
    );
    const account_id = accResult.insertId;

    // Create student record WITHOUT batch_id initially
    await conn.query(
      `INSERT INTO students
      (student_id, account_id, first_name, middle_name, last_name, age, gender, birth_date, birth_place, phone_number, address,
       background, goals, batch_id, trading_level_id, learning_style_id, device_availability, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        account_id,
        first_name?.trim() || null,
        middle_name?.trim() || null,
        last_name?.trim() || null,
        finalAge,
        gender || null,
        birth_date || null,
        birth_place?.trim() || null,
        phone_number?.trim() || null,
        address?.trim() || null,
        background?.trim() || null,
        goals?.trim() || null,
        null, // batch_id will be set when enrolling in course
        trading_level_id ?? null,
        learning_style_id ?? null,
        device_availability?.trim() || null,
        rating ?? 0.0
      ]
    );

    let enrollmentInfo = null;
    let competencyAssessment = null;

    // Handle course enrollment if course_id is provided
    if (course_id) {
      // Validate course exists
      const [courseRows] = await conn.query(
        'SELECT * FROM courses WHERE course_id = ? LIMIT 1',
        [course_id]
      );
      if (courseRows.length === 0) {
        throw new Error(`Course with ID ${course_id} does not exist`);
      }

      // Find or create batch for the course
      let batch_id;
      const [batchRows] = await conn.query(
        'SELECT batch_id FROM batches WHERE course_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
        [course_id]
      );
      if (batchRows.length > 0) {
        batch_id = batchRows[0].batch_id;
      } else {
        // Create new batch if none exists
        const [batchResult] = await conn.query(
          `INSERT INTO batches (course_id, batch_name, start_date, end_date)
           VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH))`,
          [course_id, `Batch for Course ${course_id} - ${new Date().toISOString().slice(0, 10)}`]
        );
        batch_id = batchResult.insertId;
      }

      // Update student with batch_id
      await conn.query(
        'UPDATE students SET batch_id = ? WHERE student_id = ?',
        [batch_id, student_id]
      );

      // Enroll student in course
      await conn.query(
        'INSERT INTO course_enrollees (student_id, course_id) VALUES (?, ?)',
        [student_id, course_id]
      );

      // Create Basic competency assessment for this course
      const [basicCompetencyRows] = await conn.query(
        'SELECT type_id, type_name, passing_score FROM competency_types WHERE type_name = ? LIMIT 1',
        ['Basic']
      );
      let basicCompetencyId = 1;
      let competencyName = 'Basic';
      let passingScore = 75.00;
      if (basicCompetencyRows.length > 0) {
        basicCompetencyId = basicCompetencyRows[0].type_id;
        competencyName = basicCompetencyRows[0].type_name;
        passingScore = basicCompetencyRows[0].passing_score;
      }

      // Insert competency assessment
      await conn.query(
        `INSERT INTO competency_assessments 
         (student_id, course_id, competency_type_id, attempt_number, score, passing_score, exam_status, assessment_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
        [
          student_id,
          course_id,
          basicCompetencyId,
          1, // First attempt
          0.00, // Initial score
          passingScore,
          'failed', // Initial status
          `Initial ${competencyName} competency assessment for course ${course_id}`
        ]
      );

      enrollmentInfo = {
        course_id,
        batch_id,
        course_name: courseRows[0].course_name
      };

      competencyAssessment = {
        type: competencyName,
        course_id,
        score: 0.00,
        status: 'failed',
        attempt: 1
      };
    }

    await conn.commit();

    // Prepare response
    const response = {
      message: 'Student created successfully',
      student_id,
      username,
      email,
      account_id,
      age: finalAge,
      action: 'created_new'
    };

    if (enrollmentInfo) {
      response.message = 'Student created and enrolled successfully';
      response.enrollment = enrollmentInfo;
      response.competency_assessment = competencyAssessment;
    }

    res.status(201).json(response);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Separate function to enroll existing student in additional courses
export const enrollStudentInCourse = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { student_id } = req.params;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ error: 'course_id is required' });
    }

    // Check if student exists
    const [studentRows] = await conn.query(
      'SELECT student_id, first_name, last_name FROM students WHERE student_id = ? LIMIT 1',
      [student_id]
    );
    if (studentRows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentRows[0];

    // Check if course exists
    const [courseRows] = await conn.query(
      'SELECT course_id, course_name FROM courses WHERE course_id = ? LIMIT 1',
      [course_id]
    );
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const course = courseRows[0];

    // Check if already enrolled
    const [enrollmentCheck] = await conn.query(
      'SELECT 1 FROM course_enrollees WHERE student_id = ? AND course_id = ? LIMIT 1',
      [student_id, course_id]
    );
    if (enrollmentCheck.length > 0) {
      return res.status(400).json({ 
        error: `Student is already enrolled in course: ${course.course_name}` 
      });
    }

    // Enroll in course
    await conn.query(
      'INSERT INTO course_enrollees (student_id, course_id) VALUES (?, ?)',
      [student_id, course_id]
    );

    // Create Basic competency assessment for this new course
    const [basicCompetencyRows] = await conn.query(
      'SELECT type_id, type_name, passing_score FROM competency_types WHERE type_name = ? LIMIT 1',
      ['Basic']
    );
    let basicCompetencyId = 1;
    let competencyName = 'Basic';
    let passingScore = 75.00;
    if (basicCompetencyRows.length > 0) {
      basicCompetencyId = basicCompetencyRows[0].type_id;
      competencyName = basicCompetencyRows[0].type_name;
      passingScore = basicCompetencyRows[0].passing_score;
    }

    // Insert competency assessment for the new course enrollment
    await conn.query(
      `INSERT INTO competency_assessments 
       (student_id, course_id, competency_type_id, attempt_number, score, passing_score, exam_status, assessment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        student_id,
        course_id,
        basicCompetencyId,
        1,
        0.00,
        passingScore,
        'failed',
        `Initial ${competencyName} competency assessment for new course enrollment`
      ]
    );

    await conn.commit();

    res.status(200).json({
      message: `Student ${student.first_name} ${student.last_name} enrolled in ${course.course_name} successfully`,
      student_id,
      course_id,
      course_name: course.course_name,
      competency_assessment: {
        type: competencyName,
        course_id,
        score: 0.00,
        status: 'failed',
        attempt: 1
      }
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// New function to add competency assessment for existing enrollments
export const addCompetencyAssessment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { student_id, course_id, competency_type_id, score, notes } = req.body;

    if (!student_id || !course_id || !competency_type_id) {
      return res.status(400).json({ 
        error: 'student_id, course_id, and competency_type_id are required' 
      });
    }

    // Verify student is enrolled in the course
    const [enrollmentCheck] = await conn.query(
      'SELECT 1 FROM course_enrollees WHERE student_id = ? AND course_id = ?',
      [student_id, course_id]
    );
    if (enrollmentCheck.length === 0) {
      return res.status(400).json({ 
        error: 'Student is not enrolled in this course' 
      });
    }

    // Get competency type details
    const [competencyRows] = await conn.query(
      'SELECT type_name, passing_score FROM competency_types WHERE type_id = ?',
      [competency_type_id]
    );
    if (competencyRows.length === 0) {
      return res.status(400).json({ error: 'Invalid competency type' });
    }

    const competencyType = competencyRows[0];
    const assessmentScore = score || 0.00;
    const examStatus = assessmentScore >= competencyType.passing_score ? 'completed' : 'failed';

    // Get next attempt number
    const [attemptRows] = await conn.query(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt 
       FROM competency_assessments 
       WHERE student_id = ? AND course_id = ? AND competency_type_id = ?`,
      [student_id, course_id, competency_type_id]
    );
    const attemptNumber = attemptRows[0].next_attempt;

    // Insert new assessment
    await conn.query(
      `INSERT INTO competency_assessments 
       (student_id, course_id, competency_type_id, attempt_number, score, passing_score, exam_status, assessment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
      [
        student_id,
        course_id,
        competency_type_id,
        attemptNumber,
        assessmentScore,
        competencyType.passing_score,
        examStatus,
        notes || `${competencyType.type_name} competency assessment attempt ${attemptNumber}`
      ]
    );

    res.status(201).json({
      message: 'Competency assessment added successfully',
      assessment: {
        student_id,
        course_id,
        competency_type: competencyType.type_name,
        attempt_number: attemptNumber,
        score: assessmentScore,
        passing_score: competencyType.passing_score,
        status: examStatus,
        is_passed: assessmentScore >= competencyType.passing_score
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Function to get student's competency progress for a specific course
export const getStudentCourseCompetency = async (req, res) => {
  try {
    const { student_id, course_id } = req.params;

    const [results] = await pool.query(
      'CALL sp_GetStudentCourseCompetency(?, ?)',
      [student_id, course_id]
    );

    if (!results || results[0].length === 0) {
      return res.status(404).json({ 
        error: 'No competency data found for this student and course' 
      });
    }

    res.json({
      student_id,
      course_id,
      competencies: results[0],
      completion_rate: results[0][0].completion_rate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to check for potential duplicate students (optional - for reference)
export const checkPotentialDuplicates = async (req, res) => {
  try {
    const { first_name, last_name, birth_date, email } = req.query;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name are required' });
    }

    let sql = `
      SELECT 
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.birth_date,
        a.email,
        GROUP_CONCAT(c.course_name SEPARATOR ', ') as enrolled_courses
      FROM students s
      JOIN accounts a ON s.account_id = a.account_id
      LEFT JOIN course_enrollees ce ON s.student_id = ce.student_id
      LEFT JOIN courses c ON ce.course_id = c.course_id
      WHERE LOWER(TRIM(s.first_name)) = LOWER(TRIM(?))
      AND LOWER(TRIM(s.last_name)) = LOWER(TRIM(?))
    `;
    const params = [first_name, last_name];

    if (birth_date) {
      sql += ' AND s.birth_date = ?';
      params.push(birth_date);
    }

    if (email) {
      sql += ' AND LOWER(TRIM(a.email)) = LOWER(TRIM(?))';
      params.push(email);
    }

    sql += ' GROUP BY s.student_id ORDER BY s.created_at DESC';

    const [rows] = await pool.query(sql, params);

    res.json({
      potential_duplicates: rows,
      count: rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    const { batch_id, q } = req.query;

    let sql = `
      SELECT 
        s.student_id,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.age,
        s.gender,
        s.batch_id,
        s.birth_date,
        s.birth_place,
        s.phone_number,
        s.address,
        s.background,
        s.goals,
        s.trading_level_id,
        s.learning_style_id,
        s.device_availability,
        s.rating,
        s.is_graduated,
        s.eligibility_status,
        s.graduation_date,
        s.created_at,
        s.updated_at,
        GROUP_CONCAT(
          DISTINCT CONCAT(c.course_id, ':', c.course_name) 
          ORDER BY c.course_name 
          SEPARATOR '||'
        ) AS enrolled_courses
      FROM students s
      LEFT JOIN course_enrollees ce ON s.student_id = ce.student_id
      LEFT JOIN courses c ON ce.course_id = c.course_id
    `;

    const params = [];
    const whereClauses = [];

    if (batch_id) {
      whereClauses.push(`s.batch_id = ?`);
      params.push(batch_id);
    }

    if (q) {
      whereClauses.push(`(
        s.first_name LIKE ? OR 
        s.last_name LIKE ? OR 
        s.student_id LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ` GROUP BY s.student_id ORDER BY s.created_at DESC`;

    const [rows] = await pool.query(sql, params);

    const processedRows = rows.map(student => {
      let courses = [];
      if (student.enrolled_courses) {
        courses = student.enrolled_courses.split('||').map(course => {
          const [course_id, course_name] = course.split(':');
          return { course_id, course_name };
        });
      }

      return {
        ...student,
        enrolled_courses: courses,
        course_names: courses.map(c => c.course_name).join(', ') || 'No courses'
      };
    });

    res.json(processedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student (or add course)
export const updateStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const studentId = req.params.id;
    const { mode, course_id, birth_date, age: manualAge, ...otherFields } = req.body;

    const [studentCheck] = await conn.query(
      'SELECT student_id FROM students WHERE student_id = ?',
      [studentId]
    );
    if (studentCheck.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Add course mode
    if (mode === 'addCourse') {
      if (!course_id) return res.status(400).json({ error: 'course_id is required' });

      const [courseCheck] = await conn.query(
        'SELECT course_id, course_name FROM courses WHERE course_id = ?',
        [course_id]
      );
      if (courseCheck.length === 0) return res.status(400).json({ error: 'Course not found' });

      const [exists] = await conn.query(
        'SELECT 1 FROM course_enrollees WHERE student_id = ? AND course_id = ?',
        [studentId, course_id]
      );
      if (exists.length > 0) {
        return res.status(400).json({ error: 'Student already enrolled in this course' });
      }

      // Enroll in course
      await conn.query(
        'INSERT INTO course_enrollees (student_id, course_id) VALUES (?, ?)',
        [studentId, course_id]
      );

      // Create Basic competency assessment for this new course enrollment
      const [basicCompetencyRows] = await conn.query(
        'SELECT type_id, type_name, passing_score FROM competency_types WHERE type_name = ? LIMIT 1',
        ['Basic']
      );
      let basicCompetencyId = 1;
      let competencyName = 'Basic';
      let passingScore = 75.00;
      if (basicCompetencyRows.length > 0) {
        basicCompetencyId = basicCompetencyRows[0].type_id;
        competencyName = basicCompetencyRows[0].type_name;
        passingScore = basicCompetencyRows[0].passing_score;
      }

      // Insert competency assessment for the new course enrollment
      await conn.query(
        `INSERT INTO competency_assessments 
         (student_id, course_id, competency_type_id, attempt_number, score, passing_score, exam_status, assessment_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
        [
          studentId,
          course_id,
          basicCompetencyId,
          1,
          0.00,
          passingScore,
          'failed',
          `Initial ${competencyName} competency assessment for course ${course_id} (added via update)`
        ]
      );

      await conn.commit();

      return res.json({ 
        message: 'Course added successfully', 
        student_id: studentId, 
        course_id,
        course_name: courseCheck[0].course_name,
        competency_assessment: {
          type: competencyName,
          course_id,
          score: 0.00,
          status: 'failed',
          attempt: 1
        }
      });
    }

    // Check if course_id is being updated (for normal update mode)
    let newCompetencyAssessment = null;
    if (course_id && course_id !== undefined) {
      // Get current course_id from batch_id if exists
      const [currentBatchInfo] = await conn.query(
        `SELECT b.course_id FROM students s 
         LEFT JOIN batches b ON s.batch_id = b.batch_id 
         WHERE s.student_id = ?`,
        [studentId]
      );
      
      const currentCourseId = currentBatchInfo[0]?.course_id;
      
      // If course_id is different from current one, create new assessment
      if (currentCourseId !== course_id) {
        // Verify the new course exists
        const [courseCheck] = await conn.query(
          'SELECT course_id, course_name FROM courses WHERE course_id = ?',
          [course_id]
        );
        if (courseCheck.length === 0) {
          await conn.rollback();
          return res.status(400).json({ error: 'Course not found' });
        }

        // Check if student is already enrolled in the new course
        const [enrollmentExists] = await conn.query(
          'SELECT 1 FROM course_enrollees WHERE student_id = ? AND course_id = ?',
          [studentId, course_id]
        );

        // If not enrolled, enroll them
        if (enrollmentExists.length === 0) {
          await conn.query(
            'INSERT INTO course_enrollees (student_id, course_id) VALUES (?, ?)',
            [studentId, course_id]
          );
        }

        // Create new competency assessment for the new course
        const [basicCompetencyRows] = await conn.query(
          'SELECT type_id, type_name, passing_score FROM competency_types WHERE type_name = ? LIMIT 1',
          ['Basic']
        );
        let basicCompetencyId = 1;
        let competencyName = 'Basic';
        let passingScore = 75.00;
        if (basicCompetencyRows.length > 0) {
          basicCompetencyId = basicCompetencyRows[0].type_id;
          competencyName = basicCompetencyRows[0].type_name;
          passingScore = basicCompetencyRows[0].passing_score;
        }

        // Get next attempt number for this student and course combination
        const [attemptRows] = await conn.query(
          `SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt 
           FROM competency_assessments 
           WHERE student_id = ? AND course_id = ? AND competency_type_id = ?`,
          [studentId, course_id, basicCompetencyId]
        );
        const attemptNumber = attemptRows[0].next_attempt;

        // Insert new competency assessment
        await conn.query(
          `INSERT INTO competency_assessments 
           (student_id, course_id, competency_type_id, attempt_number, score, passing_score, exam_status, assessment_date, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)`,
          [
            studentId,
            course_id,
            basicCompetencyId,
            attemptNumber,
            0.00,
            passingScore,
            'failed',
            `${competencyName} competency assessment for course change (attempt ${attemptNumber})`
          ]
        );

        newCompetencyAssessment = {
          type: competencyName,
          course_id,
          score: 0.00,
          status: 'failed',
          attempt: attemptNumber,
          course_name: courseCheck[0].course_name
        };

        // Find or create batch for the new course and update student's batch_id
        let batch_id;
        const [batchRows] = await conn.query(
          'SELECT batch_id FROM batches WHERE course_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
          [course_id]
        );
        if (batchRows.length > 0) {
          batch_id = batchRows[0].batch_id;
        } else {
          // Create new batch if none exists
          const [batchResult] = await conn.query(
            `INSERT INTO batches (course_id, batch_name, start_date, end_date)
             VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 MONTH))`,
            [course_id, `Batch for Course ${course_id} - ${new Date().toISOString().slice(0, 10)}`]
          );
          batch_id = batchResult.insertId;
        }

        // Update student's batch_id
        otherFields.batch_id = batch_id;
      }
    }

    // Update student details mode
    const fields = [];
    const values = [];
    const allowed = [
      'first_name', 'middle_name', 'last_name', 'gender', 'birth_date', 'birth_place',
      'phone_number', 'address', 'background', 'goals', 'batch_id', 'trading_level_id',
      'learning_style_id', 'device_availability', 'rating', 'is_graduated', 
      'eligibility_status', 'graduation_date'
    ];

    let finalAge = manualAge;
    if (birth_date !== undefined) {
      finalAge = calculateAge(birth_date);
      fields.push('age = ?');
      values.push(finalAge);
    } else if (manualAge !== undefined) {
      fields.push('age = ?');
      values.push(manualAge);
    }

    for (const key of allowed) {
      if (otherFields[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(typeof otherFields[key] === 'string' ? otherFields[key].trim() : otherFields[key]);
      }
    }

    if (!fields.length && !newCompetencyAssessment) {
      await conn.rollback();
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    if (fields.length > 0) {
      values.push(studentId);
      const sql = `UPDATE students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP() WHERE student_id = ?`;
      await conn.query(sql, values);
    }

    await conn.commit();

    const response = { 
      message: 'Student updated successfully', 
      student_id: studentId,
      updated_age: finalAge 
    };

    if (newCompetencyAssessment) {
      response.message = 'Student updated and new competency assessment created';
      response.new_competency_assessment = newCompetencyAssessment;
    }

    res.json(response);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};

// Get student by id
export const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Get student details with enrolled courses
    const [studentRows] = await pool.query(`
      SELECT 
        s.*,
        GROUP_CONCAT(
          DISTINCT CONCAT(c.course_id, ':', c.course_name, ':', ce.enrollment_date) 
          ORDER BY ce.enrollment_date DESC 
          SEPARATOR '||'
        ) AS enrolled_courses
      FROM students s
      LEFT JOIN course_enrollees ce ON s.student_id = ce.student_id
      LEFT JOIN courses c ON ce.course_id = c.course_id
      WHERE s.student_id = ?
      GROUP BY s.student_id
    `, [studentId]);

    if (!studentRows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentRows[0];
    
    // Process enrolled courses
    let enrolledCourses = [];
    if (student.enrolled_courses) {
      enrolledCourses = student.enrolled_courses.split('||').map(course => {
        const [course_id, course_name, enrollment_date] = course.split(':');
        return { course_id, course_name, enrollment_date };
      });
    }

    res.json({
      ...student,
      enrolled_courses: enrolledCourses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const studentId = req.params.id;

    await conn.beginTransaction();

    // Delete competency assessments first
    await conn.query('DELETE FROM competency_assessments WHERE student_id = ?', [studentId]);
    
    // Delete course enrollments
    await conn.query('DELETE FROM course_enrollees WHERE student_id = ?', [studentId]);
    
    // Delete student
    const [result] = await conn.query('DELETE FROM students WHERE student_id = ?', [studentId]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    await conn.commit();
    res.json({ message: 'Student and all related data deleted successfully', affectedRows: result.affectedRows });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
};