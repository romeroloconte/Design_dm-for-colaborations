(function () {
  const DEVICE = "[data-device]";

  function bind(device) {
    const screen = device.querySelector(".about-device__screen");
    if (!screen) return;

    screen.addEventListener("scroll", () => {
      if (screen.scrollTop > 8) {
        device.setAttribute("data-scrolled", "");
      } else {
        device.removeAttribute("data-scrolled");
      }
    }, { passive: true });
  }

  function init() {
    document.querySelectorAll(DEVICE).forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
