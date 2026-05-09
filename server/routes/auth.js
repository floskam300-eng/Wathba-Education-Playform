const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password and role are required' });
  }

  try {
    let user = null;
    let table = '';

    if (role === 'teacher') table = 'teachers';
    else if (role === 'assistant') table = 'assistants';
    else if (role === 'student') table = 'students';
    else return res.status(400).json({ error: 'Invalid role' });

    const whereClause = role === 'student'
      ? `WHERE username = $1 AND deleted_at IS NULL`
      : `WHERE username = $1`;
    const result = await pool.query(`SELECT * FROM ${table} ${whereClause}`, [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { id: user.id, role, username: user.username, name: user.name };
    if (role === 'assistant') payload.teacher_id = user.teacher_id;
    if (role === 'student') payload.teacher_id = user.teacher_id;

    const token = generateToken(payload);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: { ...safeUser, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { id, role } = req.user;
    let table = role === 'teacher' ? 'teachers' : role === 'assistant' ? 'assistants' : 'students';
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...safeUser } = result.rows[0];
    res.json({ ...safeUser, role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
