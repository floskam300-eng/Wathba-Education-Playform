require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db/connection');

async function seed() {
  console.log('🌱 بدء إضافة البيانات التجريبية الشاملة...');
  const hash = async (p) => bcrypt.hash(p, 10);

  // ── 1. تحديث بروفايل المعلم الافتراضي ──────────────────────────
  await pool.query(`
    UPDATE teachers SET
      name = 'أ/ أحمد السيد حسن',
      bio  = 'مدرس رياضيات خبرة 15 سنة · متخصص في الثانوية العامة · أكثر من 2000 طالب تخرجوا على يديه',
      classification = 'مدرس رياضيات — ثانوي وإعدادي',
      whatsapp_phone = '+201001234567'
    WHERE username = 'admin'
  `);
  const teacherRes = await pool.query("SELECT id FROM teachers WHERE username='admin'");
  const T = teacherRes.rows[0].id;
  console.log('✅ المعلم id:', T);

  // ── 2. المساعدون ─────────────────────────────────────────────────
  const asst1 = await pool.query(`
    INSERT INTO assistants
      (username,password,name,phone,teacher_id,
       can_add_students,can_edit_students,can_delete_students,
       can_manage_exams,can_view_analytics,can_send_reports,
       can_manage_payments,can_manage_courses)
    VALUES($1,$2,$3,$4,$5,true,true,false,true,true,true,true,true)
    ON CONFLICT(username) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    ['sara_asst', await hash('123456'), 'سارة محمود — مساعدة أولى', '01112345678', T]
  );
  const asst2 = await pool.query(`
    INSERT INTO assistants
      (username,password,name,phone,teacher_id,
       can_add_students,can_edit_students,can_delete_students,
       can_manage_exams,can_view_analytics,can_send_reports,
       can_manage_payments,can_manage_courses)
    VALUES($1,$2,$3,$4,$5,true,true,false,false,true,false,true,false)
    ON CONFLICT(username) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
    ['omar_asst', await hash('123456'), 'عمر خالد — مساعد مدفوعات', '01223456789', T]
  );
  const A1 = asst1.rows[0].id;
  console.log('✅ المساعدون:', A1, asst2.rows[0].id);

  // ── 3. الطلاب (30 طالب) ──────────────────────────────────────────
  const studentRows = [
    ['ahmed_s1',   'محمد أحمد السيد',     '01001111111','01001111112','الصف الثالث الثانوي','ذكر',  180],
    ['fatima_s2',  'فاطمة علي محمود',     '01002222222','01002222223','الصف الثالث الثانوي','أنثى', 210],
    ['omar_s3',    'عمر حسن خالد',        '01003333333','01003333334','الصف الثاني الثانوي','ذكر',   95],
    ['layla_s4',   'ليلى إبراهيم أحمد',   '01004444444','01004444445','الصف الثاني الثانوي','أنثى', 140],
    ['youssef_s5', 'يوسف محمد سعد',       '01005555555','01005555556','الصف الثالث الثانوي','ذكر',  320],
    ['nour_s6',    'نور عبدالرحمن',        '01006666666','01006666667','الصف الأول الثانوي', 'أنثى',  60],
    ['khaled_s7',  'خالد طارق عبدالله',   '01007777777','01007777778','الصف الثالث الثانوي','ذكر',  275],
    ['sara_s8',    'سارة وليد منصور',     '01008888888','01008888889','الصف الأول الثانوي', 'أنثى',  40],
    ['hassan_s9',  'حسن محمود علي',       '01009999999','01009999990','الصف الثاني الثانوي','ذكر',  155],
    ['mona_s10',   'منى أحمد فريد',       '01010101010','01010101011','الصف الثالث الثانوي','أنثى', 230],
    ['ibrahim_s11','إبراهيم سعيد الجابي', '01011111111','01011111112','الصف الثاني الإعدادي','ذكر',  80],
    ['hana_s12',   'هنا رضا كمال',        '01012121212','01012121213','الصف الثالث الإعدادي','أنثى', 190],
    ['tarek_s13',  'طارق عصام فكري',      '01013131313','01013131314','الصف الثالث الثانوي','ذكر',  110],
    ['amira_s14',  'أميرة محمد شاكر',     '01014141414','01014141415','الصف الأول الثانوي', 'أنثى',  75],
    ['ziad_s15',   'زياد علاء الدين',      '01015151515','01015151516','الصف الثاني الثانوي','ذكر',  200],
    ['nadia_s16',  'نادية حمدي توفيق',    '01016161616','01016161617','الصف الثالث الثانوي','أنثى', 245],
    ['mostafa_s17','مصطفى رامي حسن',      '01017171717','01017171718','الصف الثاني الإعدادي','ذكر',  30],
    ['dina_s18',   'دينا كريم ناصر',      '01018181818','01018181819','الصف الثالث الإعدادي','أنثى', 165],
    ['ahmed_s19',  'أحمد صلاح رزق',       '01019191919','01019191920','الصف الأول الثانوي', 'ذكر',   90],
    ['rana_s20',   'رنا وجدي سليمان',     '01020202020','01020202021','الصف الثاني الثانوي','أنثى', 130],
    ['tamer_s21',  'تامر فؤاد غانم',      '01021212121','01021212122','الصف الثالث الثانوي','ذكر',  300],
    ['yasmine_s22','ياسمين سامي زكي',     '01022222222','01022222223','الصف الأول الثانوي', 'أنثى',  50],
    ['sayed_s23',  'سيد جمال الدين',      '01023232323','01023232324','الصف الثالث الإعدادي','ذكر', 120],
    ['rowan_s24',  'روان أيمن حلمي',      '01024242424','01024242425','الصف الثاني الثانوي','أنثى', 185],
    ['bilal_s25',  'بلال عادل إسماعيل',   '01025252525','01025252526','الصف الثالث الثانوي','ذكر',  260],
    ['noha_s26',   'نهى طلعت رفاعي',      '01026262626','01026262627','الصف الأول الثانوي', 'أنثى',  25],
    ['karim_s27',  'كريم منير عثمان',     '01027272727','01027272728','الصف الثاني الثانوي','ذكر',  145],
    ['mariam_s28', 'مريم صبحي درويش',     '01028282828','01028282829','الصف الثالث الثانوي','أنثى', 290],
    ['sherif_s29', 'شريف نبيل الشيخ',     '01029292929','01029292930','الصف الثالث الثانوي','ذكر',  170],
    ['heba_s30',   'هبة سعد الرشيد',      '01030303030','01030303031','الصف الأول الثانوي', 'أنثى',  55],
  ];

  const pw = await hash('123456');
  const S = [];
  for (const [un, name, phone, parent, stage, gender, pts] of studentRows) {
    const r = await pool.query(`
      INSERT INTO students
        (username,password,name,phone,parent_phone,academic_stage,gender,teacher_id,points)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT(username) DO UPDATE SET points=EXCLUDED.points RETURNING id`,
      [un, pw, name, phone, parent, stage, gender, T, pts]
    );
    S.push(r.rows[0].id);
  }
  console.log('✅ الطلاب:', S.length);

  // ── 4. الكورسات (5 كورسات) ───────────────────────────────────────
  const courseRows = [
    ['رياضيات الثانوية العامة — الصف الثالث',
     'شرح كامل لمنهج الرياضيات للصف الثالث الثانوي بأسلوب مبسط مع حل تمارين الامتحانات السابقة لآخر 10 سنوات',
     350, 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop', 'الصف الثالث الثانوي'],
    ['جبر وهندسة الصف الثاني الثانوي',
     'منهج الجبر والهندسة كاملاً بالشرح والتطبيق والتدريبات للصف الثاني الثانوي مع امتحانات شهرية',
     280, 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=450&fit=crop', 'الصف الثاني الثانوي'],
    ['رياضيات الصف الأول الثانوي — أساسيات',
     'مقدمة قوية في رياضيات الصف الأول الثانوي — الجبر والهندسة والإحصاء بأسلوب تفاعلي',
     200, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=450&fit=crop', 'الصف الأول الثانوي'],
    ['رياضيات الإعدادية — الصف الثالث',
     'مراجعة وتأسيس شامل للصف الثالث الإعدادي استعداداً للثانوية — جبر وهندسة وإحصاء',
     150, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop', 'الصف الثالث الإعدادي'],
    ['مراجعة مكثفة — ليلة الامتحان الثانوية',
     'ملخصات مكثفة وأهم النقاط وأكثر المسائل توقعاً لامتحانات الثانوية العامة في الرياضيات',
     120, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=450&fit=crop', 'الصف الثالث الثانوي'],
  ];
  const C = [];
  for (const [name, desc, price, thumb, stage] of courseRows) {
    const r = await pool.query(`
      INSERT INTO courses (name,description,price,thumbnail_url,teacher_id,target_stage)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, [name, desc, price, thumb, T, stage]);
    C.push(r.rows[0].id);
  }
  console.log('✅ الكورسات:', C);

  // ── 5. الأقسام (sections) ─────────────────────────────────────────
  const secRes = [];
  const sectionDefs = [
    [C[0], ['الوحدة الأولى: الجبر والمعادلات',     'الوحدة الثانية: المثلثات',
            'الوحدة الثالثة: الهندسة التحليلية',   'الوحدة الرابعة: التفاضل والتكامل']],
    [C[1], ['الجزء الأول: الجبر',                  'الجزء الثاني: الهندسة الفراغية']],
    [C[2], ['الأساسيات والمفاهيم',                 'تطبيقات وتمارين']],
  ];
  for (const [cid, titles] of sectionDefs) {
    for (let i = 0; i < titles.length; i++) {
      const r = await pool.query(
        'INSERT INTO sections (course_id,title,sort_order) VALUES($1,$2,$3) RETURNING id',
        [cid, titles[i], i + 1]
      );
      secRes.push(r.rows[0].id);
    }
  }
  // secRes: [0..3] لكورس 0، [4..5] لكورس 1، [6..7] لكورس 2

  // ── 6. الفيديوهات (22 فيديو) ─────────────────────────────────────
  const videoRows = [
    // كورس 0 — 10 فيديوهات
    [C[0],'مقدمة الكورس وخطة المذاكرة',           '/uploads/videos/vid_demo.mp4', 12, 1, secRes[0]],
    [C[0],'المعادلات التربيعية وطرق الحل',         '/uploads/videos/vid_demo.mp4', 45, 2, secRes[0]],
    [C[0],'المتتاليات الحسابية والهندسية',         '/uploads/videos/vid_demo.mp4', 38, 3, secRes[0]],
    [C[0],'حل تمارين الجبر — امتحانات سابقة',      '/uploads/videos/vid_demo.mp4', 55, 4, secRes[0]],
    [C[0],'مقدمة المثلثات ودوائر الوحدة',          '/uploads/videos/vid_demo.mp4', 40, 5, secRes[1]],
    [C[0],'قوانين الجيب والجيب تمام والظل',        '/uploads/videos/vid_demo.mp4', 50, 6, secRes[1]],
    [C[0],'الإحداثيات والمسافة بين نقطتين',        '/uploads/videos/vid_demo.mp4', 42, 7, secRes[2]],
    [C[0],'معادلة المستقيم والدائرة',               '/uploads/videos/vid_demo.mp4', 48, 8, secRes[2]],
    [C[0],'النهايات وأساسيات التفاضل',             '/uploads/videos/vid_demo.mp4', 60, 9, secRes[3]],
    [C[0],'التكامل وحساب المساحة',                 '/uploads/videos/vid_demo.mp4', 65,10, secRes[3]],
    // كورس 1 — 4 فيديوهات
    [C[1],'الجبر للصف الثاني — أسس وقوى',          '/uploads/videos/vid_demo.mp4', 30, 1, secRes[4]],
    [C[1],'المصفوفات والمحددات',                    '/uploads/videos/vid_demo.mp4', 45, 2, secRes[4]],
    [C[1],'الهندسة الفراغية — أساسيات',            '/uploads/videos/vid_demo.mp4', 40, 3, secRes[5]],
    [C[1],'حجوم ومساحات الأشكال الفراغية',         '/uploads/videos/vid_demo.mp4', 38, 4, secRes[5]],
    // كورس 2 — 3 فيديوهات
    [C[2],'الأعداد والعمليات الأساسية',            '/uploads/videos/vid_demo.mp4', 25, 1, secRes[6]],
    [C[2],'الجبر للمبتدئين',                        '/uploads/videos/vid_demo.mp4', 35, 2, secRes[6]],
    [C[2],'الهندسة الأساسية والقياسات',            '/uploads/videos/vid_demo.mp4', 30, 3, secRes[7]],
    // كورس 3 — 2 فيديوهات
    [C[3],'مراجعة جبر الإعدادية الكاملة',          '/uploads/videos/vid_demo.mp4', 55, 1, null],
    [C[3],'هندسة الإعدادية ومسائل التطبيق',        '/uploads/videos/vid_demo.mp4', 50, 2, null],
    // كورس 4 — 3 فيديوهات
    [C[4],'ملخص الجبر في ساعة واحدة',              '/uploads/videos/vid_demo.mp4', 60, 1, null],
    [C[4],'ملخص الهندسة والمثلثات',                '/uploads/videos/vid_demo.mp4', 55, 2, null],
    [C[4],'أهم 50 سؤال متوقع في الامتحان',         '/uploads/videos/vid_demo.mp4', 70, 3, null],
  ];
  const V = [];
  for (const [cid, title, url, dur, so, sid] of videoRows) {
    const r = await pool.query(
      'INSERT INTO videos (title,file_path_or_url,duration_minutes,course_id,sort_order,section_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [title, url, dur, cid, so, sid]
    );
    V.push(r.rows[0].id);
  }
  console.log('✅ الفيديوهات:', V.length);

  // ── 7. ملفات PDF ─────────────────────────────────────────────────
  const pdfRows = [
    [C[0], 'ملزمة الجبر كاملة — الثالث الثانوي',         '/uploads/pdfs/pdf_demo.pdf'],
    [C[0], 'مراجعة المثلثات مع الحل النموذجي',           '/uploads/pdfs/pdf_demo.pdf'],
    [C[0], 'امتحانات رياضيات سابقة — 10 سنوات بحل',     '/uploads/pdfs/pdf_demo.pdf'],
    [C[1], 'ملزمة الصف الثاني الثانوي كاملة',            '/uploads/pdfs/pdf_demo.pdf'],
    [C[2], 'ملزمة الصف الأول الثانوي',                   '/uploads/pdfs/pdf_demo.pdf'],
    [C[3], 'ملخص الإعدادية مع تمارين وحلول',             '/uploads/pdfs/pdf_demo.pdf'],
    [C[4], 'ورقة المراجعة النهائية — أهم 100 سؤال',      '/uploads/pdfs/pdf_demo.pdf'],
  ];
  for (const [cid, title, url] of pdfRows) {
    await pool.query('INSERT INTO pdf_files (title,file_url,course_id) VALUES($1,$2,$3)', [title, url, cid]);
  }
  console.log('✅ الـ PDFs:', pdfRows.length);

  // ── 8. الامتحانات (8 امتحانات) ───────────────────────────────────
  const now = new Date();
  const inSevenDays = new Date(now.getTime() + 7  * 86400000).toISOString();
  const inFourteen  = new Date(now.getTime() + 14 * 86400000).toISOString();
  const examRows = [
    ['اختبار الجبر والمعادلات — الفصل الأول',   45,100,C[0],T,50,'نجم الجبر',          '#FF8C00',null,null],
    ['اختبار المثلثات والدوال المثلثية',         60,100,C[0],T,60,'أستاذ المثلثات',     '#6366F1',null,null],
    ['امتحان شامل — نصف العام الدراسي',          90,100,C[0],T,55,'متفوق نصف العام',    '#10B981',null,null],
    ['اختبار جبر الصف الثاني',                   45,100,C[1],T,50,'نجم الصف الثاني',    '#F59E0B',null,null],
    ['اختبار الهندسة الفراغية',                  50,100,C[1],T,50,'مبدع الهندسة',       '#EC4899',null,null],
    ['اختبار تحديد المستوى — الصف الأول',        30,100,C[2],T,40, null,                '#FF8C00',null,null],
    ['امتحان مفتوح عام — جميع الطلاب',           60,100,null,T,50,'نجم الدفعة',         '#8B5CF6',null,null],
    ['اختبار قادم — الفصل الثاني (مجدول)',       45,100,C[0],T,50,'متميز الفصل الثاني','#0EA5E9',inSevenDays,inFourteen],
  ];
  const E = [];
  for (const [title,dur,total,cid,tid,pass,badge,color,sd,ed] of examRows) {
    const r = await pool.query(`
      INSERT INTO exams
        (title,duration_minutes,total_score,course_id,teacher_id,pass_score,badge_name,badge_color,start_date,end_date)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [title,dur,total,cid,tid,pass,badge,color,sd,ed]
    );
    E.push(r.rows[0].id);
  }
  console.log('✅ الامتحانات:', E.length);

  // ── 9. الأسئلة ───────────────────────────────────────────────────
  const questions = [
    // اختبار 0 — جبر (10 أسئلة)
    [E[0],'ما هو ناتج (x+3)² إذا كان x=2؟',                           '25','15','10','20','A',10,'mcq',null],
    [E[0],'حل المعادلة: 2x + 6 = 14، قيمة x =',                       '4','3','7','8','A',10,'mcq',null],
    [E[0],'ما هو المنتج الكامل لـ (a-b)(a+b)؟',                       'a²-b²','a²+b²','a²-2ab+b²','2a²','A',10,'mcq',null],
    [E[0],'إذا كان f(x) = x² - 4، فما قيمة f(3)؟',                    '5','9','13','-1','A',10,'mcq',null],
    [E[0],'المتتالية الحسابية: 2, 5, 8, 11, ... ما الحد العاشر؟',     '29','32','27','31','A',10,'mcq',null],
    [E[0],'مجموع عددين 14 وحاصل ضربهما 48، أصغرهما؟',                 '6','4','7','5','A',10,'mcq',null],
    [E[0],'x² - 9 = 0، قيم x هي؟',                                    '3 و-3','9 و-9','0 و9','3 و0','A',10,'mcq',null],
    [E[0],'المتتالية الهندسية: 1, 3, 9, 27 — أساسها؟',                '3','2','4','6','A',10,'mcq',null],
    [E[0],'المعادلة x²-5x+6=0 لها جذران حقيقيان مختلفان — صح أم خطأ؟','صح','خطأ',null,null,'A',10,'true_false',null],
    [E[0],'اذكر خطوات حل المعادلة التربيعية ax²+bx+c=0 بالتفصيل',     '','',null,null,'A',10,'essay','تحليل المعادلة أو تطبيق قانون الحل: x=(-b±√(b²-4ac))/2a — يُحسب المميز Δ=b²-4ac أولاً ثم الجذران'],
    // اختبار 1 — مثلثات (9 أسئلة)
    [E[1],'sin(30°) =',                                                 '0.5','√3/2','1','√2/2','A',10,'mcq',null],
    [E[1],'cos(90°) =',                                                 '0','1','-1','0.5','A',10,'mcq',null],
    [E[1],'tan(45°) =',                                                 '1','√3','0','∞','A',10,'mcq',null],
    [E[1],'في مثلث قائم الزاوية: sin²θ + cos²θ =',                    '1','0','2','يتغير','A',10,'mcq',null],
    [E[1],'sin(60°) =',                                                 '√3/2','0.5','1','√2/2','A',10,'mcq',null],
    [E[1],'إذا كان sin θ = 0.6 فإن cos θ =',                          '0.8','0.4','1.6','0.36','A',10,'mcq',null],
    [E[1],'cos(0°) = 1 — صح أم خطأ؟',                                 'صح','خطأ',null,null,'A',10,'true_false',null],
    [E[1],'دائرة الوحدة نصف قطرها يساوي 1 — صح أم خطأ؟',             'صح','خطأ',null,null,'A',10,'true_false',null],
    [E[1],'اشرح قانون الجيب تمام وأذكر حالة تطبيقه',                  '','',null,null,'A',20,'essay','قانون الجيب تمام: c²=a²+b²-2ab·cosC — يُستخدم عندما نعرف ضلعين والزاوية المحصورة بينهما أو الأضلاع الثلاثة'],
    // اختبار 2 — شامل (8 أسئلة)
    [E[2],'مشتقة x³ تساوي',                                            '3x²','3x','x²','2x³','A',10,'mcq',null],
    [E[2],'مشتقة sin(x) =',                                            'cos(x)','-cos(x)','sin(x)','-sin(x)','A',10,'mcq',null],
    [E[2],'∫2x dx =',                                                   'x²+C','2x²+C','x+C','2+C','A',10,'mcq',null],
    [E[2],'حد الدالة f(x)=x² عند x→2 يساوي',                          '4','2','8','0','A',10,'mcq',null],
    [E[2],'sin(0°) = 0 — صح أم خطأ؟',                                 'صح','خطأ',null,null,'A',10,'true_false',null],
    [E[2],'المتتالية الهندسية: 1,2,4,8,... الحد الخامس هو؟',           '16','10','32','8','A',10,'mcq',null],
    [E[2],'معادلة المستقيم العمودي على محور x تكون في الصورة؟',        'x=a','y=b','y=mx+c','x+y=0','A',10,'mcq',null],
    [E[2],'اشرح الفرق بين التفاضل والتكامل بالتفصيل',                  '','',null,null,'A',30,'essay','التفاضل: إيجاد معدل التغيير اللحظي (المشتقة) — التكامل: إيجاد المساحة تحت المنحنى — وهما عمليتان عكسيتان لبعضهما'],
    // اختبار 3 — جبر الثاني (5 أسئلة)
    [E[3],'محدد المصفوفة |2 1; 3 4| =',                                '5','11','8','-5','A',20,'mcq',null],
    [E[3],'ضرب المصفوفات يتبع قانون التبديل AB=BA دائماً؟',            'خطأ','صح',null,null,'A',20,'true_false',null],
    [E[3],'(2³)² تساوي؟',                                              '64','32','16','128','A',20,'mcq',null],
    [E[3],'الأس الصفري لأي عدد غير صفر يساوي 1 — صح أم خطأ؟',        'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[3],'صف خصائص المصفوفة المعكوسة وشروط وجودها',                  '','',null,null,'A',20,'essay','المصفوفة المعكوسة A⁻¹ هي التي تحقق A·A⁻¹=I — تتطلب أن يكون المحدد غير صفري — وتُحسب بطريقة المصاحبة أو الحذف'],
    // اختبار 4 — هندسة فراغية (5 أسئلة)
    [E[4],'حجم المكعب الذي طول حافته 3 =',                             '27','9','18','36','A',20,'mcq',null],
    [E[4],'مساحة الوجه الجانبي للأسطوانة = 2πrh — صح أم خطأ؟',       'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[4],'حجم الكرة = (4/3)πr³ — صح أم خطأ؟',                       'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[4],'عدد أوجه المكعب =',                                          '6','8','4','12','A',20,'mcq',null],
    [E[4],'احسب حجم ومساحة أسطوانة نصف قطرها 3 وارتفاعها 7',          '','',null,null,'A',20,'essay','الحجم = π×9×7 = 63π ≈ 197.9 — المساحة الكلية = 2π×3×7 + 2×π×9 = 42π + 18π = 60π ≈ 188.5'],
    // اختبار 5 — تحديد المستوى (5 أسئلة)
    [E[5],'7 × 8 =',                                                    '56','48','64','54','A',20,'mcq',null],
    [E[5],'مربع العدد 13 =',                                            '169','139','196','163','A',20,'mcq',null],
    [E[5],'√144 =',                                                     '12','14','16','11','A',20,'mcq',null],
    [E[5],'العدد 7 عدد أولي — صح أم خطأ؟',                            'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[5],'15 ÷ 3 + 4 × 2 =',                                          '13','11','18','7','A',20,'mcq',null],
    // اختبار 6 — عام (5 أسئلة)
    [E[6],'ناتج 12² - 10² =',                                           '44','24','244','144','A',20,'mcq',null],
    [E[6],'π تساوي تقريباً',                                            '3.14','2.71','1.41','3.41','A',20,'mcq',null],
    [E[6],'مجموع زوايا المثلث = 180° — صح أم خطأ؟',                   'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[6],'مساحة المستطيل = طول × عرض — صح أم خطأ؟',                  'صح','خطأ',null,null,'A',20,'true_false',null],
    [E[6],'مساحة دائرة نصف قطرها 5 =',                                 '78.5','31.4','25','157','A',20,'mcq',null],
  ];

  for (const [eid,qt,a,b,c,d,ans,pts,qtype,ekey] of questions) {
    await pool.query(
      'INSERT INTO questions (exam_id,question_text,option_a,option_b,option_c,option_d,correct_answer_letter,points,question_type,essay_answer_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [eid,qt,a,b,c,d,ans,pts,qtype,ekey]
    );
  }
  console.log('✅ الأسئلة:', questions.length);

  // ── 10. التسجيل في الكورسات ──────────────────────────────────────
  // ثالث ثانوي ← كورس 0 + 4
  const thirdT  = [S[0],S[1],S[4],S[6],S[9],S[12],S[15],S[20],S[24],S[27],S[28]];
  // ثاني ثانوي ← كورس 1
  const secondT = [S[2],S[3],S[8],S[14],S[19],S[23],S[26]];
  // أول ثانوي ← كورس 2
  const firstT  = [S[5],S[7],S[13],S[18],S[21],S[25],S[29]];
  // ثالث إعدادي ← كورس 3
  const prepT   = [S[11],S[17],S[22]];

  for (const sid of thirdT) {
    await pool.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sid,C[0]]);
    await pool.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sid,C[4]]);
  }
  for (const sid of secondT)
    await pool.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sid,C[1]]);
  for (const sid of firstT)
    await pool.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sid,C[2]]);
  for (const sid of prepT)
    await pool.query('INSERT INTO student_course_enrollment (student_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[sid,C[3]]);
  console.log('✅ التسجيلات تمت');

  // ── 11. نتائج الامتحانات ─────────────────────────────────────────
  // [student_id, exam_id, score, correct, wrong, unanswered, points_earned]
  const resultRows = [
    // اختبار 0 (جبر — ثالث ثانوي)
    [S[0], E[0], 90, 8,1,1, 80], [S[1], E[0],100,10,0,0,100],
    [S[4], E[0], 70, 6,2,2, 60], [S[6], E[0], 80, 7,2,1, 70],
    [S[9], E[0], 60, 5,3,2, 50], [S[12],E[0], 50, 4,4,2, 40],
    [S[15],E[0], 95, 9,1,0, 90], [S[20],E[0], 40, 3,5,2, 30],
    [S[24],E[0], 85, 8,1,1, 80], [S[27],E[0], 75, 7,2,1, 70],
    // اختبار 1 (مثلثات)
    [S[0], E[1], 80, 7,2,0, 70], [S[1], E[1], 90, 8,1,0, 80],
    [S[4], E[1], 65, 5,3,1, 50], [S[6], E[1], 55, 4,4,1, 40],
    [S[15],E[1],100, 9,0,0,100], [S[27],E[1], 70, 6,2,1, 60],
    // اختبار 2 (شامل)
    [S[0], E[2], 75, 5,2,1, 70], [S[1], E[2], 88, 6,1,1, 80],
    [S[4], E[2], 60, 4,3,1, 50], [S[15],E[2], 92, 6,0,2, 90],
    [S[20],E[2], 45, 3,4,1, 40],
    // اختبار 3 (جبر 2 — ثاني ثانوي)
    [S[2], E[3], 80, 3,1,1, 70], [S[3], E[3], 60, 2,2,1, 50],
    [S[8], E[3],100, 4,0,1,100], [S[14],E[3], 40, 1,3,1, 30],
    [S[19],E[3], 75, 3,1,1, 70],
    // اختبار 4 (هندسة فراغية)
    [S[2], E[4], 75, 3,1,1, 60], [S[8], E[4], 50, 2,2,1, 40],
    [S[14],E[4], 85, 4,0,1, 80],
    // اختبار 5 (تحديد المستوى — أول ثانوي)
    [S[5], E[5], 80, 4,1,0, 70], [S[7], E[5], 60, 3,2,0, 50],
    [S[13],E[5],100, 5,0,0,100], [S[21],E[5], 40, 2,3,0, 30],
    [S[25],E[5], 60, 3,2,0, 50],
    // اختبار 6 (عام — كل الطلاب)
    [S[0], E[6], 80, 4,1,0, 80], [S[1], E[6],100, 5,0,0,100],
    [S[2], E[6], 60, 3,2,0, 60], [S[3], E[6], 80, 4,1,0, 80],
    [S[4], E[6], 60, 3,2,0, 60], [S[5], E[6], 60, 3,2,0, 60],
    [S[6], E[6], 80, 4,1,0, 80], [S[7], E[6], 40, 2,3,0, 40],
    [S[8], E[6],100, 5,0,0,100], [S[9], E[6], 60, 3,2,0, 60],
    [S[10],E[6], 40, 2,3,0, 40], [S[11],E[6], 80, 4,1,0, 80],
    [S[12],E[6], 40, 2,3,0, 40], [S[13],E[6],100, 5,0,0,100],
    [S[14],E[6], 60, 3,2,0, 60], [S[15],E[6],100, 5,0,0,100],
  ];

  const insertedResults = [];
  for (const [sid,eid,score,correct,wrong,unanswered,pe] of resultRows) {
    const r = await pool.query(`
      INSERT INTO exam_results
        (student_id,exam_id,score,correct_count,wrong_count,unanswered_count,
         start_time,end_time,points_earned)
      VALUES($1,$2,$3,$4,$5,$6,
             NOW()-interval'2 hours',NOW(),
             $7) RETURNING id`,
      [sid,eid,score,correct,wrong,unanswered,pe]
    );
    insertedResults.push({ id: r.rows[0].id, sid, score, eid });
    await pool.query('UPDATE students SET points = points + $1 WHERE id = $2',[pe,sid]);
  }
  console.log('✅ النتائج:', insertedResults.length);

  // ── 12. الشارات ──────────────────────────────────────────────────
  const badgeCriteria = [
    [E[0],'نجم الجبر',          '#FF8C00',50],
    [E[1],'أستاذ المثلثات',     '#6366F1',60],
    [E[2],'متفوق نصف العام',    '#10B981',55],
    [E[3],'نجم الصف الثاني',    '#F59E0B',50],
    [E[6],'نجم الدفعة',         '#8B5CF6',50],
  ];
  for (const [eid,bname,bcolor,passScore] of badgeCriteria) {
    const passed = insertedResults.filter(r => r.eid === eid && r.score >= passScore);
    for (const { sid } of passed) {
      await pool.query(
        'INSERT INTO badges (student_id,exam_id,badge_name,badge_color) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',
        [sid,eid,bname,bcolor]
      );
    }
  }
  console.log('✅ الشارات تمت');

  // ── 13. تقدم مشاهدة الفيديوهات ──────────────────────────────────
  const progressRows = [
    // طالب S[0] — شاهد معظم فيديوهات كورس 0
    [S[0],V[0],3,12,100],[S[0],V[1],2,45,100],[S[0],V[2],2,38,100],
    [S[0],V[3],1,40,73], [S[0],V[4],2,40,100],[S[0],V[5],1,30,60],
    // طالب S[1] — شاهد كل فيديوهات كورس 0
    [S[1],V[0],4,12,100],[S[1],V[1],3,45,100],[S[1],V[2],3,38,100],
    [S[1],V[3],2,55,100],[S[1],V[4],2,40,100],[S[1],V[5],2,50,100],
    [S[1],V[6],2,42,100],[S[1],V[7],1,30,63], [S[1],V[8],1,45,75],
    // طالب S[4] — شاهد البداية فقط
    [S[4],V[0],2,12,100],[S[4],V[1],1,25,56],[S[4],V[2],1,20,53],
    // طالب S[6]
    [S[6],V[0],3,12,100],[S[6],V[1],2,45,100],[S[6],V[4],1,20,50],
    // طالب S[15] — الأكثر نشاطاً
    [S[15],V[0],5,12,100],[S[15],V[1],4,45,100],[S[15],V[2],4,38,100],
    [S[15],V[3],3,55,100],[S[15],V[4],3,40,100],[S[15],V[5],3,50,100],
    [S[15],V[6],2,42,100],[S[15],V[7],2,48,100],[S[15],V[8],2,60,100],[S[15],V[9],2,65,100],
    // ثاني ثانوي — كورس 1
    [S[2], V[10],2,30,100],[S[2], V[11],1,25,56],
    [S[8], V[10],3,30,100],[S[8], V[11],2,45,100],[S[8],V[12],2,40,100],
    [S[14],V[10],2,30,100],[S[14],V[11],1,20,44],
    // أول ثانوي — كورس 2
    [S[5], V[14],2,25,100],[S[7], V[14],1,15,60],
    [S[13],V[14],3,25,100],[S[13],V[15],2,35,100],[S[13],V[16],1,20,67],
  ];
  for (const [sid,vid,wc,wm,pct] of progressRows) {
    await pool.query(`
      INSERT INTO video_progress
        (student_id,video_id,watch_count,watched_minutes,progress_percentage,last_watched_at)
      VALUES($1,$2,$3,$4,$5,NOW()-interval'${Math.floor(Math.random()*10)+1} days')
      ON CONFLICT(student_id,video_id) DO UPDATE
        SET watch_count=$3,watched_minutes=$4,progress_percentage=$5`,
      [sid,vid,wc,wm,pct]
    );
  }
  console.log('✅ تقدم المشاهدة:', progressRows.length, 'سجل');

  // ── 14. المدفوعات ────────────────────────────────────────────────
  const payRows = [
    [S[0], C[0],350,'فودافون كاش','VF-2024-001',null,         'verified'],
    [S[0], C[4],120,'إنستاباي',   'IP-2024-001',null,         'verified'],
    [S[1], C[0],350,'فودافون كاش','VF-2024-002',null,         'verified'],
    [S[1], C[4],120,'فودافون كاش','VF-2024-003',null,         'verified'],
    [S[4], C[0],350,'إنستاباي',   'IP-2024-002',null,         'verified'],
    [S[6], C[0],350,'فودافون كاش','VF-2024-004',null,         'verified'],
    [S[9], C[0],350,'فودافون كاش','VF-2024-005',null,         'verified'],
    [S[15],C[0],350,'إنستاباي',   'IP-2024-003',null,         'verified'],
    [S[15],C[4],120,'فودافون كاش','VF-2024-006',null,         'verified'],
    [S[20],C[0],350,'فودافون كاش','VF-2024-007',null,         'verified'],
    [S[24],C[0],350,'إنستاباي',   'IP-2024-004',null,         'verified'],
    [S[27],C[0],350,'فودافون كاش','VF-2024-008',null,         'verified'],
    [S[2], C[1],280,'فودافون كاش','VF-2024-009',null,         'verified'],
    [S[8], C[1],280,'إنستاباي',   'IP-2024-005',null,         'verified'],
    [S[3], C[1],280,'فودافون كاش','VF-2024-010','بانتظار التأكيد','pending'],
    [S[5], C[2],200,'فودافون كاش','VF-2024-011',null,         'verified'],
    [S[13],C[2],200,'إنستاباي',   'IP-2024-006',null,         'verified'],
    [S[11],C[3],150,'فودافون كاش','VF-2024-012',null,         'verified'],
    [S[17],C[3],150,'فودافون كاش','VF-2024-013','أرجو التأكيد السريع','pending'],
    [S[12],C[0],350,'إنستاباي',   'IP-2024-007','دفع أونلاين', 'pending'],
    [S[28],C[0],350,'فودافون كاش','VF-2024-014',null,         'pending'],
  ];
  for (const [sid,cid,amount,method,ref,notes,status] of payRows) {
    await pool.query(`
      INSERT INTO payments
        (student_id,course_id,amount,method,reference_number,notes,status,verified_by,verified_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [sid,cid,amount,method,ref,notes,status,
       status==='verified'?A1:null,
       status==='verified'?new Date():null]
    );
  }
  console.log('✅ المدفوعات:', payRows.length);

  // ── 15. الإشعارات ────────────────────────────────────────────────
  const notifRows = [
    [T,S[0], '+201001111111','student','أهلاً محمد! تم تسجيلك في كورس رياضيات الثانوية بنجاح 🎉','enrollment'],
    [T,S[1], '+201002222222','student','مبروك فاطمة! حصلتِ على 100/100 في اختبار الجبر 🏆','result'],
    [T,S[4], '+201005555555','student','يوسف، لديك اختبار المثلثات غداً — راجع الوحدة الثانية بعناية 📚','reminder'],
    [T,S[6], '+201007777777','parent', 'أهلاً ولي أمر خالد، أداء ابنكم في تراجع — يحتاج مراجعة إضافية','general'],
    [T,S[20],'+201021212121','student','تامر، درجتك 40/100 في الامتحان الأخير — أنصحك بمراجعة شاملة','result'],
    [T,S[15],'+201016161616','student','نادية، أداؤك رائع ومتميز! استمري هكذا 🌟','general'],
    [T,S[8], '+201009999999','student','حسن، حصلت على شارة "نجم الدفعة" مبروك! 🏅','badge'],
    [T,S[12],'+201013131313','parent', 'أهلاً ولي أمر طارق، يرجى سداد رسوم الكورس','payment'],
  ];
  for (const [tid,sid,phone,rtype,msg,type] of notifRows) {
    await pool.query(`
      INSERT INTO notification_log (teacher_id,student_id,recipient_phone,recipient_type,message,type)
      VALUES($1,$2,$3,$4,$5,$6)`,[tid,sid,phone,rtype,msg,type]
    );
  }
  // إشعارات نتائج للطلاب داخل التطبيق
  for (const { sid, score, eid } of insertedResults.slice(0, 12)) {
    await pool.query(`
      INSERT INTO notification_log (teacher_id,student_id,message,type)
      VALUES($1,$2,$3,'result')`,
      [T, sid, `تم تصحيح اختبارك — درجتك: ${score}/100 ${score >= 50 ? '✅ ناجح' : '❌ راجع المنهج'}`]
    );
  }
  console.log('✅ الإشعارات تمت');

  // ── 16. طلبات التسجيل في الكورسات ───────────────────────────────
  await pool.query(`
    INSERT INTO course_enrollment_requests (student_id,course_id,status,message)
    VALUES($1,$2,'pending','أريد الالتحاق بكورس الثانوية — أنا في الصف الثالث حالياً')
    ON CONFLICT DO NOTHING`,[S[28],C[0]]
  );
  await pool.query(`
    INSERT INTO course_enrollment_requests (student_id,course_id,status,message)
    VALUES($1,$2,'pending','أريد الانضمام لكورس المراجعة المكثفة قبل الامتحانات')
    ON CONFLICT DO NOTHING`,[S[16],C[4]]
  );
  await pool.query(`
    INSERT INTO course_enrollment_requests (student_id,course_id,status,message)
    VALUES($1,$2,'approved','طلب موافق عليه')
    ON CONFLICT DO NOTHING`,[S[10],C[4]]
  );
  console.log('✅ طلبات التسجيل: 3');

  // ── ملخص ─────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(55));
  console.log('🎉 تمت إضافة البيانات التجريبية بنجاح!');
  console.log('='.repeat(55));
  console.log('👨‍🏫 المعلم     : admin        / admin123');
  console.log('🤝 مساعد 1    : sara_asst    / 123456');
  console.log('🤝 مساعد 2    : omar_asst    / 123456');
  console.log('🎓 30 طالب    : ahmed_s1 ... heba_s30 / 123456');
  console.log(`📚 ${C.length} كورسات  · ${V.length} فيديو · ${pdfRows.length} PDF`);
  console.log(`📝 ${E.length} امتحانات · ${questions.length} سؤال متنوع`);
  console.log(`✅ ${insertedResults.length} نتيجة امتحان`);
  console.log(`💳 ${payRows.length} عملية دفع`);
  console.log(`🔔 ${notifRows.length + 12} إشعار`);
  console.log('='.repeat(55));

  await pool.end();
}

seed().catch(err => {
  console.error('❌ خطأ:', err.message);
  console.error(err.stack);
  process.exit(1);
});
