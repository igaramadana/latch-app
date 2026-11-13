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
    loginIntro(paused),
    signupIntro(paused),
    navIntro(paused),
    navHover(paused),
    heroIntro(paused),
    platformHeroIntro(paused),
    solutionsHeroIntro(paused),
    pricingHeroIntro(paused),
    comparePlansIntro(paused),
    faqSectionMotion(paused),
    testimonialIntro(paused),
    resourcesHeroIntro(paused),
    careersHeroIntro(paused),
    careersPerksIntro(paused),
    careersProcessStory(paused),
    careersRolesIntro(paused),
    blogGridIntro(paused),
    solutionsOverviewIntro(paused),
    solutionsFeaturesIntro(paused),
    solutionsUseCaseIntro(paused),
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

function solutionsUseCaseIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-sol-usecase]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-su-badge]");
  const title = section.querySelector<HTMLElement>("[data-su-title]");
  const sub = section.querySelector<HTMLElement>("[data-su-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-su-card]", section);
  const icons = gsap.utils.toArray<HTMLElement>("[data-su-icon]", section);
  const links = gsap.utils.toArray<HTMLElement>("[data-su-link]", section);

  if (!title || !cards.length) return () => {};

  const header = [badge, title, sub].filter(Boolean) as HTMLElement[];

  // Same guard as the sibling sections: never hide what is already on screen.
  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.75;

  gsap.set(header, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 22 });
  gsap.set(cards, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 28 });
  gsap.set(icons, { scale: onScreen ? 1 : 0.85 });

  const parts = [...header, ...cards, ...icons];

  if (onScreen) {
    const intro = gsap.timeline({ defaults: { ease: EASE } });

    intro.from(cards, { y: 16, duration: 0.7, stagger: 0.07 }, 0.05)
      .from(icons, { scale: 0.85, duration: 0.5, stagger: 0.07, ease: "back.out(1.7)" }, 0.2);

    return () => {
      intro.kill();
      gsap.set(parts, { clearProps: "all" });
    };
  }

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  tl.to(header, { autoAlpha: 1, y: 0, stagger: 0.09 }, 0)
    // Six cards in reading order; a 0.07 stagger keeps the grid from pulsing.
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, 0.16)
    .to(icons, { scale: 1, duration: 0.6, stagger: 0.07, ease: "back.out(1.7)" }, 0.34);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set(parts, { clearProps: "all" });
  };
}

function solutionsFeaturesIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-sol-features]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-sf-badge]");
  const title = section.querySelector<HTMLElement>("[data-sf-title]");
  const sub = section.querySelector<HTMLElement>("[data-sf-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-sf-card]", section);
  const chips = gsap.utils.toArray<HTMLElement>("[data-sf-chip]", section);

  if (!title || !cards.length) return () => {};

  const header = [badge, title, sub].filter(Boolean) as HTMLElement[];

  // A reload while already scrolled here would flash the cards hidden first, so
  // this section plays in place when it is on screen at load.
  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.75;

  gsap.set(header, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 22 });
  gsap.set(cards, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 30 });

  if (onScreen) {
    const intro = gsap.timeline({ defaults: { ease: EASE } });

    intro
      .from(cards, { y: 16, duration: 0.7, stagger: 0.09 }, 0.06)
      .from(
        chips,
        { autoAlpha: 0, y: 10, scale: 0.96, duration: 0.45, stagger: 0.06, ease: "back.out(1.6)" },
        0.3,
      );

    return () => {
      intro.kill();
      gsap.set([...header, ...cards, ...chips], { clearProps: "all" });
    };
  }

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  tl.to(header, { autoAlpha: 1, y: 0, stagger: 0.09 }, 0)
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.12 }, 0.16)
    // Chips read as results appearing after the argument, so they land last.
    .from(
      chips,
      { autoAlpha: 0, y: 10, scale: 0.96, duration: 0.45, stagger: 0.06, ease: "back.out(1.6)" },
      0.5,
    );

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...header, ...cards, ...chips], { clearProps: "all" });
  };
}

function solutionsOverviewIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-sol-overview]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-so-badge]");
  const title = section.querySelector<HTMLElement>("[data-so-title]");
  const sub = section.querySelector<HTMLElement>("[data-so-sub]");
  const cards = gsap.utils.toArray<HTMLElement>("[data-so-card]", section);
  const icons = gsap.utils.toArray<HTMLElement>("[data-so-icon]", section);
  const copies = gsap.utils.toArray<HTMLElement>("[data-so-copy]", section);

  if (!title || !cards.length) return () => {};

  // On tall viewports the section is already on screen at load. Hiding it first
  // would flash, so it plays a short in-place reveal instead of scrolling in.
  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.75;

  const header = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(header, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 24 });
  gsap.set(cards, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 32 });
  gsap.set(icons, { scale: onScreen ? 1 : 0.82, rotate: onScreen ? 0 : -6 });
  gsap.set(copies, { autoAlpha: onScreen ? 1 : 0, y: onScreen ? 0 : 16 });

  if (onScreen) {
    const intro = gsap.timeline({ defaults: { ease: EASE } });

    intro
      .from(icons, { scale: 0.8, rotate: -6, duration: 0.7, stagger: 0.09, ease: "back.out(1.7)" }, 0.1)
      .from(copies, { autoAlpha: 0, y: 14, duration: 0.55, stagger: 0.09 }, 0.22)
      .from(cards, { y: 18, duration: 0.7, stagger: 0.08 }, 0);

    return () => {
      intro.kill();
      gsap.set([...header, ...cards, ...icons, ...copies], { clearProps: "all" });
    };
  }

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  tl.to(header, { autoAlpha: 1, y: 0, stagger: 0.09 }, 0)
    .to(cards, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.1 }, 0.18)
    .to(icons, { scale: 1, rotate: 0, duration: 0.7, stagger: 0.1, ease: "back.out(1.7)" }, 0.34)
    .to(copies, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.42);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...header, ...cards, ...icons, ...copies], { clearProps: "all" });
  };
}

function loginIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-login]");
  if (!section || paused) return () => {};

  const card = section.querySelector<HTMLElement>("[data-login-card]");
  const pattern = section.querySelector<HTMLElement>("[data-login-pattern]");
  const title = section.querySelector<HTMLElement>("[data-login-title]");
  const oauth = gsap.utils.toArray<HTMLElement>("[data-login-oauth]", section);
  const fields = gsap.utils.toArray<HTMLElement>("[data-login-field]", section);
  const submit = section.querySelector<HTMLElement>("[data-login-submit]");
  if (!card || !title) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "login-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.7 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    // The lattice drifts up as it fades in; the card lands on top of it.
    if (pattern) {
      tl.fromTo(
        pattern,
        { autoAlpha: 0, yPercent: 6 },
        { autoAlpha: 1, yPercent: 0, duration: 1.6, ease: "power2.out" },
        0,
      );
    }

    tl.fromTo(
      card,
      { autoAlpha: 0, y: 28, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
      0.08,
    )
      .fromTo(split.lines, { yPercent: 115, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power4.out" }, 0.3)
      .fromTo(oauth, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.42)
      .fromTo(fields, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.56);

    if (submit) {
      tl.fromTo(
        submit,
        { autoAlpha: 0, y: 12, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)" },
        0.72,
      );
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    split?.revert();
    gsap.set([pattern, card, ...oauth, ...fields, submit].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function signupIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-signup]");
  if (!section || paused) return () => {};

  const card = section.querySelector<HTMLElement>("[data-signup-card]");
  const title = section.querySelector<HTMLElement>("[data-signup-title]");
  const heading = section.querySelector<HTMLElement>("[data-signup-heading]");
  const art = section.querySelector<HTMLElement>("[data-signup-art]");
  const bar = section.querySelector<HTMLElement>("[data-signup-bar]");
  const quote = section.querySelector<HTMLElement>("[data-signup-quote]");
  const brands = section.querySelector<HTMLElement>("[data-signup-brands]");
  const tiles = gsap.utils.toArray<HTMLElement>("[data-signup-tile]", section);
  const perks = gsap.utils.toArray<HTMLElement>("[data-signup-perk]", section);
  // Step 2 ships hidden, so only the first panel is in flow at load.
  const fields = gsap.utils.toArray<HTMLElement>("[data-signup-step=\"1\"] [data-signup-field]", section);
  const buttons = gsap.utils.toArray<HTMLElement>("[data-signup-next],[data-signup-submit]", section);
  if (!card || !title) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let float: gsap.core.Tween | null = null;
  let stepTween: gsap.core.Tween | null = null;

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "signup-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.7 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    if (tiles.length) {
      tl.fromTo(tiles, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 0.5, scale: 1, duration: 1.4, stagger: 0.09, ease: "power2.out" }, 0);
      // The two reference opacities differ; the 0.8 tile is the one scoring the illustration.
      if (tiles[0]) tl.set(tiles[0], { autoAlpha: 0.8 }, 1.4);
    }

    tl.fromTo(
      card,
      { autoAlpha: 0, y: 26, scale: 0.99 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: "power3.out" },
      0.05,
    )
      .fromTo(split.lines, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.85, ease: "power4.out" }, 0.2)
      .fromTo(perks, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.07 }, 0.34);

    if (heading) tl.fromTo(heading, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.3);

    if (art) {
      tl.fromTo(art, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0.46);
      float = gsap.to(art, { y: -8, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.5 });
    }

    if (bar) tl.fromTo(bar, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.4);
    tl.fromTo(fields, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.48);
    tl.fromTo(buttons, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.66);

    if (quote) tl.fromTo(quote, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.6);
    if (brands) tl.fromTo(brands, { autoAlpha: 0 }, { autoAlpha: 0.3, duration: 0.8 }, 0.7);
  };

  // The component swaps steps with classes; the entrance is animated here so
  // both halves of the form arrive with the same motion.
  const onStep = () => {
    // Both panels keep their `flex` class, so display is the only signal for
    // which one is on screen.
    const active = gsap
      .utils.toArray<HTMLElement>("[data-signup-step]", section)
      .find((step) => getComputedStyle(step).display !== "none");
    if (!active) return;
    stepTween?.kill();
    stepTween = gsap.fromTo(
      active,
      { autoAlpha: 0, x: 16 },
      { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out" },
    );
  };
  section.addEventListener("signup:step", onStep);

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    section.removeEventListener("signup:step", onStep);
    tl?.kill();
    float?.kill();
    stepTween?.kill();
    split?.revert();
    gsap.set(
      [card, art, bar, quote, brands, ...tiles, ...perks, ...fields, ...buttons].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
  };
}

function pricingHeroIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-pricing-hero]");
  if (!section) return () => {};

  const eyebrow = section.querySelector<HTMLElement>("[data-pr-eyebrow]");
  const title = section.querySelector<HTMLElement>("[data-pr-title]");
  const sub = section.querySelector<HTMLElement>("[data-pr-sub]");
  const toggle = section.querySelector<HTMLElement>("[data-pr-toggle]");
  const pattern = section.querySelector<HTMLElement>("[data-pr-pattern]");
  const heads = gsap.utils.toArray<HTMLElement>("[data-pr-head]", section);
  const arts = gsap.utils.toArray<HTMLElement>("[data-pr-art]", section);
  const rows = gsap.utils.toArray<HTMLElement>("[data-pr-feature]", section);
  const ctas = gsap.utils.toArray<HTMLElement>("[data-pr-cta]", section);

  if (!title || paused) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let float: gsap.core.Tween | null = null;

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "pr-line" });

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
      tl.fromTo(eyebrow, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.55 }, 0.1);
    }

    tl.fromTo(
      split.lines,
      { yPercent: 115, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power4.out" },
      0.2,
    );

    if (sub) tl.fromTo(sub, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.44);
    if (toggle) tl.fromTo(toggle, { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0 }, 0.5);

    // Cards rise in reading order, then their artwork settles.
    tl.fromTo(heads, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.1 }, 0.5)
      .fromTo(
        arts,
        { autoAlpha: 0, scale: 0.9, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
        0.66,
      )
      .fromTo(
        rows,
        { autoAlpha: 0, x: -10 },
        { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.03 },
        0.72,
      )
      .fromTo(
        ctas,
        { autoAlpha: 0, y: 12, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.09, ease: "back.out(1.6)" },
        0.9,
      );

    if (arts.length) {
      float = gsap.to(arts, {
        y: -6,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4,
        delay: 2.2,
      });
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    float?.kill();
    split?.revert();
    gsap.set(
      [eyebrow, sub, toggle, pattern, ...heads, ...arts, ...rows, ...ctas].filter(Boolean) as HTMLElement[],
      { clearProps: "all" },
    );
  };
}

function solutionsHeroIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-sol-hero]");
  if (!section) return () => {};

  const eyebrow = section.querySelector<HTMLElement>("[data-sol-eyebrow]");
  const heading = section.querySelector<HTMLElement>("[data-sol-title]");
  const copy = section.querySelector<HTMLElement>("[data-sol-copy]");
  const ctas = gsap.utils.toArray<HTMLElement>("[data-sol-cta]", section);
  const art = section.querySelector<HTMLElement>("[data-sol-art]");

  if (!heading || paused) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let float: gsap.core.Tween | null = null;

  const run = () => {
    split = SplitText.create(heading, { type: "lines", linesClass: "sol-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.85 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    if (eyebrow) {
      tl.fromTo(
        eyebrow,
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: 0.55 },
        0.1,
      );
    }

    tl.fromTo(
      split.lines,
      { yPercent: 115, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1.05, stagger: 0.11, ease: "power4.out" },
      0.22,
    );

    if (copy) {
      tl.fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.5);
    }

    if (ctas.length) {
      tl.fromTo(
        ctas,
        { autoAlpha: 0, y: 16, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.09, ease: "back.out(1.6)" },
        0.6,
      );
    }

    if (art) {
      tl.fromTo(
        art,
        { autoAlpha: 0, yPercent: 5, scale: 0.97 },
        { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.3, ease: "power3.out" },
        0.55,
      );

      float = gsap.to(art, {
        y: -8,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2.1,
      });
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    float?.kill();
    split?.revert();
    gsap.set([eyebrow, copy, art, ...ctas].filter(Boolean), { clearProps: "all" });
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
    .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.75);

  if (!hidden.length) return () => {};

  gsap.set(hidden, { autoAlpha: 0, y: 32 });

  const triggers = ScrollTrigger.batch(hidden, {
    start: "top 75%",
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

  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.75;
  if (onScreen) return () => {};

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];
  const arts = cards
    .map((card) => card.querySelector<HTMLElement>("img"))
    .filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 44 });
  gsap.set(arts, { scale: 0.94, transformOrigin: "50% 50%" });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(art, { autoAlpha: 0, scale: 0.97, transformOrigin: "50% 50%" });
  gsap.set(items, { autoAlpha: 0, y: 20 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

function careersPerksIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-perks]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-perks-badge]");
  const title = section.querySelector<HTMLElement>("[data-perks-title]");
  const sub = section.querySelector<HTMLElement>("[data-perks-sub]");
  const card = section.querySelector<HTMLElement>("[data-perks-card]");
  const cells = gsap.utils.toArray<HTMLElement>("[data-perks-cell]", section);
  const bar = section.querySelector<HTMLElement>("[data-perks-bar]");
  const avatars = gsap.utils.toArray<HTMLElement>("[data-perks-avatar]", section);
  if (!title || !cells.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(card, { autoAlpha: 0, y: 32 });
  gsap.set(cells, { autoAlpha: 0, y: 20 });
  gsap.set([bar, ...avatars].filter(Boolean) as HTMLElement[], { autoAlpha: 0, y: 12 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  tl.to(parts, { autoAlpha: 1, y: 0, stagger: 0.1 })
    .to(card, { autoAlpha: 1, y: 0, duration: 0.9 }, "-=0.45")
    .to(cells, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, "-=0.6")
    .to(bar, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35")
    .to(avatars, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, "-=0.35");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...parts, card, ...cells, bar, ...avatars].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function careersProcessStory(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-process]");
  if (!section) return () => {};

  const track = section.querySelector<HTMLElement>("[data-process-track]");
  const badge = section.querySelector<HTMLElement>("[data-process-badge]");
  const title = section.querySelector<HTMLElement>("[data-process-title]");
  const sub = section.querySelector<HTMLElement>("[data-process-sub]");
  const lineFill = section.querySelector<HTMLElement>("[data-process-line-fill]");
  const list = section.querySelector<HTMLElement>("[data-process-list]");
  const fade = section.querySelector<HTMLElement>("[data-process-fade]");
  const steps = gsap.utils.toArray<HTMLElement>("[data-process-step]", section);

  const nodes = steps.map((step) => step.querySelector<HTMLElement>("[data-process-node]"));
  const icons = steps.map((step) => step.querySelector<HTMLElement>("[data-process-icon-active]"));

  if (!track || !steps.length || !lineFill) return () => {};

  const ACTIVE = "#5E71FF";
  const IDLE = "#E3E8EF";
  const FUTURE_BLUR = [0, 0.25, 0.6, 1.2];
  const n = steps.length;
  let active = 0;

  const placeLine = () => {
    const segment = lineSegmentUpTo(active);
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

  // Progressive completion: every step up to `last` is lit. Scroll unlocks
  // them one by one, so the bottom of the track shows them all active.
  const paintUpTo = (last: number, duration: number) => {
    const ease = "power2.out";

    steps.forEach((step, index) => {
      const reached = index <= last;
      const ahead = index - last;
      const depth = Math.min(Math.abs(ahead), FUTURE_BLUR.length - 1);
      const blur = ahead > 0 ? FUTURE_BLUR[depth] : 0;

      gsap.to(step, { opacity: 1, filter: `blur(${blur}px)`, duration, ease, overwrite: "auto" });
      gsap.to(nodes[index], {
        backgroundColor: reached ? ACTIVE : IDLE,
        duration,
        ease,
        overwrite: "auto",
      });
      gsap.to(icons[index], { opacity: reached ? 1 : 0, duration, overwrite: "auto" });
    });

    const segment = lineSegmentUpTo(last);
    gsap.to(lineFill, {
      top: segment.top,
      height: segment.height,
      duration: duration * 1.3,
      ease: "power3.inOut",
      overwrite: "auto",
    });

    if (fade) {
      gsap.to(fade, {
        "--process-fade": fadeFor(Math.min(last, n - 1)),
        duration,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
  };

  // Fill from the top of the line through the last reached node.
  const lineSegmentUpTo = (last: number) => {
    const line = lineFill.parentElement;
    if (!line || !nodes.length) return { top: 0, height: 0 };
    const box = line.getBoundingClientRect();
    const node = nodes[Math.min(Math.max(last, 0), n - 1)];
    if (!node) return { top: 0, height: 0 };
    const nb = node.getBoundingClientRect();
    return { top: 0, height: Math.max(0, nb.bottom - box.top) };
  };

  // Step one is the resting state of the design, so paint it before any
  // ScrollTrigger exists: a deep link or a killed timeline still looks right.
  gsap.set(nodes[0], { backgroundColor: ACTIVE });
  gsap.set(icons[0], { opacity: 1 });
  placeLine();
  gsap.set(lineFill, { height: 0 });

  if (paused) {
    // No tween will ever run here, so place the gradient by hand or it would
    // fall back to a value that washes the active description.
    fade?.style.setProperty("--process-fade", String(fadeFor(0)));
    return () => {};
  }

  ScrollTrigger.addEventListener("refresh", placeLine);

  const header = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  header
    .from(badge, { autoAlpha: 0, y: 16 }, 0)
    .from(title, { autoAlpha: 0, y: 24 }, 0.08)
    .from(sub, { autoAlpha: 0, y: 20 }, 0.16);

  const mm = gsap.matchMedia();

  // The stage is sticky, not pinned: the track behind it is five viewports, so
  // every step owns exactly one viewport of scrolling. Matches the media query
  // in HowItWorksSteps.astro, including the 1080px height floor: below it the
  // fr rows squash the design's 190 / 198 / 194 gaps.
  mm.add("(min-width: 1025px) and (min-height: 1080px)", () => {
    // One step lit at rest; scrolling unlocks the rest cumulatively, so the
    // bottom of the track shows every number active. The step trigger is a
    // plain onUpdate (no scrub) so it fires on every scroll event; the fill
    // line below scrubs through its own tween.
    paintUpTo(0, 0);

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const last = Math.min(n - 1, Math.max(0, Math.round(self.progress * (n - 1))));
        if (last === active) return;
        active = last;
        paintUpTo(last, 0);
      },
    });

    const fillTween = gsap.fromTo(
      lineFill,
      { height: 0 },
      {
        height: () => lineSegmentUpTo(n - 1).height,
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      },
    );

    return () => {
      trigger.kill();
      fillTween.scrollTrigger?.kill();
      fillTween.kill();
    };
  });

  // No sticky stage here, so the steps scroll past the viewport centre and the
  // one crossing it becomes active.
  mm.add("(max-width: 1024px), (min-width: 1025px) and (max-height: 1079px)", () => {
    paintUpTo(0, 0);

    const focus = (index: number) => {
      if (index === active) return;
      active = index;
      paintUpTo(index, 0.6);
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

function careersRolesIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-roles]");
  if (!section || paused) return () => {};

  const badge = section.querySelector<HTMLElement>("[data-roles-badge]");
  const title = section.querySelector<HTMLElement>("[data-roles-title]");
  const sub = section.querySelector<HTMLElement>("[data-roles-sub]");
  const groups = gsap.utils.toArray<HTMLElement>("[data-roles-group]", section);
  const rows = gsap.utils.toArray<HTMLElement>("[data-roles-row]", section);
  const footer = section.querySelector<HTMLElement>("[data-roles-footer]");
  const cta = section.querySelector<HTMLElement>("[data-roles-cta]");
  if (!title || !rows.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const header = [badge, title, sub].filter(Boolean) as HTMLElement[];
  const reveal = [...groups, ...rows, footer, cta].filter(Boolean) as HTMLElement[];

  gsap.set(header, { autoAlpha: 0, y: 24 });
  gsap.set(groups, { autoAlpha: 0, y: 16 });
  gsap.set(rows, { autoAlpha: 0, y: 14 });
  gsap.set([footer, cta].filter(Boolean) as HTMLElement[], { autoAlpha: 0, y: 12 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  tl.to(header, { autoAlpha: 1, y: 0, stagger: 0.1 })
    .to(groups, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.4")
    // Rows follow their own group, so the two categories read one after another
    // instead of lighting up as a single block.
    .to(rows, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.06 }, "-=0.75")
    .to([footer, cta].filter(Boolean) as HTMLElement[], { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, "-=0.3");

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...header, ...reveal], { clearProps: "all" });
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
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 28 });
  gsap.set(bar, { autoAlpha: 0, y: 16 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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
  const FUTURE_BLUR = [0, 0.25, 0.6, 1.2];
  const n = steps.length;
  let active = 0;

  const placeLine = () => {
    const segment = lineSegmentUpTo(active);
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

  // Progressive completion: every step up to `last` is lit. Scroll unlocks
  // them one by one, so the bottom of the track shows them all active.
  const paintUpTo = (last: number, duration: number) => {
    const ease = "power2.out";

    steps.forEach((step, index) => {
      const reached = index <= last;
      const ahead = index - last;
      const depth = Math.min(Math.abs(ahead), FUTURE_BLUR.length - 1);
      const blur = ahead > 0 ? FUTURE_BLUR[depth] : 0;

      gsap.to(step, { opacity: 1, filter: `blur(${blur}px)`, duration, ease, overwrite: "auto" });
      gsap.to(nodes[index], {
        backgroundColor: reached ? ACTIVE : IDLE,
        duration,
        ease,
        overwrite: "auto",
      });
      gsap.to(icons[index], { opacity: reached ? 1 : 0, duration, overwrite: "auto" });
    });

    const segment = lineSegmentUpTo(last);
    gsap.to(lineFill, {
      top: segment.top,
      height: segment.height,
      duration: duration * 1.3,
      ease: "power3.inOut",
      overwrite: "auto",
    });

    if (fade) {
      gsap.to(fade, {
        "--hiw-fade": fadeFor(Math.min(last, n - 1)),
        duration,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
  };

  // Fill from the top of the line through the last reached node.
  const lineSegmentUpTo = (last: number) => {
    const line = lineFill.parentElement;
    if (!line || !nodes.length) return { top: 0, height: 0 };
    const box = line.getBoundingClientRect();
    const node = nodes[Math.min(Math.max(last, 0), n - 1)];
    if (!node) return { top: 0, height: 0 };
    const nb = node.getBoundingClientRect();
    return { top: 0, height: Math.max(0, nb.bottom - box.top) };
  };

  // Step one is the resting state of the design, so paint it before any
  // ScrollTrigger exists: a deep link or a killed timeline still looks right.
  gsap.set(nodes[0], { backgroundColor: ACTIVE });
  gsap.set(icons[0], { opacity: 1 });
  placeLine();
  gsap.set(lineFill, { height: 0 });

  if (paused) {
    // No tween will ever run here, so place the gradient by hand or it would
    // fall back to a value that washes the active description.
    fade?.style.setProperty("--hiw-fade", String(fadeFor(0)));
    return () => {};
  }

  ScrollTrigger.addEventListener("refresh", placeLine);

  const header = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
  });

  header
    .from(badge, { autoAlpha: 0, y: 16 }, 0)
    .from(title, { autoAlpha: 0, y: 24 }, 0.08)
    .from(sub, { autoAlpha: 0, y: 20 }, 0.16);

  const mm = gsap.matchMedia();

  // The stage is sticky, not pinned: the track behind it is five viewports, so
  // every step owns exactly one viewport of scrolling. Matches the media query
  // in HowItWorksSteps.astro, including the 1080px height floor: below it the
  // fr rows squash the design's 190 / 198 / 194 gaps.
  mm.add("(min-width: 1025px) and (min-height: 1080px)", () => {
    // One step lit at rest; scrolling unlocks the rest cumulatively, so the
    // bottom of the track shows every number active. The step trigger is a
    // plain onUpdate (no scrub) so it fires on every scroll event; the fill
    // line below scrubs through its own tween.
    paintUpTo(0, 0);

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const last = Math.min(n - 1, Math.max(0, Math.round(self.progress * (n - 1))));
        if (last === active) return;
        active = last;
        paintUpTo(last, 0);
      },
    });

    const fillTween = gsap.fromTo(
      lineFill,
      { height: 0 },
      {
        height: () => lineSegmentUpTo(n - 1).height,
        ease: "none",
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      },
    );

    return () => {
      trigger.kill();
      fillTween.scrollTrigger?.kill();
      fillTween.kill();
    };
  });

  // No sticky stage here, so the steps scroll past the viewport centre and the
  // one crossing it becomes active.
  mm.add("(max-width: 1024px), (min-width: 1025px) and (max-height: 1079px)", () => {
    paintUpTo(0, 0);

    const focus = (index: number) => {
      if (index === active) return;
      active = index;
      paintUpTo(index, 0.6);
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
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  const parts = [badge, title, sub].filter(Boolean) as HTMLElement[];

  gsap.set(parts, { autoAlpha: 0, y: 24 });
  gsap.set(cards, { autoAlpha: 0, y: 40 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) {
    return () => {};
  }

  gsap.set(copy, { autoAlpha: 0, y: 24 });
  gsap.set(art, { autoAlpha: 0, y: 32 });
  if (diagram) gsap.set(diagram, { autoAlpha: 0, scale: 0.94 });
  if (halftone) gsap.set(halftone, { autoAlpha: 0 });
  if (glow) gsap.set(glow, { autoAlpha: 0, scale: 0.85 });

  const tl = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.75;
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
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.75;
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
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.75;
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
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

  const belowFold = section.getBoundingClientRect().top > window.innerHeight * 0.75;
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
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
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

function comparePlansIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-compare-plans]");
  if (!section) return () => {};

  const title = section.querySelector<HTMLElement>("[data-cp-title]");
  const sub = section.querySelector<HTMLElement>("[data-cp-sub]");
  const layers = gsap.utils.toArray<HTMLElement>("[data-cp-art-layer]", section);
  const rows = gsap.utils.toArray<HTMLTableRowElement>("[data-cp-row]", section);
  const hints = gsap.utils.toArray<HTMLElement>("[data-cp-hint-panel]", section);
  const strip = section.querySelector<HTMLElement>("[data-cp-scroll]");

  if (!title || paused) return () => {};

  let split: SplitText | null = null;
  let drift: gsap.core.Tween | null = null;

  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.85;
  if (onScreen) return () => {};

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "cp-line" });

    const tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
      onComplete: () => {
        // Restoring the unsplit heading keeps the text reflowable on resize.
        split?.revert();
        split = null;
      },
    });

    tl.fromTo(
      split.lines,
      { yPercent: 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power4.out" },
      0,
    )
      .fromTo(sub, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.24)
      .fromTo(
        layers,
        { autoAlpha: 0, y: 18, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.09, ease: "power2.out" },
        0.18,
      )
      .fromTo(
        rows,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.055 },
        0.4,
      );

    // Idle drift, started only once the entrance has settled.
    if (layers.length) {
      drift = gsap.to(layers, {
        y: (index) => (index === layers.length - 1 ? -8 : -4),
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.35,
      });
    }
  };

  // Core parallax on the illustration, scrubbed rather than looped so it stops
  // costing frames when the section is off screen.
  const artTween =
    layers.length
      ? gsap.fromTo(
          layers,
          { yPercent: 4 },
          {
            yPercent: -4,
            ease: "none",
            scrollTrigger: { trigger: layers[0], start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        )
      : null;

  const cleanups: Array<() => void> = [];

  // Only a table that actually overflows should be reachable by Tab; otherwise
  // the container becomes a dead tab stop on wide screens.
  if (strip) {
    const sync = () => {
      const scrollable = strip.scrollWidth > strip.clientWidth + 1;
      if (scrollable) strip.setAttribute("tabindex", "0");
      else strip.removeAttribute("tabindex");
      strip.classList.toggle("cp-has-overflow", scrollable);
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(strip);
    const onResize = () => sync();
    window.addEventListener("resize", onResize);

    cleanups.push(() => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    });
  }

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    split?.revert();
    drift?.kill();
    artTween?.scrollTrigger?.kill();
    artTween?.kill();
    cleanups.forEach((fn) => fn());
    gsap.set([sub, ...layers, ...rows, ...hints].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function testimonialIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-testimonial]");
  if (!section || paused) return () => {};

  const text = section.querySelector<HTMLElement>("[data-tst-text]");
  const author = section.querySelector<HTMLElement>("[data-tst-author]");
  const avatar = section.querySelector<HTMLElement>(".tst-avatar");
  const stats = gsap.utils.toArray<HTMLElement>("[data-tst-stat]", section);
  if (!text || !stats.length) return () => {};

  // Already on screen at load: leave it alone rather than flashing a hidden state.
  if (section.getBoundingClientRect().top <= window.innerHeight * 0.75) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;

  const run = () => {
    split = SplitText.create(text, { type: "lines", linesClass: "tst-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    // The quote reads first, then the attribution settles, then the proof points.
    tl.fromTo(
      split.lines,
      { yPercent: 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.95, stagger: 0.09, ease: "power4.out" },
      0,
    )
      .fromTo(avatar, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)" }, 0.42)
      .fromTo(author, { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.6 }, 0.46)
      .fromTo(
        stats,
        { autoAlpha: 0, y: 22 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1 },
        0.56,
      );
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.scrollTrigger?.kill();
    tl?.kill();
    split?.revert();
    gsap.set([text, author, avatar, ...stats].filter(Boolean) as HTMLElement[], { clearProps: "all" });
  };
}

function faqSectionMotion(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-faq]");
  if (!section) return () => {};

  const intro = section.querySelector<HTMLElement>("[data-faq-intro]");
  const badge = section.querySelector<HTMLElement>("[data-faq-badge]");
  const title = section.querySelector<HTMLElement>("[data-faq-title]");
  const sub = section.querySelector<HTMLElement>("[data-faq-sub]");
  const art = section.querySelector<HTMLElement>("[data-faq-art]");
  const items = gsap.utils.toArray<HTMLElement>("[data-faq-item]", section);
  const triggers = gsap.utils.toArray<HTMLButtonElement>("[data-faq-trigger]", section);
  const panels = gsap.utils.toArray<HTMLElement>("[data-faq-panel]", section);

  if (!triggers.length || !panels.length) return () => {};

  const reduced = reducedMotion();
  // Reveal animation is skipped when the section is already on screen, but the
  // accordion must stay interactive either way.
  const onScreen = section.getBoundingClientRect().top <= window.innerHeight * 0.75;

  let tl: gsap.core.Timeline | null = null;
  let split: SplitText | null = null;
  let drift: gsap.core.Tween | null = null;

  // Height animation is owned by GSAP; `hidden` is cleared so the panel keeps a
  // measurable height, and aria-expanded stays the single source of truth.
  const initialOpen = triggers.map((trigger) => trigger.getAttribute("aria-expanded") === "true");

  const setOpen = (index: number, open: boolean, animate = true) => {
    const trigger = triggers[index];
    const panel = panels[index];
    const others = triggers.findIndex((t) => t !== trigger && t.getAttribute("aria-expanded") === "true");

    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = false;

    const duration = animate && !reduced ? 0.32 : 0;
    gsap.to(panel, {
      height: open ? "auto" : 0,
      autoAlpha: open ? 1 : 0,
      duration,
      ease: "power2.inOut",
      overwrite: true,
      onComplete: () => {
        if (!open) panel.hidden = true;
      },
    });

    // Single-open accordion: close whichever other item is expanded.
    if (open && others > -1) setOpen(others, false, animate);
  };

  panels.forEach((panel, index) => {
    panel.hidden = false;
    gsap.set(panel, { height: initialOpen[index] ? "auto" : 0, autoAlpha: initialOpen[index] ? 1 : 0 });
    if (!initialOpen[index]) panel.hidden = true;
  });

  const cleanups: Array<() => void> = [];

  triggers.forEach((trigger, index) => {
    const onClick = () => {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      setOpen(index, open);
    };
    trigger.addEventListener("click", onClick);
    cleanups.push(() => trigger.removeEventListener("click", onClick));
  });

  if (paused) {
    return () => cleanups.forEach((fn) => fn());
  }

  if (!onScreen) {
    const run = () => {
      split = SplitText.create(title, { type: "lines", linesClass: "faq-line" });

      tl = gsap.timeline({
        defaults: { ease: EASE, duration: 0.8 },
        scrollTrigger: { trigger: section, start: "top 75%", once: true },
        onComplete: () => {
          split?.revert();
          split = null;
        },
      });

      tl.fromTo(
        split.lines,
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: "power4.out" },
        0,
      )
        .fromTo(badge, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
        .fromTo(sub, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.24)
        .fromTo(
          items,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 },
          0.3,
        );

      if (art) {
        tl.fromTo(
          art,
          { autoAlpha: 0, y: 24, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" },
          0.36,
        );
      }
    };

    if (document.fonts.status === "loaded") run();
    else document.fonts.ready.then(run);
  }

  if (art && !reduced) {
    drift = gsap.to(art, {
      y: -6,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.4,
    });
  }

  return () => {
    cleanups.forEach((fn) => fn());
    tl?.scrollTrigger?.kill();
    tl?.kill();
    drift?.kill();
    split?.revert();
    gsap.set([intro, badge, sub, art, ...items, ...panels].filter(Boolean) as HTMLElement[], {
      clearProps: "all",
    });
  };
}

function resourcesHeroIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-res-hero]");
  if (!section || paused) return () => {};

  const eyebrow = section.querySelector<HTMLElement>("[data-res-eyebrow]");
  const title = section.querySelector<HTMLElement>("[data-res-title]");
  const search = section.querySelector<HTMLElement>("[data-res-search]");
  if (!title) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "res-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.8 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    tl.fromTo(eyebrow, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0)
      .fromTo(
        split.lines,
        { yPercent: 115, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power4.out" },
        0.12,
      )
      .fromTo(
        search,
        { autoAlpha: 0, y: 18, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
        0.44,
      );
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    split?.revert();
    gsap.set([eyebrow, title, search].filter(Boolean) as HTMLElement[], { clearProps: "all" });
  };
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

function blogGridIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-res-blog]");
  if (!section) return () => {};

  const tabs = gsap.utils.toArray<HTMLElement>("[data-blog-tab]", section);
  const cards = gsap.utils.toArray<HTMLElement>("[data-blog-card]", section);
  const pager = section.querySelector<HTMLElement>("[data-blog-pager]");

  if (paused || !cards.length) return () => {};

  // Only cards below the fold animate; anything already on screen at load
  // would flash from invisible to visible for no reason.
  const fold = window.innerHeight * 0.85;
  const hidden = cards.filter((card) => card.getBoundingClientRect().top > fold);

  let timeline: gsap.core.Timeline | null = null;
  let pagerTween: gsap.core.Tween | null = null;

  // immediateRender: false keeps every card painted until the trigger fires,
  // so a filter click can never land on an element stuck at opacity 0.
  timeline = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 80%", once: true },
    defaults: { ease: EASE, duration: 0.6 },
  });

  // immediateRender: false keeps every card painted until the trigger fires,
  // so a filter click can never land on an element stuck at opacity 0.
  timeline
    .fromTo(
      tabs,
      { autoAlpha: 0, y: -8 },
      { autoAlpha: 1, y: 0, stagger: 0.03, immediateRender: false },
      0,
    )
    .fromTo(
      hidden,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, stagger: 0.06, immediateRender: false },
      0.08,
    );

  if (pager) {
    pagerTween = gsap.fromTo(
      pager,
      { autoAlpha: 0, y: 12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        ease: EASE,
        immediateRender: false,
        scrollTrigger: { trigger: pager, start: "top 92%", once: true },
      },
    );
  }

  return () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    pagerTween?.scrollTrigger?.kill();
    pagerTween?.kill();
    gsap.set([...tabs, ...cards, pager].filter(Boolean) as HTMLElement[], { clearProps: "all" });
  };
}

function careersHeroIntro(paused: boolean): () => void {
  const section = document.querySelector<HTMLElement>("[data-car-hero]");
  if (!section || paused) return () => {};

  const title = section.querySelector<HTMLElement>("[data-car-title]");
  const copy = section.querySelector<HTMLElement>("[data-car-copy]");
  const cta = section.querySelector<HTMLElement>("[data-car-cta]");
  const art = section.querySelector<HTMLElement>("[data-car-art]");
  const dots = section.querySelector<HTMLElement>("[data-car-dots]");
  if (!title) return () => {};

  let split: SplitText | null = null;
  let tl: gsap.core.Timeline | null = null;
  let float: gsap.core.Tween | null = null;

  const run = () => {
    split = SplitText.create(title, { type: "lines", linesClass: "car-line" });

    tl = gsap.timeline({
      defaults: { ease: EASE, duration: 0.85 },
      onComplete: () => {
        split?.revert();
        split = null;
      },
    });

    tl.fromTo(
      split.lines,
      { yPercent: 115, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1.05, stagger: 0.11, ease: "power4.out" },
      0.1,
    );

    if (copy) tl.fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0.42);

    if (cta) {
      tl.fromTo(
        cta,
        { autoAlpha: 0, y: 16, scale: 0.94 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
        0.56,
      );
    }

    if (dots) {
      tl.fromTo(dots, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 }, 0.5);
    }

    if (art) {
      tl.fromTo(
        art,
        { autoAlpha: 0, yPercent: 6, scale: 0.97 },
        { autoAlpha: 1, yPercent: 0, scale: 1, duration: 1.25, ease: "power3.out" },
        0.5,
      );

      float = gsap.to(art, {
        y: -10,
        duration: 6.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }
  };

  if (document.fonts.status === "loaded") run();
  else document.fonts.ready.then(run);

  return () => {
    tl?.kill();
    float?.kill();
    split?.revert();
    gsap.set([title, copy, cta, art, dots].filter(Boolean) as HTMLElement[], { clearProps: "all" });
  };
}
