(function () {
  "use strict";
  var THEMES = [
    { id: "dark",  label: "Dark" },
    { id: "light", label: "Light" },
    { id: "brad",  label: "Brad" }
  ];
  var DEFAULT_THEME = "dark";
  var STORAGE_KEY = "rl-theme";
  function isValid(id) {
    return THEMES.some(function (t) { return t.id === id; });
  }
  function stored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  function persist(id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {  }
  }
  function current() {
    var attr = document.documentElement.getAttribute("data-theme");
    return isValid(attr) ? attr : DEFAULT_THEME;
  }
  function apply(id) {
    if (!isValid(id)) { id = DEFAULT_THEME; }
    document.documentElement.setAttribute("data-theme", id);
    persist(id);
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: id } }));
  }
  function build(host) {
    var active = current();
    host.classList.add("theme-switcher");
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "theme-switcher__trigger";
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Theme");
    var dot = document.createElement("span");
    dot.className = "theme-switcher__dot";
    dot.setAttribute("aria-hidden", "true");
    var label = document.createElement("span");
    label.className = "theme-switcher__label";
    var caret = document.createElement("span");
    caret.className = "theme-switcher__caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▼";
    trigger.append(dot, label, caret);
    var menu = document.createElement("ul");
    menu.className = "theme-switcher__menu";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    var options = THEMES.map(function (theme) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-switcher__option";
      btn.setAttribute("role", "menuitemradio");
      btn.dataset.themeId = theme.id;
      var dot = document.createElement("span");
      dot.className = "theme-switcher__dot";
      dot.setAttribute("aria-hidden", "true");
      var name = document.createElement("span");
      name.textContent = theme.label;
      btn.append(dot, name);
      btn.addEventListener("click", function () {
        apply(theme.id);
        sync();
        close();
        trigger.focus();
      });
      li.appendChild(btn);
      menu.appendChild(li);
      return btn;
    });
    host.append(trigger, menu);
    function sync() {
      var id = current();
      var match = THEMES.filter(function (t) { return t.id === id; })[0];
      label.textContent = match ? match.label : id;
      options.forEach(function (btn) {
        btn.setAttribute("aria-checked", String(btn.dataset.themeId === id));
      });
    }
    function open() {
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu.hidden) { open(); } else { close(); }
    });
    document.addEventListener("click", function (e) {
      if (!host.contains(e.target)) { close(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        close();
        trigger.focus();
      }
    });
    sync();
    host.hidden = false;
  }
  function init() {
    var initial = stored();
    document.documentElement.setAttribute(
      "data-theme",
      isValid(initial) ? initial : DEFAULT_THEME
    );
    var hosts = document.querySelectorAll("[data-theme-switcher]");
    Array.prototype.forEach.call(hosts, build);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
