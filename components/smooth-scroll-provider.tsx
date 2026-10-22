'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap-scroll-trigger';

export function SmoothScrollProvider() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      anchors: { offset: -80 },
    });
    const onScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    const onModalChange = () => {
      if (document.querySelector('[role="dialog"][data-state="open"], [aria-modal="true"]')) {
        lenis.stop();
      } else if (!preference.matches) {
        lenis.start();
      }
    };
    const onPreferenceChange = () => {
      if (preference.matches) lenis.stop();
      else onModalChange();
    };
    const observer = new MutationObserver(onModalChange);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-state', 'aria-modal'] });

    lenis.on('scroll', onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    preference.addEventListener('change', onPreferenceChange);
    onPreferenceChange();

    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreferenceChange);
      lenis.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
