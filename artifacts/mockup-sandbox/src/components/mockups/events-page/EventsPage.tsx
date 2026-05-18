import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard, BookOpen, FileText, Trophy, Radio,
  BarChart2, LogOut, Gamepad2, Lock, PlayCircle, Star, Zap,
  ChevronLeft,
} from "lucide-react";

/* ─────────────────────────────────────────────
   GLOBAL ANIMATIONS (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

/* ── layout helpers ── */
@keyframes slideDown { from{opacity:0;transform:translateY(-28px) scale(.96)} to{opacity:1;transform:none} }
@keyframes fadeUp    { from{opacity:0;transform:translateY(20px)}             to{opacity:1;transform:none} }
@keyframes floatBob  { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-10px) rotate(4deg)} }
@keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes spin4     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* ── PHYSICS ── */
@keyframes boltFlash { 0%,85%,100%{opacity:0} 88%,96%{opacity:1} }
@keyframes arcPulse  { 0%,100%{stroke-dashoffset:220} 50%{stroke-dashoffset:0} }
@keyframes gridPulse { 0%,100%{opacity:.07} 50%{opacity:.18} }

/* ── RAMADAN ── */
@keyframes sway1   { 0%,100%{transform:rotate(-9deg)  translateX(0)} 50%{transform:rotate(9deg)  translateX(2px)} }
@keyframes sway2   { 0%,100%{transform:rotate(7deg)   translateX(0)} 50%{transform:rotate(-7deg) translateX(-2px)} }
@keyframes twinkle { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
@keyframes moonGlow { 0%,100%{filter:drop-shadow(0 0 4px #fbbf24)} 50%{filter:drop-shadow(0 0 14px #fbbf24)} }

/* ── EID ── */
@keyframes confettiFall {
  0%  { transform:translateY(-24px) rotate(0deg);   opacity:1 }
  100%{ transform:translateY(320px) rotate(520deg); opacity:0 }
}
@keyframes flowerPulse { 0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.15) rotate(12deg)} }

/* ── HALLOWEEN ── */
@keyframes batFly {
  0%  {transform:translate(0,0) scaleX(1)}
  45% {transform:translate(-200px,-18px) scaleX(1)}
  50% {transform:translate(-210px,-18px) scaleX(-1)}
  95% {transform:translate(0,0) scaleX(-1)}
  100%{transform:translate(0,0) scaleX(1)}
}
@keyframes eyeGlow { 0%,100%{box-shadow:0 0 6px 2px #f97316} 50%{box-shadow:0 0 18px 6px #ef4444} }
@keyframes ghostBob { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
@keyframes webSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

/* ── CHRISTMAS ── */
@keyframes snowfall {
  0%  {transform:translateY(-20px) translateX(0)   rotate(0deg)  ; opacity:.9}
  100%{transform:translateY(340px) translateX(20px) rotate(360deg); opacity:0}
}
@keyframes starBlink { 0%,100%{opacity:1;text-shadow:0 0 8px #fde68a} 50%{opacity:.3;text-shadow:none} }
@keyframes treeSway  { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }

/* ── SCIENCE ── */
@keyframes orbit1 { from{transform:rotate(0deg)  translateX(42px) rotate(0deg)}  to{transform:rotate(360deg)  translateX(42px) rotate(-360deg)} }
@keyframes orbit2 { from{transform:rotate(120deg) translateX(42px) rotate(-120deg)} to{transform:rotate(480deg) translateX(42px) rotate(-480deg)} }
@keyframes orbit3 { from{transform:rotate(240deg) translateX(42px) rotate(-240deg)} to{transform:rotate(600deg) translateX(42px) rotate(-600deg)} }
@keyframes bubbleRise { 0%{transform:translateY(0)   scale(1);   opacity:.7}
                        100%{transform:translateY(-260px) scale(1.4); opacity:0} }
@keyframes tubeFlow  { 0%,100%{height:40%} 50%{height:70%} }

/* ── card enter ── */
.card-in { animation: fadeUp 0.5s ease both; }

/* ── nav ── */
.nav-link { display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:12px;
  font-size:14px;font-weight:600;color:rgba(255,255,255,.6);cursor:pointer;transition:background .18s,color .18s; }
.nav-link:hover { background:rgba(255,255,255,.07);color:white; }
.special-nav {
  position:relative;display:flex;align-items:center;gap:10px;
  padding:11px 14px;border-radius:14px;font-size:14px;font-weight:900;
  cursor:pointer;overflow:hidden;color:white;
  background:linear-gradient(135deg,#7c3aed 0%,#ec4899 50%,#f97316 100%);
  box-shadow:0 4px 24px rgba(124,58,237,.45);transition:transform .2s,box-shadow .2s;
}
.special-nav:hover { transform:scale(1.03);box-shadow:0 6px 30px rgba(124,58,237,.65); }
.special-nav::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
  background-size:200% 100%;animation:shimmer 2.2s linear infinite;
}
`;

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
const NAV = [
  { icon: LayoutDashboard, label: "لوحتي" },
  { icon: BookOpen,        label: "كورساتي" },
  { icon: FileText,        label: "الاختبارات" },
  { icon: BarChart2,       label: "إحصائياتي" },
  { icon: Trophy,          label: "المتصدرون" },
  { icon: Radio,           label: "بث مباشر" },
];

/* ─────────────────────────────────────────────
   SHARED CARD WRAPPER
───────────────────────────────────────────── */
const STUDENT_PTS = 820;

interface WrapProps {
  locked: boolean; threshold: number;
  bg: string; glow: string;
  children: React.ReactNode;
  label: string; labelBg: string; labelColor: string;
  title: string; subtitle: string;
}
function CardWrap({ locked, threshold, bg, glow, children, label, labelBg, labelColor, title, subtitle }: WrapProps) {
  const [hov, setHov] = useState(false);
  const prog = Math.min(100, (STUDENT_PTS / threshold) * 100);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", aspectRatio: "1/1", borderRadius: 24, overflow: "hidden",
        background: bg, cursor: locked ? "default" : "pointer",
        transform: hov && !locked ? "translateY(-8px) scale(1.03)" : "none",
        transition: "transform 0.28s cubic-bezier(.34,1.56,.64,1), box-shadow 0.28s ease",
        boxShadow: hov && !locked
          ? `0 24px 64px ${glow.replace("0.5","0.7")}, 0 0 0 1.5px rgba(255,255,255,.12)`
          : `0 6px 28px ${glow}`,
      }}>
      {/* card art & animations (passed as children) */}
      {children}

      {/* bottom gradient so text reads */}
      <div style={{ position:"absolute",inset:0, zIndex:2,
        background:"linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.18) 55%,transparent 100%)" }} />

      {/* badge top-right */}
      <div style={{ position:"absolute",top:14,right:16, zIndex:3,
        background:labelBg, backdropFilter:"blur(8px)",
        border:"1px solid rgba(255,255,255,.18)", borderRadius:999,
        padding:"3px 10px", color:labelColor, fontSize:11, fontWeight:700 }}>
        {label}
      </div>

      {/* bottom content */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"0 18px 18px", zIndex:3 }}>
        <div style={{ color:"white",fontWeight:900,fontSize:17,lineHeight:1.3,marginBottom:3 }}>{title}</div>
        <div style={{ color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:12 }}>{subtitle}</div>
        <button style={{
          width:"100%",padding:"10px 0",borderRadius:12,border:"none",
          background: locked ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.18)",
          backdropFilter:"blur(10px)", color: locked ? "rgba(255,255,255,.4)" : "white",
          fontFamily:"inherit",fontWeight:700,fontSize:13,cursor: locked ? "default" : "pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          transition:"background .2s",
        }}>
          {locked ? <><Lock size={13}/> مقفولة</> : <><PlayCircle size={15}/> العب الآن</>}
        </button>
      </div>

      {/* lock overlay */}
      {locked && (
        <div style={{
          position:"absolute",inset:0, zIndex:10,
          background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          <div style={{ width:56,height:56,borderRadius:"50%",
            background:"rgba(255,255,255,.1)",
            display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Lock size={26} color="white"/>
          </div>
          <div style={{ color:"rgba(255,255,255,.85)",fontSize:13,fontWeight:700 }}>
            تحتاج {threshold.toLocaleString("ar-EG")} نقطة
          </div>
          <div style={{ width:"62%",height:7,borderRadius:999,background:"rgba(255,255,255,.13)" }}>
            <div style={{ height:"100%",borderRadius:999,width:`${prog}%`,
              background:"linear-gradient(90deg,#6366f1,#ec4899)",transition:"width .4s" }}/>
          </div>
          <div style={{ color:"rgba(255,255,255,.38)",fontSize:11 }}>
            {STUDENT_PTS.toLocaleString("ar-EG")} / {threshold.toLocaleString("ar-EG")}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   1. PHYSICS CARD — electric grid + flashing bolt + arc
───────────────────────────────────────────── */
function CardPhysics({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={0} bg="linear-gradient(145deg,#080820 0%,#141060 55%,#080820 100%)"
      glow="rgba(99,102,241,.5)" label="أسبوعي ⚡" labelBg="rgba(99,102,241,.35)" labelColor="#c7d2fe"
      title="تحدي الفيزياء الخاطف" subtitle="10 أسئلة في 5 دقائق • 500 نقطة">

      {/* animated grid */}
      <div style={{ position:"absolute",inset:0,
        backgroundImage:"linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)",
        backgroundSize:"32px 32px", animation:"gridPulse 3s ease-in-out infinite" }}/>

      {/* SVG arc that draws itself */}
      <svg style={{ position:"absolute",top:0,left:0,width:"100%",height:"55%",opacity:.55 }}
        viewBox="0 0 300 120" preserveAspectRatio="none">
        <path d="M10,100 Q80,20 150,70 Q220,20 290,50"
          fill="none" stroke="#818cf8" strokeWidth="2.5"
          strokeDasharray="220" style={{ animation:"arcPulse 4s ease-in-out infinite" }}/>
        <path d="M10,80 Q90,40 180,90 Q240,60 290,80"
          fill="none" stroke="#6366f1" strokeWidth="1.5"
          strokeDasharray="220" style={{ animation:"arcPulse 4s 1s ease-in-out infinite" }}/>
      </svg>

      {/* giant flashing bolt */}
      <div style={{ position:"absolute",top:"8%",left:"50%",transform:"translateX(-50%)",
        fontSize:90,lineHeight:1,
        animation:"boltFlash 3.5s ease-in-out infinite",
        textShadow:"0 0 30px #818cf8,0 0 60px #6366f1" }}>⚡</div>

      {/* sparks */}
      {[{l:"15%",t:"30%",rot:30},{l:"72%",t:"22%",rot:-20},{l:"85%",t:"50%",rot:10},{l:"8%",t:"55%",rot:-40}].map((s,i)=>(
        <div key={i} style={{ position:"absolute",top:s.t,left:s.l,
          width:4,height:20,background:"linear-gradient(#fff,#818cf8)",
          borderRadius:2,transform:`rotate(${s.rot}deg)`,
          animation:`boltFlash ${2+i*.4}s ${i*.3}s ease-in-out infinite`,opacity:.7 }}/>
      ))}
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   2. RAMADAN CARD — swaying lanterns + twinkling stars + moon glow
───────────────────────────────────────────── */
function CardRamadan({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={500} bg="linear-gradient(145deg,#0a1a10 0%,#0f2a18 50%,#08120e 100%)"
      glow="rgba(212,175,55,.5)" label="رمضان كريم 🌙" labelBg="rgba(212,175,55,.25)" labelColor="#fde68a"
      title="مسابقة رمضان الكريم" subtitle="طوال الشهر الكريم • 1000 نقطة">

      {/* twinkling stars */}
      {[
        {top:"8%",left:"10%",d:"0s"},{top:"14%",left:"35%",d:".4s"},{top:"6%",left:"58%",d:".8s"},
        {top:"20%",left:"78%",d:"1.2s"},{top:"30%",left:"22%",d:".6s"},{top:"25%",left:"52%",d:"1s"},
        {top:"12%",left:"88%",d:".2s"},{top:"35%",left:"68%",d:".9s"},
      ].map((s,i)=>(
        <div key={i} style={{ position:"absolute",top:s.top,left:s.left,
          fontSize:i%3===0?12:8,color:"#fde68a",
          animation:`twinkle ${1.5+i*.3}s ${s.d} ease-in-out infinite` }}>★</div>
      ))}

      {/* crescent moon */}
      <div style={{ position:"absolute",top:"8%",right:"14%",
        width:54,height:54,borderRadius:"50%",
        boxShadow:"-10px 5px 0 0 #fbbf24",
        animation:"moonGlow 2.5s ease-in-out infinite" }}/>

      {/* string at top */}
      <svg style={{ position:"absolute",top:0,left:0,width:"100%",height:28,opacity:.6 }}
        viewBox="0 0 300 28">
        <path d="M0,4 Q37,22 75,4 Q112,22 150,4 Q187,22 225,4 Q262,22 300,4"
          fill="none" stroke="#92400e" strokeWidth="1.5"/>
      </svg>

      {/* lantern 1 — large, swaying */}
      <div style={{ position:"absolute",top:0,left:"22%",
        transformOrigin:"top center", animation:"sway1 3s ease-in-out infinite" }}>
        <div style={{ width:2,height:22,background:"#92400e",margin:"0 auto" }}/>
        <div style={{ fontSize:56,lineHeight:1,
          filter:"drop-shadow(0 0 12px rgba(239,68,68,.8)) drop-shadow(0 0 4px #fbbf24)" }}>🏮</div>
      </div>

      {/* lantern 2 — medium */}
      <div style={{ position:"absolute",top:0,left:"52%",
        transformOrigin:"top center", animation:"sway2 2.6s ease-in-out infinite" }}>
        <div style={{ width:2,height:18,background:"#92400e",margin:"0 auto" }}/>
        <div style={{ fontSize:40,lineHeight:1,
          filter:"drop-shadow(0 0 10px rgba(239,68,68,.7))" }}>🏮</div>
      </div>

      {/* lantern 3 — small */}
      <div style={{ position:"absolute",top:0,right:"14%",
        transformOrigin:"top center", animation:"sway1 3.4s .5s ease-in-out infinite" }}>
        <div style={{ width:2,height:14,background:"#92400e",margin:"0 auto" }}/>
        <div style={{ fontSize:28,lineHeight:1,
          filter:"drop-shadow(0 0 8px rgba(239,68,68,.6))" }}>🏮</div>
      </div>

      {/* golden arch ornament */}
      <svg style={{ position:"absolute",bottom:"28%",left:"50%",transform:"translateX(-50%)",
        width:120,height:40,opacity:.25 }} viewBox="0 0 120 40">
        <path d="M5,40 Q60,-10 115,40" fill="none" stroke="#fbbf24" strokeWidth="2"/>
        <circle cx="5"  cy="40" r="3" fill="#fbbf24"/>
        <circle cx="60" cy="5"  r="3" fill="#fbbf24"/>
        <circle cx="115"cy="40" r="3" fill="#fbbf24"/>
      </svg>
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   3. EID CARD — falling confetti + pulsing flowers
───────────────────────────────────────────── */
const CONFETTI_PIECES = [
  {left:"12%",delay:"0s",  dur:"2.8s",color:"#f59e0b",w:10,h:4,rot:20},
  {left:"28%",delay:".4s", dur:"3.2s",color:"#ec4899",w:8, h:8,rot:-30},
  {left:"42%",delay:".9s", dur:"2.5s",color:"#6366f1",w:12,h:5,rot:15},
  {left:"58%",delay:".2s", dur:"3.5s",color:"#10b981",w:7, h:7,rot:45},
  {left:"72%",delay:"1.1s",dur:"2.9s",color:"#f97316",w:10,h:3,rot:-15},
  {left:"85%",delay:".6s", dur:"3.1s",color:"#06b6d4",w:9, h:9,rot:60},
  {left:"20%",delay:"1.5s",dur:"2.7s",color:"#a855f7",w:11,h:4,rot:-45},
  {left:"65%",delay:"1.8s",dur:"3.3s",color:"#fde68a",w:8, h:5,rot:35},
];

function CardEid({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={1000} bg="linear-gradient(145deg,#042f26 0%,#065f46 50%,#022c22 100%)"
      glow="rgba(52,211,153,.5)" label="عيد الفطر 🎉" labelBg="rgba(52,211,153,.25)" labelColor="#a7f3d0"
      title="مسابقة عيد الفطر المبارك" subtitle="مناسبة خاصة • 1200 نقطة">

      {/* continuously falling confetti */}
      {CONFETTI_PIECES.map((c,i)=>(
        <div key={i} style={{
          position:"absolute",top:"-20px",left:c.left,
          width:c.w,height:c.h,background:c.color,
          borderRadius: i%2===0 ? 2 : "50%",
          transform:`rotate(${c.rot}deg)`,
          animation:`confettiFall ${c.dur} ${c.delay} ease-in infinite`,
        }}/>
      ))}

      {/* crescent + star */}
      <div style={{ position:"absolute",top:"12%",left:"50%",transform:"translateX(-50%)",
        display:"flex",flexDirection:"column",alignItems:"center",gap:0 }}>
        <div style={{ fontSize:52,lineHeight:1,filter:"drop-shadow(0 0 16px rgba(52,211,153,.8))" }}>☪️</div>
      </div>

      {/* pulsing flowers */}
      {[{b:"30%",l:"8%",s:34,d:"0s"},{b:"28%",r:"8%",s:26,d:".4s"},{b:"22%",l:"38%",s:20,d:".8s"}].map((f,i)=>(
        <div key={i} style={{ position:"absolute",bottom:f.b,left:(f as any).l,right:(f as any).r,
          fontSize:f.s,lineHeight:1,
          animation:`flowerPulse ${2+i*.3}s ${f.d} ease-in-out infinite` }}>🌸</div>
      ))}

      {/* arch */}
      <svg style={{ position:"absolute",top:"35%",left:"50%",transform:"translateX(-50%)",
        width:100,height:36,opacity:.3 }} viewBox="0 0 100 36">
        <path d="M4,36 Q50,-4 96,36" fill="none" stroke="#34d399" strokeWidth="2"/>
        {[4,28,52,72,96].map(x=>(
          <circle key={x} cx={x} cy={x===4||x===96?36:x===50?0:22} r="2.5" fill="#34d399" opacity={.8}/>
        ))}
      </svg>
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   4. HALLOWEEN CARD — flying bat + glowing pumpkin + ghost
───────────────────────────────────────────── */
function CardHalloween({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={1500} bg="linear-gradient(145deg,#100808 0%,#2a0d00 50%,#12080a 100%)"
      glow="rgba(249,115,22,.5)" label="هالوين 🎃" labelBg="rgba(249,115,22,.25)" labelColor="#fed7aa"
      title="ليلة الهالوين المرعبة" subtitle="أكتوبر فقط • 800 نقطة">

      {/* SVG spiderweb — top-right corner */}
      <svg style={{ position:"absolute",top:0,right:0,width:110,height:110,opacity:.3 }}
        viewBox="0 0 110 110">
        {/* radii */}
        {[0,45,90,135,180,225,270,315].map(a=>(
          <line key={a} x1="110" y1="0"
            x2={110+Math.cos((a-45)*Math.PI/180)*90}
            y2={0+Math.sin((a-45)*Math.PI/180)*90}
            stroke="#aaa" strokeWidth=".8"/>
        ))}
        {/* rings */}
        {[18,36,56,76].map(r=>(
          <path key={r}
            d={`M${110-r*Math.cos(45*Math.PI/180)},${r*Math.sin(45*Math.PI/180)} A${r},${r} 0 0 0 110,${r}`}
            fill="none" stroke="#888" strokeWidth=".7"/>
        ))}
      </svg>

      {/* animated flying bat */}
      <div style={{ position:"absolute",top:"14%",right:"10%",fontSize:28,
        animation:"batFly 5s ease-in-out infinite" }}>🦇</div>

      {/* small bat 2 */}
      <div style={{ position:"absolute",top:"28%",right:"30%",fontSize:18,opacity:.7,
        animation:"batFly 7s 1.5s ease-in-out infinite" }}>🦇</div>

      {/* ghost bobbing */}
      <div style={{ position:"absolute",top:"10%",left:"12%",fontSize:40,
        animation:"ghostBob 2.8s ease-in-out infinite",
        filter:"drop-shadow(0 0 12px rgba(255,255,255,.4))" }}>👻</div>

      {/* large pumpkin with glowing eyes */}
      <div style={{ position:"absolute",bottom:"24%",left:"50%",transform:"translateX(-50%)",
        fontSize:64,lineHeight:1,
        filter:"drop-shadow(0 0 18px rgba(249,115,22,.8))",
        animation:"eyeGlow 2s ease-in-out infinite" }}>🎃</div>

      {/* crescent moon */}
      <div style={{ position:"absolute",top:"6%",left:"50%",transform:"translateX(-50%)",
        width:34,height:34,borderRadius:"50%",
        boxShadow:"-7px 4px 0 0 #fbbf24",
        filter:"drop-shadow(0 0 8px #fbbf24)",opacity:.7 }}/>

      {/* dripping effect */}
      {[20,38,55,70,85].map((l,i)=>(
        <div key={i} style={{ position:"absolute",top:0,left:`${l}%`,
          width:3,background:"linear-gradient(#4a0010,transparent)",
          height:`${12+i*4}%`, borderRadius:"0 0 4px 4px", opacity:.35 }}/>
      ))}
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   5. CHRISTMAS CARD — falling snow + swaying tree + star blink
───────────────────────────────────────────── */
const SNOWFLAKES = [
  {l:"8%", d:"0s",  dur:"3.2s",s:16},{l:"22%",d:".5s", dur:"2.8s",s:12},
  {l:"38%",d:"1.1s",dur:"3.5s",s:10},{l:"52%",d:".3s", dur:"2.6s",s:18},
  {l:"65%",d:"1.4s",dur:"3.0s",s:14},{l:"78%",d:".8s", dur:"3.4s",s:10},
  {l:"90%",d:"1.8s",dur:"2.9s",s:12},{l:"15%",d:"2.0s",dur:"3.1s",s:8},
  {l:"45%",d:"2.4s",dur:"2.7s",s:10},{l:"70%",d:"2.1s",dur:"3.3s",s:14},
];

function CardChristmas({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={2000} bg="linear-gradient(145deg,#080c1e 0%,#141c38 50%,#08091a 100%)"
      glow="rgba(239,68,68,.5)" label="كريسماس 🎁" labelBg="rgba(239,68,68,.25)" labelColor="#fca5a5"
      title="عيد الكريسماس السعيد" subtitle="ديسمبر فقط • 900 نقطة">

      {/* falling snowflakes */}
      {SNOWFLAKES.map((sf,i)=>(
        <div key={i} style={{ position:"absolute",top:"-20px",left:sf.l,
          fontSize:sf.s,color:"#bfdbfe",opacity:.8,
          animation:`snowfall ${sf.dur} ${sf.d} linear infinite` }}>❄</div>
      ))}

      {/* swaying christmas tree — center */}
      <div style={{ position:"absolute",top:"10%",left:"50%",transform:"translateX(-50%)",
        fontSize:72,lineHeight:1,transformOrigin:"bottom center",
        animation:"treeSway 4s ease-in-out infinite",
        filter:"drop-shadow(0 0 10px rgba(34,197,94,.6))" }}>🎄</div>

      {/* blinking star on top */}
      <div style={{ position:"absolute",top:"4%",left:"50%",transform:"translateX(-50%)",
        fontSize:22, animation:"starBlink 1.8s ease-in-out infinite" }}>⭐</div>

      {/* gifts row */}
      {["🎁","🎀","🎁"].map((g,i)=>(
        <div key={i} style={{ position:"absolute",bottom:"22%",left:`${20+i*24}%`,
          fontSize:22,lineHeight:1,opacity:.8,
          animation:`floatBob ${2.5+i*.3}s ${i*.4}s ease-in-out infinite` }}>{g}</div>
      ))}

      {/* snow ground */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:24,
        background:"linear-gradient(180deg,#bfdbfe,#e0f2fe)",
        borderRadius:"60% 60% 0 0 / 100% 100% 0 0",opacity:.22 }}/>
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   6. SCIENCE CARD — orbiting atom + rising bubbles + test tube
───────────────────────────────────────────── */
const BUBBLES = [
  {l:"18%",d:"0s",  dur:"3.5s",s:14},{l:"34%",d:".8s", dur:"4.2s",s:10},
  {l:"55%",d:"1.4s",dur:"3.0s",s:18},{l:"72%",d:".4s", dur:"4.8s",s:12},
  {l:"86%",d:"2s",  dur:"3.8s",s:8},
];

function CardScience({ locked }: { locked: boolean }) {
  return (
    <CardWrap locked={locked} threshold={600} bg="linear-gradient(145deg,#011f16 0%,#042f26 50%,#00170f 100%)"
      glow="rgba(16,185,129,.5)" label="علوم أسبوعي 🔬" labelBg="rgba(16,185,129,.25)" labelColor="#a7f3d0"
      title="مسابقة العلوم الأسبوعية" subtitle="كل أسبوع • 600 نقطة">

      {/* rising bubbles */}
      {BUBBLES.map((b,i)=>(
        <div key={i} style={{ position:"absolute",bottom:"-20px",left:b.l,
          width:b.s,height:b.s,borderRadius:"50%",
          border:"2px solid rgba(52,211,153,.6)",
          animation:`bubbleRise ${b.dur} ${b.d} ease-in infinite`,
          background:"rgba(52,211,153,.08)" }}/>
      ))}

      {/* large atom SVG — center */}
      <div style={{ position:"absolute",top:"8%",left:"50%",transform:"translateX(-50%)",
        width:100,height:100 }}>
        <svg viewBox="0 0 100 100" style={{ width:100,height:100,opacity:.7 }}>
          {/* nucleus */}
          <circle cx="50" cy="50" r="7" fill="#34d399"/>
          {/* orbit rings */}
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#34d399" strokeWidth="1.5"/>
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#34d399" strokeWidth="1.5"
            transform="rotate(60 50 50)"/>
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#34d399" strokeWidth="1.5"
            transform="rotate(120 50 50)"/>
          {/* electron 1 */}
          <circle cx="50" cy="50" r="4" fill="#6ee7b7"
            style={{ transformOrigin:"50px 50px", animation:"orbit1 2.5s linear infinite" }}/>
          {/* electron 2 */}
          <circle cx="50" cy="50" r="4" fill="#6ee7b7"
            style={{ transformOrigin:"50px 50px", animation:"orbit2 2.5s linear infinite" }}/>
          {/* electron 3 */}
          <circle cx="50" cy="50" r="4" fill="#6ee7b7"
            style={{ transformOrigin:"50px 50px", animation:"orbit3 2.5s linear infinite" }}/>
        </svg>
      </div>

      {/* test tube with animated fill */}
      <div style={{ position:"absolute",bottom:"24%",left:"10%",
        width:22,height:60,borderRadius:"0 0 20px 20px",
        border:"2px solid rgba(52,211,153,.6)",overflow:"hidden" }}>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,
          background:"linear-gradient(to top,#059669,#34d399)",
          animation:"tubeFlow 3s ease-in-out infinite",borderRadius:"0 0 18px 18px" }}/>
      </div>

      {/* microscope */}
      <div style={{ position:"absolute",bottom:"22%",right:"8%",fontSize:38,
        lineHeight:1,opacity:.6,
        animation:`floatBob 3.2s ease-in-out infinite` }}>🔬</div>
    </CardWrap>
  );
}

/* ─────────────────────────────────────────────
   NEXT UNLOCK BANNER (header area)
───────────────────────────────────────────── */
function NextUnlockBanner() {
  const nextGame = { title:"مسابقة العلوم الأسبوعية", emoji:"🔬", threshold:600, label:"علوم أسبوعي" };
  const remaining = nextGame.threshold - STUDENT_PTS;
  const prog = Math.min(100, (STUDENT_PTS / nextGame.threshold) * 100);

  return (
    <div style={{
      display:"flex",alignItems:"center",gap:18,marginTop:18,
      background:"rgba(255,255,255,.06)",backdropFilter:"blur(12px)",
      border:"1px solid rgba(255,255,255,.1)",borderRadius:18,
      padding:"14px 20px",
    }}>
      {/* emoji */}
      <div style={{ fontSize:42,lineHeight:1,flexShrink:0,
        filter:"drop-shadow(0 0 10px rgba(16,185,129,.7))" }}>{nextGame.emoji}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:"rgba(255,255,255,.5)",fontSize:11,marginBottom:3 }}>
          🔓 اللعبة القادمة التي ستفتحها
        </div>
        <div style={{ color:"white",fontWeight:900,fontSize:15,marginBottom:8 }}>
          {nextGame.title}
        </div>
        {/* progress bar */}
        <div style={{ height:8,borderRadius:999,background:"rgba(255,255,255,.12)",marginBottom:5 }}>
          <div style={{ height:"100%",borderRadius:999,width:`${prog}%`,
            background:"linear-gradient(90deg,#6366f1,#34d399)",
            boxShadow:"0 0 8px rgba(52,211,153,.5)",transition:"width .4s" }}/>
        </div>
        <div style={{ display:"flex",justifyContent:"space-between" }}>
          <span style={{ color:"rgba(255,255,255,.45)",fontSize:11 }}>
            {STUDENT_PTS.toLocaleString("ar-EG")} / {nextGame.threshold.toLocaleString("ar-EG")} نقطة
          </span>
          <span style={{ color:"#34d399",fontSize:11,fontWeight:700 }}>
            يتبقى {remaining.toLocaleString("ar-EG")} نقطة فقط! 🚀
          </span>
        </div>
      </div>
      <div style={{ flexShrink:0,display:"flex",alignItems:"center",gap:6,
        background:"rgba(52,211,153,.15)",border:"1px solid rgba(52,211,153,.3)",
        borderRadius:12,padding:"8px 14px",color:"#34d399",fontSize:12,fontWeight:700 }}>
        <Zap size={14}/> قريباً
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HEADER PARTICLES
───────────────────────────────────────────── */
function HeaderParticles() {
  const [ps, setPs] = useState<{id:number;x:number;y:number;s:number;c:string;del:number;dur:number}[]>([]);
  useEffect(() => {
    const cols = ["#f59e0b","#ec4899","#8b5cf6","#10b981","#3b82f6","#f97316"];
    setPs(Array.from({length:20},(_,i)=>({
      id:i, x:Math.random()*100, y:Math.random()*100,
      s:4+Math.random()*6, c:cols[i%cols.length],
      del:Math.random()*2, dur:2+Math.random()*3,
    })));
  }, []);
  return (
    <div style={{ position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none" }}>
      {ps.map(p=>(
        <div key={p.id} className="animate-ping" style={{
          position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
          width:p.s,height:p.s,borderRadius:"50%",
          background:p.c,opacity:.6,
          animationDelay:`${p.del}s`,animationDuration:`${p.dur}s`,
        }}/>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARDS LIST
───────────────────────────────────────────── */
const CARDS = [
  { id:1, C: CardPhysics,   threshold:0    },
  { id:2, C: CardScience,   threshold:600  },
  { id:3, C: CardRamadan,   threshold:500  },
  { id:4, C: CardEid,       threshold:1000 },
  { id:5, C: CardHalloween, threshold:1500 },
  { id:6, C: CardChristmas, threshold:2000 },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export function EventsPage() {
  const [hIn, setHIn] = useState(false);
  const [cIn, setCIn] = useState(false);
  useEffect(() => {
    const a = setTimeout(()=>setHIn(true),80);
    const b = setTimeout(()=>setCIn(true),480);
    return ()=>{ clearTimeout(a); clearTimeout(b); };
  }, []);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden"
      style={{ background:"#0a0812",fontFamily:"'Cairo',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>

      {/* ════ SIDEBAR ════ */}
      <aside style={{ width:240,flexShrink:0,display:"flex",flexDirection:"column",
        background:"linear-gradient(180deg,#161422 0%,#100e1a 100%)",
        borderLeft:"1px solid rgba(230,175,80,.08)" }}>

        {/* logo */}
        <div style={{ padding:"24px 20px 16px",borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:42,height:42,borderRadius:12,flexShrink:0,
              background:"linear-gradient(135deg,#7c3aed,#ec4899)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"white" }}>و</div>
            <div>
              <div style={{ color:"white",fontWeight:900,fontSize:20 }}>وثبة</div>
              <div style={{ color:"rgba(255,255,255,.38)",fontSize:11 }}>منطقة الطالب</div>
            </div>
          </div>
        </div>

        {/* student */}
        <div style={{ padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,.07)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:40,height:40,borderRadius:"50%",flexShrink:0,
              background:"linear-gradient(135deg,#f97316,#ec4899)",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"white",fontWeight:900,fontSize:16 }}>أ</div>
            <div>
              <div style={{ color:"white",fontWeight:700,fontSize:13 }}>أحمد محمد</div>
              <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
                <Star size={11} style={{ color:"#fb923c" }}/>
                <span style={{ color:"#fb923c",fontSize:11,fontWeight:700 }}>
                  {STUDENT_PTS.toLocaleString("ar-EG")} نقطة
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1,padding:"12px 10px",display:"flex",flexDirection:"column",gap:3 }}>
          {NAV.map(({icon:Icon,label})=>(
            <div key={label} className="nav-link"><Icon size={18}/><span>{label}</span></div>
          ))}
          <div style={{ marginTop:8 }}>
            <div className="special-nav">
              <Gamepad2 size={18} style={{ flexShrink:0,animation:"spin4 5s linear infinite" }}/>
              <span>الفعاليات</span>
              <span style={{ marginRight:"auto",background:"rgba(255,255,255,.22)",
                borderRadius:999,padding:"1px 8px",fontSize:10,fontWeight:900 }}>6 🎮</span>
            </div>
          </div>
        </nav>

        <div style={{ padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <div className="nav-link" style={{ color:"rgba(252,165,165,.7)" }}>
            <LogOut size={18}/><span>تسجيل الخروج</span>
          </div>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>

        {/* ── HEADER ── */}
        <div style={{
          position:"relative",flexShrink:0,padding:"22px 28px 24px",
          background:"linear-gradient(135deg,#1a0838 0%,#350768 40%,#1a0e30 100%)",
          borderBottom:"1px solid rgba(139,92,246,.2)",overflow:"hidden",
          opacity:hIn?1:0,transition:"opacity .4s ease",
        }}>
          <HeaderParticles/>

          {/* float emojis */}
          {[{e:"🎮",t:"8%",l:"2%",d:"0s",dur:"2.8s"},{e:"🏆",t:"4%",l:"14%",d:".5s",dur:"3.2s"},
            {e:"⚡",t:"65%",l:"5%",d:"1s",dur:"2.5s"},{e:"🎯",t:"10%",r:"4%",d:".3s",dur:"3s"},
            {e:"🧠",t:"12%",r:"16%",d:"1.1s",dur:"3.5s"}].map((f,i)=>(
            <span key={i} style={{ position:"absolute",top:f.t,left:(f as any).l,right:(f as any).r,
              fontSize:26,pointerEvents:"none",userSelect:"none",
              animation:`floatBob ${f.dur} ${f.d} ease-in-out infinite` }}>{f.e}</span>
          ))}

          {/* glow orbs */}
          <div style={{ position:"absolute",left:"20%",top:"50%",transform:"translateY(-50%)",
            width:180,height:180,borderRadius:"50%",pointerEvents:"none",
            background:"radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)" }}/>
          <div style={{ position:"absolute",right:"25%",top:"50%",transform:"translateY(-50%)",
            width:130,height:130,borderRadius:"50%",pointerEvents:"none",
            background:"radial-gradient(circle,rgba(236,72,153,.15) 0%,transparent 70%)" }}/>

          <div style={{ position:"relative",zIndex:1,
            animation:hIn?"slideDown .6s ease both":"none" }}>
            {/* title row */}
            <div style={{ display:"flex",alignItems:"center",gap:14 }}>
              <div style={{ width:52,height:52,borderRadius:18,flexShrink:0,fontSize:24,
                background:"linear-gradient(135deg,#7c3aed,#ec4899,#f97316)",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:"0 8px 30px rgba(124,58,237,.5)" }}>🎮</div>
              <div>
                <h1 style={{ margin:0,fontSize:24,fontWeight:900,
                  background:"linear-gradient(90deg,#fff 0%,#c4b5fd 40%,#f9a8d4 75%,#fdba74 100%)",
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
                  الفعاليات التعليمية 🎯
                </h1>
                <p style={{ margin:"3px 0 0",color:"rgba(196,181,253,.7)",fontSize:12 }}>
                  كل مناسبة ليها لعبة خاصة — اجمع نقاط وافتح الألعاب الجديدة ✨
                </p>
              </div>
            </div>

            {/* next unlock banner */}
            <NextUnlockBanner/>
          </div>
        </div>

        {/* ── CARDS ── */}
        <div style={{ flex:1,overflowY:"auto",padding:"22px 24px",background:"#0a0812" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
            gap:22,
          }}>
            {CARDS.map(({id,C,threshold},i)=>(
              <div key={id} className={cIn?"card-in":""} style={{
                animationDelay:cIn?`${i*.07}s`:"0s",opacity:cIn?undefined:0 }}>
                <C locked={STUDENT_PTS < threshold}/>
              </div>
            ))}
          </div>
          <div style={{ height:24 }}/>
        </div>
      </main>
    </div>
  );
}
