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
    overviewIntro(paused),
    capabilitiesIntro(paused),
    keyBenefitsIntro(paused),
    howItWorksStepsMotion(paused),
    whoWeServeIntro(paused),
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

function capabilitiesIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-capabilities]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-cap-badge]");
  const title = section.querySelector<HTMLElement>("[data-cap-title]");
  const sub = section.querySelector<HTMLElement>("[data-cap-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-cap-card]", section);
  if (!title || !cards.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.9) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];
  const arts = cards
    .map((card) => card.querySelector<HTMLElement>("img"))
    .filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 44 });
  gsap.set(arts, { scale: 0.94, transformOrigin: "50% 50%" });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 })
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.14 }, "-=0.45")
    .to(arts, { scale: 1, duration: 1.1, stagger: 0.14, ease: "power2.out" }, "<0.1");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...parts, ...cards, ...arts], { clearProps: "all" });
  };
}

function keyBenefitsIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-key-benefits]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-kb-badge]");
  const title = section.querySelector<HTMLElement>("[data-kb-title]");
  const sub = section.querySelector<HTMLElement>("[data-kb-sub]");
  const art = section.querySelector<HTMLElement>("[data-kb-art]");
  const items = gsap.utils.toArray<HTMLElement>("[data-kb-item]", section);
  if (!title || !items.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.9) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(art, { autoAlpha: 0, scale: 0.97, transformOrigin: "50% 50%" });
  gsap.set(items, { autoAlpha: 0, y: 20 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 })
    .to(art, { autoAlpha: 1, scale: 1, duration: 1, ease: "power3.out" }, "-=0.5")
    .to(items, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, "-=0.7");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...parts, art, ...items].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function whoWeServeIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-who-we-serve]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-wws-badge]");
  const title = section.querySelector<HTMLElement>("[data-wws-title]");
  const sub = section.querySelector<HTMLElement>("[data-wws-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-wws-card]", section);
  const bar = section.querySelector<HTMLElement>("[data-wws-bar]");
  const pattern = section.querySelector<HTMLElement>("[data-wws-pattern]");
  if (!title || !cards.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.9) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 28 });
  gsap.set(bar, { autoAlpha: 0, y: 16 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  if (pattern) {
    tl.fromTo(pattern, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2 }, 0);
  }
  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 }, 0.1)
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, "-=0.5")
    .to(bar, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.45");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...parts, ...cards, bar, pattern].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function howItWorksStepsMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-hiw]");
  if (!section) return () => {};

  const track = section.querySelector<HTMLElement>("[data-hiw-track]");
  const badge = section.querySelector<HTMLElement>("[data-hiw-badge]");
  const title = section.querySelector<HTMLElement>("[data-hiw-title]");
  const sub = section.querySelector<HTMLElement>("[data-hiw-sub]");
  const lineFill = section.querySelector<HTMLElement>("[data-hiw-line-fill]");
  const list = section.querySelector<HTMLElement>("[data-hiw-list]");
  const fade = section.querySelector<HTMLElement>("[data-hiw-fade]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-hiw-step]", section);

  const nodes = steps.map((step) => step.querySelector<HTMLElement>("[data-hiw-node]"));
  const icons = steps.map((step) => step.querySelector<HTMLElement>("[data-hiw-icon-active]"));

  if (!track || !steps.length || !lineFill) return () => {};

  const ACTIVE = "#5E71FF";
  const IDLE = "#E3E8EF";
  const PAST = 0.8;
  // Ahead-of-active steps are washed by the white gradient, so they keep full
  // opacity and only gain the blur the design draws on them.
  const FUTURE_BLUR = [0, 0.25, 0.6, 1.2];
  const n = steps.length;
  let active = 0;

  // The blue segment runs from the active circle to the next one; everything
  // above it is already walked and stays grey. Measured from the circles, not
  // from thirds, because Figma's gaps are 190 / 198 / 194.
  const lineSegment = (index: number) => {
    const line = lineFill.parentElement;
    if (!line || !nodes.length) return { top: 0, height: 0 };

    const box = line.getBoundingClientRect();
    const centers = nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2 - box.top;
    });
    const last = centers.length - 1;

    // On the last step there is no "next" to point at, and the connector above
    // it belongs to a step that is already done: collapse the segment.
    if (index >= last) return { top: centers[last], height: 0 };
    return { top: centers[index], height: centers[index + 1] - centers[index] };
  };

  const placeLine = () => {
    const segment = lineSegment(active);
    gsap.set(lineFill, { top: segment.top, height: segment.height });
  };

  // Where the white gradient starts: at the bottom of the active block (node
  // plus copy, not the node alone), so the description being read is never
  // washed. Measuring the node instead cut into it by 20-44px.
  const fadeFor = (index: number) => {
    if (!list || !nodes[index]) return 16;
    const box = list.getBoundingClientRect();
    if (!box.height) return 16;
    // The whole active block, not just its node: the fade must never wash the
    // description the reader is on.
    const block = steps[index].getBoundingClientRect();
    return Math.min(100, ((block.bottom - box.top) / box.height) * 100);
  };

  const paint = (active: number, duration: number) => {
    const ease = "power2.out";

    steps.forEach((step, index) => {
      const ahead = index - active;
      const depth = Math.min(Math.abs(ahead), FUTURE_BLUR.length - 1);
      const opacity = ahead === 0 ? 1 : ahead < 0 ? PAST : 1;
      const blur = ahead > 0 ? FUTURE_BLUR[depth] : 0;

      gsap.to(step, { opacity, filter: `blur(${blur}px)`, duration, ease, overwrite: "auto" });
      gsap.to(nodes[index], {
        backgroundColor: ahead === 0 ? ACTIVE : IDLE,
        duration,
        ease,
        overwrite: "auto",
      });
      gsap.to(icons[index], { opacity: ahead === 0 ? 1 : 0, duration, overwrite: "auto" });
    });

    const segment = lineSegment(active);
    gsap.to(lineFill, {
      top: segment.top,
      height: segment.height,
      duration: duration * 1.3,
      ease: "power3.inOut",
      overwrite: "auto",
    });

    if (fade) {
      gsap.to(fade, {
        "--hiw-fade": fadeFor(active),
        duration,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
  };

  // Step one is the resting state of the design, so paint it before any
  // ScrollTrigger exists: a deep link or a killed timeline still looks right.
  gsap.set(nodes[0], { backgroundColor: ACTIVE });
  gsap.set(icons[0], { opacity: 1 });
  placeLine();

  if (paused) {
    // No tween will ever run here, so place the gradient by hand or it would
    // fall back to a value that washes the active description.
    fade?.style.setProperty("--hiw-fade", String(fadeFor(0)));
    return () => {};
  }

  ScrollTrigger.addEventListener("refresh", placeLine);

  const header = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 78%", once: true },
  });

  header
    .from(badge, { autoAlpha: 0, y: 16 }, 0)
    .from(title, { autoAlpha: 0, y: 24 }, 0.08)
    .from(sub, { autoAlpha: 0, y: 20 }, 0.16);

  const mm = gsap.matchMedia();

  // The stage is sticky, not pinned: the track behind it is five viewports, so
  // every step owns exactly one viewport of scrolling. Matches the media query
  // in HowItWorksSteps.astro.
  mm.add("(min-width: 1025px) and (min-height: 740px)", () => {
    paint(0, 0);

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const next = Math.min(n - 1, Math.floor(self.progress * n));
        if (next === active) return;
        active = next;
        paint(next, 0.7);
      },
      onLeaveBack: () => {
        if (active === 0) return;
        active = 0;
        paint(0, 0.7);
      },
    });

    return () => trigger.kill();
  });

  // No sticky stage here, so the steps scroll past the viewport centre and the
  // one crossing it becomes active.
  mm.add("(max-width: 1024px), (min-width: 1025px) and (max-height: 739px)", () => {
    paint(0, 0);

    const focus = (index: number) => {
      if (index === active) return;
      active = index;
      paint(index, 0.6);
    };

    const triggers = steps.map((step, index) =>
      ScrollTrigger.create({
        trigger: step,
        start: "top center",
        end: "bottom center",
        onEnter: () => focus(index),
        onEnterBack: () => focus(index),
      }),
    );

    return () => triggers.forEach((trigger) => trigger.kill());
  });

  return () => {
    ScrollTrigger.removeEventListener("refresh", placeLine);
    mm.revert();
    header.scrollTrigger?.kill();
    header.kill();
    gsap.set(
      [badge, title, sub, lineFill, fade, ...steps, ...nodes, ...icons].filter(
        Boolean,
      ) as HTMLElement[],
      { clearProps: "all" },
    );
  };
}

function overviewIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-overview]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-ov-badge]");
  const title = section.querySelector<HTMLElement>("[data-ov-title]");
  const sub = section.querySelector<HTMLElement>("[data-ov-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-ov-card]", section);
  if (!title || !cards.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.9) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
  });

  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 }).to(
    cards,
    { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 },
    "-=0.45",
  );

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
