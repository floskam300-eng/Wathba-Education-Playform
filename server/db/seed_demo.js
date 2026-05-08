require('dotenv').config();
const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 بدء إدخال البيانات التجريبية...');

    // ─── كلمات المرور المشفرة ─────────────────────────────────────────────────
    const pass = await bcrypt.hash('123456', 10);

    // ─── 1. المعلمون ──────────────────────────────────────────────────────────
    const teachersRes = await client.query(`
      INSERT INTO teachers (username, password, name, bio, classification, whatsapp_phone)
      VALUES
        ('ahmed_math',   $1, 'أ/ أحمد سامي',   'معلم رياضيات بخبرة 15 سنة، متخصص في الثانوية العامة', 'مدرس رياضيات', '+201011111111'),
        ('sara_science', $1, 'د/ سارة محمود',  'دكتوراه في الكيمياء، مدربة معتمدة لطلاب الثانوية',    'مدرسة علوم',   '+201022222222'),
        ('omar_arabic',  $1, 'أ/ عمر الشافعي', 'معلم لغة عربية وأدب، حاصل على ماجستير في الأدب العربي','مدرس لغة عربية','+201033333333')
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `, [pass]);

    const teachers = teachersRes.rows;
    if (teachers.length === 0) {
      const existing = await client.query(
        "SELECT id, username FROM teachers WHERE username IN ('ahmed_math','sara_science','omar_arabic')"
      );
      teachers.push(...existing.rows);
    }

    // نجيب الـ admin أيضاً
    const adminRes = await client.query("SELECT id FROM teachers WHERE username='admin' LIMIT 1");
    const adminId = adminRes.rows[0]?.id;

    const tMap = {};
    for (const t of teachers) tMap[t.username] = t.id;
    // دعم الـ admin ضمن الخريطة
    if (adminId) tMap['admin'] = adminId;

    const T1 = tMap['ahmed_math']   || adminId;
    const T2 = tMap['sara_science'] || adminId;
    const T3 = tMap['omar_arabic']  || adminId;

    console.log('✅ المعلمون:', { T1, T2, T3 });

    // ─── 2. المساعدون ─────────────────────────────────────────────────────────
    const assistantsRes = await client.query(`
      INSERT INTO assistants (username, password, name, phone, teacher_id,
        can_add_students, can_edit_students, can_delete_students,
        can_manage_exams, can_view_analytics, can_send_reports,
        can_manage_payments, can_manage_courses)
      VALUES
        ('asst_nour',   $1, 'نور علي',    '+201044444444', $2, true,  true,  false, true,  true,  true,  true,  false),
        ('asst_karim',  $1, 'كريم حسن',   '+201055555555', $2, true,  true,  true,  true,  true,  true,  true,  true),
        ('asst_dina',   $1, 'دينا وليد',  '+201066666666', $3, true,  true,  false, false, true,  true,  false, false),
        ('asst_tarek',  $1, 'طارق عادل',  '+201077777777', $4, true,  true,  false, true,  true,  true,  true,  true)
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username
    `, [pass, T1, T2, T3]);

    let assistants = assistantsRes.rows;
    if (assistants.length === 0) {
      const ex = await client.query(
        "SELECT id, username FROM assistants WHERE username IN ('asst_nour','asst_karim','asst_dina','asst_tarek')"
      );
      assistants = ex.rows;
    }
    const aMap = {};
    for (const a of assistants) aMap[a.username] = a.id;
    const A1 = aMap['asst_nour']  || null;
    const A2 = aMap['asst_karim'] || null;
    console.log('✅ المساعدون:', aMap);

    // ─── 3. الطلاب ────────────────────────────────────────────────────────────
    const studentsData = [
      // طلاب المعلم 1 (رياضيات)
      ['student_ali',     'علي محمد رمضان',    '+201100000001', '+201100000002', 'الصف الثالث الثانوي', 'ذكر',   T1, 320],
      ['student_fatma',   'فاطمة أحمد سعد',    '+201100000003', '+201100000004', 'الصف الثاني الثانوي', 'أنثى',  T1, 280],
      ['student_youssef', 'يوسف إبراهيم كمال', '+201100000005', '+201100000006', 'الصف الثالث الثانوي', 'ذكر',   T1, 410],
      ['student_nada',    'ندى حسن عبد الله',  '+201100000007', '+201100000008', 'الصف الأول الثانوي',  'أنثى',  T1, 150],
      ['student_omar2',   'عمر سامي فرج',       '+201100000009', '+201100000010', 'الصف الثاني الثانوي', 'ذكر',   T1, 190],
      ['student_hana',    'هناء وليد منصور',    '+201100000011', '+201100000012', 'الصف الثالث الثانوي', 'أنثى',  T1, 360],
      ['student_mostafa', 'مصطفى علاء الدين',  '+201100000013', '+201100000014', 'الصف الأول الثانوي',  'ذكر',   T1, 90],
      ['student_rana',    'رنا طارق عبد العزيز','+201100000015', '+201100000016', 'الصف الثاني الثانوي', 'أنثى',  T1, 240],
      // طلاب المعلم 2 (علوم)
      ['student_adam',    'آدم محمود صالح',     '+201100000017', '+201100000018', 'الصف الثالث الثانوي', 'ذكر',   T2, 300],
      ['student_lina',    'لينا سعيد عيد',      '+201100000019', '+201100000020', 'الصف الثاني الثانوي', 'أنثى',  T2, 220],
      ['student_ziad',    'زياد أحمد مبارك',    '+201100000021', '+201100000022', 'الصف الثالث الثانوي', 'ذكر',   T2, 380],
      ['student_dalia',   'داليا رامي أبو زيد', '+201100000023', '+201100000024', 'الصف الأول الثانوي',  'أنثى',  T2, 110],
      // طلاب المعلم 3 (عربي)
      ['student_karim2',  'كريم ماهر توفيق',    '+201100000025', '+201100000026', 'الصف الثالث الثانوي', 'ذكر',   T3, 200],
      ['student_sara2',   'سارة خالد نجيب',     '+201100000027', '+201100000028', 'الصف الثاني الثانوي', 'أنثى',  T3, 260],
      ['student_amr',     'عمرو حامد رشاد',     '+201100000029', '+201100000030', 'الصف الأول الثانوي',  'ذكر',   T3, 130],
    ];

    const insertedStudents = [];
    for (const [uname, name, phone, pphone, stage, gender, tid, pts] of studentsData) {
      const r = await client.query(
        `INSERT INTO students (username,password,name,phone,parent_phone,academic_stage,gender,teacher_id,points)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (username) DO NOTHING RETURNING id`,
        [uname, pass, name, phone, pphone, stage, gender, tid, pts]
      );
      if (r.rows.length > 0) {
        insertedStudents.push({ id: r.rows[0].id, teacher_id: tid, username: uname });
      } else {
        const ex = await client.query('SELECT id,teacher_id FROM students WHERE username=$1', [uname]);
        if (ex.rows.length > 0) insertedStudents.push({ ...ex.rows[0], username: uname });
      }
    }
    console.log('✅ الطلاب:', insertedStudents.length);

    const studentsByTeacher = {};
    for (const s of insertedStudents) {
      if (!studentsByTeacher[s.teacher_id]) studentsByTeacher[s.teacher_id] = [];
      studentsByTeacher[s.teacher_id].push(s.id);
    }

    // ─── 4. الكورسات + الأقسام ───────────────────────────────────────────────
    // كورسات المعلم 1
    const c1 = await client.query(`
      INSERT INTO courses (name,description,price,teacher_id,target_stage)
      VALUES
        ('رياضيات الصف الثالث الثانوي - ترم أول','شرح شامل لمنهج الرياضيات الصف الثالث الثانوي الترم الأول بالكامل مع حل الامتحانات',350.00,$1,'الصف الثالث الثانوي'),
        ('رياضيات الصف الثاني الثانوي','منهج رياضيات الصف الثاني الثانوي كامل مع تدريبات وامتحانات',250.00,$1,'الصف الثاني الثانوي'),
        ('أساسيات الرياضيات للصف الأول','تأسيس قوي في الرياضيات للصف الأول الثانوي',200.00,$1,'الصف الأول الثانوي')
      RETURNING id
    `, [T1]);

    const [C1a, C1b, C1c] = c1.rows.map(r => r.id);

    // كورسات المعلم 2
    const c2 = await client.query(`
      INSERT INTO courses (name,description,price,teacher_id,target_stage)
      VALUES
        ('كيمياء الثانوية العامة','منهج الكيمياء للثانوية العامة مع تجارب وشرح مبسط',300.00,$1,'الصف الثالث الثانوي'),
        ('أحياء وفيزياء الصف الثاني','شرح شامل لمادتي الأحياء والفيزياء للصف الثاني الثانوي',280.00,$1,'الصف الثاني الثانوي')
      RETURNING id
    `, [T2]);

    const [C2a, C2b] = c2.rows.map(r => r.id);

    // كورسات المعلم 3
    const c3 = await client.query(`
      INSERT INTO courses (name,description,price,teacher_id,target_stage)
      VALUES
        ('لغة عربية الثانوية العامة','نحو وصرف وأدب وقراءة للصف الثالث الثانوي',200.00,$1,'الصف الثالث الثانوي'),
        ('مهارات التعبير الكتابي','تطوير مهارة الكتابة الإبداعية والموضوعية لجميع المراحل',150.00,$1,'الصف الثاني الثانوي')
      RETURNING id
    `, [T3]);

    const [C3a, C3b] = c3.rows.map(r => r.id);

    console.log('✅ الكورسات:', { C1a, C1b, C1c, C2a, C2b, C3a, C3b });

    // ─── 5. الأقسام (sections) ───────────────────────────────────────────────
    const secRes = await client.query(`
      INSERT INTO sections (course_id, title, sort_order) VALUES
        ($1,'الوحدة الأولى: المصفوفات والمحددات',1),
        ($1,'الوحدة الثانية: المتراجحات الخطية',2),
        ($1,'الوحدة الثالثة: الدوال والنهايات',3),
        ($2,'الوحدة الأولى: الهندسة الفراغية',1),
        ($2,'الوحدة الثانية: الإحصاء والاحتمالات',2),
        ($3,'الوحدة الأولى: الأعداد والعمليات',1),
        ($4,'الوحدة الأولى: الروابط الكيميائية',1),
        ($4,'الوحدة الثانية: التفاعلات الكيميائية',2),
        ($5,'الوحدة الأولى: الأحياء الدقيقة',1),
        ($6,'الوحدة الأولى: النحو والصرف',1),
        ($6,'الوحدة الثانية: الأدب العربي',2),
        ($7,'الوحدة الأولى: التعبير الوظيفي',1)
      RETURNING id, course_id
    `, [C1a, C1b, C1c, C2a, C2b, C3a, C3b]);

    const secByCourse = {};
    for (const s of secRes.rows) {
      if (!secByCourse[s.course_id]) secByCourse[s.course_id] = [];
      secByCourse[s.course_id].push(s.id);
    }

    // ─── 6. الفيديوهات ───────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO videos (title, file_path_or_url, duration_minutes, course_id, sort_order, section_id) VALUES
        ('مقدمة في المصفوفات','https://www.youtube.com/watch?v=example1',45,$1,1,$2),
        ('عمليات المصفوفات','https://www.youtube.com/watch?v=example2',50,$1,2,$2),
        ('المحددات وخصائصها','https://www.youtube.com/watch?v=example3',55,$1,3,$2),
        ('حل الأنظمة بالمصفوفات','https://www.youtube.com/watch?v=example4',60,$1,4,$2),
        ('المتراجحات الخطية','https://www.youtube.com/watch?v=example5',40,$1,5,$3),
        ('مقدمة النهايات','https://www.youtube.com/watch?v=example6',45,$1,6,$4),
        ('الهندسة الفراغية - مقدمة','https://www.youtube.com/watch?v=example7',50,$5,1,$6),
        ('المجسمات الهندسية','https://www.youtube.com/watch?v=example8',45,$5,2,$6),
        ('الإحصاء الوصفي','https://www.youtube.com/watch?v=example9',40,$5,3,$7),
        ('الروابط التساهمية','https://www.youtube.com/watch?v=example10',55,$8,1,$9),
        ('التفاعلات والمعادلات','https://www.youtube.com/watch?v=example11',50,$8,2,$10),
        ('النحو - الجملة الاسمية','https://www.youtube.com/watch?v=example12',45,$11,1,$12),
        ('الصرف - الميزان الصرفي','https://www.youtube.com/watch?v=example13',40,$11,2,$12),
        ('الأدب في العصر الجاهلي','https://www.youtube.com/watch?v=example14',60,$11,3,$13)
    `, [
      C1a,
      secByCourse[C1a]?.[0], secByCourse[C1a]?.[1], secByCourse[C1a]?.[2],
      C1b,
      secByCourse[C1b]?.[0], secByCourse[C1b]?.[1],
      C2a,
      secByCourse[C2a]?.[0], secByCourse[C2a]?.[1],
      C3a,
      secByCourse[C3a]?.[0], secByCourse[C3a]?.[1],
    ]);

    // نجيب IDs الفيديوهات
    const vidRes = await client.query('SELECT id, course_id FROM videos ORDER BY id');
    const videos = vidRes.rows;
    console.log('✅ الفيديوهات:', videos.length);

    // ─── 7. ملفات PDF ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO pdf_files (title, file_url, course_id) VALUES
        ('ملخص المصفوفات والمحددات','/uploads/pdf_matrices.pdf',$1),
        ('مسائل محلولة - رياضيات ثالثة ثانوي','/uploads/pdf_math_solutions.pdf',$1),
        ('امتحانات سابقة - رياضيات','/uploads/pdf_math_exams.pdf',$2),
        ('ملزمة الهندسة الفراغية','/uploads/pdf_geometry.pdf',$2),
        ('ملخص كيمياء الثانوية','/uploads/pdf_chemistry.pdf',$3),
        ('تجارب كيمياء عملية','/uploads/pdf_chemistry_lab.pdf',$3),
        ('قواعد النحو والصرف','/uploads/pdf_arabic_grammar.pdf',$4),
        ('نصوص أدبية مختارة','/uploads/pdf_arabic_literature.pdf',$4)
    `, [C1a, C1b, C2a, C3a]);

    console.log('✅ ملفات PDF أضيفت');

    // ─── 8. الامتحانات ───────────────────────────────────────────────────────
    // $1=C1a $2=C1b $3=C2a $4=C2b $5=C3a $6=T1 $7=T2 $8=T3
    const examRes = await client.query(`
      INSERT INTO exams (title, duration_minutes, total_score, course_id, teacher_id, pass_score, badge_name, badge_color, start_date, end_date)
      VALUES
        ('امتحان المصفوفات - الشهر الأول',    45, 100, $1, $6, 60, 'نجم المصفوفات',    '#FFD700', NOW()-INTERVAL'30 days', NOW()-INTERVAL'25 days'),
        ('امتحان نهاية الترم - رياضيات ثالثة', 90, 100, $1, $6, 65, 'متفوق الرياضيات', '#FF4500', NOW()-INTERVAL'10 days', NOW()-INTERVAL'5 days'),
        ('امتحان الهندسة الفراغية',             45, 100, $2, $6, 60, 'مهندس المستقبل',  '#4169E1', NOW()-INTERVAL'20 days', NOW()-INTERVAL'15 days'),
        ('امتحان الكيمياء - الوحدة الأولى',    60, 100, $3, $7, 60, 'عالم الكيمياء',   '#00CED1', NOW()-INTERVAL'15 days', NOW()-INTERVAL'10 days'),
        ('امتحان شامل للأحياء والفيزياء',       60, 100, $4, $7, 65, 'باحث علمي',       '#32CD32', NOW()-INTERVAL'5 days',  NOW()+INTERVAL'5 days'),
        ('امتحان النحو والصرف',                 45, 100, $5, $8, 55, 'فصيح اللغة',      '#9400D3', NOW()-INTERVAL'25 days', NOW()-INTERVAL'20 days'),
        ('امتحان الأدب العربي',                  60, 100, $5, $8, 60, 'أديب متميز',      '#DC143C', NOW()-INTERVAL'8 days',  NOW()-INTERVAL'3 days')
      RETURNING id
    `, [C1a, C1b, C2a, C2b, C3a, T1, T2, T3]);

    const [E1, E2, E3, E4, E5, E6, E7] = examRes.rows.map(r => r.id);
    console.log('✅ الامتحانات:', { E1, E2, E3, E4, E5, E6, E7 });

    // ─── 9. الأسئلة ──────────────────────────────────────────────────────────
    // امتحان 1: المصفوفات
    await client.query(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id, question_type) VALUES
        ('إذا كانت A مصفوفة من الرتبة 2×3 وB مصفوفة من الرتبة 3×2، فما رتبة حاصل ضرب AB؟','2×2','3×3','2×3','3×2','a',10,$1,'mcq'),
        ('ما قيمة محدد المصفوفة [[3,1],[2,4]]؟','10','14','11','8','a',10,$1,'mcq'),
        ('المصفوفة المنتقلة للمصفوفة A هي:','A نفسها','مرآة A أفقياً','قلب صفوف وأعمدة A','ضرب A في -1','c',10,$1,'mcq'),
        ('إذا كان det(A) = 0 فالمصفوفة A تسمى:','وحدانية','منفردة','قطرية','متعامدة','b',10,$1,'mcq'),
        ('ما ناتج ضرب المصفوفة [[1,0],[0,1]] في أي مصفوفة A؟','الصفر','A نفسها','مرفوعة للقوة 2','لا شيء','b',10,$1,'mcq'),
        ('ما خاصية توزيع الضرب على الجمع في المصفوفات؟','A(B+C)=AB+AC','A(B+C)=AB+C','A(B+C)=A+BC','لا توجد','a',10,$1,'mcq'),
        ('المصفوفة المعكوسة A⁻¹ موجودة إذا كان:','det(A)≠0','det(A)=0','A مربعة فقط','A قطرية','a',10,$1,'mcq'),
        ('ما رتبة مصفوفة الوحدة I₃؟','2×2','3×3','4×4','1×1','b',10,$1,'mcq'),
        ('إذا كانت A مصفوفة 3×3 فما عدد عناصرها؟','6','9','3','12','b',10,$1,'mcq'),
        ('ضرب مصفوفة في مقلوبها يساوي:','الصفر','مضاعف A','مصفوفة الوحدة','لا يمكن','c',10,$1,'mcq')
    `, [E1]);

    // امتحان 2: نهاية ترم رياضيات
    await client.query(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id, question_type) VALUES
        ('ما قيمة النهاية lim(x→2) (x²-4)/(x-2)؟','2','4','0','غير محددة','b',10,$1,'mcq'),
        ('الدالة f(x)=x²-3x+2 تساوي صفر عند:','x=1 و x=2','x=2 و x=3','x=0 و x=1','x=-1 و x=-2','a',10,$1,'mcq'),
        ('ما مشتقة الدالة f(x)=3x²+2x-5؟','6x+2','3x+2','6x-5','3x²+2','a',10,$1,'mcq'),
        ('متراجحة 2x-3 > 7 حلها هو:','x > 5','x < 5','x > 2','x < 2','a',10,$1,'mcq'),
        ('ما مساحة المثلث ذو القاعدة 6 والارتفاع 8؟','48','24','14','36','b',10,$1,'mcq'),
        ('ما قيمة sin(90°)؟','0','1','0.5','√2/2','b',10,$1,'mcq'),
        ('التقدم الحسابي: 2، 5، 8، 11، ... الحد العام هو:','3n-1','2n+1','3n+2','n+2','a',10,$1,'mcq'),
        ('مجموع زوايا المضلع الخماسي يساوي:','360°','540°','720°','180°','b',10,$1,'mcq'),
        ('ما قيمة log₁₀(1000)؟','2','3','4','10','b',10,$1,'mcq'),
        ('الاحتمال دائماً يقع في النطاق:','0 إلى 100','0 إلى 1','-1 إلى 1','1 إلى 10','b',10,$1,'mcq')
    `, [E2]);

    // امتحان 4: كيمياء
    await client.query(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id, question_type) VALUES
        ('الرابطة التساهمية تنشأ بمشاركة:','إلكترونات','بروتونات','نيوترونات','أيونات','a',10,$1,'mcq'),
        ('الصيغة الكيميائية للماء هي:','H₂O₂','H₂O','HO','H₃O','b',10,$1,'mcq'),
        ('الرقم الهيدروجيني للمحلول المتعادل يساوي:','0','7','14','10','b',10,$1,'mcq'),
        ('في التفاعل: 2H₂+O₂→2H₂O نوع التفاعل:','تحلل','اتحاد','إزاحة','تبادل','b',10,$1,'mcq'),
        ('الكتلة المولية لثاني أكسيد الكربون CO₂:','28','44','32','56','b',10,$1,'mcq'),
        ('عدد البروتونات في النيتروجين (N, Z=7):','7','14','5','3','a',10,$1,'mcq'),
        ('قانون حفظ الكتلة ينص على:','الكتلة تتضاعف','الكتلة لا تفنى ولا تستحدث','الكتلة تتناقص','لا علاقة','b',10,$1,'mcq'),
        ('الأكسدة تعني:','اكتساب إلكترونات','فقدان بروتونات','فقدان إلكترونات','اكتساب نيوترونات','c',10,$1,'mcq'),
        ('المذيب الكوني هو:','الكحول','البنزين','الماء','الأسيتون','c',10,$1,'mcq'),
        ('درجة انصهار الحديد تقريباً:','500°م','1000°م','1538°م','3000°م','c',10,$1,'mcq')
    `, [E4]);

    // امتحان 6: النحو والصرف
    await client.query(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id, question_type) VALUES
        ('في جملة "جاء الطالبُ" كلمة "الطالب" إعرابها:','مفعول به','فاعل مرفوع','مبتدأ','خبر','b',10,$1,'mcq'),
        ('المفعول به في "أكل محمد التفاحة":','محمد','أكل','التفاحة','لا يوجد','c',10,$1,'mcq'),
        ('الفعل الماضي من "يكتب" هو:','اكتب','كتب','كاتب','مكتوب','b',10,$1,'mcq'),
        ('جمع كلمة "كتاب" هو:','كتابات','أكتب','كتب','كاتبون','c',10,$1,'mcq'),
        ('المثنى يُعرب بالألف في حالة:','الرفع','النصب','الجر','النصب والجر','a',10,$1,'mcq'),
        ('المصدر من الفعل "درس" هو:','دارس','مدروس','دراسة','يدرس','c',10,$1,'mcq'),
        ('"الصدق منجاة" إعراب "الصدق":','فاعل','مبتدأ','خبر','مفعول به','b',10,$1,'mcq'),
        ('علامة نصب الاسم المفرد:','الكسرة','الضمة','الفتحة','السكون','c',10,$1,'mcq'),
        ('الفاعل دائماً يكون:','منصوباً','مجروراً','مرفوعاً','مجزوماً','c',10,$1,'mcq'),
        ('النعت يتبع منعوته في:','العدد فقط','الجنس فقط','الإعراب والجنس والعدد والتعريف','الإعراب فقط','c',10,$1,'mcq')
    `, [E6]);

    // امتحان 7: الأدب
    await client.query(`
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer_letter, points, exam_id, question_type) VALUES
        ('أشهر شعراء المعلقات هو:','المتنبي','امرؤ القيس','أبو تمام','البحتري','b',10,$1,'mcq'),
        ('العصر الذهبي للأدب العربي هو:','الأموي','العباسي','الجاهلي','الحديث','b',10,$1,'mcq'),
        ('صاحب كتاب "الأغاني":','الجاحظ','أبو الفرج الأصفهاني','ابن رشيق','المبرد','b',10,$1,'mcq'),
        ('الشعر الجاهلي يمتد تقريباً:','100 سنة قبل الإسلام','150 سنة قبل الإسلام','200 سنة قبل الإسلام','50 سنة','b',10,$1,'mcq'),
        ('من أغراض الشعر الجاهلي:','الرثاء والمدح والهجاء','الشعر الديني','قصيدة النثر','الرواية','a',10,$1,'mcq'),
        ('الأدب المهجري ظهر في:','مصر','المغرب','الأمريكتين','الخليج','c',10,$1,'mcq'),
        ('جبران خليل جبران من رواد:','الشعر الكلاسيكي','الأدب المهجري','الرواية العربية','المسرح','b',10,$1,'mcq'),
        ('القصيدة العمودية تلتزم بـ:','الوزن والقافية','القافية فقط','الوزن فقط','لا شيء','a',10,$1,'mcq'),
        ('المتنبي عاش في العصر:','الجاهلي','الأموي','العباسي','الحديث','c',10,$1,'mcq'),
        ('"وقفنا وبكينا" شطر من معلقة:','طرفة بن العبد','امرؤ القيس','زهير بن أبي سلمى','عنترة','b',10,$1,'mcq')
    `, [E7]);

    console.log('✅ الأسئلة أضيفت');

    // ─── 10. الالتحاق بالكورسات ──────────────────────────────────────────────
    // طلاب T1 → C1a, C1b
    const enrollments = [];
    const t1Students = studentsByTeacher[T1] || [];
    const t2Students = studentsByTeacher[T2] || [];
    const t3Students = studentsByTeacher[T3] || [];

    for (const sid of t1Students) {
      enrollments.push([sid, C1a, 'active']);
      enrollments.push([sid, C1b, 'active']);
      if (Math.random() > 0.4) enrollments.push([sid, C1c, 'active']);
    }
    for (const sid of t2Students) {
      enrollments.push([sid, C2a, 'active']);
      enrollments.push([sid, C2b, 'active']);
    }
    for (const sid of t3Students) {
      enrollments.push([sid, C3a, 'active']);
      if (Math.random() > 0.5) enrollments.push([sid, C3b, 'active']);
    }

    for (const [sid, cid, status] of enrollments) {
      await client.query(
        'INSERT INTO student_course_enrollment (student_id,course_id,status) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [sid, cid, status]
      );
    }
    console.log('✅ تسجيل الكورسات:', enrollments.length);

    // ─── 11. نتائج الامتحانات ─────────────────────────────────────────────────
    const resultData = [
      // E1 المصفوفات
      ...t1Students.slice(0, 6).map((sid, i) => {
        const scores = [90, 75, 85, 60, 95, 70];
        const correct = Math.round(scores[i] / 10);
        return [sid, E1, scores[i], correct, 10 - correct, 0,
          new Date(Date.now() - 28*86400000), new Date(Date.now() - 28*86400000 + 45*60000),
          scores[i] >= 60 ? Math.round(scores[i] / 5) : 0];
      }),
      // E2 نهاية ترم
      ...t1Students.slice(0, 8).map((sid, i) => {
        const scores = [88, 72, 91, 55, 97, 66, 80, 74];
        const correct = Math.round(scores[i] / 10);
        return [sid, E2, scores[i], correct, 10 - correct, 0,
          new Date(Date.now() - 8*86400000), new Date(Date.now() - 8*86400000 + 90*60000),
          scores[i] >= 65 ? Math.round(scores[i] / 5) : 0];
      }),
      // E4 كيمياء
      ...t2Students.map((sid, i) => {
        const scores = [78, 85, 92, 61];
        const sc = scores[i] || 70;
        const correct = Math.round(sc / 10);
        return [sid, E4, sc, correct, 10 - correct, 0,
          new Date(Date.now() - 12*86400000), new Date(Date.now() - 12*86400000 + 60*60000),
          sc >= 60 ? Math.round(sc / 5) : 0];
      }),
      // E6 نحو
      ...t3Students.map((sid, i) => {
        const scores = [82, 68, 55];
        const sc = scores[i] || 65;
        const correct = Math.round(sc / 10);
        return [sid, E6, sc, correct, 10 - correct, 0,
          new Date(Date.now() - 22*86400000), new Date(Date.now() - 22*86400000 + 45*60000),
          sc >= 55 ? Math.round(sc / 5) : 0];
      }),
      // E7 أدب
      ...t3Students.slice(0, 2).map((sid, i) => {
        const scores = [88, 74];
        const sc = scores[i];
        const correct = Math.round(sc / 10);
        return [sid, E7, sc, correct, 10 - correct, 0,
          new Date(Date.now() - 5*86400000), new Date(Date.now() - 5*86400000 + 60*60000),
          sc >= 60 ? Math.round(sc / 5) : 0];
      }),
    ];

    for (const [sid, eid, score, correct, wrong, unans, start, end, pts] of resultData) {
      const answers = {};
      for (let q = 1; q <= 10; q++) answers[q] = q <= correct ? 'a' : 'b';
      await client.query(
        `INSERT INTO exam_results (student_id,exam_id,score,correct_count,wrong_count,unanswered_count,start_time,end_time,answers,points_earned,essay_graded)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)`,
        [sid, eid, score, correct, wrong, unans, start, end, JSON.stringify(answers), pts]
      );
    }
    console.log('✅ نتائج الامتحانات:', resultData.length);

    // ─── 12. الشارات (Badges) ────────────────────────────────────────────────
    // للطلاب الذين حصلوا على 60% أو أكثر في امتحانات ذات شارة
    const passedResults = await client.query(`
      SELECT er.student_id, er.exam_id, e.badge_name, e.badge_color
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      WHERE er.score >= e.pass_score AND e.badge_name IS NOT NULL
    `);
    for (const r of passedResults.rows) {
      await client.query(
        'INSERT INTO badges (student_id,exam_id,badge_name,badge_color) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [r.student_id, r.exam_id, r.badge_name, r.badge_color]
      );
    }
    console.log('✅ الشارات:', passedResults.rows.length);

    // ─── 13. تقدم مشاهدة الفيديوهات ──────────────────────────────────────────
    for (const s of insertedStudents) {
      const courseVids = videos.filter(v => {
        if (s.teacher_id === T1) return [C1a, C1b, C1c].includes(v.course_id);
        if (s.teacher_id === T2) return [C2a, C2b].includes(v.course_id);
        if (s.teacher_id === T3) return [C3a, C3b].includes(v.course_id);
        return false;
      });
      for (const v of courseVids) {
        const pct = Math.floor(Math.random() * 101);
        const mins = Math.floor(pct * 0.45);
        await client.query(
          `INSERT INTO video_progress (student_id,video_id,watch_count,watched_minutes,progress_percentage)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT (student_id,video_id) DO NOTHING`,
          [s.id, v.id, Math.ceil(pct / 40), mins, pct]
        );
      }
    }
    console.log('✅ تقدم الفيديوهات');

    // ─── 14. المدفوعات ───────────────────────────────────────────────────────
    const paymentRows = [
      ...t1Students.map((sid, i) => [sid, C1a, 350.00, 'vodafone_cash', 'completed', `VC${1000+i}`, A1]),
      ...t1Students.slice(0, 5).map((sid, i) => [sid, C1b, 250.00, 'instapay',     'completed', `IP${2000+i}`, A2]),
      ...t1Students.slice(5).map((sid, i) =>   [sid, C1b, 250.00, 'vodafone_cash', 'pending',   null,          null]),
      ...t2Students.map((sid, i) => [sid, C2a, 300.00, 'instapay',     'completed', `IP${3000+i}`, A1]),
      ...t2Students.slice(0, 2).map((sid, i) => [sid, C2b, 280.00, 'vodafone_cash','completed', `VC${4000+i}`, null]),
      ...t3Students.map((sid, i) => [sid, C3a, 200.00, 'vodafone_cash', i < 2 ? 'completed' : 'pending', i < 2 ? `VC${5000+i}` : null, null]),
    ];

    for (const [sid, cid, amount, method, status, ref, verifiedBy] of paymentRows) {
      await client.query(
        `INSERT INTO payments (student_id,course_id,amount,method,status,reference_number,verified_by,verified_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [sid, cid, amount, method, status, ref, verifiedBy, status === 'completed' ? new Date() : null]
      );
    }
    console.log('✅ المدفوعات:', paymentRows.length);

    // ─── 15. سجل الإشعارات ───────────────────────────────────────────────────
    const notifRows = [
      [T1, t1Students[0], '+201100000001', 'student', 'مبروك! لقد اجتزت امتحان المصفوفات بنجاح وحصلت على شارة نجم المصفوفات 🌟', 'exam_result', false],
      [T1, t1Students[1], '+201100000003', 'student', 'تذكير: موعد امتحان نهاية الترم بعد 3 أيام، استعد جيداً', 'reminder', false],
      [T1, t1Students[2], '+201100000005', 'student', 'أحسنت! حصلت على أعلى درجة في امتحان المصفوفات 🏆', 'exam_result', true],
      [T1, t1Students[0], '+201100000002', 'parent',  'نود إعلامكم أن ابنكم اجتاز امتحان رياضيات الشهر الأول بدرجة 90%', 'parent_report', true],
      [T2, t2Students[0], '+201100000017', 'student', 'تم قبول تسجيلك في كورس كيمياء الثانوية العامة', 'enrollment', true],
      [T2, t2Students[1], '+201100000019', 'student', 'نتيجتك في امتحان الكيمياء: 85 درجة. بكل فخر وتقدير', 'exam_result', false],
      [T3, t3Students[0], '+201100000025', 'student', 'مبروك! اجتزت امتحان النحو والصرف بتفوق 🎉', 'exam_result', false],
      [T3, t3Students[1], '+201100000027', 'student', 'تذكير بموعد امتحان الأدب العربي يوم الخميس القادم', 'reminder', false],
    ];

    for (const [tid, sid, phone, rtype, msg, type, isRead] of notifRows) {
      await client.query(
        `INSERT INTO notification_log (teacher_id,student_id,recipient_phone,recipient_type,message,type,is_read)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [tid, sid, phone, rtype, msg, type, isRead]
      );
    }
    console.log('✅ الإشعارات:', notifRows.length);

    // ─── 16. طلبات الالتحاق المعلقة ──────────────────────────────────────────
    // نضيف بعض طلبات الانتساب المعلقة للكورسات
    if (t1Students.length > 0 && C1c) {
      await client.query(
        `INSERT INTO course_enrollment_requests (student_id,course_id,status,message) VALUES ($1,$2,'pending','أريد الالتحاق بهذا الكورس') ON CONFLICT DO NOTHING`,
        [t1Students[t1Students.length - 1], C1c]
      );
    }
    if (t2Students.length > 1 && C2b) {
      await client.query(
        `INSERT INTO course_enrollment_requests (student_id,course_id,status,message) VALUES ($1,$2,'pending','أرجو قبول طلب انتسابي') ON CONFLICT DO NOTHING`,
        [t2Students[1], C2b]
      );
    }
    console.log('✅ طلبات الانتساب أضيفت');

    console.log('\n🎉 تم إدخال جميع البيانات التجريبية بنجاح!');
    console.log('─────────────────────────────────────────');
    console.log('بيانات الدخول:');
    console.log('المعلم 1: ahmed_math / 123456');
    console.log('المعلم 2: sara_science / 123456');
    console.log('المعلم 3: omar_arabic / 123456');
    console.log('المساعد: asst_nour / 123456');
    console.log('الطلاب: student_ali, student_fatma, ... / 123456');
    console.log('─────────────────────────────────────────');

  } catch (err) {
    console.error('❌ خطأ:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
