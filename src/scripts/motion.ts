import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = "power3.out";

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const BAR_OFFSET = 5;

export function animateMenuToggle({
  toggle,
  menu,
  open,
  onClosed,
  skipPanel = false,
}: {
  toggle: HTMLButtonElement;
  menu: HTMLElement;
  open: boolean;
  onClosed?: () => void;
  /** Desktop keeps this element as the inline nav, so only reset the bars. */
  skipPanel?: boolean;
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
    if (!open) onClosed?.();
    return;
  }

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
    // Re-opening mid-exit: the close branch set pointer-events: none and its
    // onComplete (which would clear it) is killed by overwrite.
    gsap.set(menu, { pointerEvents: "auto" });
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
  } else if (skipPanel) {
    gsap.set(menu, { clearProps: "opacity,visibility,transform,pointerEvents" });
    gsap.set(items, { clearProps: "opacity,visibility,transform" });
    onClosed?.();
  } else {
    // The panel stays displayed until the tween lands: removing `is-open` first
    // would let `display: none` cut the exit animation off at frame zero.
    gsap.set(menu, { pointerEvents: "none" });
    gsap.to(items, {
      autoAlpha: 0,
      y: -6,
      duration: 0.16,
      stagger: { each: 0.025, from: "end" },
      ease: "power2.in",
      overwrite: true,
    });
    gsap.to(menu, {
      autoAlpha: 0,
      y: -10,
      duration: 0.26,
      delay: 0.05,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        gsap.set(menu, { clearProps: "opacity,visibility,transform,pointerEvents" });
        gsap.set(items, { clearProps: "opacity,visibility,transform" });
        onClosed?.();
      },
    });
  }
}

export function initMotion() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hidden tab / battery saver stops rAF, leaving from-tweens stuck mid-state.
  const paused = document.hidden || reduced;

  const teardowns = [
    navScrollState(),
    navIntro(paused),
    navHover(paused),
    heroIntro(paused),
    platformHeroIntro(paused),
    ctaHover(paused),
    scrollReveals(paused),
    howItWorksIntro(paused),
    whyItMattersIntro(paused),
    whyParallax(paused),
    useCasesMotion(paused),
    securityImpactMotion(paused),
    featuresMotion(paused),
    ctaSectionMotion(paused),
    footerMotion(paused),
    trustedMarquee(paused),
  ];

  return () => teardowns.forEach((fn) => fn());
}

function navScrollState(): () => void {
  const header = document.querySelector<HTMLElement>("[data-nav]");
  if (!header) return () => {};

  // Sticky + transparent would put ink text over the dark CTA panel and footer.
  const sync = () => header.toggleAttribute("data-scrolled", window.scrollY > 8);
  sync();
  window.addEventListener("scroll", sync, { passive: true });

  return () => {
    window.removeEventListener("scroll", sync);
    header.removeAttribute("data-scrolled");
  };
}

