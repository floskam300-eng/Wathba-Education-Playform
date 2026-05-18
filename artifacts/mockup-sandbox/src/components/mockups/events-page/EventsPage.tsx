import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard, BookOpen, FileText, Trophy, Radio,
  BarChart2, LogOut, Gamepad2, Zap, Star, Clock, Users,
  Sparkles, Lock, PlayCircle,
} from "lucide-react";

/* ── Sparkle particle ─────────────────────────────────────── */
interface Particle {
  id: number; x: number; y: number;
  size: number; color: string; delay: number; duration: number;
}

function HeaderParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    const colors = ["#f59e0b","#ec4899","#8b5cf6","#10b981","#ef4444","#3b82f6","#f97316","#06b6d4"];
    const ps: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }));
    setParticles(ps);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            opacity: 0.7,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Floating emoji ───────────────────────────────────────── */
function FloatingEmoji({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return (
    <span
      className="absolute text-3xl select-none pointer-events-none"
      style={{ animation: "floatBob 3s ease-in-out infinite", ...style }}
    >
      {emoji}
    </span>
  );
}

/* ── Sidebar nav ──────────────────────────────────────────── */
const navItems = [
  { icon: LayoutDashboard, label: "لوحتي", active: false },
  { icon: BookOpen,        label: "كورساتي", active: false },
  { icon: FileText,        label: "الاختبارات", active: false },
  { icon: BarChart2,       label: "إحصائياتي", active: false },
  { icon: Trophy,          label: "المتصدرون", active: false },
  { icon: Radio,           label: "بث مباشر", active: false },
];

/* ── Event card data ──────────────────────────────────────── */
interface EventCard {
  id: number;
  title: string;
  emoji: string;
  desc: string;
  gradient: string;
  glow: string;
  badge: string;
  badgeBg: string;
  players: number;
  duration: string;
  points: number;
  locked: boolean;
  upcoming?: string;
}

const events: EventCard[] = [
  {
    id: 1,
    title: "تحدي الفيزياء السريع",
    emoji: "⚡",
    desc: "أجب على 10 أسئلة في وقت قياسي واحصد النقاط!",
    gradient: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
    glow: "rgba(249,115,22,0.4)",
    badge: "جديد 🔥",
    badgeBg: "rgba(255,255,255,0.25)",
    players: 142,
    duration: "5 دقائق",
    points: 500,
    locked: false,
  },
  {
    id: 2,
    title: "من سيربح المليون؟",
    emoji: "🏆",
    desc: "تنافس مع زملائك في أسئلة متدرجة الصعوبة!",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #ec4899 100%)",
    glow: "rgba(99,102,241,0.4)",
    badge: "الأكثر شعبية ⭐",
    badgeBg: "rgba(255,255,255,0.2)",
    players: 389,
    duration: "15 دقيقة",
    points: 1000,
    locked: false,
  },
  {
    id: 3,
    title: "بازل المعادلات",
    emoji: "🧩",
    desc: "رتب قطع الأحجية لتكوين معادلة رياضية صحيحة!",
    gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
    glow: "rgba(16,185,129,0.4)",
    badge: "قريباً 🚀",
    badgeBg: "rgba(255,255,255,0.2)",
    players: 0,
    duration: "10 دقائق",
    points: 750,
    locked: false,
    upcoming: "يفتح الجمعة",
  },
  {
    id: 4,
    title: "لغز الكيمياء المجنون",
    emoji: "🧪",
    desc: "خمّن العنصر الكيميائي من تلميحات غريبة وممتعة!",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    glow: "rgba(245,158,11,0.4)",
    badge: "حصري 👑",
    badgeBg: "rgba(255,255,255,0.2)",
    players: 0,
    duration: "8 دقائق",
    points: 600,
    locked: true,
  },
  {
    id: 5,
    title: "مسابقة العلوم الخاطفة",
    emoji: "🔬",
    desc: "سباق ضد الزمن! من يحل أكثر مسائل في دقيقة واحدة؟",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    glow: "rgba(59,130,246,0.4)",
    badge: "موسمي 🎄",
    badgeBg: "rgba(255,255,255,0.2)",
    players: 211,
    duration: "3 دقائق",
    points: 300,
    locked: false,
  },
  {
    id: 6,
    title: "اختبار الذكاء الخارق",
    emoji: "🧠",
    desc: "تحديات منطقية وألغاز ذكاء مستوحاة من المناهج!",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f97316 60%, #f59e0b 100%)",
    glow: "rgba(236,72,153,0.4)",
    badge: "المفضل 💖",
    badgeBg: "rgba(255,255,255,0.2)",
    players: 527,
    duration: "20 دقيقة",
    points: 1500,
    locked: false,
  },
];

/* ── Main component ───────────────────────────────────────── */
export function EventsPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), 100);
    const t2 = setTimeout(() => setCardsVisible(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden font-['Cairo',sans-serif]" style={{ background: "#0f0c1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
          50%       { box-shadow: 0 0 0 6px rgba(249,115,22,0.2); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .card-enter {
          animation: fadeUp 0.55s ease forwards;
        }
        .card-hover {
          transform: translateY(-6px) scale(1.02);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .events-nav-item {
          position: relative;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px;
          font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .events-nav-item:hover {
          background: rgba(255,255,255,0.07);
          color: white;
        }
        .events-nav-item.active-nav {
          background: linear-gradient(135deg, #f97316, #ec4899);
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(249,115,22,0.35);
        }
        .special-nav {
          position: relative;
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 14px;
          font-size: 14px; font-weight: 900;
          cursor: pointer;
          overflow: hidden;
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%);
          color: white;
          box-shadow: 0 4px 24px rgba(124,58,237,0.45);
          animation: pulseBorder 2.5s ease-in-out infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .special-nav:hover {
          transform: scale(1.03);
          box-shadow: 0 6px 30px rgba(124,58,237,0.6);
        }
        .special-nav::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .sparkle-icon {
          animation: spin-slow 4s linear infinite;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #161422 0%, #100e1a 100%)",
        borderLeft: "1px solid rgba(230,175,80,0.1)",
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>و</div>
            <div>
              <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>وثبة</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>منطقة الطالب</div>
            </div>
          </div>
        </div>

        {/* Student info */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 900, fontSize: 16,
            }}>أ</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>أحمد محمد</div>
              <div style={{ color: "#fb923c", fontSize: 11, fontWeight: 700 }}>⭐ 2,340 نقطة</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ icon: Icon, label }) => (
            <div key={label} className="events-nav-item">
              <Icon size={18} />
              <span>{label}</span>
            </div>
          ))}

          {/* Special events nav item */}
          <div style={{ marginTop: 8 }}>
            <div className="special-nav active-nav">
              <Gamepad2 size={18} className="sparkle-icon" style={{ flexShrink: 0 }} />
              <span>الفعاليات</span>
              <span style={{
                marginRight: "auto",
                background: "rgba(255,255,255,0.25)",
                borderRadius: 999, padding: "1px 8px",
                fontSize: 10, fontWeight: 900,
              }}>6 🎮</span>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="events-nav-item" style={{ color: "rgba(252,165,165,0.8)" }}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Animated hero header ── */}
        <div
          style={{
            position: "relative", flexShrink: 0,
            padding: "28px 32px 32px",
            background: "linear-gradient(135deg, #1e0a3c 0%, #3b0764 40%, #1e1035 100%)",
            borderBottom: "1px solid rgba(139,92,246,0.3)",
            overflow: "hidden",
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <HeaderParticles />

          {/* Floating emojis */}
          <FloatingEmoji emoji="🎮" style={{ top: 12, left: 40, animationDelay: "0s", animationDuration: "2.8s" }} />
          <FloatingEmoji emoji="🏆" style={{ top: 8, left: 180, animationDelay: "0.5s", animationDuration: "3.2s" }} />
          <FloatingEmoji emoji="⚡" style={{ bottom: 10, left: 80, animationDelay: "1s", animationDuration: "2.5s" }} />
          <FloatingEmoji emoji="🎯" style={{ top: 16, right: 60, animationDelay: "0.3s", animationDuration: "3s" }} />
          <FloatingEmoji emoji="⭐" style={{ bottom: 16, right: 140, animationDelay: "0.8s", animationDuration: "2.7s" }} />
          <FloatingEmoji emoji="🧠" style={{ top: 20, right: 220, animationDelay: "1.2s", animationDuration: "3.5s" }} />

          {/* Glowing orbs */}
          <div style={{
            position: "absolute", left: "15%", top: "50%", transform: "translateY(-50%)",
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", right: "20%", top: "50%", transform: "translateY(-50%)",
            width: 150, height: 150, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Header text */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 14, marginBottom: 10,
              animation: headerVisible ? "slideDown 0.6s ease forwards" : "none",
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: 18,
                background: "linear-gradient(135deg, #7c3aed, #ec4899, #f97316)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, flexShrink: 0,
                boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
              }}>🎮</div>
              <div>
                <h1 style={{
                  margin: 0, fontSize: 28, fontWeight: 900, color: "white",
                  background: "linear-gradient(90deg, #fff 0%, #c4b5fd 40%, #f9a8d4 80%, #fdba74 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  الفعاليات التعليمية 🎯
                </h1>
                <p style={{ margin: "4px 0 0", color: "rgba(196,181,253,0.8)", fontSize: 13 }}>
                  العب، تعلّم، وتصدّر القائمة! ✨
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 12, marginTop: 16,
              animation: headerVisible ? "slideDown 0.7s 0.15s ease both" : "none",
            }}>
              {[
                { icon: "🎮", label: "فعالية نشطة", val: "4" },
                { icon: "👥", label: "لاعب الآن", val: "1,269" },
                { icon: "🏆", label: "أقصى نقاط", val: "1,500" },
                { icon: "🕹️", label: "قريباً", val: "2" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
                  padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <div>
                    <div style={{ color: "white", fontWeight: 900, fontSize: 16 }}>{s.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cards grid ── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "24px 28px",
          background: "#0f0c1a",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {events.map((ev, i) => (
              <div
                key={ev.id}
                className={cardsVisible ? "card-enter" : ""}
                style={{ animationDelay: cardsVisible ? `${i * 0.08}s` : "0s", opacity: cardsVisible ? undefined : 0 }}
                onMouseEnter={() => setHoveredId(ev.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  style={{
                    borderRadius: 20, overflow: "hidden", cursor: "pointer",
                    transform: hoveredId === ev.id ? "translateY(-6px) scale(1.02)" : "none",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: hoveredId === ev.id
                      ? `0 20px 60px ${ev.glow}, 0 0 0 1px rgba(255,255,255,0.15)`
                      : `0 4px 24px ${ev.glow.replace("0.4", "0.2")}`,
                  }}
                >
                  {/* Card header with gradient */}
                  <div style={{
                    background: ev.gradient,
                    padding: "20px 20px 16px",
                    position: "relative", overflow: "hidden",
                  }}>
                    {/* Shimmer effect */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s linear infinite",
                    }} />

                    {/* Badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center",
                      background: ev.badgeBg, borderRadius: 999,
                      padding: "3px 10px", fontSize: 11, fontWeight: 700,
                      color: "white", marginBottom: 10, position: "relative", zIndex: 1,
                    }}>
                      {ev.badge}
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative", zIndex: 1 }}>
                      <div style={{ fontSize: 40, lineHeight: 1, flexShrink: 0 }}>{ev.emoji}</div>
                      <div>
                        <h3 style={{ margin: 0, color: "white", fontWeight: 900, fontSize: 17, lineHeight: 1.3 }}>
                          {ev.title}
                        </h3>
                        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 1.5 }}>
                          {ev.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div style={{
                    background: "#1a1628", padding: "14px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}>
                    {/* Stats row */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                      {[
                        { Icon: Users, val: ev.players > 0 ? ev.players.toLocaleString("ar-EG") : "—", label: "لاعب" },
                        { Icon: Clock, val: ev.duration, label: "" },
                        { Icon: Star, val: `${ev.points.toLocaleString("ar-EG")} نقطة`, label: "" },
                      ].map(({ Icon, val, label }) => (
                        <div key={val} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icon size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{val} {label}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA button */}
                    {ev.locked ? (
                      <button style={{
                        width: "100%", padding: "10px", borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.35)",
                        fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                        cursor: "not-allowed", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                      }}>
                        <Lock size={14} /> مقفول — اكسب المزيد من النقاط
                      </button>
                    ) : ev.upcoming ? (
                      <button style={{
                        width: "100%", padding: "10px", borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,0.07)",
                        color: "rgba(196,181,253,0.8)",
                        fontFamily: "inherit", fontWeight: 700, fontSize: 14,
                        cursor: "not-allowed", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                      }}>
                        <Clock size={14} /> {ev.upcoming}
                      </button>
                    ) : (
                      <button style={{
                        width: "100%", padding: "10px", borderRadius: 12, border: "none",
                        background: ev.gradient, color: "white",
                        fontFamily: "inherit", fontWeight: 900, fontSize: 14,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6,
                        boxShadow: `0 4px 16px ${ev.glow}`,
                        transition: "opacity 0.2s",
                      }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      >
                        <PlayCircle size={16} /> العب الآن
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom spacer */}
          <div style={{ height: 24 }} />
        </div>
      </main>
    </div>
  );
}
