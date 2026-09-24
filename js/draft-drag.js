(function () {
  "use strict";

  var SLOT_SELECTOR = ".draft-kit__slot";
  var MEDIA_QUERY = "(min-width: 800px)";
  var DRAG_CLASS = "draft-kit__slot--draggable";
  var ACTIVE_CLASS = "draft-kit__slot--dragging";
  var STYLE_ID = "draft-drag-style";
  var THRESHOLD = 4;

  var active = false;
  var mq = window.matchMedia(MEDIA_QUERY);
  var boundSlots = [];

  function isDraft() {
    return document.documentElement.getAttribute("data-theme") === "draft";
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent =
      "." + DRAG_CLASS + "{cursor:grab;}" +
      "." + ACTIVE_CLASS + "{cursor:grabbing !important;z-index:9999 !important;user-select:none;-webkit-user-select:none;touch-action:none;}" +
      "." + ACTIVE_CLASS + " *{cursor:grabbing !important;user-select:none;-webkit-user-select:none;pointer-events:none;}";
    document.head.appendChild(style);
  }

  function computedBaseTransform(el) {
    var t = window.getComputedStyle(el).transform;
    return (!t || t === "none") ? "" : t;
  }

  function applyTransform(el, tx, ty) {
    var base = el.__dragBase || "";
    el.style.transform = "translate(" + tx + "px," + ty + "px)" + (base ? " " + base : "");
  }

  function onPointerDown(e) {
    if (!isDraft() || !mq.matches) return;
    if (e.button !== undefined && e.button !== 0) return;

    var slot = e.currentTarget;

    if (slot.__dragBase === undefined) {
      slot.__dragBase = computedBaseTransform(slot);
    }

    slot.__startX = e.clientX;
    slot.__startY = e.clientY;
    slot.__dragTx = slot.__dragTx || 0;
    slot.__dragTy = slot.__dragTy || 0;
    slot.__baseTx = slot.__dragTx;
    slot.__baseTy = slot.__dragTy;
    slot.__pointerId = e.pointerId;
    slot.__dragging = false;

    slot.addEventListener("pointermove", onPointerMove);
    slot.addEventListener("pointerup", onPointerUp);
    slot.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(e) {
    var slot = e.currentTarget;
    var dx = e.clientX - slot.__startX;
    var dy = e.clientY - slot.__startY;

    if (!slot.__dragging) {
      if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
      slot.__dragging = true;
      slot.classList.add(ACTIVE_CLASS);
      try { slot.setPointerCapture(slot.__pointerId); } catch (err) {  }
    }

    slot.__dragTx = slot.__baseTx + dx;
    slot.__dragTy = slot.__baseTy + dy;
    applyTransform(slot, slot.__dragTx, slot.__dragTy);
    e.preventDefault();
  }

  function onPointerUp(e) {
    var slot = e.currentTarget;
    if (slot.__dragging) {
      slot.classList.remove(ACTIVE_CLASS);
      try { slot.releasePointerCapture(slot.__pointerId); } catch (err) {  }
    }
    slot.__dragging = false;
    slot.removeEventListener("pointermove", onPointerMove);
    slot.removeEventListener("pointerup", onPointerUp);
    slot.removeEventListener("pointercancel", onPointerUp);
  }

  function enable() {
    if (active) return;
    if (!isDraft() || !mq.matches) return;

    injectStyle();

    var slots = document.querySelectorAll(SLOT_SELECTOR);
    Array.prototype.forEach.call(slots, function (slot) {
      slot.classList.add(DRAG_CLASS);
      slot.addEventListener("pointerdown", onPointerDown);
      boundSlots.push(slot);
    });

    active = true;
  }

  function disable() {
    if (!active) return;

    boundSlots.forEach(function (slot) {
      slot.removeEventListener("pointerdown", onPointerDown);
      slot.removeEventListener("pointermove", onPointerMove);
      slot.removeEventListener("pointerup", onPointerUp);
      slot.removeEventListener("pointercancel", onPointerUp);
      slot.classList.remove(DRAG_CLASS);
      slot.classList.remove(ACTIVE_CLASS);
      slot.style.transform = "";
      delete slot.__dragBase;
      slot.__dragTx = 0;
      slot.__dragTy = 0;
      slot.__dragging = false;
    });

    boundSlots = [];
    active = false;
  }

  document.addEventListener("themechange", function (e) {
    if (e.detail && e.detail.theme === "draft") {
      enable();
    } else {
      disable();
    }
  });

  if (mq.addEventListener) {
    mq.addEventListener("change", function () {
      if (!mq.matches) disable();
      else if (isDraft()) enable();
    });
  }

  function init() {
    if (isDraft()) enable();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
