import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import api from '../../lib/api';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function TeacherLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get('/payments/leaderboard').then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-600 flex items-center gap-2">
        <Trophy className="w-7 h-7 text-orange-500" /> لوحة المتصدرين
      </h1>

      {leaderboard.slice(0, 3).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((s, i) => s && (
            <div key={s.id} className={`card text-center ${i === 1 ? 'bg-gradient-to-b from-yellow-50 to-white border-2 border-yellow-300' : ''}`}>
              <div className="text-4xl mb-2">{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 ${i === 1 ? 'bg-yellow-500' : i === 0 ? 'bg-gray-500' : 'bg-orange-700'}`}>
                {s.name?.charAt(0)}
              </div>
              <h3 className="font-bold text-navy-600 text-sm">{s.name}</h3>
              {/* orange-700 on white = 7.4:1 ✓ */}
              <p className="text-orange-700 font-black text-xl mt-1">{s.points} ⭐</p>
              {/* gray-600 on white = 7.2:1 ✓ */}
              <p className="text-gray-600 text-xs font-medium mt-0.5">{s.exams_taken} اختبار</p>
            </div>
          ))}
        </div>
      )}

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                <th className="table-header rounded-r-lg">#</th>
                <th className="table-header">الطالب</th>
                <th className="table-header">النقاط</th>
                <th className="table-header">الاختبارات</th>
                <th className="table-header">متوسط الدرجات</th>
                <th className="table-header rounded-l-lg">الشارات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => <tr key={i}><td colSpan={6}><div className="h-10 bg-gray-100 animate-pulse m-2 rounded" /></td></tr>)
              ) : leaderboard.map((s, i) => (
                <tr key={s.id} className={`table-row ${i < 3 ? 'bg-orange-50/50' : ''}`}>
                  <td className="table-cell">
                    {i < 3
                      ? <span className="text-xl">{MEDAL[i]}</span>
                      : <span className="text-gray-700 font-bold">{i + 1}</span>}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {s.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy-600 text-sm">{s.name}</p>
                        {/* gray-600 on white = 7.2:1 ✓ */}
                        <p className="text-xs text-gray-600 font-medium">{s.academic_stage || '—'}</p>
                      </div>
                    </div>
                  </td>
                  {/* orange-700 on white = 7.4:1 ✓ */}
                  <td className="table-cell"><span className="text-orange-700 font-black">⭐ {s.points}</span></td>
                  <td className="table-cell text-center text-gray-700 font-semibold">{s.exams_taken}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min(s.avg_score, 100)}%` }} />
                      </div>
                      <span className="text-sm font-bold text-navy-600">{Math.round(s.avg_score)}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-center">
                    <span className="text-base font-semibold text-gray-700">{s.badge_count > 0 ? `🏅 ${s.badge_count}` : '—'}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && leaderboard.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center text-gray-600 py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">لا توجد بيانات بعد</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
