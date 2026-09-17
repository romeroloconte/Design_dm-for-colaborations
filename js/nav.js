(function () {
  // La altura de .site-nav es variable: en mobile apila los enlaces y crece o
  // decrece segun exista el enlace "Back". Publicamos la altura real en
  // --nav-height para que el layout reserve exactamente el espacio necesario.
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

  // El switcher se inyecta por JS y las webfonts cambian la altura de linea:
  // remedimos cuando ambos terminan.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(publish).catch(function () {});
  }
  window.addEventListener("load", publish);
})();
