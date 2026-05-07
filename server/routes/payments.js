const express = require('express');
const pool = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const getTeacherId = (req) => req.user.role === 'teacher' ? req.user.id : req.user.teacher_id;

router.get('/', requireRole('teacher', 'assistant'), async (req, res) => {
  const teacherId = getTeacherId(req);
  try {
    const result = await pool.query(
      `SELECT p.*, s.name as student_name, s.phone as student_phone, c.name as course_name
       FROM payments p JOIN students s ON p.student_id=s.id
       LEFT JOIN courses c ON p.course_id=c.id
       WHERE s.teacher_id=$1 ORDER BY p.payment_date DESC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireRole('teacher', 'assistant'), async (req, res) => {
  const { student_id, course_id, amount, method, reference_number, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payments (student_id,course_id,amount,method,reference_number,notes,status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [student_id, course_id, amount, method, reference_number, notes, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/verify', requireRole('teacher', 'assistant'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE payments SET status=$1, verified_by=$2, verified_at=NOW() WHERE id=$3 RETURNING *',
      [status, req.user.role === 'assistant' ? req.user.id : null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Payment not found' });

    if (status === 'verified' && result.rows[0].course_id) {
      await pool.query(
        'INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
        [result.rows[0].student_id, result.rows[0].course_id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/leaderboard', requireRole('teacher', 'assistant', 'student'), async (req, res) => {
  const teacherId = req.user.role === 'student'
    ? (await pool.query('SELECT teacher_id FROM students WHERE id=$1', [req.user.id])).rows[0]?.teacher_id
    : getTeacherId(req);

  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.points, s.academic_stage, s.gender,
              COUNT(DISTINCT er.exam_id) as exams_taken,
              COALESCE(AVG(er.score), 0) as avg_score,
              COUNT(DISTINCT b.id) as badge_count
       FROM students s
       LEFT JOIN exam_results er ON s.id=er.student_id
       LEFT JOIN badges b ON s.id=b.student_id
       WHERE s.teacher_id=$1
       GROUP BY s.id ORDER BY s.points DESC LIMIT 50`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
