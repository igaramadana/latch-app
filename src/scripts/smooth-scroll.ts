import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling driven by GSAP's ticker so Lenis and ScrollTrigger share a
 * single rAF loop. `respectReducedMotion` stays on, so Lenis falls back to
 * native 1:1 scrolling for users who ask for reduced motion.
 */
export function initSmoothScroll(): () => void {
  const lenis = new Lenis({
    autoRaf: false,
    anchors: true,
    duration: 1.1,
    // Keep the sticky navbar and anchor jumps predictable.
    stopInertiaOnNavigate: true,
  });

  // ScrollTrigger.update is a stable reference, so it can be detached as-is.
  lenis.on("scroll", ScrollTrigger.update);

  const raf = (time: number) => {
    // GSAP's ticker reports seconds; Lenis expects milliseconds.
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(raf);
  // Scroll is already smoothed, so lag smoothing would add a second delay.
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.off("scroll", ScrollTrigger.update);
    lenis.destroy();
  };
}
