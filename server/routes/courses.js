const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/connection');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const getTeacherId = (req) => req.user.role === 'teacher' ? req.user.id : req.user.teacher_id;

// ── Multer storage ──
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `vid_${Date.now()}${ext}`);
  },
});
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/pdfs');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `pdf_${Date.now()}.pdf`);
  },
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files allowed'));
  },
});
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

// ── Courses CRUD ──
router.get('/', requireRole('teacher', 'assistant'), async (req, res) => {
  const teacherId = getTeacherId(req);
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(DISTINCT sce.student_id) as enrolled_count,
              COUNT(DISTINCT v.id) as video_count, COUNT(DISTINCT p.id) as pdf_count
       FROM courses c
       LEFT JOIN student_course_enrollment sce ON c.id = sce.course_id
       LEFT JOIN videos v ON c.id = v.course_id
       LEFT JOIN pdf_files p ON c.id = p.course_id
       WHERE c.teacher_id = $1
       GROUP BY c.id ORDER BY c.created_at DESC`,
      [teacherId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireRole('teacher'), async (req, res) => {
  const { name, description, price, thumbnail_url, target_stage } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO courses (name,description,price,thumbnail_url,teacher_id,target_stage) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, description, price || 0, thumbnail_url, req.user.id, target_stage || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireRole('teacher'), async (req, res) => {
  const { name, description, price, thumbnail_url, target_stage } = req.body;
  try {
    const result = await pool.query(
      'UPDATE courses SET name=$1,description=$2,price=$3,thumbnail_url=$4,target_stage=$5 WHERE id=$6 AND teacher_id=$7 RETURNING *',
      [name, description, price, thumbnail_url, target_stage || null, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireRole('teacher'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM courses WHERE id=$1 AND teacher_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Course content ──
router.get('/:id/content', async (req, res) => {
  try {
    const [videos, pdfs, exams] = await Promise.all([
      pool.query('SELECT * FROM videos WHERE course_id=$1 ORDER BY sort_order', [req.params.id]),
      pool.query('SELECT * FROM pdf_files WHERE course_id=$1', [req.params.id]),
      pool.query('SELECT id,title,duration_minutes,total_score,pass_score FROM exams WHERE course_id=$1', [req.params.id]),
    ]);
    res.json({ videos: videos.rows, pdfs: pdfs.rows, exams: exams.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Video upload (actual file) ──
router.post('/:id/videos/upload', requireRole('teacher', 'assistant'), uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });
    const { title, duration_minutes, sort_order } = req.body;
    const filePath = `/uploads/videos/${req.file.filename}`;
    const result = await pool.query(
      'INSERT INTO videos (title,file_path_or_url,duration_minutes,course_id,sort_order) VALUES($1,$2,$3,$4,$5) RETURNING *',
      [title || req.file.originalname, filePath, parseInt(duration_minutes) || 0, req.params.id, parseInt(sort_order) || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PDF upload (actual file) ──
router.post('/:id/pdfs/upload', requireRole('teacher', 'assistant'), uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });
    const { title } = req.body;
    const filePath = `/uploads/pdfs/${req.file.filename}`;
    const result = await pool.query(
      'INSERT INTO pdf_files (title,file_url,course_id) VALUES($1,$2,$3) RETURNING *',
      [title || req.file.originalname, filePath, req.params.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Delete video ──
router.delete('/:id/videos/:videoId', requireRole('teacher', 'assistant'), async (req, res) => {
  try {
    const v = await pool.query('SELECT file_path_or_url FROM videos WHERE id=$1', [req.params.videoId]);
    if (v.rows.length && v.rows[0].file_path_or_url?.startsWith('/uploads/')) {
      const fp = path.join(__dirname, '../../', v.rows[0].file_path_or_url);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await pool.query('DELETE FROM videos WHERE id=$1', [req.params.videoId]);
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Delete PDF ──
router.delete('/:id/pdfs/:pdfId', requireRole('teacher', 'assistant'), async (req, res) => {
  try {
    const p = await pool.query('SELECT file_url FROM pdf_files WHERE id=$1', [req.params.pdfId]);
    if (p.rows.length && p.rows[0].file_url?.startsWith('/uploads/')) {
      const fp = path.join(__dirname, '../../', p.rows[0].file_url);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await pool.query('DELETE FROM pdf_files WHERE id=$1', [req.params.pdfId]);
    res.json({ message: 'PDF deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Enrollment ──
router.post('/:id/enroll/:studentId', requireRole('teacher', 'assistant'), async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',
      [req.params.studentId, req.params.id]
    );
    res.json({ message: 'Student enrolled' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Student: my courses (filtered by academic stage) ──
router.get('/student/my-courses', requireRole('student'), async (req, res) => {
  try {
    const studentRes = await pool.query('SELECT academic_stage FROM students WHERE id=$1', [req.user.id]);
    const stage = studentRes.rows[0]?.academic_stage;
    const result = await pool.query(
      `SELECT c.*, sce.enrollment_date, sce.status,
              COUNT(DISTINCT v.id) as video_count, COUNT(DISTINCT p.id) as pdf_count
       FROM courses c
       JOIN student_course_enrollment sce ON c.id = sce.course_id
       LEFT JOIN videos v ON c.id = v.course_id
       LEFT JOIN pdf_files p ON c.id = p.course_id
       WHERE sce.student_id = $1
         AND (c.target_stage = $2 OR c.target_stage IS NULL)
       GROUP BY c.id, sce.enrollment_date, sce.status
       ORDER BY c.created_at DESC`,
      [req.user.id, stage]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
