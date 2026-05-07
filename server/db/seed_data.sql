-- Seed data for WATHBA Educational Platform

-- 1. Insert Assistants (Linked to Teacher ID 1 - admin)
INSERT INTO assistants (username, password, name, phone, teacher_id)
VALUES 
('assistant1', '$2a$10$8K9V/n.Fp.UvRzQvWnE.9e3X8v5F0pXv8v5F0pXv8v5F0pXv8v5F0', 'أحمد علي', '01112223334', 1),
('assistant2', '$2a$10$8K9V/n.Fp.UvRzQvWnE.9e3X8v5F0pXv8v5F0pXv8v5F0pXv8v5F0', 'سارة محمود', '01223334445', 1);

-- 2. Insert Students
INSERT INTO students (username, password, name, phone, parent_phone, academic_stage, gender, teacher_id, points)
VALUES 
('student1', '$2a$10$8K9V/n.Fp.UvRzQvWnE.9e3X8v5F0pXv8v5F0pXv8v5F0pXv8v5F0', 'محمد خالد', '01001112223', '01009998887', 'الصف الثالث الثانوي', 'ذكر', 1, 150),
('student2', '$2a$10$8K9V/n.Fp.UvRzQvWnE.9e3X8v5F0pXv8v5F0pXv8v5F0pXv8v5F0', 'منى أحمد', '01004445556', '01007776665', 'الصف الثالث الثانوي', 'أنثى', 1, 200),
('student3', '$2a$10$8K9V/n.Fp.UvRzQvWnE.9e3X8v5F0pXv8v5F0pXv8v5F0pXv8v5F0', 'عمر حسن', '01002223334', '01003332221', 'الصف الثاني الثانوي', 'ذكر', 1, 50);

-- 3. Insert Courses
INSERT INTO courses (name, description, price, teacher_id, thumbnail_url)
VALUES 
('دورة الفيزياء الحديثة', 'شرح مفصل لوحدة الفيزياء الحديثة لطلاب الصف الثالث الثانوي', 500.00, 1, 'https://placehold.co/600x400?text=Physics+Course'),
('أساسيات الكيمياء العضوية', 'كورس مكثف لأساسيات الكيمياء العضوية من الصفر', 450.00, 1, 'https://placehold.co/600x400?text=Chemistry+Course');

-- 4. Insert Videos
INSERT INTO videos (title, file_path_or_url, duration_minutes, course_id, sort_order)
VALUES 
('مقدمة في الفيزياء الحديثة', 'https://www.youtube.com/watch?v=example1', 45, 1, 1),
('ظاهرة التأثير الكهروضوئي', 'https://www.youtube.com/watch?v=example2', 60, 1, 2),
('مدخل للكيمياء العضوية', 'https://www.youtube.com/watch?v=example3', 30, 2, 1);

-- 5. Insert PDF Files
INSERT INTO pdf_files (title, file_url, course_id)
VALUES 
('ملخص قوانين الفيزياء', 'https://example.com/physics_summary.pdf', 1),
('شيت أسئلة الكيمياء العضوية', 'https://example.com/chemistry_questions.pdf', 2);

-- 6. Insert Exams
INSERT INTO exams (title, duration_minutes, total_score, course_id, teacher_id, pass_score, badge_name)
VALUES 
('امتحان الفيزياء الحديثة الشامل', 60, 100, 1, 1, 60, 'عبقري الفيزياء'),
('اختبار الكيمياء العضوية الأول', 30, 50, 2, 1, 30, 'كيميائي متميز');

-- 7. Insert Questions for Exam 1
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id)
VALUES 
('ما هو مكتشف الفوتون؟', 'أينشتاين', 'نيوتن', 'ماكسويل', 'بلانك', 'A', 10, 1),
('ما هي وحدة قياس الشغل؟', 'الجول', 'الوات', 'الفولت', 'الأمبير', 'A', 10, 1);

-- 8. Insert Exam Results
INSERT INTO exam_results (student_id, exam_id, score, correct_count, wrong_count, unanswered_count, points_earned)
VALUES 
(1, 1, 80, 8, 2, 0, 50),
(2, 1, 95, 9, 1, 0, 100);

-- 9. Insert Enrollments
INSERT INTO student_course_enrollment (student_id, course_id, status)
VALUES 
(1, 1, 'active'),
(2, 1, 'active'),
(2, 2, 'active');

-- 10. Insert Payments
INSERT INTO payments (student_id, course_id, amount, method, status, verified_by)
VALUES 
(1, 1, 500.00, 'Vodafone Cash', 'verified', 1),
(2, 1, 500.00, 'Instapay', 'verified', 1),
(2, 2, 450.00, 'Cash', 'pending', NULL);
