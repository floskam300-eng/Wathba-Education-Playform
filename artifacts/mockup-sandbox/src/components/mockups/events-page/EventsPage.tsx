import { useEffect, useState } from "react";
import {
  LayoutDashboard, BookOpen, FileText, Trophy, Radio,
  BarChart2, LogOut, Gamepad2, Lock, PlayCircle, Star,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   HEADER PARTICLES
═══════════════════════════════════════════════ */
interface Particle { id: number; x: number; y: number; size: number; color: string; delay: number; dur: number; }
function HeaderParticles() {
  const [ps, setPs] = useState<Particle[]>([]);
  useEffect(() => {
    const colors = ["#f59e0b","#ec4899","#8b5cf6","#10b981","#ef4444","#3b82f6","#f97316"];
    setPs(Array.from({ length: 22 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 4 + Math.random() * 7, color: colors[i % colors.length],
      delay: Math.random() * 2, dur: 2 + Math.random() * 3,
    })));
  }, []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {ps.map(p => (
        <div key={p.id} className="absolute rounded-full animate-ping"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size,
            backgroundColor: p.color, opacity: 0.65,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════ */
const navItems = [
  { icon: LayoutDashboard, label: "لوحتي" },
  { icon: BookOpen, label: "كورساتي" },
  { icon: FileText, label: "الاختبارات" },
  { icon: BarChart2, label: "إحصائياتي" },
  { icon: Trophy, label: "المتصدرون" },
  { icon: Radio, label: "بث مباشر" },
];

/* ═══════════════════════════════════════════════
   CARD DESIGNS — each card is a self-contained component
═══════════════════════════════════════════════ */

/* ── 1. Weekly Physics — electric spark look ── */
function CardPhysics({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#0a0a2e 0%,#1a1060 50%,#0d0d3d 100%)"
      glowColor="rgba(99,102,241,0.5)">
      {/* electric grid lines */}
      <div style={{ position:"absolute", inset:0, opacity:0.12,
        backgroundImage:"linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)",
        backgroundSize:"28px 28px" }} />
      {/* big lightning bolt */}
      <div style={{ position:"absolute", top:"8%", right:"12%", fontSize:70, opacity:0.18, lineHeight:1 }}>⚡</div>
      {/* sparks */}
      {["10%","35%","60%","80%"].map((t,i) => (
        <div key={i} style={{ position:"absolute", top:t, left:`${15+i*18}%`,
          width:3, height:18, background:"#818cf8", borderRadius:2,
          opacity:0.5, transform:`rotate(${-20+i*15}deg)` }} />
      ))}
      <CardContent emoji="⚡" title="تحدي الفيزياء الخاطف" subtitle="أسبوعي • 500 نقطة"
        badgeText="أسبوعي" badgeBg="rgba(99,102,241,0.35)" textColor="#c7d2fe" />
    </CardShell>
  );
}

/* ── 2. Ramadan — lanterns & crescent ── */
function CardRamadan({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#0d1b2a 0%,#1a2f1a 40%,#0f2020 100%)"
      glowColor="rgba(212,175,55,0.5)">
      {/* starfield */}
      {Array.from({length:14},(_,i)=>(
        <div key={i} style={{ position:"absolute",
          top:`${8+Math.floor(i/3)*22}%`, left:`${8+((i*31)%80)}%`,
          width: i%3===0?3:2, height: i%3===0?3:2,
          borderRadius:"50%", background:"#fde68a", opacity:0.6+i%3*0.2 }} />
      ))}
      {/* crescent moon */}
      <div style={{ position:"absolute", top:"6%", right:"10%",
        width:48, height:48, borderRadius:"50%",
        background:"transparent", boxShadow:"-8px 4px 0 0 #fbbf24",
        opacity:0.85 }} />
      {/* big lantern */}
      <div style={{ position:"absolute", bottom:"8%", right:"8%", opacity:0.22 }}>
        <div style={{ fontSize:52, lineHeight:1 }}>🏮</div>
      </div>
      {/* small lanterns */}
      <div style={{ position:"absolute", top:"10%", left:"8%", fontSize:22, opacity:0.3 }}>🏮</div>
      <div style={{ position:"absolute", bottom:"20%", left:"14%", fontSize:16, opacity:0.25 }}>🏮</div>
      {/* festoon string */}
      <svg style={{ position:"absolute", top:0, left:0, width:"100%", height:40, opacity:0.4 }} viewBox="0 0 300 40">
        <path d="M0,8 Q50,32 100,8 Q150,32 200,8 Q250,32 300,8" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
        {[50,100,150,200,250].map(x=>(
          <ellipse key={x} cx={x} cy={24} rx={5} ry={8} fill="#ef4444" opacity={0.7}/>
        ))}
      </svg>
      <CardContent emoji="🌙" title="رمضان كريم" subtitle="طوال رمضان • 1000 نقطة"
        badgeText="رمضان ✨" badgeBg="rgba(212,175,55,0.3)" textColor="#fde68a" />
    </CardShell>
  );
}

/* ── 3. Eid al-Fitr — flowers & celebration ── */
function CardEid({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#065f46 0%,#047857 50%,#064e3b 100%)"
      glowColor="rgba(52,211,153,0.5)">
      {/* confetti rects */}
      {[
        {top:"12%",left:"10%",w:10,h:4,bg:"#fde68a",rot:30},
        {top:"20%",left:"55%",w:8,h:3,bg:"#f9a8d4",rot:-20},
        {top:"35%",left:"25%",w:6,h:6,bg:"#86efac",rot:45},
        {top:"15%",left:"75%",w:9,h:3,bg:"#c4b5fd",rot:15},
        {top:"55%",left:"8%",w:7,h:3,bg:"#fcd34d",rot:-35},
        {top:"60%",left:"70%",w:10,h:4,bg:"#fb923c",rot:25},
      ].map((r,i)=>(
        <div key={i} style={{ position:"absolute", top:r.top, left:r.left,
          width:r.w, height:r.h, background:r.bg, borderRadius:2, opacity:0.8,
          transform:`rotate(${r.rot}deg)` }} />
      ))}
      {/* star and crescent */}
      <div style={{ position:"absolute", top:"8%", right:"12%", fontSize:38, opacity:0.25 }}>☪️</div>
      {/* flower decorations */}
      <div style={{ position:"absolute", bottom:"6%", left:"6%", fontSize:28, opacity:0.35, lineHeight:1 }}>🌸</div>
      <div style={{ position:"absolute", bottom:"14%", right:"8%", fontSize:20, opacity:0.3 }}>🌸</div>
      <div style={{ position:"absolute", top:"18%", left:"14%", fontSize:16, opacity:0.3 }}>✿</div>
      <CardContent emoji="🎉" title="عيد الفطر المبارك" subtitle="عيد الفطر • 1200 نقطة"
        badgeText="عيد الفطر 🌙" badgeBg="rgba(52,211,153,0.3)" textColor="#a7f3d0" />
    </CardShell>
  );
}

/* ── 4. Halloween — dark pumpkins & spiderwebs ── */
function CardHalloween({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#1a0a00 0%,#2d1000 50%,#150a1a 100%)"
      glowColor="rgba(249,115,22,0.5)">
      {/* spiderweb SVG */}
      <svg style={{ position:"absolute", top:0, right:0, width:90, height:90, opacity:0.25 }} viewBox="0 0 90 90">
        <line x1="0" y1="0" x2="90" y2="90" stroke="#aaa" strokeWidth="1"/>
        <line x1="45" y1="0" x2="45" y2="90" stroke="#aaa" strokeWidth="1"/>
        <line x1="90" y1="0" x2="0" y2="90" stroke="#aaa" strokeWidth="1"/>
        <line x1="0" y1="45" x2="90" y2="45" stroke="#aaa" strokeWidth="1"/>
        {[15,30,50,70].map(r=><circle key={r} cx="45" cy="45" r={r} fill="none" stroke="#888" strokeWidth="0.8"/>)}
      </svg>
      {/* bats */}
      <div style={{ position:"absolute", top:"10%", left:"12%", fontSize:22, opacity:0.5, transform:"scaleX(-1)" }}>🦇</div>
      <div style={{ position:"absolute", top:"22%", left:"42%", fontSize:14, opacity:0.4 }}>🦇</div>
      {/* big pumpkin */}
      <div style={{ position:"absolute", bottom:"5%", right:"8%", fontSize:48, opacity:0.2, lineHeight:1 }}>🎃</div>
      {/* small pumpkin */}
      <div style={{ position:"absolute", bottom:"10%", left:"8%", fontSize:24, opacity:0.3 }}>🎃</div>
      {/* moon */}
      <div style={{ position:"absolute", top:"6%", right:"30%",
        width:30, height:30, borderRadius:"50%",
        background:"transparent", boxShadow:"-5px 3px 0 0 #fbbf24", opacity:0.5 }} />
      <CardContent emoji="🎃" title="ليلة الهالوين" subtitle="أكتوبر • 800 نقطة"
        badgeText="هالوين 👻" badgeBg="rgba(249,115,22,0.3)" textColor="#fed7aa" />
    </CardShell>
  );
}

/* ── 5. Christmas — snow & trees ── */
function CardChristmas({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#0f172a 0%,#1e1b4b 40%,#0c1120 100%)"
      glowColor="rgba(239,68,68,0.5)">
      {/* snowflakes */}
      {["12%","30%","55%","72%","88%","20%","65%"].map((l,i)=>(
        <div key={i} style={{ position:"absolute", top:`${8+i*10}%`, left:l,
          fontSize:i%2===0?14:10, opacity:0.4+i%3*0.1, color:"#bfdbfe" }}>❄</div>
      ))}
      {/* big tree */}
      <div style={{ position:"absolute", bottom:"4%", right:"8%", fontSize:52, opacity:0.2, lineHeight:1 }}>🎄</div>
      {/* small tree */}
      <div style={{ position:"absolute", bottom:"8%", left:"6%", fontSize:26, opacity:0.25 }}>🎄</div>
      {/* star on top */}
      <div style={{ position:"absolute", bottom:"34%", right:"14%", fontSize:18, opacity:0.45 }}>⭐</div>
      {/* gift */}
      <div style={{ position:"absolute", bottom:"4%", left:"38%", fontSize:22, opacity:0.3 }}>🎁</div>
      {/* snow ground */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:18, opacity:0.15,
        borderRadius:"50% 50% 0 0 / 100% 100% 0 0",
        background:"linear-gradient(180deg,#e0f2fe,white)" }} />
      <CardContent emoji="🎄" title="عيد الكريسماس" subtitle="ديسمبر • 900 نقطة"
        badgeText="كريسماس 🎁" badgeBg="rgba(239,68,68,0.3)" textColor="#bfdbfe" />
    </CardShell>
  );
}

/* ── 6. Science weekly — lab & atoms ── */
function CardScience({ locked, points, threshold }: CardProps) {
  return (
    <CardShell locked={locked} points={points} threshold={threshold}
      bg="linear-gradient(145deg,#042f2e 0%,#064e3b 50%,#022c22 100%)"
      glowColor="rgba(16,185,129,0.5)">
      {/* atom rings SVG */}
      <svg style={{ position:"absolute", top:"5%", right:"6%", width:80, height:80, opacity:0.2 }} viewBox="0 0 80 80">
        <ellipse cx="40" cy="40" rx="36" ry="14" fill="none" stroke="#34d399" strokeWidth="2"/>
        <ellipse cx="40" cy="40" rx="36" ry="14" fill="none" stroke="#34d399" strokeWidth="2" transform="rotate(60 40 40)"/>
        <ellipse cx="40" cy="40" rx="36" ry="14" fill="none" stroke="#34d399" strokeWidth="2" transform="rotate(120 40 40)"/>
        <circle cx="40" cy="40" r="6" fill="#6ee7b7"/>
      </svg>
      {/* bubbles */}
      {[{top:"18%",left:"8%",s:20},{top:"40%",left:"18%",s:13},{top:"60%",left:"6%",s:16},{top:"22%",left:"50%",s:10}].map((b,i)=>(
        <div key={i} style={{ position:"absolute", top:b.top, left:b.left,
          width:b.s, height:b.s, borderRadius:"50%",
          border:"1.5px solid rgba(52,211,153,0.5)", opacity:0.45 }} />
      ))}
      {/* beakers */}
      <div style={{ position:"absolute", bottom:"6%", right:"8%", fontSize:40, opacity:0.2, lineHeight:1 }}>🧪</div>
      <div style={{ position:"absolute", bottom:"10%", left:"8%", fontSize:22, opacity:0.3 }}>🔬</div>
      <CardContent emoji="🔬" title="مسابقة العلوم الأسبوعية" subtitle="أسبوعي • 600 نقطة"
        badgeText="علوم 🧬" badgeBg="rgba(16,185,129,0.3)" textColor="#a7f3d0" />
    </CardShell>
  );
}

/* ═══════════════════════════════════════════════
   REUSABLE CARD SHELL & CONTENT
═══════════════════════════════════════════════ */
interface CardProps { locked: boolean; points: number; threshold: number; }

function CardShell({ locked, points, threshold, bg, glowColor, children }: CardProps & {
  bg: string; glowColor: string; children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const progress = Math.min(100, (points / threshold) * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", aspectRatio: "1/1", borderRadius: 24, overflow: "hidden",
        background: bg, cursor: locked ? "default" : "pointer",
        transform: hovered && !locked ? "translateY(-6px) scale(1.03)" : "none",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hovered && !locked
          ? `0 20px 60px ${glowColor}, 0 0 0 1.5px rgba(255,255,255,0.1)`
          : `0 6px 28px ${glowColor.replace("0.5","0.2")}`,
      }}
    >
      {/* decorations from parent */}
      {children}

      {/* dark gradient overlay so text is readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
        zIndex: 1,
      }} />

      {/* LOCK OVERLAY */}
      {locked && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "rgba(0,0,0,0.68)", backdropFilter: "blur(3px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={24} color="white" />
          </div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700, textAlign: "center" }}>
            تحتاج {threshold.toLocaleString("ar-EG")} نقطة
          </div>
          {/* progress bar */}
          <div style={{ width: "65%", height: 6, borderRadius: 999, background: "rgba(255,255,255,0.15)" }}>
            <div style={{
              height: "100%", borderRadius: 999, width: `${progress}%`,
              background: "linear-gradient(90deg,#6366f1,#ec4899)",
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
            {points.toLocaleString("ar-EG")} / {threshold.toLocaleString("ar-EG")}
          </div>
        </div>
      )}
    </div>
  );
}

function CardContent({ emoji, title, subtitle, badgeText, badgeBg, textColor }: {
  emoji: string; title: string; subtitle: string;
  badgeText: string; badgeBg: string; textColor: string;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 2,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "14px 16px",
    }}>
      {/* Top: badge */}
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: badgeBg, backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 999, padding: "3px 10px",
          color: textColor, fontSize: 11, fontWeight: 700,
        }}>
          {badgeText}
        </div>
      </div>

      {/* Bottom: emoji + title + play */}
      <div>
        <div style={{ fontSize: 38, lineHeight: 1, marginBottom: 8 }}>{emoji}</div>
        <div style={{ color: "white", fontWeight: 900, fontSize: 16, lineHeight: 1.35, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginBottom: 12 }}>
          {subtitle}
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          width: "100%", padding: "9px 0", borderRadius: 12, border: "none",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          color: "white", fontFamily: "inherit", fontWeight: 700, fontSize: 13,
          cursor: "pointer",
        }}>
          <PlayCircle size={15} /> العب الآن
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const STUDENT_POINTS = 820;

