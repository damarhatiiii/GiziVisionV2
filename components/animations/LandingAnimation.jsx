'use client';

import { useEffect } from 'react';
import anime from 'animejs';

export default function LandingAnimation() {
  useEffect(() => {
    anime({
      targets: '.animate-hero',
      opacity: [0, 1],
      translateY: [18, 0],
      easing: 'easeOutQuart',
      duration: 600,
      delay: anime.stagger(120, { start: 80 }),
    });

    anime({
      targets: '.animate-features',
      opacity: [0, 1],
      translateY: [12, 0],
      easing: 'easeOutQuart',
      duration: 500,
      delay: anime.stagger(60, { start: 350 }),
    });
  }, []);

  return null;
}
