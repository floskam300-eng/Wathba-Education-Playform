/**
 * SSE (Server-Sent Events) Manager
 * Manages persistent connections and broadcasts real-time events
 * to connected students and teachers.
 */

const clients = new Map();

/**
 * Register a new SSE client connection.
 * @param {string} key  - unique key: "student_<id>" or "teacher_<id>"
 * @param {object} res  - Express response object (the SSE stream)
 */
function addClient(key, res) {
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
}

/**
 * Remove an SSE client when it disconnects.
 */
function removeClient(key, res) {
  const set = clients.get(key);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(key);
}

/**
 * Send an SSE event to all connections under a given key.
 * @param {string} key      - "student_<id>" or "teacher_<id>"
 * @param {string} event    - event name (e.g. "notification", "new_exam")
 * @param {object} payload  - JSON payload
 */
function sendEvent(key, event, payload) {
  const set = clients.get(key);
  if (!set || set.size === 0) return;
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of set) {
    try { res.write(data); } catch (_) {}
  }
}

/**
 * Broadcast an event to every student belonging to a teacher.
 * Requires a pool query to find all student IDs.
 */
async function broadcastToTeacherStudents(pool, teacherId, event, payload) {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM students WHERE teacher_id=$1 AND deleted_at IS NULL',
      [teacherId]
    );
    for (const { id } of rows) {
      sendEvent(`student_${id}`, event, payload);
    }
  } catch (_) {}
}

/**
 * Broadcast to all students enrolled in a specific course.
 */
async function broadcastToCourseStudents(pool, courseId, event, payload) {
  try {
    const { rows } = await pool.query(
      'SELECT student_id FROM student_course_enrollment WHERE course_id=$1',
      [courseId]
    );
    for (const { student_id } of rows) {
      sendEvent(`student_${student_id}`, event, payload);
    }
  } catch (_) {}
}

module.exports = {
  addClient,
  removeClient,
  sendEvent,
  broadcastToTeacherStudents,
  broadcastToCourseStudents,
};
