import { useEffect, useCallback } from 'react';

export function useAntiCapture({ onAttempt } = {}) {
  const notify = useCallback(() => {
    if (onAttempt) onAttempt();
  }, [onAttempt]);

  useEffect(() => {
    const blockContext = (e) => e.preventDefault();
    document.addEventListener('contextmenu', blockContext);

    const blockKeys = (e) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      if (key === 'printscreen') {
        e.preventDefault();
        notify();
        return;
      }
      if (key === 'f12') { e.preventDefault(); return; }
      if (ctrl && key === 'p') { e.preventDefault(); return; }
      if (ctrl && key === 's') { e.preventDefault(); return; }
      if (ctrl && shift && (key === 'i' || key === 'c' || key === 'j' || key === 'k')) {
        e.preventDefault();
        return;
      }
      if (ctrl && key === 'u') { e.preventDefault(); return; }
    };
    document.addEventListener('keydown', blockKeys, true);

    // Also catch PrintScreen on keyup (some OS fire after capture)
    const blockKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        try { navigator.clipboard.writeText(''); } catch (_) {}
        notify();
      }
    };
    document.addEventListener('keyup', blockKeyUp, true);

    const blockDrag = (e) => e.preventDefault();
    document.addEventListener('dragstart', blockDrag);

    const blockSelect = (e) => e.preventDefault();
    document.addEventListener('selectstart', blockSelect);

    // Block screen-share / recording via browser API
    let origGetDisplayMedia = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getDisplayMedia = async () => {
        notify();
        throw new DOMException('Screen capture is not permitted on this platform.', 'NotAllowedError');
      };
    }

    // Overlay when window loses focus (external screenshot tools)
    // 400ms delay to avoid false triggers from accidental tab switches
    let blurOverlay = null;
    let blurTimer = null;
    const showBlur = () => {
      clearTimeout(blurTimer);
      blurTimer = setTimeout(() => {
        if (blurOverlay) return;
        blurOverlay = document.createElement('div');
        Object.assign(blurOverlay.style, {
          position: 'fixed', inset: '0', zIndex: '2147483647',
          background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        });
        blurOverlay.innerHTML = '<div style="color:#ef4444;font-size:22px;font-weight:900;font-family:inherit;text-align:center;direction:rtl;padding:32px">⛔ تسجيل الشاشة ممنوع</div>';
        document.body.appendChild(blurOverlay);
      }, 400);
    };
    const hideBlur = () => {
      clearTimeout(blurTimer);
      if (blurOverlay) { blurOverlay.remove(); blurOverlay = null; }
    };
    window.addEventListener('blur', showBlur);
    window.addEventListener('focus', hideBlur);

    return () => {
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('keyup', blockKeyUp, true);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('selectstart', blockSelect);
      window.removeEventListener('blur', showBlur);
      window.removeEventListener('focus', hideBlur);
      clearTimeout(blurTimer);
      hideBlur();
      if (origGetDisplayMedia && navigator.mediaDevices) {
        navigator.mediaDevices.getDisplayMedia = origGetDisplayMedia;
      }
    };
  }, [notify]);
}
