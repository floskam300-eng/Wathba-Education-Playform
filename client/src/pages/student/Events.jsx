import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, FileText, Trophy, BarChart2, Radio, Gamepad2, Lock, PlayCircle, Star, Zap, X } from 'lucide-react';
import StickmanRun from './games/StickmanRun';
import api from '../../lib/api';

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
@keyframes slideDown  { from{opacity:0;transform:translateY(-22px) scale(.97)} to{opacity:1;transform:none} }
@keyframes fadeUp     { from{opacity:0;transform:translateY(18px)}            to{opacity:1;transform:none} }
@keyframes floatBob   { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-9px) rotate(3deg)} }
@keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes spin4      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes gridPulse  { 0%,100%{opacity:.07} 50%{opacity:.17} }
@keyframes boltFlash  { 0%,82%,100%{opacity:0} 86%,94%{opacity:1} }
@keyframes arcPulse   { 0%,100%{stroke-dashoffset:220} 50%{stroke-dashoffset:0} }
@keyframes pingDot    { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.8);opacity:0} }
@keyframes comingSoon { 0%,100%{opacity:.4} 50%{opacity:.7} }

.events-card-in { animation: fadeUp 0.45s ease both; }

.special-nav-events {
  position:relative; display:flex; align-items:center; gap:10px;
  padding:11px 14px; border-radius:14px; font-size:14px; font-weight:900;
  cursor:pointer; overflow:hidden; color:white;
  background:linear-gradient(135deg,#7c3aed 0%,#ec4899 50%,#f97316 100%);
  box-shadow:0 4px 22px rgba(124,58,237,.42); transition:transform .2s,box-shadow .2s;
}
.special-nav-events:hover { transform:scale(1.02); box-shadow:0 6px 28px rgba(124,58,237,.6); }
.special-nav-events::before {
  content:''; position:absolute; inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);
  background-size:200% 100%; animation:shimmer 2.2s linear infinite;
}
`;

function HeaderParticles() {
  const [ps, setPs] = useState([]);
  useEffect(() => {
    const cols = ['#f59e0b','#ec4899','#8b5cf6','#10b981','#3b82f6','#f97316'];
    setPs(Array.from({ length: 18 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      s: 4 + Math.random() * 5, c: cols[i % cols.length],
      del: Math.random() * 2, dur: 1.8 + Math.random() * 2.5,
    })));
  }, []);
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {ps.map(p => (
        <div key={p.id} style={{
          position:'absolute', left:`${p.x}%`, top:`${p.y}%`,
          width:p.s, height:p.s, borderRadius:'50%', background:p.c, opacity:.55,
          animation:`pingDot ${p.dur}s ${p.del}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

function NextGameBanner({ pts, nextThreshold, nextTitle, nextEmoji }) {
  const prog = Math.min(100, (pts / nextThreshold) * 100);
  const remaining = Math.max(0, nextThreshold - pts);
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:16, marginTop:16,
      background:'rgba(255,255,255,.055)', backdropFilter:'blur(10px)',
      border:'1px solid rgba(255,255,255,.1)', borderRadius:16,
      padding:'12px 18px',
    }}>
      <div style={{ fontSize:38, lineHeight:1, flexShrink:0, filter:'drop-shadow(0 0 8px rgba(16,185,129,.7))' }}>
        {nextEmoji}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:'rgba(255,255,255,.45)', fontSize:11, marginBottom:2 }}>
          🔓 اللعبة القادمة التي ستفتحها
        </div>
        <div style={{ color:'#fff', fontWeight:900, fontSize:14, marginBottom:6 }}>{nextTitle}</div>
        <div style={{ height:7, borderRadius:999, background:'rgba(255,255,255,.1)', marginBottom:4 }}>
          <div style={{ height:'100%', borderRadius:999, width:`${prog}%`,
            background:'linear-gradient(90deg,#6366f1,#34d399)',
            boxShadow:'0 0 7px rgba(52,211,153,.5)', transition:'width .4s' }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ color:'rgba(255,255,255,.4)', fontSize:11 }}>
            {pts.toLocaleString('ar-EG')} / {nextThreshold.toLocaleString('ar-EG')} نقطة
          </span>
          <span style={{ color:'#34d399', fontSize:11, fontWeight:700 }}>
            {remaining > 0 ? `يتبقى ${remaining.toLocaleString('ar-EG')} نقطة 🚀` : 'يمكنك فتحها الآن! 🎉'}
          </span>
        </div>
      </div>
      <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:5,
        background:'rgba(52,211,153,.12)', border:'1px solid rgba(52,211,153,.28)',
        borderRadius:10, padding:'7px 12px', color:'#34d399', fontSize:12, fontWeight:700 }}>
        <Zap size={13}/> قريباً
      </div>
    </div>
  );
}

