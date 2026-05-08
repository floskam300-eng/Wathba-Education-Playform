import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Database, Users, BookOpen, FileText, CreditCard, BarChart3, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Backup() {
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  const { data: stats } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => api.get('/teachers/dashboard').then(r => r.data),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/teachers/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wathba-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setLastExport(new Date());
      toast.success('تم تصدير البيانات بنجاح!');
    } catch (err) {
      toast.error('حدث خطأ أثناء التصدير');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = (type) => {
    api.get('/teachers/export').then(res => {
      const data = res.data;
      let rows = [];
      let filename = '';

      if (type === 'students') {
        filename = 'students.csv';
        const headers = ['الاسم', 'اسم المستخدم', 'الهاتف', 'هاتف ولي الأمر', 'المرحلة', 'الجنس', 'النقاط', 'تاريخ التسجيل'];
        rows = [headers, ...data.students.map(s => [s.name, s.username, s.phone || '', s.parent_phone || '', s.academic_stage || '', s.gender || '', s.points, new Date(s.created_at).toLocaleDateString('ar-EG')])];
      } else if (type === 'results') {
        filename = 'exam_results.csv';
        const headers = ['اسم الطالب', 'الاختبار', 'الدرجة', 'صحيح', 'خطأ', 'لم يُجب', 'التاريخ'];
        rows = [headers, ...data.exam_results.map(r => [r.student_name, r.exam_title, r.score, r.correct_count, r.wrong_count, r.unanswered_count, new Date(r.created_at).toLocaleDateString('ar-EG')])];
      } else if (type === 'payments') {
        filename = 'payments.csv';
        const headers = ['اسم الطالب', 'الكورس', 'المبلغ', 'طريقة الدفع', 'الحالة', 'رقم مرجعي', 'التاريخ'];
        rows = [headers, ...data.payments.map(p => [p.student_name, p.course_name || '', p.amount, p.method, p.status, p.reference_number || '', new Date(p.payment_date).toLocaleDateString('ar-EG')])];
      }

      const csvContent = '\uFEFF' + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`تم تصدير ${filename}`);
    }).catch(() => toast.error('حدث خطأ أثناء التصدير'));
  };

  const statCards = [
    { icon: Users, label: 'الطلاب', value: stats?.totalStudents, color: 'text-blue-600 bg-blue-50' },
    { icon: BookOpen, label: 'الكورسات', value: stats?.totalCourses, color: 'text-purple-600 bg-purple-50' },
    { icon: FileText, label: 'الاختبارات', value: stats?.totalExams, color: 'text-orange-600 bg-orange-50' },
    { icon: CreditCard, label: 'الإيرادات (جنيه)', value: stats?.totalRevenue?.toLocaleString(), color: 'text-green-600 bg-green-50' },
  ];

  const csvExports = [
    { key: 'students', label: 'قائمة الطلاب', desc: 'بيانات الطلاب كاملة', icon: Users },
    { key: 'results', label: 'نتائج الاختبارات', desc: 'جميع نتائج الاختبارات', icon: BarChart3 },
    { key: 'payments', label: 'سجل المدفوعات', desc: 'جميع عمليات الدفع', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-600 flex items-center gap-2">
        <Database className="w-7 h-7 text-navy-500" /> النسخ الاحتياطي وتصدير البيانات
      </h1>

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-navy-700">{value ?? '…'}</p>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Full JSON backup */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-navy-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Database className="w-7 h-7 text-navy-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-navy-700 mb-1">نسخة احتياطية كاملة (JSON)</h2>
            <p className="text-sm text-gray-500 mb-4">
              تصدير جميع بياناتك — الطلاب، الكورسات، الاختبارات، النتائج، والمدفوعات — في ملف JSON واحد يمكنك حفظه أو استعادته لاحقاً.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'جاري التصدير...' : 'تنزيل النسخة الاحتياطية'}
              </button>
              {lastExport && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                  <CheckCircle className="w-4 h-4" />
                  آخر تصدير: {lastExport.toLocaleTimeString('ar-EG')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSV exports */}
      <div>
        <h2 className="text-lg font-black text-navy-600 mb-3">تصدير CSV مخصص</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {csvExports.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-black text-navy-700 mb-1">{label}</h3>
              <p className="text-sm text-gray-500 mb-4">{desc}</p>
              <button
                onClick={() => handleExportCSV(key)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-orange-300 text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-all text-sm"
              >
                <Download className="w-4 h-4" /> تحميل CSV
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-bold mb-1">💡 نصيحة</p>
        <p>ننصح بعمل نسخة احتياطية أسبوعياً على الأقل لضمان عدم فقدان أي بيانات.</p>
      </div>
    </div>
  );
}