function navHover(paused: boolean): () => void {
  const links = gsap.utils.toArray<HTMLElement>("[data-nav-link]");
  if (!links.length || paused) return () => {};

  // Desktop only: below lg the same links live in the dropdown.
  const desktop = window.matchMedia("(min-width: 1025px)");
  const cleanups: Array<() => void> = [];

  const isActive = (link: HTMLElement) => link.getAttribute("aria-current") === "page";

  const settle = () => {
    links.forEach((link) => {
      if (isActive(link)) return;
      gsap.set(link.querySelector("[data-nav-label]"), { backgroundPositionX: "100%" });
    });
  };

  links.forEach((link) => {
    if (isActive(link)) return;

    const label = link.querySelector<HTMLElement>("[data-nav-label]");
    if (!label) return;

    // background-position, not a clipped overlay: the wash travels through the
    // glyphs themselves, so the colour change reads left to right.
    const sweep = (to: string, duration: number, ease: string) => {
      if (!desktop.matches) return;
      gsap.to(label, { backgroundPositionX: to, duration, ease, overwrite: true });
    };

    const onEnter = () => sweep("0%", 0.45, "power2.out");
    const onLeave = () => sweep("100%", 0.3, "power2.in");

    link.addEventListener("pointerenter", onEnter);
    link.addEventListener("pointerleave", onLeave);
    link.addEventListener("focus", onEnter);
    link.addEventListener("blur", onLeave);

    cleanups.push(() => {
      link.removeEventListener("pointerenter", onEnter);
      link.removeEventListener("pointerleave", onLeave);
      link.removeEventListener("focus", onEnter);
      link.removeEventListener("blur", onLeave);
      gsap.killTweensOf(label);
      gsap.set(label, { clearProps: "backgroundPositionX" });
    });
  });

  settle();
  desktop.addEventListener("change", settle);

  return () => {
    desktop.removeEventListener("change", settle);
    cleanups.forEach((fn) => fn());
  };
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

function platformHeroIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-platform-hero]");
  if (!section) return () => {};

  const eyebrow = section.querySelector<HTMLElement>("[data-ph-eyebrow]");
  const heading = section.querySelector<HTMLElement>("[data-ph-title]");
  const copy = section.querySelector<HTMLElement>("[data-ph-copy]");
  const ctas = gsap.utils.toArray<HTMLElement>("[data-ph-cta]", section);
  const art = section.querySelector<HTMLElement>("[data-ph-art]");
  const pattern = section.querySelector<HTMLElement>("[data-ph-pattern]");

  if (!heading || paused) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let float: gsap.core.Tween | null = null;

  const run = () => {
    split = SplitText.create(heading, { type: "lines", linesClass: "ph-line" });

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
        { autoAlpha: 0, yPercent: 4 },
        { autoAlpha: 1, yPercent: 0, duration: 1.4, ease: "power2.out" },
        0,
      );
    }

    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: 0.55 },
        0.15,
      );
    }

    tl.fromTo(
      split.lines,
      { yPercent: 115, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power4.out" },
      0.28,
    );

    if (copy) {
      tl.fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.52);
    }

    if (ctas.length) {
      tl.fromTo(
        ctas,
        { autoAlpha: 0, y: 16, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.09, ease: "back.out(1.6)" },
        0.64,
      );
    }

    if (art) {
      tl.fromTo(
        art,
        { autoAlpha: 0, yPercent: 6, scale: 0.975 },
        { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.2, ease: "power3.out" },
        0.5,
      );

      // The illustration keeps drifting once it lands, matching the hero on the
      // home page where the floating cards breathe on their own phase.
      float = gsap.to(art, {
        y: -10,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.9,
      });
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    float?.kill();
    split?.revert();
    gsap.set([eyebrow, copy, art, pattern, ...ctas].filter(Boolean), {
      clearProps: "all",
    });
  };
}

