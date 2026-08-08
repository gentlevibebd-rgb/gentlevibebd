'use client';

import { useState, useEffect } from 'react';
import './SplashScreen.css';

export default function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem('gvb_splash_seen');
      if (!hasSeen) {
        setShow(true);
        sessionStorage.setItem('gvb_splash_seen', '1');
        const timer = setTimeout(() => {
          setShow(false);
          document.documentElement.classList.remove('gvb-first-visit');
        }, 1350);
        return () => clearTimeout(timer);
      } else {
        document.documentElement.classList.remove('gvb-first-visit');
        setShow(false);
      }
    } catch (e) {
      document.documentElement.classList.remove('gvb-first-visit');
      setShow(false);
    }
  }, []);

  if (!show && typeof document !== "undefined" && !document.documentElement.classList.contains("gvb-first-visit")) {
    return null;
  }

  return (
    <div className="gvb-splash-container">
      <div className="gvb-splash-logo">
        Gentle Vibe <em>BD</em>
      </div>
      <div className="gvb-splash-sub">Premium Men's Fashion</div>
      <div className="gvb-splash-bar">
        <div className="gvb-splash-progress"></div>
      </div>
    </div>
  );
}
