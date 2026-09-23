(function () {
  "use strict";
  var CDN_BASE = "https://cdn.jsdelivr.net/npm/drawably@0.4.2";
  var sketches = [];
  var modulePromise = null;
  var HOST_CLASSES = [
    "drawably-host",
    "drawably-button",
    "drawably-button--outline",
    "drawably-card",
    "drawably-inputbox"
  ];

  function loadModule() {
    if (!modulePromise) {
      modulePromise = import(CDN_BASE + "/dist/index.js");
    }
    return modulePromise;
  }

  function isDraft() {
    return document.documentElement.getAttribute("data-theme") === "draft";
  }

  function attachable(el) {
    return !el.dataset.drawablyAttached && el.offsetWidth > 0 && el.offsetHeight > 0;
  }

  function withClasses(el, classNames) {
    classNames.forEach(function (className) {
      el.classList.add(className);
    });
  }

  function isFirstCluster(cluster) {
    var sibling = cluster.previousElementSibling;
    while (sibling) {
      if (sibling.classList.contains("skills-cluster")) return false;
      sibling = sibling.previousElementSibling;
    }
    return true;
  }

  function wrapVaultInput() {
    var input = document.querySelector("[data-vault-input]");
    if (!input) return null;
    var wrap = input.closest(".draft-field");
    if (wrap) return wrap;
    wrap = document.createElement("span");
    wrap.className = "draft-field";
    wrap.style.display = "block";
    wrap.style.flex = "1 1 auto";
    wrap.style.minWidth = "0";
    wrap.style.fontFamily = "var(--font-data)";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    return wrap;
  }

  function unwrapVaultInput() {
    var wrap = document.querySelector(".draft-field");
    if (!wrap) return;
    var input = wrap.querySelector("[data-vault-input]");
    if (input) wrap.parentNode.insertBefore(input, wrap);
    wrap.remove();
  }

  function attachButton(drawably, el) {
    withClasses(el, ["drawably-button", "drawably-button--outline"]);
    sketches.push(drawably.drawablyButton(el));
  }

  function attachCard(drawably, el, opts) {
    withClasses(el, ["drawably-card"]);
    sketches.push(drawably.drawablyCard(el, opts));
  }

  function apply() {
    Promise.all([loadModule(), document.fonts.ready]).then(function (results) {
      var drawably = results[0];
      if (!isDraft()) return;

      document.querySelectorAll(".vault__submit, .theme-switcher__trigger")
        .forEach(function (el) {
          if (!attachable(el)) return;
          el.dataset.drawablyAttached = "true";
          attachButton(drawably, el);
        });

      document.querySelectorAll(".project-link, .project-chip")
        .forEach(function (el) {
          if (!attachable(el)) return;
          el.dataset.drawablyAttached = "true";
          attachCard(drawably, el);
        });

      document.querySelectorAll(".skills-tag")
        .forEach(function (el) {
          if (!attachable(el)) return;
          el.dataset.drawablyAttached = "true";
          attachCard(drawably, el, { stroke: "var(--text-primary)", width: 1 });
        });

      document.querySelectorAll(".skills-cluster").forEach(function (cluster) {
        if (isFirstCluster(cluster)) return;
        if (cluster.previousElementSibling && cluster.previousElementSibling.classList.contains("draft-divider")) return;
        if (cluster.offsetWidth === 0) return;
        var divider = document.createElement("hr");
        divider.className = "draft-divider";
        cluster.parentNode.insertBefore(divider, cluster);
        withClasses(divider, ["drawably-divider"]);
        sketches.push(drawably.drawablyDivider(divider, { seed: 2899602929, roughness: 0.1, boil: 1, width: 1, stroke: "#18181b" }));
      });

      var inputWrap = wrapVaultInput();
      if (inputWrap && attachable(inputWrap)) {
        inputWrap.dataset.drawablyAttached = "true";
        withClasses(inputWrap, ["drawably-inputbox"]);
        sketches.push(drawably.drawablyInput(inputWrap));
      }

    });
  }

  function teardown() {
    sketches.forEach(function (sketch) {
      sketch.destroy();
    });
    sketches = [];
    document.querySelectorAll("[data-drawably-attached]").forEach(function (el) {
      delete el.dataset.drawablyAttached;
      el.classList.remove.apply(el.classList, HOST_CLASSES);
    });
    document.querySelectorAll(".draft-divider").forEach(function (el) {
      el.remove();
    });
    unwrapVaultInput();
  }

  document.addEventListener("themechange", function (event) {
    if (event.detail.theme === "draft") {
      apply();
    } else if (sketches.length || document.querySelector(".draft-field")) {
      teardown();
    }
  });

  document.addEventListener("contentreveal", function () {
    if (isDraft()) apply();
  });

  function init() {
    if (isDraft()) apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