function trustedMarquee(paused: boolean): () => void {
  const track = document.querySelector<HTMLElement>("[data-marquee-track]");
  if (!track) return () => {};

  // Track holds the list twice; shifting by one list width loops seamlessly.
  const list = track.querySelector<HTMLElement>("ul");
  if (!list) return () => {};

  const distance = () => list.getBoundingClientRect().width + 32;

  if (paused) return () => {};

  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    duration: 30,
    repeat: -1,
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

  // overwrite: "auto" — the hero entrance animates scale on these same nodes.
  gsap.utils.toArray<HTMLElement>("[data-cta-scale]").forEach((el) => {
    const tween = { duration: 0.3, ease: "power3", overwrite: "auto" } as const;

    const onEnter = () => gsap.to(el, { ...tween, scale: 1.04 });
    const onLeave = () => gsap.to(el, { ...tween, scale: 1 });

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    cleanups.push(() => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "scale" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

function scrollReveals(paused: boolean): () => void {
  if (paused) return () => {};

  // Never hide content that is already on screen at load.
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

function securityImpactMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-impact]");
  if (!section) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-impact-badge]");
  const title = section.querySelector<HTMLElement>("[data-impact-title]");
  const art = section.querySelector<HTMLElement>("[data-impact-art]");
  const composition = section.querySelector<HTMLElement>("[data-impact-composition]");
  const compositionWrap = section.querySelector<HTMLElement>("[data-impact-composition-wrap]");
  const pattern = section.querySelector<HTMLElement>("[data-impact-pattern]");
  const stats = gsap.utils.toArray<HTMLElement>("[data-impact-stat]", section);
  const values = gsap.utils.toArray<HTMLElement>("[data-impact-value]", section);

  const cleanups: Array<() => void> = [];
  let intro: gsap.core.Timeline | null = null;
  let split: SplitText | null = null;

  // Same start/end on both ScrollTriggers keeps the layers in lockstep.
  const parallaxLayers: Array<{ el: HTMLElement | null; depth: number }> = [
    { el: pattern, depth: 26 },
    { el: compositionWrap, depth: 14 },
  ];

  const scrubTweens = parallaxLayers
    .filter((layer): layer is { el: HTMLElement; depth: number } => Boolean(layer.el))
    .map(({ el, depth }) =>
      gsap.fromTo(
        el,
        { y: depth },
        {
          y: -depth,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      ),
    );

  const killScrub = () => {
    scrubTweens.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
    gsap.set(
      parallaxLayers.map((layer) => layer.el).filter(Boolean) as HTMLElement[],
      { clearProps: "y" },
    );
  };

  if (paused) return killScrub;

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.9;
  if (!belowFold) return killScrub;

  const run = () => {
    if (title) {
      split = SplitText.create(title, { type: "lines", linesClass: "impact-line" });
    }

    gsap.set(badge, { autoAlpha: 0, y: -12 });
    gsap.set(split ? split.lines : title, { autoAlpha: 0, yPercent: 110 });
    gsap.set(art, { autoAlpha: 0, y: 32 });
    if (composition) gsap.set(composition, { autoAlpha: 0, scale: 0.96 });
    gsap.set(stats, { autoAlpha: 0, x: 28 });

    const counters = values.map((el) => {
      const to = Number(el.dataset.countTo ?? 0);
      const prefix = el.dataset.countPrefix ?? "";
      const suffix = el.dataset.countSuffix ?? "";
      const decimals = Number(el.dataset.countDecimals ?? 0);
      const state = { value: 0 };

      return gsap.to(state, {
        value: to,
        duration: 1.4,
        ease: "power2.out",
        paused: true,
        onUpdate: () => {
          el.textContent = `${prefix}${state.value.toFixed(decimals)}${suffix}`;
        },
      });
    });

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
      .to(split ? split.lines : title, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.08 }, 0.08)
      .to(art, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.2)
      .to(composition, { autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out" }, 0.35)
      .to(stats, { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.12 }, 0.4)
      .add(() => counters.forEach((tween) => tween.play()), 0.55);

    cleanups.push(() => counters.forEach((tween) => tween.kill()));
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    intro?.scrollTrigger?.kill();
    intro?.kill();
    killScrub();
    split?.revert();
    gsap.set(
      [badge, art, composition, ...stats].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
    values.forEach((el) => {
      el.textContent = el.dataset.countPrefix
        ? `${el.dataset.countPrefix}${Number(el.dataset.countTo).toFixed(Number(el.dataset.countDecimals ?? 0))}${el.dataset.countSuffix ?? ""}`
        : `${Number(el.dataset.countTo).toFixed(Number(el.dataset.countDecimals ?? 0))}${el.dataset.countSuffix ?? ""}`;
    });
    cleanups.forEach((fn) => fn());
  };
}

function featuresMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-features]");
  if (!section) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-features-badge]");
  const title = section.querySelector<HTMLElement>("[data-features-title]");
  const sub = section.querySelector<HTMLElement>("[data-features-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-feature-card]", section);
  const arts = gsap.utils.toArray<HTMLElement>("[data-feature-art]", section);

  let split: SplitText | null = null;
  let intro: gsap.core.Timeline | null = null;

  if (paused) return () => {};

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.9;
  if (!belowFold) return () => {};

  const run = () => {
    if (title) split = SplitText.create(title, { type: "lines", linesClass: "features-line" });

    gsap.set(badge, { autoAlpha: 0, y: -12 });
    gsap.set(split ? split.lines : title, { autoAlpha: 0, yPercent: 110 });
    gsap.set(sub, { autoAlpha: 0, y: 16 });
    gsap.set(cards, { autoAlpha: 0, y: 28 });
    gsap.set(arts, { autoAlpha: 0, scale: 0.96, transformOrigin: "50% 0%" });

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
      .to(sub, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.3)
      .to(cards, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09 }, 0.34)
      .to(arts, { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.09 }, 0.42);

  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    intro?.scrollTrigger?.kill();
    intro?.kill();
    split?.revert();
    gsap.set(
      [badge, sub, title, ...cards, ...arts].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
  };
}

function ctaSectionMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-cta]");
  if (!section) return () => {};

  const panel = section.querySelector<HTMLElement>("[data-cta-panel]");
  const title = section.querySelector<HTMLElement>("[data-cta-title]");
  const button = section.querySelector<HTMLElement>("[data-cta-button]");
  const glow = section.querySelector<HTMLElement>("[data-cta-glow]");
  const patterns = gsap.utils.toArray<HTMLElement>("[data-cta-pattern]", section);

  let split: SplitText | null = null;
  let intro: gsap.core.Timeline | null = null;
  const drifts: gsap.core.Tween[] = [];

  const teardown = () => {
    intro?.scrollTrigger?.kill();
    intro?.kill();
    drifts.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });
    split?.revert();
    gsap.set(
      [panel, title, button, glow, ...patterns].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
  };

  if (paused) return teardown;

  // ease: "none" keeps drift linear against scroll.
  patterns.forEach((tile, i) => {
    drifts.push(
      gsap.fromTo(
        tile,
        { yPercent: i === 0 ? -3 : 3 },
        {
          yPercent: i === 0 ? 3 : -3,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      ),
    );
  });

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.9;
  if (!belowFold) return teardown;

  const run = () => {
    if (title) {
      split = SplitText.create(title, { type: "lines", linesClass: "cta-line" });
    }

    gsap.set(panel, { autoAlpha: 0, y: 32 });
    gsap.set(split ? split.lines : title, { autoAlpha: 0, yPercent: 110 });
    gsap.set(button, { autoAlpha: 0, y: 14 });
    gsap.set(glow, { autoAlpha: 0 });

    intro = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      scrollTrigger: { trigger: section, start: "top 82%", once: true },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    intro
      .to(panel, { autoAlpha: 1, y: 0, duration: 0.9 }, 0)
      .to(
        split ? split.lines : title,
        { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.09 },
        0.18,
      )
      .to(button, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.46)
      .to(glow, { autoAlpha: 1, duration: 1.2 }, 0.1);
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return teardown;
}

function footerMotion(paused: boolean): () => void {
  const footer = document.querySelector<HTMLElement>("[data-footer]");
  if (!footer) return () => {};

  const brand = footer.querySelector<HTMLElement>("[data-footer-brand]");
  const columns = gsap.utils.toArray<HTMLElement>("[data-footer-col]", footer);
  const bar = footer.querySelector<HTMLElement>("[data-footer-bar]");

  if (paused) return () => {};

  const intro = gsap.timeline({
    defaults: { ease: EASE, duration: 0.7 },
    scrollTrigger: { trigger: footer, start: "top 92%", once: true },
  });

  intro
    .from(brand, { autoAlpha: 0, y: 24 }, 0)
    .from(columns, { autoAlpha: 0, y: 24, stagger: 0.07 }, 0.1)
    .from(bar, { autoAlpha: 0 }, 0.4);

  return () => {
    intro?.scrollTrigger?.kill();
    intro?.kill();
    gsap.set([brand, ...columns, bar].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}
