// Animated glitch favicon — Chromium/WebKit don't animate SVG/SMIL/GIF favicons
// natively, so this redraws the icon on a <canvas> and swaps link[rel="icon"].href
// on a schedule, replaying the same keyframes as resources/favicon.svg's SMIL.
(function () {
  var CYCLE_MS = 1900;
  var STAGGER_MS = 30; // X lags U, same as the per-char delay in js/gsap.js

  // Fractions of the 1.9s cycle + the color at each point (mirrors favicon.svg).
  var KEYTIMES = [
    0, 0.0105, 0.0316, 0.0421, 0.0684, 0.0789, 0.1, 0.1105, 0.1316, 0.1421,
    0.1632, 0.1737, 0.2632, 0.2737, 0.2947, 0.3053, 0.4105, 0.4211, 0.4421,
    0.4526, 0.4789, 0.4895, 0.5105, 0.5211, 0.6368, 0.6474, 0.6684, 0.6789,
    0.7526, 0.7632, 0.7842, 0.7947, 1
  ];
  var COLORS = [
    "#FFFFFF", "#85AF00", "#85AF00", "#FFFFFF", "#FFFFFF", "#FFCC00", "#FFCC00",
    "#FFFFFF", "#FFFFFF", "#FB9CFD", "#FB9CFD", "#FFFFFF", "#FFFFFF", "#A19BFF",
    "#A19BFF", "#FFFFFF", "#FFFFFF", "#FF4C00", "#FF4C00", "#FFFFFF", "#FFFFFF",
    "#85AF00", "#85AF00", "#FFFFFF", "#FFFFFF", "#FFCC00", "#FFCC00", "#FFFFFF",
    "#FFFFFF", "#FB9CFD", "#FB9CFD", "#FFFFFF", "#FFFFFF"
  ];

  var canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  var colorU = "#FFFFFF";
  var colorX = "#FFFFFF";
  var timers = [];

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, 32, 32);
    ctx.fillStyle = "#000000";
    roundRect(0, 0, 32, 32, 6);
    ctx.fill();
    ctx.font = "800 16px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = colorU;
    ctx.fillText("U", 10, 22);
    ctx.fillStyle = colorX;
    ctx.fillText("X", 21, 22);
    link.type = "image/png";
    link.href = canvas.toDataURL("image/png");
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers.length = 0;
  }

  function scheduleCycle(apply, delayMs) {
    KEYTIMES.forEach(function (t, i) {
      var ms = t * CYCLE_MS + delayMs;
      timers.push(
        setTimeout(function () {
          apply(COLORS[i]);
          draw();
        }, ms)
      );
    });
  }

  function loop() {
    clearTimers();
    scheduleCycle(function (c) { colorU = c; }, 0);
    scheduleCycle(function (c) { colorX = c; }, STAGGER_MS);
  }

  loop();
  draw();
  setInterval(loop, CYCLE_MS);
})();
