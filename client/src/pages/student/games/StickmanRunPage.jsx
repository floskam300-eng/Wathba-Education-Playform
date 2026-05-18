import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import StickmanRun from './StickmanRun';

export default function StickmanRunPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#060612', fontFamily: "'Cairo', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 20px', borderBottom: '1px solid rgba(124,58,237,.2)',
        background: 'rgba(6,6,18,.95)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('/student/events')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
            borderRadius: 10, border: '1px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.7)',
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.13)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)'; }}
        >
          <ArrowRight size={15} />
          الفعاليات
        </button>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.12)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124,58,237,.5)',
          }}>
            <Gamepad2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>
              تحدي الأسبوعي الرياضي
            </div>
            <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>
              مرة واحدة في الأسبوع • حتى 300 نقطة
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.28)',
          borderRadius: 8, padding: '5px 12px',
          color: '#fbbf24', fontSize: 13, fontWeight: 700,
        }}>
          ⭐ {user?.points?.toLocaleString('ar-EG') || '0'} نقطة
        </div>
      </div>

      {/* Game area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', gap: 18,
      }}>
        <div style={{ width: '100%', maxWidth: 920 }}>
          <StickmanRun
            academicStage={user?.academic_stage}
            onClose={() => navigate('/student/events')}
          />
        </div>

        {/* Tip bar */}
        <div style={{
          width: '100%', maxWidth: 920,
          display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
        }}>
          {[
            ['⬆️', 'مسافة / سهم لفوق / W', 'قفز'],
            ['⬇️', 'سهم لتحت / S', 'اركع'],
            ['📱', 'اضغط فوق / تحت', 'موبايل'],
            ['🎯', 'إجابة صح', 'نقاط'],
            ['❤️', '3 أرواح', 'تبدأ بيها'],
          ].map(([ic, keys, desc]) => (
            <div key={desc} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 8, padding: '6px 12px',
            }}>
              <span style={{ fontSize: 16 }}>{ic}</span>
              <div>
                <div style={{ color: 'rgba(255,255,255,.25)', fontSize: 9 }}>{keys}</div>
                <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, fontWeight: 700 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
