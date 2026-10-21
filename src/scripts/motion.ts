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
    howItWorksIntro(paused),
    whyItMattersIntro(paused),
    whyParallax(paused),
    useCasesMotion(paused),
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

function howItWorksIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-howitworks]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-hiw-badge]");
  const title = section.querySelector<HTMLElement>("[data-hiw-title]");
  const sub = section.querySelector<HTMLElement>("[data-hiw-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-hiw-card]");
  if (!title || !cards.length) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  // Same contract as scrollReveals: never hide content that is already
  // on screen at load, or the section reads as empty.
  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.9;
  if (onScreen) return () => {};

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 })
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, "-=0.45");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...parts, ...cards], { clearProps: "all" });
  };
}

function whyItMattersIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-why]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-why-badge]");
  const title = section.querySelector<HTMLElement>("[data-why-title]");
  const sub = section.querySelector<HTMLElement>("[data-why-sub]");
  const art = section.querySelector<HTMLElement>("[data-why-art]");
  const diagram = section.querySelector<HTMLElement>("[data-why-diagram]");
  const halftone = section.querySelector<HTMLElement>("[data-why-halftone]");
  const glow = section.querySelector<HTMLElement>("[data-why-glow]");
  if (!title || !art) return () => {};

  const copy = [badge, title, sub].filter(Boolean) as HTMLElement[];

  // Never hide a section that is already on screen at load.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.9) {
    return () => {};
  }

  gsap.set(copy, { autoAlpha: 0, y: 24 });
  gsap.set(art, { autoAlpha: 0, y: 32 });
  if (diagram) gsap.set(diagram, { autoAlpha: 0, scale: 0.94 });
  if (halftone) gsap.set(halftone, { autoAlpha: 0 });
  if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0.85 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  tl.to(art, { autoAlpha: 1, y: 0, duration: 0.9 }, 0);

  if (halftone) tl.to(halftone, { autoAlpha: 1, duration: 1.1 }, 0.15);

  if (glow) tl.to(glow, { autoAlpha: 1, scale: 1, duration: 1.1 }, 0.2);

  if (diagram) {
    tl.to(
      diagram,
      { autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out" },
      0.25,
    );
  }

  tl.to(copy, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.35);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set(
      [art, halftone, glow, diagram, ...copy].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
  };
}

/**
 * Scroll parallax for the art panel. Each layer sits in its own wrapper so
 * the drift never shares a transform with the entrance tweens, and depths
 * are capped in px to stay inside the panel's slack.
 */
