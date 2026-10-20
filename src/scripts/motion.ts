import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "power3.out";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BAR_OFFSET = 5;

/**
 * Morphs the hamburger into an X and staggers the menu items in.
 * The open/close state stays owned by the Navbar's click handler.
 */
export function animateMenuToggle({
  toggle,
  menu,
  open,
}: {
  toggle: HTMLButtonElement;
  menu: HTMLElement;
  open: boolean;
}) {
  const bars = Array.from(toggle.querySelectorAll<HTMLElement>("[data-bar]"));
  const items = menu.querySelectorAll<HTMLElement>("[data-menu-item]");

  const angles = open ? [45, 0, -45] : [0, 0, 0];
  const middleOpacity = open ? 0 : 1;

  if (reducedMotion()) {
    bars.forEach((bar, i) => {
      gsap.set(bar, {
        rotation: angles[i],
        opacity: i === 1 ? middleOpacity : 1,
      });
    });
    gsap.set(items, { autoAlpha: 1, y: 0 });
    return;
  }

  // GSAP animates only rotation and opacity; the bars' spacing stays in CSS
  // so the tween never fights the layout offset.
  bars.forEach((bar, i) => {
    gsap.to(bar, {
      rotation: angles[i],
      opacity: i === 1 ? middleOpacity : 1,
      duration: open ? 0.34 : 0.32,
      ease: open ? "power3.out" : "power3.inOut",
      delay: i * 0.02,
      overwrite: true,
    });
  });

  if (open) {
    gsap.fromTo(
      menu,
      { autoAlpha: 0, y: -12 },
      { autoAlpha: 1, y: 0, duration: 0.32, ease: EASE, overwrite: true },
    );
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.055,
        delay: 0.06,
        ease: EASE,
        overwrite: true,
      },
    );
  } else {
    gsap.to(menu, {
      autoAlpha: 0,
      y: -8,
      duration: 0.22,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        gsap.set(menu, { clearProps: "opacity,visibility,transform" });
      },
    });
  }
}

export function initMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Background tabs and battery-saver mode stop rAF, which leaves a
  // from-tween's start values stuck — so skip motion entirely.
  const paused = document.hidden || reduced;

  const teardowns = [
    navIntro(paused),
    heroIntro(paused),
    ctaHover(paused),
    scrollReveals(paused),
    trustedMarquee(paused),
  ];

  return () => teardowns.forEach((fn) => fn());
}

function navIntro(paused: boolean): () => void {
  const header = document.querySelector<HTMLElement>("[data-nav]");
  if (!header) return () => {};

  const brand = header.querySelectorAll<HTMLElement>("[data-nav-item]");
  const links = header.querySelectorAll<HTMLElement>("[data-nav-link]");
  const cta = header.querySelectorAll<HTMLElement>("[data-nav-cta]");

  if (paused) return () => {};

  const tl = gsap.timeline({ defaults: { duration: 0.6, ease: EASE } });

  tl.fromTo(header, { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5 })
    .fromTo(
      [brand, cta],
      { autoAlpha: 0, y: 8 },
      { autoAlpha: 1, y: 0, stagger: 0.04 },
      "-=0.35",
    )
    .fromTo(links, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05 }, "-=0.4");

  return () => {
    tl.kill();
    gsap.set(header, { clearProps: "all" });
  };
}

function heroIntro(paused: boolean): () => void {
  const heading = document.querySelector<HTMLElement>("[data-hero-title]");
  const sub = document.querySelector<HTMLElement>("[data-hero-sub]");
  if (!heading || !sub || paused) return () => {};

  const badge = document.querySelector<HTMLElement>("[data-hero-badge]");
  const ctas = gsap.utils.toArray<HTMLElement>("[data-hero-cta]");
  const art = document.querySelector<HTMLElement>("[data-hero-art]");
  const iso = art?.querySelector<HTMLElement>("img");
  const cards = gsap.utils.toArray<HTMLElement>("[data-hero-card]");
  const pattern = document.querySelector<HTMLElement>("[data-hero-pattern]");

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let loops: gsap.core.Tween[] = [];

  const run = () => {
    split = SplitText.create(heading, { type: "lines", linesClass: "hero-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    if (pattern) {
      tl.fromTo(
        pattern,
        { autoAlpha: 0, scale: 1.06 },
        { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        0,
      );
    }

    if (badge) {
      tl.fromTo(
        badge,
        { autoAlpha: 0, y: -14, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.7)" },
        0.15,
      );
    }

    tl.fromTo(
      split.lines,
      { yPercent: 115, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.11, ease: "power4.out" },
      0.32,
    );

    tl.fromTo(sub, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.62);

    if (ctas.length) {
      tl.fromTo(
        ctas,
        { autoAlpha: 0, y: 16, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.09, ease: "back.out(1.6)" },
        0.78,
      );
    }

    if (iso) {
      tl.fromTo(
        iso,
        { autoAlpha: 0, yPercent: 14, scale: 0.965 },
        { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.25, ease: "power3.out" },
        0.7,
      );
    }

    if (cards.length) {
      tl.fromTo(
        cards,
        { autoAlpha: 0, y: -46, scale: 0.92, rotate: -2 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.9,
          stagger: { each: 0.14, from: "end" },
          ease: "power3.out",
        },
        1.05,
      );

      // Each card bobs on its own sine phase so they never sync.
      loops = cards.map((card, i) =>
        gsap.to(card, {
          y: i === 2 ? -10 : -7,
          duration: 2.6 + i * 0.55,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 2 + i * 0.35,
        }),
      );
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    loops.forEach((l) => l.kill());
    split?.revert();
    gsap.set([heading, sub, badge, ctas, iso, cards, pattern].filter(Boolean), {
      clearProps: "all",
    });
  };
}

function trustedMarquee(paused: boolean): () => void {
  const track = document.querySelector<HTMLElement>("[data-marquee-track]");
  if (!track) return () => {};

  // The track holds the list twice; shifting by the first list's width
  // (plus its trailing gap) loops seamlessly back to the start.
  const list = track.querySelector<HTMLElement>("ul");
  if (!list) return () => {};

  const distance = () => list.getBoundingClientRect().width + 32;

  if (paused) return () => {};

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    duration: 30,
    repeat: -1,
    // Recalculate on resize so the wrap point stays exact.
    repeatRefresh: true,
  });

  return () => {
    tween.kill();
    gsap.set(track, { clearProps: "all" });
  };
}

function ctaHover(paused: boolean): () => void {
  if (paused) return () => {};

  const cleanups: Array<() => void> = [];

  gsap.utils.toArray<HTMLElement>("[data-nav-cta]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
    const scaleTo = gsap.quickTo(el, "scale", { duration: 0.35, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
    };
    const onEnter = () => scaleTo(1.03);
    const onLeave = () => {
      xTo(0);
      scaleTo(1);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.set(el, { clearProps: "x,scale" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

function scrollReveals(paused: boolean): () => void {
  if (paused) return () => {};

  // Only elements still below the fold get hidden, so a section already
  // on screen never reads as empty.
  const hidden = gsap
    .utils.toArray<HTMLElement>("[data-reveal]")
    .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);

  if (!hidden.length) return () => {};

  gsap.set(hidden, { autoAlpha: 0, y: 32 });

  const triggers = ScrollTrigger.batch(hidden, {
    start: "top 88%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: EASE,
        overwrite: true,
      }),
  });

  return () => {
    triggers.forEach((t) => t.kill());
    gsap.set(hidden, { clearProps: "all" });
  };
}