function CardWeeklyRun({ played, onPlay, pts }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:'relative', aspectRatio:'1/1', borderRadius:22, overflow:'hidden',
        background:'linear-gradient(145deg,#080820 0%,#141060 55%,#080820 100%)',
        cursor: played ? 'default' : 'pointer',
        transform: hov && !played ? 'translateY(-7px) scale(1.025)' : 'none',
        transition:'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .28s ease',
        boxShadow: hov && !played
          ? '0 22px 60px rgba(99,102,241,.65), 0 0 0 1.5px rgba(255,255,255,.1)'
          : '0 6px 26px rgba(99,102,241,.4)',
      }}
    >
      <div style={{ position:'absolute', inset:0,
        backgroundImage:'linear-gradient(rgba(99,102,241,.9) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.9) 1px,transparent 1px)',
        backgroundSize:'30px 30px', animation:'gridPulse 3s ease-in-out infinite' }} />
      <svg style={{ position:'absolute',top:0,left:0,width:'100%',height:'55%',opacity:.5 }}
        viewBox="0 0 300 120" preserveAspectRatio="none">
        <path d="M10,100 Q80,20 150,70 Q220,20 290,50"
          fill="none" stroke="#818cf8" strokeWidth="2.5"
          strokeDasharray="220" style={{ animation:'arcPulse 4s ease-in-out infinite' }}/>
        <path d="M10,80 Q90,40 180,90 Q240,60 290,80"
          fill="none" stroke="#6366f1" strokeWidth="1.5"
          strokeDasharray="220" style={{ animation:'arcPulse 4s 1s ease-in-out infinite' }}/>
      </svg>
      <div style={{ position:'absolute', top:'8%', left:'50%', transform:'translateX(-50%)',
        fontSize:80, lineHeight:1, animation:'boltFlash 3.5s ease-in-out infinite',
        textShadow:'0 0 28px #818cf8,0 0 55px #6366f1' }}>🏃</div>
      {[{l:'14%',t:'30%',r:28},{l:'72%',t:'22%',r:-18},{l:'84%',t:'52%',r:12},{l:'8%',t:'56%',r:-38}].map((s,i)=>(
        <div key={i} style={{ position:'absolute',top:s.t,left:s.l,
          width:3,height:18,background:'linear-gradient(#fff,#818cf8)',
          borderRadius:2,transform:`rotate(${s.r}deg)`,
          animation:`boltFlash ${2+i*.4}s ${i*.3}s ease-in-out infinite`,opacity:.65 }}/>
      ))}
      <div style={{ position:'absolute', inset:0, zIndex:2,
        background:'linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.15) 55%,transparent 100%)' }} />
      <div style={{ position:'absolute', top:13, right:14, zIndex:3,
        background:'rgba(99,102,241,.32)', backdropFilter:'blur(7px)',
        border:'1px solid rgba(255,255,255,.16)', borderRadius:999,
        padding:'3px 10px', color:'#c7d2fe', fontSize:11, fontWeight:700 }}>
        أسبوعي ⚡
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0 16px 16px', zIndex:3 }}>
        <div style={{ color:'#fff', fontWeight:900, fontSize:16, lineHeight:1.3, marginBottom:2 }}>
          تحدي الأسبوعي الرياضي
        </div>
        <div style={{ color:'rgba(255,255,255,.45)', fontSize:12, marginBottom:10 }}>
          ٣ بوسات معادلات رياضية 🧮 • حتى {300} نقطة
        </div>
        <button
          onClick={played ? undefined : onPlay}
          style={{
            width:'100%', padding:'9px 0', borderRadius:11, border:'none',
            background: played ? 'rgba(255,255,255,.07)' : 'rgba(99,102,241,.4)',
            backdropFilter:'blur(10px)', color: played ? 'rgba(255,255,255,.35)' : '#fff',
            fontFamily:'inherit', fontWeight:700, fontSize:13, cursor: played ? 'default' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            transition:'background .2s',
          }}
        >
          {played ? <><span style={{ fontSize:14 }}>✅</span> لعبت هذا الأسبوع</> : <><PlayCircle size={15}/> العب الآن</>}
        </button>
      </div>
    </div>
  );
}

