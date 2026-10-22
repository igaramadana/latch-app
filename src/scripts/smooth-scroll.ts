import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// GSAP's ticker drives Lenis so both share one rAF; reduced motion stays on.
export function initSmoothScroll(): () => void {
  const lenis = new Lenis({
    autoRaf: false,
    anchors: true,
    duration: 1.1,
    stopInertiaOnNavigate: true,
  });

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
