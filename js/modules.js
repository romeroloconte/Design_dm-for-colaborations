(function () {
  const MODULE = "[data-module]";
  const TRIGGER = "[data-reveal]";
  const REVEAL_EVENT = "contentreveal";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function nextModule(trigger) {
    const current = trigger.closest(MODULE);
    if (!current) return null;
    let node = current.nextElementSibling;
    while (node && !node.matches(MODULE)) {
      node = node.nextElementSibling;
    }
    return node;
  }

  function announce(target) {
    document.dispatchEvent(new CustomEvent(REVEAL_EVENT, { detail: { target } }));
  }

  function focusHeading(target) {
    const heading = target.querySelector(".about-heading");
    if (!heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  function dismiss(trigger) {
    trigger.hidden = true;
    trigger.setAttribute("aria-expanded", "true");
  }

  function settle(target) {
    announce(target);
    focusHeading(target);
  }

  function place(target, smooth) {
    const nav = document.querySelector(".site-nav");
    const offset = nav ? nav.offsetHeight : 0;
    const pad = parseFloat(getComputedStyle(target).paddingTop) || 0;
    const breath = window.innerHeight * 0.06;
    const top = target.getBoundingClientRect().top + window.scrollY + pad - offset - breath;
    window.scrollTo({ top: Math.max(top, 0), behavior: smooth ? "smooth" : "auto" });
  }

  function scrollTo(target, smooth) {
    const images = Array.from(target.querySelectorAll("img")).filter((img) => !img.complete);
    if (!images.length) {
      place(target, smooth);
      return;
    }
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      place(target, smooth);
    };
    images.forEach((img) => {
      img.addEventListener("load", go, { once: true });
      img.addEventListener("error", go, { once: true });
    });
    window.setTimeout(go, 600);
  }

  function reveal(trigger) {
    const target = nextModule(trigger);
    if (!target) return;

    if (reduced.matches || typeof gsap === "undefined") {
      target.hidden = false;
      dismiss(trigger);
      scrollTo(target, false);
      settle(target);
      return;
    }

    const parts = Array.from(target.children);
    const icon = trigger.querySelector(".about-reveal__icon");

    gsap.timeline({
      onComplete: () => {
        gsap.set(parts, { clearProps: "opacity,transform" });
        settle(target);
      }
    })
      .to(trigger, { opacity: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, 0)
      .to(icon, { rotate: 45, duration: 0.2, ease: "power2.in" }, 0)
      .add(() => {
        dismiss(trigger);
        target.hidden = false;
        gsap.set(parts, { opacity: 0, y: 24 });
        scrollTo(target, true);
      }, 0.2)
      .to(parts, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
      }, 0.28);
  }

  function prune() {
    document.querySelectorAll(TRIGGER).forEach((trigger) => {
      const target = nextModule(trigger);
      trigger.hidden = !target;
      if (target && target.id) trigger.setAttribute("aria-controls", target.id);
    });
  }

  function init() {
    prune();
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest(TRIGGER);
      if (trigger) reveal(trigger);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
