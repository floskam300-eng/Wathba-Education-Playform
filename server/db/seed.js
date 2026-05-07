require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 بدء إضافة البيانات التجريبية...\n');
    await client.query('BEGIN');

    const hash = await bcrypt.hash('123456', 10);

    // ───── 1. التحقق من المعلم الافتراضي ─────
    const teacherRes = await client.query("SELECT id FROM teachers WHERE username='admin' LIMIT 1");
    const teacherId = teacherRes.rows[0].id;
    console.log(`✅ المعلم: admin (id=${teacherId})`);

    // ───── 2. المساعدون ─────
    await client.query(`
      INSERT INTO assistants (username,password,name,phone,teacher_id,can_add_students,can_edit_students,can_delete_students,can_manage_exams,can_view_analytics,can_send_reports)
      VALUES
        ('ahmed_assist','${hash}','أحمد علي','01112223334',${teacherId},true,true,false,true,true,true),
        ('sara_assist','${hash}','سارة محمود','01223334445',${teacherId},true,true,true,false,true,false),
        ('omar_assist','${hash}','عمر فاروق','01334445556',${teacherId},true,false,false,true,false,true)
      ON CONFLICT (username) DO NOTHING
    `);
    console.log('✅ تمت إضافة 3 مساعدين');

    // ───── 3. الطلاب (20 طالب) ─────
    const students = [
      ['st_mohammed','محمد خالد','01001112223','01009998887','الصف الثالث الثانوي','ذكر',340],
      ['st_mona','منى أحمد','01004445556','01007776665','الصف الثالث الثانوي','أنثى',420],
      ['st_omar','عمر حسن','01002223334','01003332221','الصف الثاني الثانوي','ذكر',180],
      ['st_nour','نور محمود','01556667778','01545556667','الصف الثالث الثانوي','أنثى',510],
      ['st_kareem','كريم سامي','01667778889','01656667778','الصف الأول الثانوي','ذكر',90],
      ['st_hana','هناء رضا','01778889990','01767778889','الصف الثاني الثانوي','أنثى',270],
      ['st_youssef','يوسف طارق','01889990001','01878889990','الصف الثالث الثانوي','ذكر',450],
      ['st_rana','رنا عصام','01990001112','01989990001','الصف الثاني الثانوي','أنثى',200],
      ['st_hassan','حسن عبدالله','01100001112','01109990001','الصف الأول الثانوي','ذكر',60],
      ['st_dina','دينا فريد','01211112223','01200001112','الصف الثالث الثانوي','أنثى',380],
      ['st_ahmed2','أحمد مصطفى','01322223334','01311112223','الصف الأول الإعدادي','ذكر',30],
      ['st_layla','ليلى يحيى','01433334445','01422223334','الصف الثاني الإعدادي','أنثى',110],
      ['st_samer','سامر وليد','01544445556','01533334445','الصف الثالث الإعدادي','ذكر',155],
      ['st_reem','ريم كمال','01655556667','01644445556','الصف الثالث الثانوي','أنثى',295],
      ['st_tamer','تامر جابر','01766667778','01755556667','الصف الثاني الثانوي','ذكر',175],
      ['st_amira','أميرة صلاح','01877778889','01866667778','الصف الأول الثانوي','أنثى',85],
      ['st_fady','فادي نبيل','01988889990','01977778889','الصف الثالث الثانوي','ذكر',490],
      ['st_mai','مي حسام','01099990001','01088889990','الصف الثاني الإعدادي','أنثى',130],
      ['st_ziad','زياد رامي','01210001112','01209990001','الصف الأول الثانوي','ذكر',55],
      ['st_nadia','نادية سعد','01321112223','01310001112','الصف الثالث الثانوي','أنثى',360],
    ];

    const studentIds = [];
    for (const [username, name, phone, parent_phone, stage, gender, points] of students) {
      const res = await client.query(`
        INSERT INTO students (username,password,name,phone,parent_phone,academic_stage,gender,teacher_id,points)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (username) DO UPDATE SET points=EXCLUDED.points
        RETURNING id
      `, [username, hash, name, phone, parent_phone, stage, gender, teacherId, points]);
      studentIds.push(res.rows[0].id);
    }
    console.log(`✅ تمت إضافة ${studentIds.length} طالب`);

    // ───── 4. الكورسات ─────
    const courses = [
      ['دورة الفيزياء الحديثة','شرح شامل لوحدة الفيزياء الحديثة لطلاب الثانوية — نظرية الكم، التأثير الكهروضوئي، والنسبية',500,'الصف الثالث الثانوي'],
      ['أساسيات الكيمياء العضوية','كورس مكثف في الكيمياء العضوية — الهيدروكربونات، المجموعات الوظيفية، والتفاعلات',450,'الصف الثالث الثانوي'],
      ['الرياضيات للصف الثاني الثانوي','حساب المثلثات، الجبر، وحساب التفاضل والتكامل بأسلوب مبسط',400,'الصف الثاني الثانوي'],
      ['الأحياء للصف الأول الثانوي','الخلية وعلم الوراثة والتنوع البيولوجي مع شرح مفصل لكل وحدة',350,'الصف الأول الثانوي'],
      ['الجيولوجيا والعلوم البيئية','دراسة طبقات الأرض والموارد الطبيعية وحماية البيئة',300,'الصف الثاني الإعدادي'],
    ];

    const courseIds = [];
    for (const [name, description, price, target_stage] of courses) {
      const res = await client.query(`
        INSERT INTO courses (name,description,price,teacher_id,target_stage)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [name, description, price, teacherId, target_stage]);
      if (res.rows.length) courseIds.push(res.rows[0].id);
    }
    console.log(`✅ تمت إضافة ${courseIds.length} كورس`);

    // ───── 5. الفيديوهات ─────
    const videos = [
      ['مقدمة في الفيزياء الحديثة','https://youtu.be/example1',45,0],
      ['ظاهرة التأثير الكهروضوئي','https://youtu.be/example2',60,1],
      ['نظرية الكم وتطبيقاتها','https://youtu.be/example3',55,2],
      ['مدخل للكيمياء العضوية','https://youtu.be/example4',30,1],
      ['الهيدروكربونات المشبعة','https://youtu.be/example5',50,2],
      ['حساب المثلثات - أساسيات','https://youtu.be/example6',40,1],
    ];
    for (const [title, url, dur, order] of videos.slice(0,2)) {
      if (courseIds[0]) await client.query('INSERT INTO videos (title,file_path_or_url,duration_minutes,course_id,sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [title, url, dur, courseIds[0], order+1]);
    }
    for (const [title, url, dur, order] of videos.slice(2,4)) {
      if (courseIds[1]) await client.query('INSERT INTO videos (title,file_path_or_url,duration_minutes,course_id,sort_order) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING', [title, url, dur, courseIds[1], order+1]);
    }
    console.log('✅ تمت إضافة الفيديوهات');

    // ───── 6. ملفات PDF ─────
    const pdfs = [
      ['ملخص قوانين الفيزياء الحديثة','https://example.com/physics.pdf',0],
      ['أوراق عمل التأثير الكهروضوئي','https://example.com/photo.pdf',0],
      ['شيت أسئلة الكيمياء العضوية','https://example.com/chem.pdf',1],
      ['مراجعة نهائية - الرياضيات','https://example.com/math.pdf',2],
    ];
    for (const [title, url, cidx] of pdfs) {
      if (courseIds[cidx]) await client.query('INSERT INTO pdf_files (title,file_url,course_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [title, url, courseIds[cidx]]);
    }
    console.log('✅ تمت إضافة ملفات PDF');

    // ───── 7. الاختبارات ─────
    const exams = [
      ['امتحان الفيزياء الحديثة الشامل',60,100,60,'عبقري الفيزياء','#FFD700',0],
      ['اختبار التأثير الكهروضوئي',45,50,30,'فيزيائي متميز','#C0C0C0',0],
      ['امتحان الكيمياء العضوية الأول',30,50,30,'كيميائي متميز','#CD7F32',1],
      ['اختبار الهيدروكربونات',40,60,36,'نجم الكيمياء','#10b981',1],
      ['امتحان الرياضيات الشهري',50,100,60,'رياضي ماهر','#6366f1',2],
      ['اختبار قصير - المثلثات',20,30,18,'بطل المثلثات','#f59e0b',2],
    ];

    const examIds = [];
    for (const [title, dur, total, pass, badge, color, cidx] of exams) {
      const cid = courseIds[cidx] || null;
      const res = await client.query(`
        INSERT INTO exams (title,duration_minutes,total_score,course_id,teacher_id,pass_score,badge_name,badge_color)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT DO NOTHING RETURNING id
      `, [title, dur, total, cid, teacherId, pass, badge, color]);
      if (res.rows.length) examIds.push({ id: res.rows[0].id, total, pass });
    }
    console.log(`✅ تمت إضافة ${examIds.length} اختبار`);

    // ───── 8. الأسئلة ─────
    if (examIds[0]) {
      const qs = [
        ['من وضع نظرية الكم؟','ماكس بلانك','ألبرت أينشتاين','إسحاق نيوتن','نيلز بور','A',10],
        ['ما وحدة قياس تردد الموجة؟','الهرتز','الجول','الواط','الفاراد','A',10],
        ['ما ظاهرة انبعاث الإلكترونات من المعادن بتأثير الضوء؟','التأثير الكهروضوئي','الانكسار','التحلل الضوئي','الحيود','A',10],
        ['ما قيمة سرعة الضوء في الفراغ؟','3×10⁸ م/ث','3×10⁶ م/ث','3×10¹⁰ م/ث','3×10⁴ م/ث','A',10],
        ['الفوتون هو...','جسيم من الضوء','جسيم نووي','موجة مائية','جزيء هواء','A',10],
        ['ما مبدأ هايزنبرغ؟','عدم التحديد','التناظر','الحفظ','الطاقة','A',10],
        ['طاقة الفوتون تتناسب طردياً مع...','التردد','الطول الموجي','الكتلة','الحجم','A',10],
        ['ما أول نموذج للذرة؟','نموذج طومسون','نموذج بور','نموذج رذرفورد','نموذج شرودنجر','A',10],
        ['الأشعة السينية اكتشفها...','رونتجن','ماري كوري','فاراداي','تسلا','A',10],
        ['وحدة قياس الشغل هي...','الجول','الواط','النيوتن','الباسكال','A',10],
      ];
      for (const [qt, a, b, c, d, correct, pts] of qs) {
        await client.query('INSERT INTO questions (question_text,option_a,option_b,option_c,option_d,correct_answer_letter,points,exam_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
          [qt, a, b, c, d, correct, pts, examIds[0].id]);
      }
    }
    if (examIds[2]) {
      const qs2 = [
        ['الهيدروكربونات المشبعة تسمى؟','الألكانات','الألكينات','الألكاينات','الأرينات','A',10],
        ['ما صيغة الميثان؟','CH₄','C₂H₆','C₃H₈','C₄H₁₀','A',10],
        ['رابطة C=C توجد في؟','الألكينات','الألكانات','الألكاينات','الأرينات','A',10],
        ['البنزين C₆H₆ مثال على؟','الأرينات','الألكانات','الألكينات','الكحولات','A',10],
        ['الكحول الإيثيلي صيغته؟','C₂H₅OH','CH₃OH','C₃H₇OH','C₄H₉OH','A',10],
      ];
      for (const [qt, a, b, c, d, correct, pts] of qs2) {
        await client.query('INSERT INTO questions (question_text,option_a,option_b,option_c,option_d,correct_answer_letter,points,exam_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING',
          [qt, a, b, c, d, correct, pts, examIds[2].id]);
      }
    }
    console.log('✅ تمت إضافة الأسئلة');

    // ───── 9. التسجيل في الكورسات ─────
    const enrollments = [
      [0,0],[0,2],[1,0],[1,1],[1,2],[2,2],[3,0],[3,2],
      [4,0],[4,1],[5,2],[6,0],[6,2],[7,2],[8,3],[9,0],
      [9,1],[10,4],[11,4],[12,4],[13,0],[13,2],[14,2],
      [15,3],[16,0],[16,2],[17,4],[18,3],[19,0],[19,2],
    ];
    for (const [si, ci] of enrollments) {
      if (studentIds[si] && courseIds[ci]) {
        await client.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [studentIds[si], courseIds[ci]]);
      }
    }
    console.log('✅ تمت إضافة التسجيلات في الكورسات');

    // ───── 10. نتائج الاختبارات (واقعية) ─────
    const now = new Date();
    const results = [
      // [student_idx, exam_idx, score, correct, wrong, unanswered, daysAgo]
      [0,0,90,9,1,0,2],[0,1,44,8,2,0,5],[0,2,38,4,1,0,8],
      [1,0,100,10,0,0,1],[1,1,48,9,1,0,4],[1,2,46,5,0,0,7],
      [2,2,60,3,1,1,3],[2,4,78,7,2,1,6],
      [3,0,80,8,2,0,2],[3,2,42,4,1,0,4],[3,4,88,8,1,1,9],
      [4,3,45,4,0,1,5],[4,5,24,7,2,1,10],
      [5,2,35,3,2,0,3],[5,4,64,6,3,1,7],
      [6,0,95,9,0,1,1],[6,1,46,9,1,0,3],[6,2,45,5,0,0,6],
      [7,2,30,3,2,0,4],[7,4,70,7,2,1,8],
      [8,3,55,5,2,3,5],[8,5,18,5,4,1,11],
      [9,0,70,7,3,0,2],[9,1,40,7,3,0,5],
      [10,4,50,4,4,2,6],[11,4,66,6,3,1,7],
      [12,4,58,5,3,2,8],[13,0,85,8,1,1,3],[13,2,40,4,1,0,6],
      [14,2,32,3,2,0,5],[14,4,74,7,1,2,9],
      [15,3,62,6,3,1,4],[15,5,27,8,1,1,10],
      [16,0,88,8,1,1,1],[16,2,44,4,1,0,3],[16,1,42,8,2,0,5],
      [17,4,48,4,5,1,7],[18,3,58,5,3,2,8],[18,5,21,6,3,1,12],
      [19,0,92,9,1,0,2],[19,2,46,4,1,0,4],[19,4,82,8,1,1,6],
    ];

    let insertedResults = 0;
    for (const [si, ei, score, correct, wrong, unanswered, daysAgo] of results) {
      const sid = studentIds[si];
      const eid = examIds[ei]?.id;
      if (!sid || !eid) continue;
      const dt = new Date(now); dt.setDate(dt.getDate() - daysAgo);
      const pointsEarned = score >= (examIds[ei]?.pass || 0) ? Math.round(score * 0.5) : 0;
      await client.query(`
        INSERT INTO exam_results (student_id,exam_id,score,correct_count,wrong_count,unanswered_count,points_earned,start_time,end_time,created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT DO NOTHING
      `, [sid, eid, score, correct, wrong, unanswered, pointsEarned, dt, dt, dt]);
      insertedResults++;
    }
    console.log(`✅ تمت إضافة ${insertedResults} نتيجة اختبار`);

    // ───── 11. الشارات ─────
    const badges = [
      [1,0,'عبقري الفيزياء','#FFD700'],
      [3,0,'عبقري الفيزياء','#FFD700'],
      [6,0,'عبقري الفيزياء','#FFD700'],
      [16,0,'عبقري الفيزياء','#FFD700'],
      [19,0,'عبقري الفيزياء','#FFD700'],
      [1,1,'فيزيائي متميز','#C0C0C0'],
      [6,1,'فيزيائي متميز','#C0C0C0'],
      [0,2,'كيميائي متميز','#CD7F32'],
    ];
    for (const [si, ei, badge_name, badge_color] of badges) {
      const sid = studentIds[si];
      const eid = examIds[ei]?.id;
      if (!sid || !eid) continue;
      await client.query('INSERT INTO badges (student_id,exam_id,badge_name,badge_color) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [sid, eid, badge_name, badge_color]);
    }
    console.log('✅ تمت إضافة الشارات');

    // ───── 12. المدفوعات ─────
    const payments = [
      [0,0,500,'فودافون كاش','verified'],[0,2,400,'إنستاباي','verified'],
      [1,0,500,'فودافون كاش','verified'],[1,1,450,'إنستاباي','verified'],[1,2,400,'كاش','pending'],
      [2,2,400,'فودافون كاش','verified'],[3,0,500,'كاش','verified'],[3,2,400,'فودافون كاش','pending'],
      [4,3,350,'إنستاباي','verified'],[5,2,400,'كاش','verified'],
      [6,0,500,'فودافون كاش','verified'],[6,2,400,'إنستاباي','verified'],
      [7,2,400,'كاش','pending'],[8,3,350,'فودافون كاش','verified'],
      [9,0,500,'إنستاباي','verified'],[10,4,300,'كاش','verified'],
      [11,4,300,'فودافون كاش','verified'],[12,4,300,'إنستاباي','pending'],
      [13,0,500,'كاش','verified'],[14,2,400,'فودافون كاش','verified'],
      [15,3,350,'إنستاباي','verified'],[16,0,500,'كاش','verified'],
      [17,4,300,'فودافون كاش','verified'],[18,3,350,'إنستاباي','verified'],
      [19,0,500,'كاش','verified'],[19,2,400,'فودافون كاش','pending'],
    ];
    for (const [si, ci, amount, method, status] of payments) {
      const sid = studentIds[si]; const cid = courseIds[ci];
      if (!sid || !cid) continue;
      await client.query('INSERT INTO payments (student_id,course_id,amount,method,status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [sid, cid, amount, method, status]);
    }
    console.log(`✅ تمت إضافة ${payments.length} عملية دفع`);

    await client.query('COMMIT');
    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log('\n📋 ملخص البيانات:');
    console.log('   - المعلم: admin / admin123');
    console.log('   - المساعدون: ahmed_assist, sara_assist, omar_assist (كلمة المرور: 123456)');
    console.log('   - الطلاب: st_mohammed, st_mona, st_omar ... إلخ (كلمة المرور: 123456)');
    console.log('   - 5 كورسات، 6 اختبارات، 20 طالب، 3 مساعدين');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ خطأ:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
