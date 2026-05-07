import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import WathbaLogo from '../assets/wathba_logo.png';

const ROLES = [
  { value: 'teacher', label: 'معلم', icon: '🎓' },
  { value: 'assistant', label: 'مساعد', icon: '👨‍💼' },
  { value: 'student', label: 'طالب', icon: '📚' },
];

export default function Login() {
  const [role, setRole] = useState('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');
    setLoading(true);
    try {
      const user = await login(username, password, role);
      toast.success(`مرحباً ${user.name}!`);
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-500 via-navy-600 to-navy-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="absolute border border-white/30 rounded-lg"
            style={{
              width: Math.random() * 180 + 60,
              height: Math.random() * 180 + 60,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 45}deg)`,
            }} />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-navy-lg mb-4 overflow-hidden p-1">
            <img src={WathbaLogo} alt="وثبة" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-white mb-1">وثبة</h1>
          <p className="text-white/80 text-sm font-medium">المنصة التعليمية المتكاملة</p>
        </div>

        <div className="bg-white rounded-3xl shadow-navy-lg p-8">
          <h2 className="text-xl font-bold text-navy-600 mb-6 text-center">تسجيل الدخول</h2>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map((r) => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  role === r.value
                    ? 'border-orange-500 bg-orange-50 shadow-orange-glow'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}>
                <span className="text-2xl mb-1">{r.icon}</span>
                <span className={`text-xs font-bold ${role === r.value ? 'text-orange-800' : 'text-gray-800'}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">اسم المستخدم</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم" className="input-field" dir="ltr" autoComplete="username" />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور" className="input-field pl-10" dir="ltr" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-navy-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary text-base py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-100 rounded-xl text-center">
            <p className="text-xs text-gray-700 font-medium">
              المعلم الافتراضي: <span className="font-mono font-bold text-navy-700">admin / admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-white/70 text-xs mt-4 font-medium">
          وثبة © 2024 — منصة التعليم الإلكتروني
        </p>
      </div>
    </div>
  );
}
