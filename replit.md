# Wathba Educational Platform
منصة تعليمية متكاملة لمراكز الدروس الخصوصية في مصر — تتيح للمعلمين إدارة الكورسات والامتحانات وتتبع أداء الطلاب.

## Run & Operate
- **Dev (both)**: `npm run dev` — يشغل الـ backend والـ frontend معاً
- **Backend only**: `npm run server` — Node.js على port 3001
- **Frontend only**: `cd client && npm run dev` — Vite على port 5000
- **Build**: `npm run build`
- **Env vars required**: `DATABASE_URL`, `JWT_SECRET`, `PORT`

## Stack
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3 + React Router 6
- **Backend**: Node.js 20 + Express 4
- **Database**: PostgreSQL (Replit managed) via `pg` pool
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Charts**: ECharts, ApexCharts, Recharts
- **PDF**: jsPDF + jspdf-autotable
- **File uploads**: Multer → `/uploads/`

## Where things live
- `server/index.js` — Express entry point, DB init, routes mounting
- `server/db/schema.sql` — canonical DB schema (all tables)
- `server/db/connection.js` — pg Pool using `DATABASE_URL`
- `server/routes/` — auth, teachers, assistants, students, courses, exams, payments
- `client/src/pages/` — all page components
- `client/src/components/` — shared UI components
- `client/src/context/` — React context (auth, etc.)
- `uploads/` — uploaded files (images, PDFs, videos)

## Architecture decisions
- Backend runs on port 3001, frontend on port 5000 (proxied externally on port 80)
- `dotenv` loads `.env` but Replit env vars take precedence (dotenv doesn't override existing vars)
- DB schema is initialized automatically on server startup via `initDB()` in `server/index.js`
- Default teacher account seeded on first run: `admin` / `admin123`
- JWT stored in localStorage on client side

## Product
- **معلم (Teacher)**: لوحة تحكم كاملة — إدارة الطلاب، المساعدين، الكورسات، الامتحانات، التحليلات
- **مساعد (Assistant)**: صلاحيات قابلة للتخصيص من المعلم
- **طالب (Student)**: مشاهدة الفيديوهات، تأدية الامتحانات، رؤية النتائج والتحليل
- **نظام نقاط وشارات** على الامتحانات
- **تقارير PDF** مع إشعارات لأولياء الأمور
- **مدفوعات**: Vodafone Cash / Instapay

## User preferences
- المشروع باللغة العربية بالكامل
- اتجاه RTL

## Gotchas
- `vite.config.js` يجب أن يسمح بـ `host: true` للـ preview على Replit
- الـ schema يُشغَّل كـ `CREATE TABLE IF NOT EXISTS` — آمن على كل إعادة تشغيل
- ملفات الرفع تُحفظ في `/uploads/` وتُقدَّم كـ static files

## Pointers
- DB skill: `.local/skills/database/SKILL.md`
- Workflows skill: `.local/skills/workflows/SKILL.md`
