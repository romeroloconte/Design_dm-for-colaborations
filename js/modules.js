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

  function settle(trigger, target) {
    trigger.hidden = true;
    trigger.setAttribute("aria-expanded", "true");
    announce(target);
    focusHeading(target);
  }

  function reveal(trigger) {
    const target = nextModule(trigger);
    if (!target) return;

    target.hidden = false;

    if (reduced.matches || typeof gsap === "undefined") {
      settle(trigger, target);
      target.scrollIntoView({ block: "start" });
      return;
    }

    gsap.set(target, { overflow: "hidden" });
    gsap.from(target, {
      height: 0,
      minHeight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      clearProps: "overflow,height,minHeight,paddingTop,paddingBottom,opacity",
      onComplete: () => {
        settle(trigger, target);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function prune() {
    document.querySelectorAll(TRIGGER).forEach((trigger) => {
      trigger.hidden = !nextModule(trigger);
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
