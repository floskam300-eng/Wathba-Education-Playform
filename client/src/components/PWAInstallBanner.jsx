import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
  const [prompt, setPrompt]       = useState(null);
  const [visible, setVisible]     = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pwa_banner_dismissed') === '1'
  );

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setTimeout(() => setVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setVisible(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setInstalled(true);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', '1');
  };

  if (installed || dismissed || !visible || !prompt) return null;

  return (
    <>
      <style>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerInstall {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <div
        dir="rtl"
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          animation: 'slideUpBanner 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          width: 'calc(100% - 32px)',
          maxWidth: 420,
          fontFamily: "'Cairo', sans-serif",
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1a1030 0%, #0f0e20 100%)',
          border: '1px solid rgba(249,115,22,0.4)',
          borderRadius: 18,
          padding: '14px 16px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Icon */}
          <div style={{
            width: 46, height: 46, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #f97316, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          }}>
            <Smartphone size={22} color="#fff" />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 14, margin: 0, lineHeight: 1.3 }}>
              ثبّت تطبيق وثبة
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, margin: '2px 0 0', lineHeight: 1.4 }}>
              أسرع وأسهل — يشتغل حتى بدون إنترنت
            </p>
          </div>

          {/* Install button */}
          <button
            onClick={handleInstall}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
              color: '#fff',
              background: 'linear-gradient(90deg, #f97316 0%, #ea580c 50%, #f97316 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmerInstall 2.5s linear infinite',
              boxShadow: '0 4px 14px rgba(249,115,22,0.45)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Download size={14} />
            تثبيت
          </button>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            style={{
              flexShrink: 0,
              width: 28, height: 28, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.08)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </>
  );
}
