'use client';

import { useEffect } from 'react';

export default function BFCacheFix() {
  useEffect(() => {
    const handlePageShow = (event) => {
      // event.persisted = true means page was restored from Browser Back/Forward Cache (BFCache)
      if (event.persisted) {
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return null;
}
