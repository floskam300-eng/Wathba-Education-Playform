import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Pencil, Trash2, HelpCircle, ChevronDown, ChevronUp, Printer, Filter } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { generatePDFReport } from '../../lib/pdfReport';

const STAGES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي', 'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي', 'جامعي'];
const emptyExam = { title: '', duration_minutes: 60, total_score: 100, course_id: '', pass_score: 50, badge_name: '', badge_color: '#995400' };
const emptyQ = { question_text: '', question_image_url: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer_letter: 'A', points: 1 };

export default function TeacherExams() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyExam);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  const [qForm, setQForm] = useState(emptyQ);
  const [editQ, setEditQ] = useState(null);
  const [stageFilter, setStageFilter] = useState('الكل');

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => api.get('/exams').then(r => r.data),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data),
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['questions', expandedExam],
    queryFn: () => api.get(`/exams/${expandedExam}/questions`).then(r => r.data),
    enabled: !!expandedExam,
  });

  const createMut = useMutation({
    mutationFn: (data) => api.post('/exams', data),
    onSuccess: () => { qc.invalidateQueries(['exams']); toast.success('تم إنشاء الاختبار'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.error || 'حدث خطأ'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/exams/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['exams']); toast.success('تم تحديث الاختبار'); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/exams/${id}`),
    onSuccess: () => { qc.invalidateQueries(['exams']); toast.success('تم حذف الاختبار'); },
  });

  const addQMut = useMutation({
    mutationFn: ({ id, data }) => api.post(`/exams/${id}/questions`, data),
    onSuccess: () => { qc.invalidateQueries(['questions', expandedExam]); toast.success('تم إضافة السؤال'); setQForm(emptyQ); },
  });

  const updateQMut = useMutation({
    mutationFn: ({ qid, data }) => api.put(`/exams/questions/${qid}`, data),
    onSuccess: () => { qc.invalidateQueries(['questions', expandedExam]); toast.success('تم تحديث السؤال'); setEditQ(null); setQForm(emptyQ); },
  });

  const deleteQMut = useMutation({
    mutationFn: (qid) => api.delete(`/exams/questions/${qid}`),
    onSuccess: () => { qc.invalidateQueries(['questions', expandedExam]); toast.success('تم حذف السؤال'); },
  });

  const openAdd = () => { setEditData(null); setForm(emptyExam); setModal(true); };
  const openEdit = (e) => {
    setEditData(e);
    setForm({ title: e.title, duration_minutes: e.duration_minutes, total_score: e.total_score, course_id: e.course_id || '', pass_score: e.pass_score, badge_name: e.badge_name || '', badge_color: e.badge_color || '#995400' });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditData(null); setForm(emptyExam); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('عنوان الاختبار مطلوب');
    if (editData) updateMut.mutate({ id: editData.id, data: form });
    else createMut.mutate(form);
  };

  const handleQSubmit = (e) => {
    e.preventDefault();
    if (!qForm.question_text || !qForm.option_a || !qForm.option_b) return toast.error('السؤال والخياران الأول والثاني مطلوبان');
    if (editQ) updateQMut.mutate({ qid: editQ.id, data: qForm });
    else addQMut.mutate({ id: expandedExam, data: qForm });
  };

  const handlePrint = () => {
    const headers = ['العنوان', 'الكورس', 'المدة', 'الأسئلة', 'المجموع', 'المحاولات'];
    const data = exams.map(ex => [
      ex.title, ex.course_name || 'عام', ex.duration_minutes.toString(),
      ex.question_count.toString(), ex.total_score.toString(), ex.attempt_count.toString()
    ]);
    generatePDFReport('تقرير الاختبارات', headers, data, 'exams_report.pdf');
  };

  // Build course stage map
  const courseStageMap = {};
  courses.forEach(c => { if (c.id) courseStageMap[c.id] = c.target_stage; });

  // Stage counts
  const stageCounts = ['الكل', ...STAGES].reduce((acc, s) => {
    if (s === 'الكل') { acc[s] = exams.length; return acc; }
    acc[s] = exams.filter(ex => {
      const stage = courseStageMap[ex.course_id] || null;
      return stage === s;
    }).length;
    return acc;
  }, {});

  const filteredExams = stageFilter === 'الكل'
    ? exams
    : exams.filter(ex => {
        const stage = courseStageMap[ex.course_id] || null;
        return stage === stageFilter;
      });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-600 flex items-center gap-2">
          <FileText className="w-7 h-7 text-orange-500" /> الاختبارات
          <span className="text-sm font-semibold text-gray-600">({exams.length})</span>
        </h1>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" /> طباعة
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة اختبار
          </button>
        </div>
      </div>

      {/* Stage Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold text-gray-500">تصفية حسب المرحلة الدراسية للكورس</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['الكل', ...STAGES].map(stage => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                stageFilter === stage
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {stage}
              <span className={`text-xs rounded-full px-1.5 font-black ${
                stageFilter === stage ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
              }`}>
                {stageCounts[stage] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)
        ) : filteredExams.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">
              {stageFilter === 'الكل' ? 'لا توجد اختبارات بعد' : `لا توجد اختبارات لـ ${stageFilter}`}
            </p>
          </div>
        ) : filteredExams.map(ex => (
          <div key={ex.id} className="card !p-0 overflow-hidden">
            <div className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-navy-600">{ex.title}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ex.course_name && <Badge variant="info">{ex.course_name}</Badge>}
                  {courseStageMap[ex.course_id] && (
                    <span className="text-xs bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                      {courseStageMap[ex.course_id]}
                    </span>
                  )}
                  <Badge variant="navy">⏱ {ex.duration_minutes} دقيقة</Badge>
                  <Badge variant="warning">📝 {ex.question_count} سؤال</Badge>
                  <Badge variant="gray">المجموع: {ex.total_score}</Badge>
                  <Badge variant="success">محاولات: {ex.attempt_count}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(ex)} className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(ex.id)} className="p-2 text-red-700 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setExpandedExam(expandedExam === ex.id ? null : ex.id)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  {expandedExam === ex.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {expandedExam === ex.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                <h4 className="font-bold text-navy-600 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-orange-500" /> بنك الأسئلة ({questions.length})
                </h4>

                {questions.map((q, qi) => (
                  <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-navy-600 text-sm mb-2">س{qi + 1}: {q.question_text}</p>
                        {q.question_image_url && <img src={q.question_image_url} alt="question" className="w-40 h-24 object-cover rounded-lg mb-2" />}
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          {['A', 'B', 'C', 'D'].map(opt => q[`option_${opt.toLowerCase()}`] && (
                            <div key={opt} className={`p-1.5 rounded-lg font-semibold ${q.correct_answer_letter === opt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {opt}. {q[`option_${opt.toLowerCase()}`]}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditQ(q); setQForm({ ...q }); }} className="p-1.5 text-navy-600 hover:bg-navy-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteQMut.mutate(q.id)} className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-orange-300">
                  <h5 className="font-bold text-navy-600 mb-3 text-sm">{editQ ? 'تعديل السؤال' : '+ إضافة سؤال جديد'}</h5>
                  <form onSubmit={handleQSubmit} className="space-y-3">
                    <textarea value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })}
                      className="input-field h-16 resize-none text-sm" placeholder="نص السؤال..." />
                    <input value={qForm.question_image_url || ''} onChange={e => setQForm({ ...qForm, question_image_url: e.target.value })}
                      className="input-field text-sm" placeholder="رابط صورة السؤال (اختياري)" dir="ltr" />
                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${qForm.correct_answer_letter === opt ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{opt}</span>
                          <input value={qForm[`option_${opt.toLowerCase()}`] || ''} onChange={e => setQForm({ ...qForm, [`option_${opt.toLowerCase()}`]: e.target.value })}
                            className="input-field text-sm" placeholder={`الخيار ${opt}${opt === 'A' || opt === 'B' ? ' *' : ''}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-navy-700">الإجابة الصحيحة:</label>
                        <select value={qForm.correct_answer_letter} onChange={e => setQForm({ ...qForm, correct_answer_letter: e.target.value })} className="input-field w-20">
                          {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-bold text-navy-700">درجة:</label>
                        <input type="number" value={qForm.points} onChange={e => setQForm({ ...qForm, points: parseInt(e.target.value) || 1 })} className="input-field w-16" min={1} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editQ && <button type="button" onClick={() => { setEditQ(null); setQForm(emptyQ); }} className="btn-secondary px-3 py-2 text-sm">إلغاء</button>}
                      <button type="submit" className="btn-primary text-sm" disabled={addQMut.isPending || updateQMut.isPending}>
                        {editQ ? 'تحديث السؤال' : 'إضافة السؤال'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={closeModal} title={editData ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1">عنوان الاختبار *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="مثال: اختبار الفصل الأول" />
          </div>
          <div>
            <label className="block text-sm font-bold text-navy-700 mb-1">الكورس (اختياري)</label>
            <select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} className="input-field">
              <option value="">اختبار عام</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.target_stage ? ` — ${c.target_stage}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1">المدة (دقيقة)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1">المجموع الكلي</label>
              <input type="number" value={form.total_score} onChange={e => setForm({ ...form, total_score: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1">درجة النجاح</label>
              <input type="number" value={form.pass_score} onChange={e => setForm({ ...form, pass_score: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1">اسم الشارة (عند النجاح)</label>
              <input value={form.badge_name} onChange={e => setForm({ ...form, badge_name: e.target.value })} className="input-field" placeholder="مثال: متميز" />
            </div>
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1">لون الشارة</label>
              <input type="color" value={form.badge_color} onChange={e => setForm({ ...form, badge_color: e.target.value })} className="input-field h-10 p-1 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={closeModal} className="flex-1 btn-secondary">إلغاء</button>
            <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="flex-1 btn-primary">
              {editData ? 'حفظ التعديلات' : 'إنشاء الاختبار'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteMut.mutate(deleteId); setDeleteId(null); }}
        title="حذف الاختبار" message="هل أنت متأكد من حذف هذا الاختبار وجميع أسئلته؟" danger />
    </div>
  );
}
