import { webcrypto } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "vault.src");
const SRC_FILE = join(SRC_DIR, "content.json");
const OUT_FILE = join(ROOT, "resources", "vault.json");

const ITERATIONS = 310000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};

function toBase64(buffer) {
  return Buffer.from(buffer).toString("base64");
}

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolvePrompt) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const onData = (char) => {
      if (["\n", "\r", ""].includes(String(char))) {
        process.stdin.removeListener("data", onData);
        return;
      }
      process.stdout.write("[2K[200D" + question);
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      process.stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolvePrompt(answer);
    });
  });
}

async function deriveKey(passphrase, salt) {
  const material = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return webcrypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

async function embedMedia(project) {
  if (!project.image) return project;
  const path = join(SRC_DIR, project.image);
  if (!existsSync(path)) fail(`No existe la imagen ${project.image} del proyecto "${project.id}".`);
  const type = MIME[extname(path).toLowerCase()];
  if (!type) fail(`Formato de imagen no soportado en ${project.image}.`);
  const bytes = await readFile(path);
  return { ...project, image: `data:${type};base64,${toBase64(bytes)}` };
}

async function main() {
  if (!existsSync(SRC_FILE)) {
    fail("Falta vault.src/content.json. Copia vault.src.example/content.json y rellénalo.");
  }

  let source;
  try {
    source = JSON.parse(await readFile(SRC_FILE, "utf8"));
  } catch (error) {
    fail(`vault.src/content.json no es JSON válido: ${error.message}`);
  }

  if (!Array.isArray(source.projects) || source.projects.length === 0) {
    fail("vault.src/content.json debe tener un array \"projects\" con al menos un proyecto.");
  }

  const projects = [];
  for (const project of source.projects) {
    projects.push(await embedMedia(project));
  }

  const passphrase = process.env.VAULT_KEY || (await askHidden("  Clave de acceso: "));
  if (!passphrase || passphrase.length < 8) {
    fail("La clave debe tener al menos 8 caracteres.");
  }
  if (!process.env.VAULT_KEY) {
    const again = await askHidden("  Repite la clave: ");
    if (again !== passphrase) fail("Las claves no coinciden.");
  }

  const salt = webcrypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = webcrypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify({ projects }));
  const ciphertext = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

  const payload = {
    v: 1,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: toBase64(salt) },
    cipher: "AES-GCM",
    iv: toBase64(iv),
    data: toBase64(ciphertext)
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload));

  const kb = (JSON.stringify(payload).length / 1024).toFixed(0);
  console.log(`\n  resources/vault.json escrito — ${projects.length} proyecto(s), ${kb} KB.`);
  console.log("  Sube solo ese archivo. vault.src/ no debe entrar nunca en Git.\n");
}

main();
