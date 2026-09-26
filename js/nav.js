(function () {
  var nav = document.querySelector(".site-nav");
  if (!nav) return;

  var root = document.documentElement;
  var last = -1;

  function publish() {
    var h = Math.round(nav.getBoundingClientRect().height);
    if (h === last) return;
    last = h;
    root.style.setProperty("--nav-height", h + "px");
  }

  publish();

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(publish).observe(nav);
  } else {
    window.addEventListener("resize", publish);
  }

  window.addEventListener("orientationchange", publish);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(publish).catch(function () {});
  }
  window.addEventListener("load", publish);

  var toggle = nav.querySelector(".site-nav__toggle");
  var panel = nav.querySelector(".site-nav__links");
  if (!toggle || !panel) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isOpen = false;

  function panelLinks() {
    return Array.from(panel.querySelectorAll(".site-nav__link"));
  }

  function focusable() {
    return [toggle].concat(panelLinks());
  }

  function open() {
    isOpen = true;
    toggle.setAttribute("aria-expanded", "true");
    panel.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var links = panelLinks();
    if (reduced.matches || typeof gsap === "undefined") {
      if (links[0]) links[0].focus();
      return;
    }
    gsap.set(links, { opacity: 0, y: 16 });
    gsap.to(links, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.06,
      ease: "power2.out",
      onComplete: function () {
        gsap.set(links, { clearProps: "opacity,transform" });
        if (links[0]) links[0].focus();
      }
    });
  }

  function close(returnFocus) {
    isOpen = false;
    toggle.setAttribute("aria-expanded", "false");
    panel.classList.remove("is-open");
    document.body.style.overflow = "";
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", function () {
    if (isOpen) close(true);
    else open();
  });

  panel.addEventListener("click", function (event) {
    if (event.target.closest(".site-nav__link")) close(false);
  });

  document.addEventListener("keydown", function (event) {
    if (!isOpen) return;
    if (event.key === "Escape") {
      close(true);
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusable();
    var first = items[0];
    var lastItem = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (isOpen && window.innerWidth > 768) close(false);
  });
})();