function CardComingSoon({ title, emoji, label, labelColor, bgFrom, bgTo, glowColor, unlockPts, currentPts }) {
  const locked = currentPts < unlockPts;
  const prog = Math.min(100, (currentPts / unlockPts) * 100);
  return (
    <div style={{
      position:'relative', aspectRatio:'1/1', borderRadius:22, overflow:'hidden',
      background:`linear-gradient(145deg,${bgFrom} 0%,${bgTo} 100%)`,
      boxShadow:`0 6px 26px ${glowColor}`,
    }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1 }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:2, textAlign:'center' }}>
        <div style={{ fontSize:52, filter:'grayscale(0.6)', marginBottom:8 }}>{emoji}</div>
        <div style={{ color:'rgba(255,255,255,.5)', fontSize:14, fontWeight:900 }}>{title}</div>
        <div style={{ marginTop:8, color:'rgba(255,255,255,.3)', fontSize:12 }}>
          {locked ? `يحتاج ${unlockPts.toLocaleString('ar-EG')} نقطة` : 'قريباً...'}
        </div>
        {locked && (
          <div style={{ marginTop:8, width:80, height:5, borderRadius:999, background:'rgba(255,255,255,.1)', margin:'8px auto 0' }}>
            <div style={{ height:'100%', borderRadius:999, width:`${prog}%`, background:`linear-gradient(90deg,#6366f1,${labelColor})` }}/>
          </div>
        )}
      </div>
      <div style={{ position:'absolute', top:12, right:13, zIndex:3,
        background:'rgba(0,0,0,.4)', borderRadius:999,
        padding:'3px 9px', color:labelColor, fontSize:10, fontWeight:700,
        animation:'comingSoon 2.5s ease-in-out infinite' }}>
        {label}
      </div>
    </div>
  );
}

const COMING_SOON_CARDS = [
  { title:'مسابقة رمضان الكريم', emoji:'🏮', label:'رمضان 🌙', labelColor:'#fde68a', bgFrom:'#0a1a10', bgTo:'#0f2a18', glowColor:'rgba(212,175,55,.3)', unlockPts:500 },
  { title:'مسابقة عيد الفطر', emoji:'☪️', label:'عيد الفطر 🎉', labelColor:'#a7f3d0', bgFrom:'#042f26', bgTo:'#065f46', glowColor:'rgba(52,211,153,.3)', unlockPts:1000 },
  { title:'ليلة الهالوين', emoji:'🎃', label:'هالوين 🎃', labelColor:'#fed7aa', bgFrom:'#100808', bgTo:'#2a0d00', glowColor:'rgba(249,115,22,.3)', unlockPts:1500 },
  { title:'عيد الكريسماس', emoji:'🎄', label:'كريسماس 🎁', labelColor:'#fca5a5', bgFrom:'#080c1e', bgTo:'#141c38', glowColor:'rgba(239,68,68,.3)', unlockPts:2000 },
  { title:'مسابقة العلوم', emoji:'🔬', label:'علوم أسبوعي 🧬', labelColor:'#a7f3d0', bgFrom:'#011f16', bgTo:'#042f26', glowColor:'rgba(16,185,129,.3)', unlockPts:600 },
];

