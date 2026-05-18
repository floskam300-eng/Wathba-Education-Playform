import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getGameConfig, BOSS_POINTS } from './gameConfig';
import api from '../../../lib/api';

const CW = 900;
const CH = 320;
const GROUND = CH - 65;
const PLAYER_X = 130;
const GRAVITY = 0.62;
const JUMP_V = -13.5;
const DUCK_HEIGHT = 22;
const STAND_HEIGHT = 55;
const BASE_SPEED = 3.2;
const MAX_SPEED = 9;
const BOSS_DISTS = [380, 900, 1700];

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, '#060612');
  g.addColorStop(1, '#150830');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CW, CH);
}

function drawStars(ctx, stars, frame) {
  stars.forEach(s => {
    const op = 0.25 + 0.55 * Math.abs(Math.sin(frame * 0.018 * s.speed + s.phase));
    ctx.globalAlpha = op;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawMathBg(ctx, symbols, offset) {
  ctx.globalAlpha = 0.055;
  ctx.fillStyle = '#c084fc';
  symbols.forEach(s => {
    const x = ((s.x - offset * s.speed * 0.15) % (CW + 120) + CW + 120) % (CW + 120) - 60;
    ctx.font = `bold ${s.size}px Georgia`;
    ctx.fillText(s.char, x, s.y);
  });
  ctx.globalAlpha = 1;
}

function drawMountains(ctx, layers, offset) {
  layers.forEach(layer => {
    ctx.fillStyle = layer.color;
    layer.peaks.forEach(p => {
      const x = ((p.x - offset * layer.speed) % (CW + p.w * 2) + CW + p.w * 2) % (CW + p.w * 2) - p.w;
      ctx.beginPath();
      ctx.moveTo(x, GROUND - 8);
      ctx.lineTo(x + p.w / 2, GROUND - p.h);
      ctx.lineTo(x + p.w, GROUND - 8);
      ctx.closePath();
      ctx.fill();
    });
  });
}

function drawGround(ctx, offset) {
  ctx.fillStyle = '#12082a';
  ctx.fillRect(0, GROUND, CW, CH - GROUND);
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#7c3aed';
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(CW, GROUND); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(124,58,237,0.18)';
  ctx.lineWidth = 1;
  const sp = 55;
  const sx = -(offset % sp);
  for (let x = sx; x < CW; x += sp) {
    ctx.beginPath(); ctx.moveTo(x, GROUND); ctx.lineTo(x - 35, CH); ctx.stroke();
  }
}

function drawStickman(ctx, px, py, frame, ducking, invincible) {
  if (invincible && Math.floor(frame / 3) % 2 === 1) return;
  const col = '#00ff88';
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.shadowBlur = 9;
  ctx.shadowColor = col;

  if (ducking) {
    const hy = py - 16;
    ctx.beginPath(); ctx.arc(px, hy, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 7); ctx.lineTo(px, hy + 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 11); ctx.lineTo(px - 14, hy + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 11); ctx.lineTo(px + 14, hy + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 18); ctx.lineTo(px - 11, hy + 28); ctx.lineTo(px - 5, hy + 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 18); ctx.lineTo(px + 11, hy + 28); ctx.lineTo(px + 5, hy + 28); ctx.stroke();
  } else {
    const hy = py - STAND_HEIGHT;
    ctx.beginPath(); ctx.arc(px, hy, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, hy + 7); ctx.lineTo(px, hy + 28); ctx.stroke();
    const isAir = py < GROUND - 3;
    const c = (frame % 8) / 8 * Math.PI * 2;
    if (isAir) {
      ctx.beginPath(); ctx.moveTo(px, hy + 14); ctx.lineTo(px - 13, hy + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, hy + 14); ctx.lineTo(px + 13, hy + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, hy + 28); ctx.lineTo(px - 9, hy + 41); ctx.lineTo(px - 4, hy + 52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, hy + 28); ctx.lineTo(px + 9, hy + 41); ctx.lineTo(px + 4, hy + 52); ctx.stroke();
    } else {
      const as = Math.sin(c) * 13;
      ctx.beginPath(); ctx.moveTo(px, hy + 14); ctx.lineTo(px - 11 + as, hy + 22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, hy + 14); ctx.lineTo(px + 11 - as, hy + 22); ctx.stroke();
      const l1 = Math.sin(c) * 14; const l2 = Math.sin(c + Math.PI) * 14;
      const k1 = Math.sin(c) * 8;  const k2 = Math.sin(c + Math.PI) * 8;
      ctx.beginPath(); ctx.moveTo(px, hy + 28); ctx.lineTo(px - 7 + k1, hy + 40); ctx.lineTo(px - 3 + l1, hy + 52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, hy + 28); ctx.lineTo(px + 7 + k2, hy + 40); ctx.lineTo(px + 3 + l2, hy + 52); ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
}

function drawObstacle(ctx, ob, frame) {
  if (ob.type === 'jump') {
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f97316';
    ctx.fillStyle = '#2a0a00';
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    roundRect(ctx, ob.x - 18, GROUND - ob.h, 36, ob.h, 5, true, true);
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('x²', ob.x, GROUND - ob.h / 2 + 4);
    ctx.shadowBlur = 0;
  } else {
    const gy = ob.y;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#06b6d4';
    ctx.fillStyle = '#001a2a';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    roundRect(ctx, ob.x - ob.w / 2, gy - 14, ob.w, 28, 6, true, true);
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('÷', ob.x, gy + 4);
    ctx.shadowBlur = 0;
  }
}

function drawBoss1(ctx, x, y, frame) {
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#a855f7';
  ctx.fillStyle = '#1e0050';
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  roundRect(ctx, x - 42, y - 76, 84, 76, 8, true, true);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath(); ctx.moveTo(x - 28, y - 76); ctx.lineTo(x - 20, y - 96); ctx.lineTo(x - 12, y - 76); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 12, y - 76); ctx.lineTo(x + 20, y - 96); ctx.lineTo(x + 28, y - 76); ctx.fill();
  const blink = Math.abs(Math.sin(frame * 0.04)) > 0.88;
  if (!blink) {
    ctx.fillStyle = '#ff2020';
    ctx.beginPath(); ctx.ellipse(x - 14, y - 55, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 14, y - 55, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(x - 13, y - 55, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 13, y - 55, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#f0abfc';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('x²+5x', x, y - 34);
  ctx.fillText('+6=0', x, y - 18);
  const ls = Math.sin(frame * 0.12) * 9;
  ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(x - 16 - ls, y + 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 16, y); ctx.lineTo(x + 16 + ls, y + 22); ctx.stroke();
}

function drawBoss2(ctx, x, y, frame) {
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ec4899';
  ctx.fillStyle = '#200030';
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.5;
  roundRect(ctx, x - 50, y - 94, 100, 94, 10, true, true);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#9f1239';
  ctx.beginPath(); ctx.moveTo(x - 30, y - 94); ctx.lineTo(x - 20, y - 118); ctx.lineTo(x - 10, y - 94); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 10, y - 94); ctx.lineTo(x + 20, y - 118); ctx.lineTo(x + 30, y - 94); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y - 94); ctx.lineTo(x, y - 112); ctx.lineTo(x + 8, y - 94); ctx.fill();
  const blink = Math.abs(Math.sin(frame * 0.035)) > 0.9;
  if (!blink) {
    ctx.fillStyle = '#ff4080';
    ctx.beginPath(); ctx.ellipse(x - 16, y - 68, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 16, y - 68, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(x - 15, y - 68, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 15, y - 68, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#fbcfe8';
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillText('∫f(x)dx', x, y - 42);
  ctx.font = 'bold 10px monospace';
  ctx.fillText('= F(x)+C', x, y - 24);
  const ls = Math.sin(frame * 0.1) * 10;
  ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(x - 20 - ls, y + 25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 20 + ls, y + 25); ctx.stroke();
}

function drawBoss3(ctx, x, y, frame, img) {
  const pulse = 1 + Math.sin(frame * 0.08) * 0.03;
  ctx.shadowBlur = 25;
  ctx.shadowColor = '#fbbf24';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  const iw = 110 * pulse, ih = 110 * pulse;
  roundRect(ctx, x - iw / 2 - 6, y - ih - 6, iw + 12, ih + 12, 12, false, true);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1a0a00';
  roundRect(ctx, x - iw / 2 - 6, y - ih - 6, iw + 12, ih + 12, 12, true, false);
  if (img && img.complete) {
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x - iw / 2, y - ih, iw, ih, 8, false, false);
    ctx.clip();
    ctx.drawImage(img, x - iw / 2, y - ih, iw, ih);
    ctx.restore();
  }
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px serif';
  ctx.textAlign = 'center';
  ctx.fillText('الأستاذ', x, y + 16);
}

function drawExplosion(ctx, particles) {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawHUD(ctx, lives, bossesDefeated, speed, distance) {
  for (let i = 0; i < 3; i++) {
    ctx.font = '20px serif';
    ctx.globalAlpha = i < lives ? 1 : 0.22;
    ctx.fillText('❤️', 12 + i * 28, 28);
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    ctx.font = '18px serif';
    ctx.globalAlpha = i < bossesDefeated ? 1 : 0.22;
    ctx.fillText('⭐', CW - 72 + i * 22, 28);
  }
  ctx.globalAlpha = 1;
  const sp = Math.min((speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED), 1);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(CW / 2 - 50, 8, 100, 10);
  const gc = ctx.createLinearGradient(CW / 2 - 50, 0, CW / 2 + 50, 0);
  gc.addColorStop(0, '#22c55e');
  gc.addColorStop(0.6, '#f59e0b');
  gc.addColorStop(1, '#ef4444');
  ctx.fillStyle = gc;
  ctx.fillRect(CW / 2 - 50, 8, sp * 100, 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(CW / 2 - 50, 8, 100, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('السرعة', CW / 2, 30);
  ctx.textAlign = 'left';
}

function makeStars() {
  return Array.from({ length: 55 }, () => ({
    x: Math.random() * CW, y: Math.random() * (GROUND - 60),
    r: 0.5 + Math.random() * 1.4,
    speed: 0.5 + Math.random(), phase: Math.random() * Math.PI * 2,
  }));
}

function makeMathSymbols() {
  const syms = ['π', 'Σ', '∫', 'x²', '√', '∞', 'Δ', '∂', 'α', 'β'];
  return Array.from({ length: 14 }, (_, i) => ({
    char: syms[i % syms.length],
    x: Math.random() * CW,
    y: 20 + Math.random() * (GROUND - 80),
    size: 18 + Math.random() * 20,
    speed: 0.2 + Math.random() * 0.3,
  }));
}

function makeMountains() {
  return [
    {
      color: '#1a0a2e', speed: 0.18,
      peaks: Array.from({ length: 8 }, (_, i) => ({
        x: i * 130 + Math.random() * 60, w: 120 + Math.random() * 80, h: 70 + Math.random() * 50,
      })),
    },
    {
      color: '#12062a', speed: 0.32,
      peaks: Array.from({ length: 10 }, (_, i) => ({
        x: i * 110 + Math.random() * 50, w: 90 + Math.random() * 60, h: 45 + Math.random() * 35,
      })),
    },
  ];
}

const DUCK_OB_Y = GROUND - 50;

function makeObstacle(speed, bossIdx) {
  const r = Math.random();
  if (r < 0.55) {
    return { type: 'jump', x: CW + 30, h: 40 + Math.random() * 25 };
  } else {
    return { type: 'duck', x: CW + 30, y: DUCK_OB_Y, w: 70 + Math.random() * 30 };
  }
}

function collides(player, ob) {
  const ph = player.ducking ? DUCK_HEIGHT : STAND_HEIGHT;
  const py1 = player.y - ph;
  const py2 = player.y;
  const px1 = PLAYER_X - 12;
  const px2 = PLAYER_X + 12;

  if (ob.type === 'jump') {
    const ox1 = ob.x - 16, ox2 = ob.x + 16;
    const oy1 = GROUND - ob.h, oy2 = GROUND;
    return px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2;
  } else {
    const ox1 = ob.x - ob.w / 2, ox2 = ob.x + ob.w / 2;
    const oy1 = ob.y - 14, oy2 = ob.y + 14;
    return px2 > ox1 && px1 < ox2 && py2 > oy1 && py1 < oy2;
  }
}

export default function StickmanRun({ onClose, academicStage }) {
  const { user, updateUser } = useAuth();
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const inputRef = useRef({ jump: false, duck: false });
  const bossEncounterRef = useRef(false);

  const [phase, setPhase] = useState('loading');
  const [bossUI, setBossUI] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [timerPct, setTimerPct] = useState(100);
  const [lives, setLives] = useState(3);
  const [bossesDefeated, setBossesDefeated] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [resultData, setResultData] = useState(null);
  const timerRef = useRef(null);

  const cfg = getGameConfig(academicStage || user?.academic_stage);
  const bossCfgs = [cfg.boss1, cfg.boss2, cfg.boss3];

  const teacherImgs = useRef({});
  useEffect(() => {
    ['normal', 'sad', 'fury'].forEach(k => {
      const img = new Image();
      img.src = `/teacher-${k}.png`;
      teacherImgs.current[k] = img;
    });
  }, []);

  useEffect(() => {
    api.get('/events/weekly-run/status').then(r => {
      if (r.data.played) setPhase('already_played');
      else setPhase('intro');
    }).catch(() => setPhase('intro'));
  }, []);

  const initState = useCallback(() => {
    return {
      frame: 0,
      distance: 0,
      speed: BASE_SPEED,
      lives: 3,
      bossesDefeated: 0,
      totalPoints: 0,
      player: { y: GROUND, vy: 0, jumping: false, ducking: false, invincible: 0 },
      obstacles: [],
      obTimer: 80,
      boss: null,
      bossIdx: -1,
      explosionParts: [],
      stars: makeStars(),
      mathSymbols: makeMathSymbols(),
      mountains: makeMountains(),
      bgOffset: 0,
      phase: 'running',
      bossTriggered: [false, false, false],
    };
  }, []);

  const triggerBossEncounter = useCallback((gs, bossIdx) => {
    if (bossEncounterRef.current) return;
    bossEncounterRef.current = true;
    gs.phase = 'boss_encounter';
    const bcfg = bossCfgs[bossIdx];
    setBossUI({ bossIdx, cfg: bcfg });
    setSelectedChoice(null);
    setAnswerResult(null);
    let pct = 100;
    const totalMs = bcfg.timeLimit * 1000;
    const step = 100 / (bcfg.timeLimit * 20);
    timerRef.current = setInterval(() => {
      pct -= step;
      setTimerPct(Math.max(0, pct));
      if (pct <= 0) {
        clearInterval(timerRef.current);
        handleAnswer(gs, bossIdx, -1);
      }
    }, 50);
  }, [bossCfgs]);

  const handleAnswer = useCallback((gs, bossIdx, choiceIdx) => {
    clearInterval(timerRef.current);
    if (!gs) return;
    const bcfg = bossCfgs[bossIdx];
    const correct = choiceIdx === bcfg.correctIndex;
    setSelectedChoice(choiceIdx);
    setAnswerResult(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      if (correct) {
        const pts = BOSS_POINTS[bossIdx];
        gs.totalPoints += pts;
        gs.bossesDefeated += 1;
        setBossesDefeated(gs.bossesDefeated);
        setTotalPoints(gs.totalPoints);
        const cx = gs.boss?.x || CW * 0.65;
        const cy = gs.boss?.y || GROUND;
        gs.explosionParts = Array.from({ length: 30 }, () => ({
          x: cx, y: cy - 40,
          vx: (Math.random() - 0.5) * 12,
          vy: -6 - Math.random() * 8,
          r: 3 + Math.random() * 5,
          color: ['#fbbf24', '#f97316', '#ec4899', '#a855f7', '#22c55e'][Math.floor(Math.random() * 5)],
          life: 40, maxLife: 40,
        }));
      } else {
        gs.lives = Math.max(0, gs.lives - 1);
        setLives(gs.lives);
        gs.player.invincible = 90;
        if (gs.lives === 0) {
          finishGame(gs);
          return;
        }
      }
      gs.boss = null;
      gs.phase = 'running';
      setBossUI(null);
      bossEncounterRef.current = false;
    }, 1200);
  }, [bossCfgs]);

  const finishGame = useCallback((gs) => {
    gs.phase = 'gameover';
    const pts = gs.totalPoints;
    const defeated = gs.bossesDefeated;
    setResultData({ won: defeated === 3, pts, defeated });
    setPhase(defeated === 3 ? 'victory' : 'gameover');
    api.post('/events/weekly-run/finish', {
      pointsEarned: pts,
      bossesDefeated: defeated,
    }).then(r => {
      if (r.data.success && updateUser) {
        updateUser({ points: r.data.newTotal });
      }
    }).catch(() => {});
  }, [updateUser]);

  const startGame = useCallback(() => {
    const gs = initState();
    stateRef.current = gs;
    setLives(3);
    setBossesDefeated(0);
    setTotalPoints(0);
    setPhase('playing');
    bossEncounterRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const gs = stateRef.current;
      if (!gs) return;

      if (gs.phase === 'running') {
        gs.frame++;
        gs.distance += gs.speed;
        gs.speed = Math.min(MAX_SPEED, BASE_SPEED + gs.distance * 0.0035);
        gs.bgOffset += gs.speed;

        const p = gs.player;
        if (p.jumping || p.y < GROUND) {
          p.vy += GRAVITY;
          p.y = Math.min(GROUND, p.y + p.vy);
          if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.jumping = false; }
        }
        if (inputRef.current.duck) p.ducking = true;
        else p.ducking = false;

        gs.obTimer--;
        if (gs.obTimer <= 0) {
          gs.obstacles.push(makeObstacle(gs.speed, gs.bossIdx));
          gs.obTimer = 45 + Math.random() * 55;
        }
        gs.obstacles.forEach(o => { o.x -= gs.speed; });
        gs.obstacles = gs.obstacles.filter(o => o.x > -80);

        if (p.invincible > 0) p.invincible--;

        for (const ob of gs.obstacles) {
          if (p.invincible === 0 && collides(p, ob)) {
            gs.lives = Math.max(0, gs.lives - 1);
            setLives(gs.lives);
            p.invincible = 90;
            ob.x = -200;
            if (gs.lives === 0) { finishGame(gs); return; }
            break;
          }
        }

        gs.explosionParts = gs.explosionParts.filter(ep => ep.life > 0);
        gs.explosionParts.forEach(ep => {
          ep.x += ep.vx; ep.y += ep.vy; ep.vy += 0.3;
          ep.life--;
        });

        for (let i = 0; i < 3; i++) {
          if (!gs.bossTriggered[i] && gs.distance >= BOSS_DISTS[i]) {
            gs.bossTriggered[i] = true;
            gs.bossIdx = i;
            gs.boss = { x: CW + 80, y: GROUND, idx: i, walkSpeed: 1.8 };
          }
        }

        if (gs.boss) {
          const bossTargetX = CW * 0.62;
          if (gs.boss.x > bossTargetX) {
            gs.boss.x -= gs.boss.walkSpeed;
          } else if (!bossEncounterRef.current) {
            triggerBossEncounter(gs, gs.boss.idx);
          }
        }

        gs.stars.forEach(s => { s.twinkle = (s.twinkle || 0) + 0.02; });
      } else if (gs.phase === 'boss_encounter') {
        gs.frame++;
        gs.explosionParts = gs.explosionParts.filter(ep => ep.life > 0);
        gs.explosionParts.forEach(ep => {
          ep.x += ep.vx; ep.y += ep.vy; ep.vy += 0.3; ep.life--;
        });
      }

      ctx.clearRect(0, 0, CW, CH);
      drawSky(ctx);
      drawStars(ctx, gs.stars, gs.frame);
      drawMathBg(ctx, gs.mathSymbols, gs.bgOffset);
      drawMountains(ctx, gs.mountains, gs.bgOffset);
      drawGround(ctx, gs.bgOffset);
      gs.obstacles.forEach(ob => drawObstacle(ctx, ob, gs.frame));

      if (gs.boss && gs.boss.x < CW + 20) {
        const bx = gs.boss.x, by = gs.boss.y;
        if (gs.boss.idx === 0) drawBoss1(ctx, bx, by, gs.frame);
        else if (gs.boss.idx === 1) drawBoss2(ctx, bx, by, gs.frame);
        else drawBoss3(ctx, bx, by, gs.frame, teacherImgs.current.normal);
      }

      drawStickman(ctx, PLAYER_X, gs.player.y, gs.frame, gs.player.ducking, gs.player.invincible > 0);
      drawExplosion(ctx, gs.explosionParts);
      drawHUD(ctx, gs.lives, gs.bossesDefeated, gs.speed, gs.distance);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [initState, triggerBossEncounter, finishGame]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        const gs = stateRef.current;
        if (gs?.phase === 'running' && gs.player.y >= GROUND && !gs.player.jumping) {
          gs.player.vy = JUMP_V;
          gs.player.jumping = true;
        }
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        inputRef.current.duck = true;
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        inputRef.current.duck = false;
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const handleCanvasTouch = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const gs = stateRef.current;
    if (!gs || gs.phase !== 'running') return;
    const y = e.touches[0].clientY - rect.top;
    const relY = y / rect.height;
    if (relY < 0.55) {
      if (gs.player.y >= GROUND && !gs.player.jumping) {
        gs.player.vy = JUMP_V; gs.player.jumping = true;
      }
    } else {
      inputRef.current.duck = true;
    }
  };
  const handleTouchEnd = () => { inputRef.current.duck = false; };

  const bossImg = bossUI?.bossIdx === 2
    ? (answerResult === 'correct' ? teacherImgs.current.sad : answerResult === 'wrong' ? teacherImgs.current.fury : teacherImgs.current.normal)
    : null;

  const bossEmoji = bossUI ? (bossUI.bossIdx === 0 ? '👹' : bossUI.bossIdx === 1 ? '👾' : null) : null;

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#060612', color: '#fff', minHeight: 340 }}>
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (phase === 'already_played') {
    return (
      <div className="flex flex-col items-center justify-center gap-5 p-8 text-center" style={{ background: '#060612', minHeight: 340, borderRadius: 16 }}>
        <div style={{ fontSize: 60 }}>🗓️</div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>لعبت هذا الأسبوع!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>تقدر تلعب مرة تانية الأسبوع الجاي 🎮</p>
        <button onClick={onClose} style={{ padding: '10px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
          رجوع للفعاليات
        </button>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center gap-6 p-8 text-center" style={{ background: 'linear-gradient(145deg,#060612 0%,#1a0838 100%)', minHeight: 340, borderRadius: 16 }}>
        <div style={{ fontSize: 64, filter: 'drop-shadow(0 0 20px #7c3aed)' }}>🏃</div>
        <div>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>تحدي الأسبوعي الرياضي</h2>
          <p style={{ color: '#c084fc', fontSize: 14, margin: '6px 0 0' }}>اتخطى العقبات وهزم الـ ٣ بوسات الرياضية!</p>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['⬆️', 'قفز'], ['⬇️', 'انحنى'], ['🎯', 'إجابة صح = نقاط']].map(([ic, lb]) => (
            <div key={lb} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 16px' }}>
              <div style={{ fontSize: 22 }}>{ic}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>{lb}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {bossCfgs.map((b, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '6px 14px', color: '#fbbf24', fontSize: 13, fontWeight: 700 }}>
              بوس {i + 1}: {BOSS_POINTS[i]} نقطة
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={startGame} style={{
            padding: '12px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff',
            fontFamily: 'inherit', fontWeight: 900, fontSize: 16,
            boxShadow: '0 6px 24px rgba(124,58,237,0.5)',
          }}>
            ابدأ اللعب 🎮
          </button>
          <button onClick={onClose} style={{ padding: '12px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', fontWeight: 700 }}>
            رجوع
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'victory' || phase === 'gameover') {
    const won = phase === 'victory';
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center gap-5 p-8 text-center" style={{ background: 'linear-gradient(145deg,#060612 0%,#1a0838 100%)', minHeight: 340, borderRadius: 16 }}>
        <div style={{ fontSize: 70 }}>{won ? '🏆' : '💔'}</div>
        <h2 style={{ color: won ? '#fbbf24' : '#ef4444', fontSize: 26, fontWeight: 900, margin: 0 }}>
          {won ? 'أنت بطل المنهج! 🌟' : 'حاول مرة تانية الأسبوع الجاي!'}
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 20px' }}>
            <div style={{ color: '#fbbf24', fontSize: 28, fontWeight: 900 }}>{resultData?.pts || 0}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>نقطة مكسوبة</div>
          </div>
          <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '10px 20px' }}>
            <div style={{ color: '#c084fc', fontSize: 28, fontWeight: 900 }}>{resultData?.defeated || 0}/3</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>بوسات هُزمت</div>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>مرة واحدة في الأسبوع — إلى اللقاء الأسبوع القادم!</p>
        <button onClick={onClose} style={{
          padding: '12px 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff',
          fontFamily: 'inherit', fontWeight: 900, fontSize: 15,
        }}>
          رجوع للفعاليات
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ position: 'relative', userSelect: 'none', background: '#060612', borderRadius: 16, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        onTouchStart={handleCanvasTouch}
        onTouchEnd={handleTouchEnd}
        style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'none' }}
      />

      {bossUI && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          background: 'rgba(6,6,18,0.82)', backdropFilter: 'blur(3px)',
          padding: '10px 16px 16px',
          animation: 'slideDownIn 0.35s cubic-bezier(.34,1.56,.64,1) both',
        }}>
          <style>{`
            @keyframes slideDownIn { from{opacity:0;transform:translateY(-24px) scale(.97)} to{opacity:1;transform:none} }
            @keyframes choiceIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }
            @keyframes shakeX { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
          `}</style>

          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8 }}>
            <div style={{
              height: '100%', borderRadius: 3, transition: 'width 0.05s linear',
              width: `${timerPct}%`,
              background: timerPct > 50 ? '#22c55e' : timerPct > 25 ? '#f59e0b' : '#ef4444',
            }} />
          </div>

          <div style={{ display: 'flex', gap: 12, width: '100%', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {bossImg ? (
                <img src={bossImg.src} alt="boss" style={{
                  width: 80, height: 80, borderRadius: 12, objectFit: 'cover',
                  border: `2px solid ${answerResult === 'correct' ? '#22c55e' : answerResult === 'wrong' ? '#ef4444' : '#fbbf24'}`,
                  animation: answerResult === 'wrong' ? 'shakeX 0.4s ease' : 'none',
                }} />
              ) : (
                <div style={{ width: 70, height: 70, fontSize: 54, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {bossEmoji}
                </div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'center' }}>
                بوس {bossUI.bossIdx + 1}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '8px 12px', marginBottom: 8,
              }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '0 0 4px' }}>
                  {answerResult === 'correct' ? bossUI.cfg.correctDialog : answerResult === 'wrong' ? bossUI.cfg.wrongDialog : bossUI.cfg.dialog}
                </p>
                <p style={{ color: '#fff', fontWeight: 900, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                  {bossUI.cfg.question}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {bossUI.cfg.choices.map((ch, idx) => {
                  const isSelected = selectedChoice === idx;
                  const isCorrect = idx === bossUI.cfg.correctIndex;
                  let bg = 'rgba(255,255,255,0.07)';
                  let border = '1px solid rgba(255,255,255,0.15)';
                  let col = '#fff';
                  if (answerResult && isSelected) {
                    bg = answerResult === 'correct' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)';
                    border = `1px solid ${answerResult === 'correct' ? '#22c55e' : '#ef4444'}`;
                    col = answerResult === 'correct' ? '#86efac' : '#fca5a5';
                  } else if (answerResult === 'wrong' && isCorrect) {
                    bg = 'rgba(34,197,94,0.15)'; border = '1px solid #22c55e'; col = '#86efac';
                  }
                  return (
                    <button key={idx}
                      disabled={!!answerResult}
                      onClick={() => {
                        if (!answerResult) {
                          setSelectedChoice(idx);
                          handleAnswer(stateRef.current, bossUI.bossIdx, idx);
                        }
                      }}
                      style={{
                        background: bg, border, borderRadius: 8, padding: '7px 10px',
                        color: col, fontFamily: 'inherit', fontWeight: 700, fontSize: 12,
                        cursor: answerResult ? 'default' : 'pointer', textAlign: 'center',
                        transition: 'all 0.2s',
                        animation: `choiceIn 0.3s ${0.05 * idx}s both`,
                      }}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div dir="rtl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(0,0,0,0.4)' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
          ⬆️ قفز &nbsp;|&nbsp; ⬇️ انحنى
        </div>
        <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>
          {totalPoints} نقطة 🌟
        </div>
      </div>
    </div>
  );
}
