'use client';

import { useLayoutEffect, type Dispatch, type RefObject, type ReactNode, type SetStateAction } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { gsap, ScrollTrigger } from '@/lib/gsap-scroll-trigger';

const MOTION = {
  rise: 28,
  duration: 0.72,
  stagger: 0.09,
  ease: 'power3.out',
};

export function MotionAction({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function useLandingMotion(rootRef: RefObject<HTMLDivElement | null>, setActiveSection: Dispatch<SetStateAction<string>>) {
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reduced) return;

    const context = gsap.context(() => {
      const header = root.querySelector('header');
      if (header) gsap.from(header, { autoAlpha: 0, y: -14, duration: 0.5, ease: MOTION.ease, clearProps: 'all' });

      const hero = gsap.timeline({ defaults: { ease: MOTION.ease, clearProps: 'opacity,visibility,transform' } });
      hero.from('.hero-copy .hero-word', { autoAlpha: 0, y: MOTION.rise, duration: 0.65, stagger: 0.055 })
        .from('.hero-copy > p', { autoAlpha: 0, y: 18, duration: 0.55 }, '-=.45')
        .from('.hero-copy .hero-actions', { autoAlpha: 0, y: 18, duration: 0.55 }, '-=.35')
        .from('.hero-copy .hero-sources > span', { autoAlpha: 0, y: 12, stagger: 0.07, duration: 0.45 }, '-=.25')
        .from('.hero-portrait', { autoAlpha: 0, y: 30, duration: 0.7 }, '-=.65')
        .from('#consulta', { autoAlpha: 0, y: 24, duration: 0.6, ease: 'back.out(1.25)' }, '-=.3');

      root.querySelectorAll<HTMLElement>('main > section:not(#inicio)').forEach((section) => {
        if (section.matches('#contato')) {
          const panel = section.querySelector(':scope > div');
          if (panel) gsap.from(panel, {
            autoAlpha: 0, scale: 0.975, duration: 0.7, ease: MOTION.ease,
            clearProps: 'all', scrollTrigger: { trigger: section, start: 'top 85%', once: true },
          });
        }
        if (section.id) ScrollTrigger.create({
          trigger: section, start: 'top 38%', end: 'bottom 38%',
          onEnter: () => setActiveSection(section.id),
          onEnterBack: () => setActiveSection(section.id),
        });
        const tag = section.querySelector('.section-tag');
        if (tag) gsap.from(tag, {
          autoAlpha: 0, scale: 0.92, duration: 0.55, ease: MOTION.ease,
          clearProps: 'all', scrollTrigger: { trigger: tag, start: 'top 88%', once: true },
        });
        const heading = section.querySelector('h2');
        if (heading) gsap.from(heading, {
          autoAlpha: 0, y: MOTION.rise, duration: MOTION.duration, ease: MOTION.ease,
          clearProps: 'all', scrollTrigger: { trigger: heading, start: 'top 84%', once: true },
        });
        const intro = heading?.parentElement;
        intro?.querySelectorAll(':scope > p:not(.section-tag), :scope > div:not(.section-tag)').forEach((element, index) => {
          gsap.from(element, {
            autoAlpha: 0, y: 16, duration: 0.6, delay: index * MOTION.stagger,
            ease: MOTION.ease, clearProps: 'all',
            scrollTrigger: { trigger: element, start: 'top 88%', once: true },
          });
        });
        const cards = section.matches('#oportunidades')
          ? []
          : section.querySelectorAll('article, .faq-list > div > div');
        cards.forEach((card, index) => gsap.from(card, {
          autoAlpha: 0, y: 22, duration: MOTION.duration, delay: Math.min(index * MOTION.stagger, 0.27), ease: MOTION.ease,
          clearProps: 'all', scrollTrigger: { trigger: card, start: 'top 87%', once: true },
        }));
      });

      root.querySelectorAll<HTMLElement>('footer > div > div:first-child > div').forEach((column) => {
        gsap.from(column, { autoAlpha: 0, y: 20, duration: 0.6, ease: MOTION.ease,
          clearProps: 'all', scrollTrigger: { trigger: column, start: 'top 90%', once: true } });
      });

      const media = gsap.matchMedia();
      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        root.querySelectorAll<HTMLElement>('.hero-portrait img, .cta-portrait img').forEach((element) => {
          gsap.fromTo(element, { y: -15 }, { y: 30, ease: 'none', scrollTrigger: {
            trigger: element.closest('section') ?? element,
            start: 'top bottom', end: 'bottom top', scrub: 0.7,
          } });
        });
      });

      let active = true;
      const refresh = () => { if (active) ScrollTrigger.refresh(); };
      const images = Array.from(root.querySelectorAll('img'));
      images.forEach((image) => image.addEventListener('load', refresh));
      window.addEventListener('resize', refresh);
      void document.fonts?.ready.then(refresh);
      const frame = requestAnimationFrame(refresh);
      return () => {
        active = false;
        cancelAnimationFrame(frame);
        media.revert();
        images.forEach((image) => image.removeEventListener('load', refresh));
        window.removeEventListener('resize', refresh);
      };
    }, root);
    return () => context.revert();
  }, [rootRef, setActiveSection, reduced]);
}