export default function Events() {
  const { user } = useAuth();
  const [hIn, setHIn] = useState(false);
  const [cIn, setCIn] = useState(false);
  const [weeklyPlayed, setWeeklyPlayed] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const pts = user?.points || 0;

  useEffect(() => {
    const a = setTimeout(() => setHIn(true), 60);
    const b = setTimeout(() => setCIn(true), 400);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    api.get('/events/weekly-run/status').then(r => {
      setWeeklyPlayed(r.data.played);
    }).catch(() => {});
  }, []);

  const nextLocked = COMING_SOON_CARDS
    .filter(c => pts < c.unlockPts)
    .sort((a, b) => a.unlockPts - b.unlockPts)[0];

  return (
    <div dir="rtl" style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'Cairo',sans-serif", background:'#0a0812' }}>
      <style>{GLOBAL_CSS}</style>

      {gameOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:100,
          background:'rgba(6,6,18,0.95)', backdropFilter:'blur(8px)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'16px',
        }}>
          <div style={{ width:'100%', maxWidth:920, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ color:'#fff', fontWeight:900, fontSize:18, margin:0 }}>
                🎮 تحدي الأسبوعي الرياضي
              </h2>
              <button onClick={() => { setGameOpen(false); api.get('/events/weekly-run/status').then(r=>setWeeklyPlayed(r.data.played)).catch(()=>{}); }}
                style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:8, padding:'6px 10px', color:'rgba(255,255,255,.7)', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:12, fontFamily:'inherit' }}>
                <X size={14}/> إغلاق
              </button>
            </div>
            <StickmanRun
              academicStage={user?.academic_stage}
              onClose={() => {
                setGameOpen(false);
                api.get('/events/weekly-run/status').then(r => setWeeklyPlayed(r.data.played)).catch(() => {});
              }}
            />
          </div>
        </div>
      )}

      <div style={{
        position:'relative', flexShrink:0, padding:'20px 26px 22px',
        background:'linear-gradient(135deg,#1a0838 0%,#350768 40%,#1a0e30 100%)',
        borderBottom:'1px solid rgba(139,92,246,.18)', overflow:'hidden',
        opacity:hIn?1:0, transition:'opacity .4s ease',
      }}>
        <HeaderParticles/>
        {[{e:'🎮',t:'6%',l:'2%',d:'0s',dur:'2.8s'},{e:'🏆',t:'4%',l:'13%',d:'.5s',dur:'3.1s'},
          {e:'⚡',t:'62%',l:'4%',d:'1s',dur:'2.5s'},{e:'🎯',t:'8%',r:'4%',d:'.3s',dur:'3s'},
          {e:'🧠',t:'10%',r:'15%',d:'1s',dur:'3.4s'}].map((f,i)=>(
          <span key={i} style={{ position:'absolute',top:f.t,left:f.l||undefined,right:f.r||undefined,
            fontSize:24,pointerEvents:'none',userSelect:'none',
            animation:`floatBob ${f.dur} ${f.d} ease-in-out infinite` }}>{f.e}</span>
        ))}
        <div style={{ position:'absolute',left:'18%',top:'50%',transform:'translateY(-50%)',
          width:170,height:170,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(124,58,237,.18) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute',right:'22%',top:'50%',transform:'translateY(-50%)',
          width:120,height:120,borderRadius:'50%',pointerEvents:'none',
          background:'radial-gradient(circle,rgba(236,72,153,.12) 0%,transparent 70%)' }}/>
        <div style={{ position:'relative',zIndex:1, animation:hIn?'slideDown .55s ease both':'none' }}>
          <div style={{ display:'flex',alignItems:'center',gap:13 }}>
            <div style={{ width:50,height:50,borderRadius:16,flexShrink:0,fontSize:22,
              background:'linear-gradient(135deg,#7c3aed,#ec4899,#f97316)',
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 8px 28px rgba(124,58,237,.48)' }}>🎮</div>
            <div>
              <h1 style={{ margin:0,fontSize:22,fontWeight:900,
                background:'linear-gradient(90deg,#fff 0%,#c4b5fd 40%,#f9a8d4 75%,#fdba74 100%)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
                الفعاليات التعليمية 🎯
              </h1>
              <p style={{ margin:'2px 0 0',color:'rgba(196,181,253,.65)',fontSize:12 }}>
                كل مناسبة ليها لعبة خاصة — اجمع نقاط وافتح الألعاب الجديدة ✨
              </p>
            </div>
          </div>
          {nextLocked && (
            <NextGameBanner
              pts={pts}
              nextThreshold={nextLocked.unlockPts}
              nextTitle={nextLocked.title}
              nextEmoji={nextLocked.emoji}
            />
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 22px', background:'#0a0812' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:18 }}>
          <div className={cIn ? 'events-card-in' : ''} style={{ animationDelay:'0s', opacity:cIn?undefined:0 }}>
            <CardWeeklyRun played={weeklyPlayed} onPlay={() => setGameOpen(true)} pts={pts} />
          </div>
          {COMING_SOON_CARDS.map((c, i) => (
            <div key={c.title} className={cIn ? 'events-card-in' : ''} style={{ animationDelay:`${(i+1)*0.07}s`, opacity:cIn?undefined:0 }}>
              <CardComingSoon {...c} currentPts={pts} />
            </div>
          ))}
        </div>
        <div style={{ height:24 }} />
      </div>
    </div>
  );
}
