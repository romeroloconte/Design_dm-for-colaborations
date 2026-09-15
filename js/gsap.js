gsap.registerPlugin(SplitText, ScrollTrigger);

/*
  EFECTO DE TEXTO
  ===============
  SplitText con type "lines, chars" envuelve cada línea en un div según
  dónde rompe el texto EN EL MOMENTO DEL SPLIT. Eso lo vuelve dependiente
  de tres cosas que cambian: la familia tipográfica (un token por theme),
  el ancho del viewport y si la fuente ha terminado de cargar.

  Por eso el split no se hace una vez al arrancar, sino que vive en
  build(), que se puede reejecutar. Cada reejecución revierte el split
  anterior — y con él se van los listeners, porque los nodos que los
  llevaban dejan de existir. Sin fugas y sin listeners duplicados.

  Se reconstruye en tres momentos:
    - cuando las fuentes han cargado (si no, mediríamos con la fallback)
    - al cambiar de theme (cambia la familia, cambia dónde rompe)
    - al redimensionar en horizontal (cambia el ancho disponible)
*/

/* --------------------------------------------------------------- paleta */
/*
  Los colores NO viven aquí: salen de --accent-1..5 y --text-primary
  (style/tokens.css), así que un theme nuevo no obliga a tocar este
  archivo. Se cachean y se refrescan solo al cambiar de theme.
*/
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

/* ---------------------------------------------------------------- efecto */

function glitchLine(line, chars) {
    const charsInLine = chars.filter((char) => line.contains(char));
    const middleIndex = (charsInLine.length - 1) / 2;

    charsInLine.forEach((char, index) => {
        if (!char.dataset.orig) {
            char.dataset.orig = char.textContent;
        }

        // El stagger sale de la distancia al centro: el glitch se abre
        // hacia los lados en vez de recorrer la línea de izquierda a derecha.
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
                // Una misma tirada decide borde y cota: van juntos por diseño.
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
                // Se libera el color inline para que el carácter vuelva a
                // heredar --text-primary. Si no, conservaría el hex del theme
                // activo durante el hover y quedaría desincronizado al cambiar.
                char.style.removeProperty("color");
            }
        });
    });
}

/* ----------------------------------------------------------- construcción */

let splits = [];

function build() {
    // revert() devuelve cada h1 a su HTML original y se lleva por delante
    // los nodos de línea y carácter — y con ellos sus listeners.
    splits.forEach((s) => {
        gsap.killTweensOf(s.chars);
        s.revert();
    });
    splits = [];

    gsap.utils.toArray("h1").forEach((txt) => {
        const instance = new SplitText(txt, { type: "lines, chars" });
        splits.push(instance);

        instance.lines.forEach((line) => {
            line.addEventListener("mouseenter", () => glitchLine(line, instance.chars));
        });
    });
}

/*
  Reconstruir tras un cambio de familia exige que la nueva fuente esté
  cargada: el navegador solo descarga las que se usan, así que la primera
  vez que se activa un theme su familia todavía no está en memoria y
  mediríamos las líneas con la tipografía de sistema.
*/
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

    // Solo ancho: en móvil el scroll muestra y oculta la barra del navegador,
    // lo que dispara resize por cambios de ALTO que no afectan al wrap.
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
