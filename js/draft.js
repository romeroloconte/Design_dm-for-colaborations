(function () {
  "use strict";
  var CDN_BASE = "https://cdn.jsdelivr.net/npm/drawably@0.4.2";
  var sketches = [];
  var heroHighlightSketch = null;
  var heroUnderlineSketch = null;
  var heroCloudSketch = null;
  var heroArrowSketch = null;
  var modulePromise = null;
  var HOST_CLASSES = [
    "drawably-host",
    "drawably-button",
    "drawably-button--outline",
    "drawably-card",
    "drawably-inputbox",
    "drawably-checkbox",
    "drawably-radio",
    "drawably-toggle",
    "drawably-textarea",
    "drawably-select"
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

  function attachButton(drawably, el, opts) {
    opts = opts || {};
    var classes = ["drawably-button"];
    if (opts.variant !== "solid") classes.push("drawably-button--outline");
    withClasses(el, classes);
    sketches.push(drawably.drawablyButton(el, opts));
  }

  function attachCard(drawably, el, opts) {
    withClasses(el, ["drawably-card"]);
    sketches.push(drawably.drawablyCard(el, opts));
  }

  function attachInput(drawably, el, opts) {
    withClasses(el, ["drawably-inputbox"]);
    sketches.push(drawably.drawablyInput(el, opts));
  }

  function attachTextarea(drawably, el, opts) {
    withClasses(el, ["drawably-textarea"]);
    sketches.push(drawably.drawablyTextarea(el, opts));
  }

  function attachSelect(drawably, el, opts) {
    withClasses(el, ["drawably-select"]);
    sketches.push(drawably.drawablySelect(el, opts));
  }

  function attachCheckbox(drawably, el, opts) {
    withClasses(el, ["drawably-checkbox"]);
    sketches.push(drawably.drawablyCheckbox(el, opts));
  }

  function attachRadio(drawably, el, opts) {
    withClasses(el, ["drawably-radio"]);
    sketches.push(drawably.drawablyRadio(el, opts));
  }

  function attachToggle(drawably, el, opts) {
    withClasses(el, ["drawably-toggle"]);
    sketches.push(drawably.drawablyToggle(el, opts));
  }

  function draftKitButtonOpts(el) {
    if (el.classList.contains("draft-kit-btn--scribble")) {
      return {
        variant: "scribble",
        seed: 4084351956,
        roughness: 1.7,
        boil: 0.2,
        width: 2.5,
        stroke: "#c2410c"
      };
    }
    var opts = {};
    if (el.classList.contains("draft-kit-btn--solid")) opts.variant = "solid";
    if (el.classList.contains("draft-kit-btn--danger")) opts.stroke = "#c0392b";
    if (el.classList.contains("draft-kit-btn--success")) {
      opts.variant = "solid";
      opts.fill = "#1f7a45";
      opts.stroke = "#1f7a45";
    }
    return opts;
  }

  function applyDraftKit(drawably) {
    if (!document.querySelector(".draft-kit")) return;

    var jobs = [];

    collect(document, ".draft-kit-btn", jobs, function (el) {
      attachButton(drawably, el, draftKitButtonOpts(el));
    });

    collect(document, ".draft-kit-radio-wrap", jobs, function (el) {
      attachRadio(drawably, el);
    });

    collect(document, ".draft-kit-checkbox-wrap", jobs, function (el) {
      attachCheckbox(drawably, el);
    });

    collect(document, ".draft-kit-toggle-wrap", jobs, function (el) {
      attachToggle(drawably, el);
    });

    collect(document, ".draft-kit-input-wrap", jobs, function (el) {
      attachInput(drawably, el);
    });

    collect(document, ".draft-kit-textarea-wrap", jobs, function (el) {
      attachTextarea(drawably, el);
    });

    collect(document, ".draft-kit-select-wrap", jobs, function (el) {
      attachSelect(drawably, el);
    });

    collect(document, ".draft-kit-underline", jobs, function (el) {
      withClasses(el, ["drawably-divider"]);
      sketches.push(drawably.drawablyDivider(el, { width: 1 }));
    });

    collect(document, ".draft-kit-card-wrap", jobs, function (el) {
      attachCard(drawably, el);
    });

    flush(jobs);
  }

  function collect(root, selector, jobs, attach) {
    Array.prototype.forEach.call(root.querySelectorAll(selector), function (el) {
      if (attachable(el)) jobs.push([el, attach]);
    });
    if (root !== document && root.matches && root.matches(selector) && attachable(root)) {
      jobs.push([root, attach]);
    }
  }

  function flush(jobs) {
    jobs.forEach(function (job) {
      job[0].dataset.drawablyAttached = "true";
      job[1](job[0]);
    });
  }

  function apply(scope) {
    Promise.all([loadModule(), document.fonts.ready]).then(function (results) {
      var drawably = results[0];
      if (!isDraft()) return;

      var root = scope && scope.querySelectorAll ? scope : document;
      var jobs = [];
      var clusters = [];

      collect(root, ".vault__submit, .theme-switcher__trigger", jobs, function (el) {
        attachButton(drawably, el);
      });

      collect(root, ".project-link", jobs, function (el) {
        attachCard(drawably, el);
      });

      collect(root, ".project-chip", jobs, function (el) {
        attachCard(drawably, el, { stroke: "var(--text-primary)", width: 1, paper: "transparent" });
      });

      collect(root, ".skills-tag", jobs, function (el) {
        attachCard(drawably, el, { stroke: "var(--text-primary)", width: 1 });
      });

      Array.prototype.forEach.call(root.querySelectorAll(".skills-cluster"), function (cluster) {
        if (isFirstCluster(cluster)) return;
        if (cluster.previousElementSibling && cluster.previousElementSibling.classList.contains("draft-divider")) return;
        if (cluster.offsetWidth === 0) return;
        clusters.push(cluster);
      });

      flush(jobs);

      clusters.forEach(function (cluster) {
        var divider = document.createElement("hr");
        divider.className = "draft-divider";
        cluster.parentNode.insertBefore(divider, cluster);
        withClasses(divider, ["drawably-divider"]);
        sketches.push(drawably.drawablyDivider(divider, { seed: 2899602929, roughness: 0.1, boil: 1, width: 1, stroke: "#18181b" }));
      });

      var inputWrap = wrapVaultInput();
      if (inputWrap && attachable(inputWrap)) {
        inputWrap.dataset.drawablyAttached = "true";
        attachInput(drawably, inputWrap);
      }

      applyDraftKit(drawably);
      applyHeroHighlight(drawably);
      applyHeroUnderline(drawably);
      applyHeroCloud(drawably);
      applyHeroArrow(drawably);
    });
  }

  function applyHeroHighlight(drawably) {
    var el = document.querySelector(".draft-hero-highlight-wrap");
    if (heroHighlightSketch) {
      heroHighlightSketch.destroy();
      heroHighlightSketch = null;
    }
    if (!el || !isDraft() || el.offsetWidth === 0) return;
    heroHighlightSketch = drawably.drawablyCircle(el, { stroke: "#0f766e", fill: "#0f766e", roughness: 1.3, boil: 0.2, width: 3.5 });
  }

  function applyHeroUnderline(drawably) {
    var el = document.querySelector(".draft-hero-underline-wrap");
    if (heroUnderlineSketch) {
      heroUnderlineSketch.destroy();
      heroUnderlineSketch = null;
    }
    if (!el || !isDraft() || el.offsetWidth === 0) return;
    heroUnderlineSketch = drawably.drawablyUnderline(el, { stroke: "#6d4bd6", fill: "#6d4bd6", roughness: 0.8, boil: 0.2, width: 3.5 });
  }

  function applyHeroCloud(drawably) {
    var el = document.querySelector(".draft-hero-cloud-wrap");
    if (heroCloudSketch) {
      heroCloudSketch.destroy();
      heroCloudSketch = null;
    }
    if (!el || !isDraft() || el.offsetWidth === 0) return;
    heroCloudSketch = drawably.drawablyHighlight(el, { stroke: "#6442cf", fill: "#6442cf", roughness: 7, boil: 1.1, width: 1.5 });
  }

  function applyHeroArrow(drawably) {
    var from = document.querySelector(".draft-hero-arrow-from");
    var to = document.querySelector(".draft-hero-arrow-to");
    if (heroArrowSketch) {
      heroArrowSketch.destroy();
      heroArrowSketch = null;
    }
    if (!from || !to || !isDraft() || from.offsetWidth === 0) return;
    heroArrowSketch = drawably.drawablyArrow(from, to, { stroke: "#18181b", roughness: 1.7, boil: 0.2, width: 2.4 });
  }

  function teardown() {
    sketches.forEach(function (sketch) {
      sketch.destroy();
    });
    sketches = [];
    if (heroHighlightSketch) {
      heroHighlightSketch.destroy();
      heroHighlightSketch = null;
    }
    if (heroUnderlineSketch) {
      heroUnderlineSketch.destroy();
      heroUnderlineSketch = null;
    }
    if (heroCloudSketch) {
      heroCloudSketch.destroy();
      heroCloudSketch = null;
    }
    if (heroArrowSketch) {
      heroArrowSketch.destroy();
      heroArrowSketch = null;
    }
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

  document.addEventListener("contentreveal", function (event) {
    if (isDraft()) apply(event.detail && event.detail.target);
  });

  document.addEventListener("glitchrebuild", function () {
    if (!isDraft()) return;
    loadModule().then(function (drawably) {
      applyHeroHighlight(drawably);
      applyHeroUnderline(drawably);
      applyHeroCloud(drawably);
      applyHeroArrow(drawably);
    });
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
