import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X, User, Phone, BookOpen, Video, FileText, Award, CreditCard,
  CheckCircle2, XCircle, Star, GraduationCap, Calendar, Clock,
  TrendingUp, Trophy, Wallet, Play, Shield, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../lib/api';

const fmt = (date) => date ? new Date(date).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (date) => date ? new Date(date).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' }) : '—';

const STATUS_COLORS = {
  verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};
const STATUS_LABELS = { verified: 'مؤكد', pending: 'معلق', rejected: 'مرفوض' };

function Section({ title, icon: Icon, iconBg, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-black text-gray-800 text-sm">{title}</span>
          {count !== undefined && (
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{count}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function StatMini({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default function StudentProfileDrawer({ studentId, onClose }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: () => api.get(`/students/${studentId}/profile`).then(r => r.data),
    enabled: !!studentId,
  });

  const s = data?.student;
  const courses = data?.courses || [];
  const exams = data?.examResults || [];
  const payments = data?.payments || [];
  const badges = data?.badges || [];

  const passedExams = exams.filter(e => e.score >= e.pass_score).length;
  const avgScore = exams.length ? Math.round(exams.reduce((a, e) => a + (e.score / Math.max(e.total_score, 1)) * 100, 0) / exams.length) : 0;
  const totalPaid = payments.filter(p => p.status === 'verified').reduce((a, p) => a + parseFloat(p.amount), 0);
  const totalWatchedMin = courses.reduce((a, c) => a + parseInt(c.total_watched_minutes || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-full max-w-2xl bg-gray-50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="bg-gradient-to-l from-navy-600 to-navy-800 px-5 py-5 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                {s?.name?.charAt(0) || '؟'}
              </div>
              <div>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-5 w-36 bg-white/20 rounded-lg animate-pulse" />
                    <div className="h-3 w-24 bg-white/10 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-white font-black text-lg leading-tight">{s?.name}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {s?.academic_stage && (
                        <span className="text-xs font-semibold bg-white/15 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> {s.academic_stage}
                        </span>
                      )}
                      <span className="text-xs font-semibold bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" /> {s?.points || 0} نقطة
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          {!isLoading && (
            <div className="grid grid-cols-4 gap-3 mt-5 bg-white/10 rounded-2xl p-3">
              <StatMini label="الكورسات" value={courses.length} color="text-white" />
              <StatMini label="الاختبارات" value={exams.length} color="text-white" />
              <StatMini label="متوسط النتائج" value={`${avgScore}%`} color={avgScore >= 50 ? 'text-emerald-300' : 'text-red-300'} />
              <StatMini label="المدفوعات" value={`${totalPaid.toFixed(0)} ج`} color="text-amber-300" />
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto text-red-300 mb-3" />
              <p className="text-gray-500 font-semibold">تعذّر تحميل بيانات الطالب</p>
            </div>
          ) : (
            <>
              {/* Personal Info */}
              <Section title="البيانات الشخصية" icon={User} iconBg="bg-blue-50 text-blue-500" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'اسم المستخدم', value: s?.username, icon: User },
                    { label: 'الجنس', value: s?.gender === 'male' ? 'ذكر' : s?.gender === 'female' ? 'أنثى' : '—', icon: User },
                    { label: 'رقم الهاتف', value: s?.phone || '—', icon: Phone },
                    { label: 'هاتف ولي الأمر', value: s?.parent_phone || '—', icon: Phone },
                    { label: 'تاريخ التسجيل', value: fmt(s?.created_at), icon: Calendar },
                    { label: 'الشارات المكتسبة', value: `${badges.length} شارة`, icon: Trophy },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                        <p className="text-xs font-bold text-gray-700 truncate">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {badges.map(b => (
                      <span key={b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white shadow-sm"
                        style={{ background: b.badge_color || '#FF8C00' }}>
                        <Trophy className="w-3 h-3" /> {b.badge_name}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Courses */}
              <Section title="الكورسات المسجّل بها" icon={BookOpen} iconBg="bg-navy-50 text-navy-600" count={courses.length}>
                {courses.length === 0 ? (
                  <p className="text-gray-400 text-sm font-medium text-center py-4">لم يُسجَّل في أي كورس بعد</p>
                ) : (
                  <div className="space-y-3">
                    {courses.map(c => {
                      const watchPct = parseInt(c.total_videos) > 0
                        ? Math.min(Math.round((parseInt(c.watched_videos) / parseInt(c.total_videos)) * 100), 100) : 0;
                      return (
                        <div key={c.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <div>
                              <p className="font-black text-sm text-navy-700">{c.name}</p>
                              {c.target_stage && (
                                <span className="text-[10px] text-blue-500 font-semibold">{c.target_stage}</span>
                              )}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                              c.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                              {c.status === 'active' ? 'نشط' : c.status}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mb-2">
                            <div className="flex justify-between text-[10px] text-gray-400 font-semibold mb-1">
                              <span>تقدم المشاهدة</span>
                              <span className="font-black text-navy-600">{watchPct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div className="h-2 rounded-full bg-gradient-to-r from-navy-500 to-orange-400 transition-all"
                                style={{ width: `${watchPct}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-gray-500 font-semibold mt-2">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3 text-navy-500" />
                              {c.watched_videos}/{c.total_videos} فيديو
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-orange-500" />
                              {c.total_pdfs} ملف
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {Math.round(parseInt(c.total_watched_minutes || 0))} دقيقة شاهد
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            تاريخ التسجيل: {fmtShort(c.enrollment_date)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Exam Results */}
              <Section title="نتائج الاختبارات" icon={Award} iconBg="bg-purple-50 text-purple-500" count={exams.length}>
                {exams.length === 0 ? (
                  <p className="text-gray-400 text-sm font-medium text-center py-4">لم يحل أي اختبار بعد</p>
                ) : (
                  <>
                    {/* Summary row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-emerald-600">{passedExams}</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">ناجح</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-red-500">{exams.length - passedExams}</p>
                        <p className="text-[10px] text-red-400 font-semibold">راسب</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-black text-blue-600">{avgScore}%</p>
                        <p className="text-[10px] text-blue-400 font-semibold">متوسط</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {exams.map(e => {
                        const passed = e.score >= e.pass_score;
                        const pct = Math.min(Math.round((e.score / Math.max(e.total_score, 1)) * 100), 100);
                        return (
                          <div key={e.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${passed ? 'bg-emerald-100' : 'bg-red-100'}`}>
                              {passed
                                ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                                : <XCircle className="w-4.5 h-4.5 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-800 truncate">{e.exam_title}</p>
                              {e.course_name && <p className="text-[10px] text-gray-400">{e.course_name}</p>}
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {e.correct_count} صح
                                </span>
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-400" /> {e.wrong_count} خطأ
                                </span>
                                <span className="text-gray-300">{fmtShort(e.created_at)}</span>
                              </div>
                            </div>
                            <div className="text-left flex-shrink-0">
                              <div className="flex items-center gap-1 justify-end mb-1">
                                <span className={`text-sm font-black ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {e.score}/{e.total_score}
                                </span>
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-1.5 rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                              <p className={`text-[10px] font-bold text-left mt-0.5 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>{pct}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Section>

              {/* Payments */}
              <Section title="سجل المدفوعات" icon={Wallet} iconBg="bg-amber-50 text-amber-500" count={payments.length} defaultOpen={payments.length > 0}>
                {payments.length === 0 ? (
                  <p className="text-gray-400 text-sm font-medium text-center py-4">لا توجد مدفوعات مسجلة</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-black text-emerald-600">{totalPaid.toFixed(0)} ج</p>
                        <p className="text-[10px] text-emerald-500 font-semibold">مؤكد</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-black text-amber-600">
                          {payments.filter(p => p.status === 'pending').reduce((a, p) => a + parseFloat(p.amount), 0).toFixed(0)} ج
                        </p>
                        <p className="text-[10px] text-amber-500 font-semibold">معلق</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-black text-gray-600">
                          {payments.reduce((a, p) => a + parseFloat(p.amount), 0).toFixed(0)} ج
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">الإجمالي</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {payments.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            p.status === 'verified' ? 'bg-emerald-100' : p.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            <CreditCard className={`w-4 h-4 ${
                              p.status === 'verified' ? 'text-emerald-600' : p.status === 'pending' ? 'text-amber-600' : 'text-red-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-800">{parseFloat(p.amount).toFixed(0)} جنيه</p>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap mt-0.5">
                              <span>{p.method}</span>
                              {p.course_name && <><span>·</span><span className="truncate">{p.course_name}</span></>}
                              {p.reference_number && <><span>·</span><span>#{p.reference_number}</span></>}
                            </div>
                            {p.notes && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{p.notes}</p>}
                          </div>
                          <div className="text-left flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block text-center ${STATUS_COLORS[p.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {STATUS_LABELS[p.status] || p.status}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 text-center">{fmtShort(p.payment_date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
