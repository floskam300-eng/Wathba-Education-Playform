require('dotenv').config();
const pool = require('./db/connection');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const seed = async () => {
  try {
    const passwordHash = await bcrypt.hash('test1234', 10);

    console.log('Re-initializing database schema...');
    // We drop the tables first to ensure the schema is up to date
    const dropTables = `
      DROP TABLE IF EXISTS badges CASCADE;
      DROP TABLE IF EXISTS student_course_enrollment CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS video_progress CASCADE;
      DROP TABLE IF EXISTS exam_results CASCADE;
      DROP TABLE IF EXISTS questions CASCADE;
      DROP TABLE IF EXISTS exams CASCADE;
      DROP TABLE IF EXISTS pdf_files CASCADE;
      DROP TABLE IF EXISTS videos CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS assistants CASCADE;
      DROP TABLE IF EXISTS teachers CASCADE;
    `;
    await pool.query(dropTables);
    
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Schema initialized.');

    console.log('Seeding Teachers...');
    const teacherRes = await pool.query(
      "INSERT INTO teachers (username, password, name, bio, classification, whatsapp_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      ['admin', passwordHash, 'أ. محمد أحمد', 'مدرس فيزياء متخصص للمرحلة الثانوية بخبرة 10 سنوات', 'فيزياء', '+201000000000']
    );
    const teacherId = teacherRes.rows[0].id;

    console.log('Seeding Assistants...');
    const assistantRes = await pool.query(
      "INSERT INTO assistants (username, password, name, phone, teacher_id) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10) RETURNING id",
      ['assistant1', passwordHash, 'أحمد علي', '01100000001', teacherId, 'assistant2', passwordHash, 'سارة محمود', '01100000002', teacherId]
    );
    const assistantId1 = assistantRes.rows[0].id;

    console.log('Seeding Students...');
    const studentsData = [
      ['student1', passwordHash, 'عمر خالد', '01200000001', '01000000001', 'الصف الثالث الثانوي', 'ذكر', teacherId, 150],
      ['student2', passwordHash, 'ليلى يوسف', '01200000002', '01000000002', 'الصف الثالث الثانوي', 'أنثى', teacherId, 200],
      ['student3', passwordHash, 'مازن حسن', '01200000003', '01000000003', 'الصف الثاني الثانوي', 'ذكر', teacherId, 50],
      ['student4', passwordHash, 'نورا محمد', '01200000004', '01000000004', 'الصف الأول الثانوي', 'أنثى', teacherId, 0],
      ['student5', passwordHash, 'ياسين علي', '01200000005', '01000000005', 'الصف الثالث الثانوي', 'ذكر', teacherId, 300],
    ];

    const studentIds = [];
    for (const s of studentsData) {
      const res = await pool.query(
        "INSERT INTO students (username, password, name, phone, parent_phone, academic_stage, gender, teacher_id, points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
        s
      );
      studentIds.push(res.rows[0].id);
    }

    console.log('Seeding Courses...');
    const courseRes1 = await pool.query(
      "INSERT INTO courses (name, description, price, teacher_id, target_stage) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['كورس الفيزياء الحديثة', 'شرح مفصل لوحدات الفيزياء الحديثة مع حل تدريبات مكثفة', 250, teacherId, 'الصف الثالث الثانوي']
    );
    const courseId1 = courseRes1.rows[0].id;

    const courseRes2 = await pool.query(
      "INSERT INTO courses (name, description, price, teacher_id, target_stage) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      ['مراجعة ليلة الامتحان - ميكانيكا', 'مراجعة شاملة لجميع قوانين الميكانيكا وحل امتحانات سابقة', 150, teacherId, 'الصف الثالث الثانوي']
    );
    const courseId2 = courseRes2.rows[0].id;

    console.log('Seeding Videos...');
    await pool.query(
      "INSERT INTO videos (title, file_path_or_url, duration_minutes, course_id, sort_order) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)",
      ['مقدمة في الفيزياء الذرية', 'https://example.com/video1', 45, courseId1, 1, 'الظاهرة الكهروضوئية', 'https://example.com/video2', 60, courseId1, 2]
    );

    console.log('Seeding Exams...');
    const examRes = await pool.query(
      "INSERT INTO exams (title, duration_minutes, total_score, course_id, teacher_id, pass_score, badge_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      ['امتحان الفيزياء الحديثة الشامل', 60, 50, courseId1, teacherId, 25, 'بطل الفيزياء']
    );
    const examId = examRes.rows[0].id;

    console.log('Seeding Questions...');
    await pool.query(
      "INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8), ($9, $10, $11, $12, $13, $14, $15, $16)",
      [
        'ما هو مكتشف الفوتون؟', 'أينشتاين', 'نيوتن', 'بلانك', 'بور', 'A', 5, examId,
        'ما هي وحدة قياس الشغل؟', 'الجول', 'الوات', 'النيوتن', 'الأمبير', 'A', 5, examId
      ]
    );

    console.log('Seeding Exam Results...');
    await pool.query(
      "INSERT INTO exam_results (student_id, exam_id, score, correct_count, wrong_count, points_earned) VALUES ($1, $2, $3, $4, $5, $6), ($7, $8, $9, $10, $11, $12)",
      [studentIds[0], examId, 45, 9, 1, 50, studentIds[1], examId, 30, 6, 4, 20]
    );

    console.log('Seeding Enrollments...');
    await pool.query(
      "INSERT INTO student_course_enrollment (student_id, course_id, status) VALUES ($1, $2, $3), ($4, $5, $6)",
      [studentIds[0], courseId1, 'active', studentIds[1], courseId1, 'active']
    );

    console.log('Seeding Payments...');
    await pool.query(
      "INSERT INTO payments (student_id, course_id, amount, method, status, verified_by) VALUES ($1, $2, $3, $4, $5, $6)",
      [studentIds[0], courseId1, 250, 'Vodafone Cash', 'verified', assistantId1]
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
