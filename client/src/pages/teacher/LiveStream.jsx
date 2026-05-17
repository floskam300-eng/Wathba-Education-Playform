import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Video, Plus, Settings2, Users, Radio, Clock, Eye, EyeOff,
  ChevronDown, ChevronUp, Trash2, Copy, Check, X, Play,
  StopCircle, GraduationCap, UserCheck, Globe, Lock,
  CalendarDays, BarChart2, Wifi, WifiOff, AlertTriangle,
  Link, RefreshCw, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAGES = [
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
];

const ACCESS_TYPES = [
  { value: 'all',      icon: Globe,       label: 'كل الطلاب',          desc: 'يمكن لجميع طلابك الانضمام' },
  { value: 'stages',  icon: GraduationCap, label: 'سنوات دراسية محددة', desc: 'اختر الصفوف المسموح لها' },
  { value: 'specific', icon: UserCheck,   label: 'طلاب بعينهم',        desc: 'أدخل أرقام كود الطلاب' },
];

const MOCK_PAST_STREAMS = [
  {
    id: 1, title: 'مراجعة الجبر — الوحدة الثالثة',
    date: '2026-05-15T18:00:00', duration: 72,
    viewers: 34, access: 'all', status: 'ended',
    roomId: 'wathba-abc123',
  },
  {
    id: 2, title: 'شرح المثلثات',
    date: '2026-05-10T17:30:00', duration: 55,
    viewers: 21, access: 'stages', stages: ['الصف الثاني الثانوي'],
    status: 'ended', roomId: 'wathba-xyz789',
  },
];

const emptyForm = {
  title: '',
  description: '',
  access: 'all',
  stages: [],
  studentCodes: '',
  scheduled: false,
  scheduleDate: '',
  scheduleTime: '',
  chat: true,
  handRaise: true,
  maxViewers: '',
  recordingAllowed: false,
};

function Badge({ children, color = 'gray' }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}>
      {children}
    </span>
  );
}

function AccessBadge({ stream }) {
  if (stream.access === 'all') return <Badge color="blue"><Globe className="w-3 h-3" /> كل الطلاب</Badge>;
  if (stream.access === 'stages') return <Badge color="orange"><GraduationCap className="w-3 h-3" /> سنوات محددة</Badge>;
  return <Badge color="gray"><UserCheck className="w-3 h-3" /> طلاب بعينهم</Badge>;
}

function StageToggle({ stage, selected, onToggle, dark }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(stage)}
      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
        selected
          ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-200'
          : dark
            ? 'border-[var(--dk-border)] text-[var(--dk-text-2)] hover:border-orange-400/50'
            : 'border-gray-200 text-gray-600 hover:border-orange-300'
      }`}
    >
      {stage}
    </button>
  );
}

function StreamCard({ stream, onDelete, dark }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const link = `${window.location.origin}/student/live/${stream.roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`rounded-2xl border p-5 transition-all ${
      dark ? 'bg-[var(--dk-surface)] border-[var(--dk-border)]' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge color="gray"><Clock className="w-3 h-3" /> منتهي</Badge>
            <AccessBadge stream={stream} />
          </div>
          <h3 className={`font-black text-base truncate ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
            {stream.title}
          </h3>
          <p className={`text-xs mt-0.5 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
            {fmtDate(stream.date)}
          </p>
        </div>
        <button
          onClick={() => onDelete(stream.id)}
          className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
            dark ? 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-50'
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className={`flex items-center gap-4 text-xs font-bold mb-3 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {stream.viewers} مشاهد</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {stream.duration} دقيقة</span>
      </div>

      {stream.stages && (
        <div className="flex flex-wrap gap-1 mb-3">
          {stream.stages.map(s => (
            <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold">{s}</span>
          ))}
        </div>
      )}

      <button
        onClick={copyLink}
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
          copied
            ? 'bg-green-100 text-green-700'
            : dark ? 'bg-[var(--dk-elevated)] text-[var(--dk-text-2)] hover:text-[var(--dk-text)]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'تم النسخ!' : 'نسخ رابط البث'}
      </button>
    </div>
  );
}

