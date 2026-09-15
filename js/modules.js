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

  function scrollTo(target, smooth) {
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
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