const cardList = [
  { id: 1, component: CardPhysics,   threshold: 0 },
  { id: 2, component: CardRamadan,   threshold: 500 },
  { id: 3, component: CardScience,   threshold: 600 },
  { id: 4, component: CardEid,       threshold: 1000 },
  { id: 5, component: CardHalloween, threshold: 1500 },
  { id: 6, component: CardChristmas, threshold: 2000 },
];

export function EventsPage() {
  const [headerIn, setHeaderIn] = useState(false);
  const [cardsIn, setCardsIn] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderIn(true), 100);
    const t2 = setTimeout(() => setCardsIn(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden"
      style={{ background: "#0f0c1a", fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        @keyframes slideDown { from { opacity:0; transform:translateY(-32px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer   { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes floatBob  { 0%,100% { transform:translateY(0) rotate(-4deg); } 50% { transform:translateY(-10px) rotate(4deg); } }
        @keyframes spin4     { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .card-in { animation: fadeUp 0.5s ease both; }
        .nav-link { display:flex; align-items:center; gap:10px; padding:9px 14px; border-radius:12px;
          font-size:14px; font-weight:600; color:rgba(255,255,255,0.6); cursor:pointer;
          transition:background 0.18s, color 0.18s; }
        .nav-link:hover { background:rgba(255,255,255,0.07); color:white; }
        .special-nav {
          position:relative; display:flex; align-items:center; gap:10px;
          padding:11px 14px; border-radius:14px; font-size:14px; font-weight:900;
          cursor:pointer; overflow:hidden; color:white;
          background:linear-gradient(135deg,#7c3aed 0%,#ec4899 50%,#f97316 100%);
          box-shadow:0 4px 24px rgba(124,58,237,0.45);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .special-nav:hover { transform:scale(1.03); box-shadow:0 6px 30px rgba(124,58,237,0.65); }
        .special-nav::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          background-size:200% 100%; animation:shimmer 2.2s linear infinite;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width:240, flexShrink:0, display:"flex", flexDirection:"column",
        background:"linear-gradient(180deg,#161422 0%,#100e1a 100%)",
        borderLeft:"1px solid rgba(230,175,80,0.09)" }}>

        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:12, flexShrink:0,
              background:"linear-gradient(135deg,#7c3aed,#ec4899)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>و</div>
            <div>
              <div style={{ color:"white", fontWeight:900, fontSize:20 }}>وثبة</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:11 }}>منطقة الطالب</div>
            </div>
          </div>
        </div>

        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#f97316,#ec4899)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"white", fontWeight:900, fontSize:16 }}>أ</div>
            <div>
              <div style={{ color:"white", fontWeight:700, fontSize:13 }}>أحمد محمد</div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                <Star size={11} style={{ color:"#fb923c" }} />
                <span style={{ color:"#fb923c", fontSize:11, fontWeight:700 }}>
                  {STUDENT_POINTS.toLocaleString("ar-EG")} نقطة
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:3 }}>
          {navItems.map(({ icon: Icon, label }) => (
            <div key={label} className="nav-link">
              <Icon size={18} /><span>{label}</span>
            </div>
          ))}
          <div style={{ marginTop:8 }}>
            <div className="special-nav">
              <Gamepad2 size={18} style={{ flexShrink:0, animation:"spin4 5s linear infinite" }} />
              <span>الفعاليات</span>
              <span style={{ marginRight:"auto", background:"rgba(255,255,255,0.22)",
                borderRadius:999, padding:"1px 8px", fontSize:10, fontWeight:900 }}>6 🎮</span>
            </div>
          </div>
        </nav>

        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="nav-link" style={{ color:"rgba(252,165,165,0.75)" }}>
            <LogOut size={18} /><span>تسجيل الخروج</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{
          position:"relative", flexShrink:0, padding:"26px 32px 28px",
          background:"linear-gradient(135deg,#1e0a3c 0%,#3b0764 40%,#1e1035 100%)",
          borderBottom:"1px solid rgba(139,92,246,0.25)", overflow:"hidden",
          opacity: headerIn ? 1 : 0, transition:"opacity 0.4s ease",
        }}>
          <HeaderParticles />

          {/* floating emojis */}
          {[
            {e:"🎮",top:"10%",left:"3%",d:"0s",dur:"2.8s"},
            {e:"🏆",top:"6%",left:"15%",d:"0.5s",dur:"3.2s"},
            {e:"⚡",top:"65%",left:"6%",d:"1s",dur:"2.5s"},
            {e:"🎯",top:"12%",right:"5%",d:"0.3s",dur:"3s"},
            {e:"🧠",top:"14%",right:"18%",d:"1.1s",dur:"3.5s"},
          ].map((f,i)=>(
            <span key={i} style={{
              position:"absolute", top:f.top, left:(f as any).left, right:(f as any).right,
              fontSize:28, pointerEvents:"none", userSelect:"none",
              animation:`floatBob ${f.dur} ease-in-out infinite`, animationDelay:f.d,
            }}>{f.e}</span>
          ))}

          {/* glow orbs */}
          <div style={{ position:"absolute", left:"18%", top:"50%", transform:"translateY(-50%)",
            width:180, height:180, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)" }} />
          <div style={{ position:"absolute", right:"22%", top:"50%", transform:"translateY(-50%)",
            width:130, height:130, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle,rgba(236,72,153,0.18) 0%,transparent 70%)" }} />

          <div style={{ position:"relative", zIndex:1,
            animation: headerIn ? "slideDown 0.6s ease both" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:18, flexShrink:0, fontSize:24,
                background:"linear-gradient(135deg,#7c3aed,#ec4899,#f97316)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 30px rgba(124,58,237,0.5)" }}>🎮</div>
              <div>
                <h1 style={{
                  margin:0, fontSize:26, fontWeight:900,
                  background:"linear-gradient(90deg,#fff 0%,#c4b5fd 40%,#f9a8d4 75%,#fdba74 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                }}>الفعاليات التعليمية 🎯</h1>
                <p style={{ margin:"4px 0 0", color:"rgba(196,181,253,0.75)", fontSize:13 }}>
                  كل مناسبة ليها لعبة خاصة — اجمع نقاط وافتح الألعاب الجديدة ✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", background:"#0f0c1a" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
            gap:20,
          }}>
            {cardList.map(({ id, component: Comp, threshold }, i) => (
              <div key={id}
                className={cardsIn ? "card-in" : ""}
                style={{ animationDelay: cardsIn ? `${i * 0.07}s` : "0s", opacity: cardsIn ? undefined : 0 }}>
                <Comp locked={STUDENT_POINTS < threshold} points={STUDENT_POINTS} threshold={threshold} />
              </div>
            ))}
          </div>
          <div style={{ height:24 }} />
        </div>
      </main>
    </div>
  );
}