export default function TeacherLiveStream() {
  const { dark } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [activeLive, setActiveLive] = useState(null);
  const [pastStreams, setPastStreams] = useState(MOCK_PAST_STREAMS);
  const [viewersCount] = useState(0);
  const [liveElapsed, setLiveElapsed] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleStage = (stage) => {
    set('stages', form.stages.includes(stage)
      ? form.stages.filter(s => s !== stage)
      : [...form.stages, stage]);
  };

  const handleStartLive = () => {
    if (!form.title.trim()) return toast.error('أدخل عنوان البث أولاً');
    if (form.access === 'stages' && form.stages.length === 0) return toast.error('اختر سنة دراسية واحدة على الأقل');
    const roomId = `wathba-${Date.now().toString(36)}`;
    setActiveLive({ ...form, roomId, startedAt: new Date(), id: Date.now() });
    setShowForm(false);
    setLiveElapsed(0);
    const t = setInterval(() => setLiveElapsed(e => e + 1), 60000);
    setTimerRef(t);
    toast.success('🔴 البث المباشر بدأ الآن!');
  };

  const handleEndLive = () => {
    if (timerRef) clearInterval(timerRef);
    setPastStreams(prev => [{
      ...activeLive,
      date: activeLive.startedAt,
      duration: liveElapsed || 1,
      viewers: viewersCount,
      status: 'ended',
    }, ...prev]);
    setActiveLive(null);
    setForm(emptyForm);
    toast.success('تم إنهاء البث');
  };

  const handleDeleteStream = (id) => {
    setPastStreams(prev => prev.filter(s => s.id !== id));
    toast.success('تم حذف البث');
  };

  const copyRoomLink = () => {
    if (!activeLive) return;
    const link = `${window.location.origin}/student/live/${activeLive.roomId}`;
    navigator.clipboard.writeText(link).then(() => toast.success('تم نسخ الرابط'));
  };

  const surface = dark
    ? { backgroundColor: 'var(--dk-surface)', borderColor: 'var(--dk-border)' }
    : {};

  const cardClass = dark
    ? 'bg-[var(--dk-surface)] border-[var(--dk-border)]'
    : 'bg-white border-gray-100 shadow-sm';

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
            البث المباشر 🔴
          </h1>
          <p className={`text-sm mt-0.5 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
            ابدأ جلسة تعليمية مباشرة مع طلابك
          </p>
        </div>
        {!activeLive && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            بث جديد
          </button>
        )}
      </div>

      {activeLive && (
        <div className={`rounded-2xl border-2 border-red-500 p-5 ${dark ? 'bg-red-500/8' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
                <Radio className="w-3.5 h-3.5" /> مباشر الآن
              </span>
              <h2 className={`text-lg font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
                {activeLive.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomLink}
                className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all border ${
                  dark ? 'border-[var(--dk-border)] text-[var(--dk-text-2)] hover:bg-[var(--dk-elevated)]' : 'border-gray-200 text-gray-600 hover:bg-white'
                }`}
              >
                <Link className="w-4 h-4" />
                نسخ رابط الانضمام
              </button>
              <button
                onClick={handleEndLive}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black px-4 py-2 rounded-xl transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                إنهاء البث
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { icon: Users, label: 'المشاهدون', value: viewersCount, color: 'text-blue-500' },
              { icon: Clock, label: 'المدة', value: `${liveElapsed} دقيقة`, color: 'text-green-500' },
              { icon: activeLive.chat ? Eye : EyeOff, label: 'الدردشة', value: activeLive.chat ? 'مفعّلة' : 'موقفة', color: activeLive.chat ? 'text-green-500' : 'text-gray-400' },
              { icon: activeLive.handRaise ? Wifi : WifiOff, label: 'رفع اليد', value: activeLive.handRaise ? 'مفعّل' : 'موقف', color: activeLive.handRaise ? 'text-green-500' : 'text-gray-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`rounded-xl p-3 border text-center ${dark ? 'border-[var(--dk-border)] bg-[var(--dk-elevated)]' : 'bg-white border-gray-100'}`}>
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className={`text-xs font-bold ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-sm font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-4 border ${dark ? 'border-[var(--dk-border)] bg-[var(--dk-elevated)]' : 'bg-white border-gray-100'}`}>
            <p className={`text-sm font-bold mb-1 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>
              رابط انضمام الطلاب
            </p>
            <p className={`text-sm font-black break-all ${dark ? 'text-amber-400' : 'text-orange-600'}`}>
              {window.location.origin}/student/live/{activeLive.roomId}
            </p>
          </div>
        </div>
      )}

      {showForm && !activeLive && (
        <div className={`rounded-2xl border p-6 ${cardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-lg font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-800'}`}>
              إعدادات البث الجديد
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-black mb-1.5 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                عنوان الجلسة <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                placeholder="مثال: مراجعة الجبر — الفصل الثاني"
                value={form.title}
                onChange={e => set('title', e.target.value)}
              />
            </div>

            <div>
              <label className={`block text-sm font-black mb-1.5 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                وصف الجلسة (اختياري)
              </label>
              <textarea
                className="input-field w-full resize-none"
                rows={2}
                placeholder="اشرح باختصار موضوع الجلسة..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div>
              <label className={`block text-sm font-black mb-3 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                من يقدر يدخل البث؟ <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ACCESS_TYPES.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('access', value)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-right transition-all ${
                      form.access === value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                        : dark
                          ? 'border-[var(--dk-border)] hover:border-orange-400/40'
                          : 'border-gray-200 hover:border-orange-200 bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${form.access === value ? 'bg-orange-500 text-white' : dark ? 'bg-[var(--dk-elevated)] text-[var(--dk-text-2)]' : 'bg-white text-gray-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>{label}</p>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-500'}`}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.access === 'stages' && (
              <div>
                <label className={`block text-sm font-black mb-2 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                  اختر السنوات الدراسية
                </label>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map(stage => (
                    <StageToggle
                      key={stage}
                      stage={stage}
                      selected={form.stages.includes(stage)}
                      onToggle={toggleStage}
                      dark={dark}
                    />
                  ))}
                </div>
                {form.stages.length === 0 && (
                  <p className="flex items-center gap-1 text-red-500 text-xs font-bold mt-2">
                    <AlertTriangle className="w-3.5 h-3.5" /> اختر سنة واحدة على الأقل
                  </p>
                )}
              </div>
            )}

            {form.access === 'specific' && (
              <div>
                <label className={`block text-sm font-black mb-1.5 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                  كود الطلاب المسموح لهم
                </label>
                <textarea
                  className="input-field w-full resize-none font-mono"
                  rows={3}
                  placeholder="ادخل كود كل طالب في سطر منفصل&#10;مثال:&#10;STD-001&#10;STD-002&#10;STD-045"
                  value={form.studentCodes}
                  onChange={e => set('studentCodes', e.target.value)}
                />
                <p className={`text-xs mt-1 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
                  {form.studentCodes.split('\n').filter(c => c.trim()).length} طالب مضاف
                </p>
              </div>
            )}

            <div>
              <label className={`block text-sm font-black mb-3 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                إعدادات التفاعل
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'chat', icon: '💬', label: 'دردشة الطلاب', desc: 'يسمح للطلاب بالتعليق أثناء البث' },
                  { key: 'handRaise', icon: '✋', label: 'رفع اليد', desc: 'يسمح للطلاب بطلب الكلام' },
                  { key: 'recordingAllowed', icon: '⏺️', label: 'تسجيل مسموح', desc: 'يمكن للطلاب تسجيل الشاشة' },
                ].map(({ key, icon, label, desc }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      form[key]
                        ? dark ? 'border-orange-500/40 bg-orange-500/8' : 'border-orange-200 bg-orange-50'
                        : dark ? 'border-[var(--dk-border)]' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={e => set(key, e.target.checked)}
                      className="w-4 h-4 accent-orange-500 flex-shrink-0"
                    />
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className={`text-sm font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>{label}</p>
                      <p className={`text-xs ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-black mb-1.5 ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
                الحد الأقصى للمشاهدين (اختياري)
              </label>
              <input
                type="number"
                min="1"
                className="input-field w-full sm:w-48"
                placeholder="لا يوجد حد"
                value={form.maxViewers}
                onChange={e => set('maxViewers', e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-[var(--dk-border)]">
              <button
                onClick={handleStartLive}
                className="btn-primary flex items-center gap-2 flex-1 justify-center"
              >
                <Radio className="w-4 h-4" />
                ابدأ البث الآن
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-base font-black ${dark ? 'text-[var(--dk-text)]' : 'text-navy-700'}`}>
            البثوث السابقة
          </h2>
          {pastStreams.length > 0 && (
            <span className={`text-xs font-bold ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>
              {pastStreams.length} جلسة
            </span>
          )}
        </div>

        {pastStreams.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
            <Video className={`w-12 h-12 mx-auto mb-3 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-300'}`} />
            <p className={`font-black ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>لم تبدأ أي بث بعد</p>
            <p className={`text-sm mt-1 ${dark ? 'text-[var(--dk-text-2)]' : 'text-gray-400'}`}>ابدأ بثك الأول من الزر بالأعلى</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastStreams.map(stream => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onDelete={handleDeleteStream}
                dark={dark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