function whyParallax(paused: boolean): () => void {
  const art = document.querySelector<HTMLElement>("[data-why-art]");
  if (!art || paused) return () => {};

  const layers = gsap.utils.toArray<HTMLElement>("[data-why-parallax]", art);
  if (!layers.length) return () => {};

  const tweens = layers.map((el) => {
    const depth = Number(el.dataset.depth ?? 0);
    return gsap.fromTo(
      el,
      { y: depth },
      {
        y: -depth,
        ease: "none",
        scrollTrigger: {
          trigger: art,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  return () => {
    tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    gsap.set(layers, { clearProps: "y" });
  };
}


/**
 * Use cases: a scroll-triggered entrance that builds the section in reading
 * order, a pointer parallax on the overlay art, and an accordion whose height
 * is measured from the content so the copy can be any length.
 */
function useCasesMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-use-cases]");
  if (!section) return () => {};

  const header = section.querySelector<HTMLElement>("header");
  const title = section.querySelector<HTMLElement>("[data-use-cases-title]");
  const sub = header?.querySelector<HTMLElement>("p:last-child") ?? null;
  const badge = header?.querySelector<HTMLElement>("p") ?? null;
  const items = gsap.utils.toArray<HTMLElement>("[data-use-cases-item]", section);
  const icons = gsap.utils.toArray<SVGElement>("[data-uc-icon]", section);
  const art = section.querySelector<HTMLElement>("[data-use-cases-art]");
  const photo = section.querySelector<HTMLElement>("[data-uc-photo]");
  const flow = section.querySelector<HTMLElement>("[data-uc-parallax]");
  const triggers = gsap.utils.toArray<HTMLButtonElement>(
    "[data-use-cases-trigger]",
    section,
  );
  const panels = gsap.utils.toArray<HTMLElement>("[data-use-cases-panel]", section);

  const cleanups: Array<() => void> = [];
  let split: SplitText | null = null;
  let intro: gsap.core.Timeline | null = null;
  let loop: gsap.core.Tween | null = null;

  const setPanel = (panel: HTMLElement, open: boolean, immediate: boolean) => {
    const height = panel.scrollHeight;
    gsap.killTweensOf(panel);
    if (immediate || paused) {
      gsap.set(panel, { height: open ? height : 0 });
      return;
    }
    gsap.to(panel, {
      height: open ? height : 0,
      duration: open ? 0.55 : 0.32,
      ease: open ? EASE : "power2.inOut",
    });
  };

  const openPanel = (index: number) => {
    triggers.forEach((trigger, i) => {
      const isOpen = i === index;
      trigger.setAttribute("aria-expanded", String(isOpen));
      if (panels[i]) setPanel(panels[i], isOpen, false);
    });
  };

  triggers.forEach((trigger, index) => {
    if (panels[index]) setPanel(panels[index], index === 0, true);

    const onClick = () => openPanel(index);
    trigger.addEventListener("click", onClick);
    cleanups.push(() => trigger.removeEventListener("click", onClick));
  });

  const onResize = () => {
    triggers.forEach((trigger, i) => {
      if (trigger.getAttribute("aria-expanded") === "true" && panels[i]) {
        setPanel(panels[i], true, true);
      }
    });
  };
  window.addEventListener("resize", onResize);
  cleanups.push(() => window.removeEventListener("resize", onResize));

  if (paused) return () => cleanups.forEach((fn) => fn());

  // Pointer parallax on the overlay art, mirrored from the Why section so the
  // two sections share one interaction language.
  if (art && flow) {
    const flowTo = {
      x: gsap.quickTo(flow, "x", { duration: 0.8, ease: "power3" }),
      y: gsap.quickTo(flow, "y", { duration: 0.8, ease: "power3" }),
    };
    const photoTo = photo
      ? {
          x: gsap.quickTo(photo, "x", { duration: 1, ease: "power3" }),
          y: gsap.quickTo(photo, "y", { duration: 1, ease: "power3" }),
        }
      : null;

    const onMove = (e: PointerEvent) => {
      const r = art.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      flowTo.x(-px * 14);
      flowTo.y(-py * 10);
      photoTo?.x(-px * 5);
      photoTo?.y(-py * 4);
    };
    const onLeave = () => {
      flowTo.x(0);
      flowTo.y(0);
      photoTo?.x(0);
      photoTo?.y(0);
    };

    art.addEventListener("pointermove", onMove);
    art.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      art.removeEventListener("pointermove", onMove);
      art.removeEventListener("pointerleave", onLeave);
      gsap.set([flow, photo].filter(Boolean) as HTMLElement[], {
        clearProps: "x,y",
      });
    });
  }

  // Entrance: build the section in reading order once it scrolls in.
  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.9;
  if (!belowFold) return () => cleanups.forEach((fn) => fn());

  const run = () => {
    if (title) {
      split = SplitText.create(title, { type: "lines", linesClass: "uc-line" });
    }

    gsap.set(badge, { autoAlpha: 0, y: -12 });
    gsap.set(split ? split.lines : title, { autoAlpha: 0, yPercent: 110 });
    if (sub) gsap.set(sub, { autoAlpha: 0, y: 16 });
    gsap.set(icons, { autoAlpha: 0, scale: 0.5, rotate: -18 });
    gsap.set(art, { autoAlpha: 0, y: 36 });
    gsap.set(flow, { autoAlpha: 0, y: 18 });

    intro = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    intro
      .to(badge, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
      .to(split ? split.lines : title, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.08 }, 0.1)
      .to(sub, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.32)
      .to(art, { autoAlpha: 1, y: 0, duration: 1 }, 0.25)
      .to(flow, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.5)
      .to(
        icons,
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.6,
          stagger: 0.09,
          ease: "back.out(2)",
        },
        0.4,
      )
      .to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0.42);

    // Slow drift on the overlay keeps the art alive once it has landed.
    if (flow) {
      loop = gsap.to(flow, {
        y: "-=8",
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.6,
      });
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    intro?.scrollTrigger?.kill();
    intro?.kill();
    loop?.kill();
    split?.revert();
    gsap.set(
      [badge, sub, art, flow, ...items, ...icons].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
    cleanups.forEach((fn) => fn());
  };
}
