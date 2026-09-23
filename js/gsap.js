gsap.registerPlugin(SplitText);
const ACCENT_TOKENS = ["--accent-1", "--accent-2", "--accent-3", "--accent-4", "--accent-5"];
let accentPalette = [];
let baseColor = "";
function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    accentPalette = ACCENT_TOKENS
        .map((token) => styles.getPropertyValue(token).trim())
        .filter(Boolean);
    baseColor = styles.getPropertyValue("--text-primary").trim() || "currentColor";
}
function randomAccent() {
    return gsap.utils.random(accentPalette);
}
const GLITCH_CHARS = [
    "a","b","c","d","e","f","g","h","i","j","k","l","m",
    "n","o","p","q","r","s","t","u","v","w","x","y","z",
    "A","B","C","D","E","F","G","H","I","J","K","L","M",
    "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "0","1","2","3","4","5","6","7","8","9",
    "<",">","%","&","@","!","#","$","^","*","(",")","-",
    "_","+","=","{","}","[","]","|","\\",":",";","\"",
    "?","/","~","`"
];
function glitchLine(line, chars) {
    const charsInLine = chars.filter((char) => line.contains(char));
    const middleIndex = (charsInLine.length - 1) / 2;
    charsInLine.forEach((char, index) => {
        if (!char.dataset.orig) {
            char.dataset.orig = char.textContent;
        }
        const distanceFromCenter = Math.abs(index - middleIndex);
        gsap.fromTo(char, { color: baseColor }, {
            color: randomAccent(),
            ease: "power3.out",
            duration: 0.3,
            delay: distanceFromCenter * 0.03,
            repeat: 1,
            yoyo: true,
            overwrite: "auto",
            onStart: () => {
                if (gsap.utils.random(["0", "1"]) === "1") {
                    char.textContent = gsap.utils.random(GLITCH_CHARS);
                }
                if (gsap.utils.random(["0", "1", "2"]) === "1") {
                    const detail = document.createElement("span");
                    detail.classList.add("detail-size");
                    detail.textContent = `△x = ${char.clientWidth}px`;
                    char.appendChild(detail);
                    char.style.border = `1px solid ${randomAccent()}`;
                }
            },
            onComplete: () => {
                char.textContent = char.dataset.orig;
                char.style.border = "none";
                char.style.removeProperty("color");
            }
        });
    });
}
function boilChars(chars) {
    chars.forEach((char) => {
        char.classList.add("boil-char");
        char.style.setProperty("--boil-dx", `${gsap.utils.random(-1, 1).toFixed(2)}px`);
        char.style.setProperty("--boil-dy", `${gsap.utils.random(-1, 1).toFixed(2)}px`);
        char.style.setProperty("--boil-rot", `${gsap.utils.random(-1.5, 1.5).toFixed(2)}deg`);
        char.style.setProperty("--boil-duration", `${gsap.utils.random(900, 1500).toFixed(0)}ms`);
        char.style.setProperty("--boil-delay", `-${gsap.utils.random(0, 1200).toFixed(0)}ms`);
    });
}
let splits = [];
const GLITCH_SELECTOR = "[data-glitch]";
function build() {
    splits.forEach((s) => {
        gsap.killTweensOf(s.chars);
        s.revert();
    });
    splits = [];
    gsap.utils.toArray(GLITCH_SELECTOR).forEach((txt) => {
        const instance = new SplitText(txt, { type: "lines, chars" });
        splits.push(instance);
        if (document.documentElement.getAttribute("data-theme") === "draft") {
            boilChars(instance.chars);
            return;
        }
        instance.lines.forEach((line) => {
            line.addEventListener("mouseenter", () => glitchLine(line, instance.chars));
        });
    });
}
function rebuildWhenFontsReady() {
    document.fonts.ready.then(build);
}
function init() {
    readPalette();
    rebuildWhenFontsReady();
    document.addEventListener("themechange", () => {
        readPalette();
        rebuildWhenFontsReady();
    });

    document.addEventListener("contentreveal", rebuildWhenFontsReady);
    let lastWidth = window.innerWidth;
    let timer;
    window.addEventListener("resize", () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        clearTimeout(timer);
        timer = setTimeout(build, 200);
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
