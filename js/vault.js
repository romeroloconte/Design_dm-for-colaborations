(function () {
  const ENDPOINT = "resources/vault.json";
  const REVEAL_EVENT = "contentreveal";

  const root = document.querySelector("[data-vault]");
  if (!root) return;

  const form = root.querySelector("[data-vault-form]");
  const input = root.querySelector("[data-vault-input]");
  const submit = root.querySelector("[data-vault-submit]");
  const error = root.querySelector("[data-vault-error]");
  const gate = root.querySelector("[data-vault-gate]");
  const stage = root.querySelector("[data-vault-stage]");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let payload = null;
  let busy = false;

  function fromBase64(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function setError(message) {
    error.textContent = message;
    error.hidden = !message;
  }

  function setBusy(state) {
    busy = state;
    submit.disabled = state;
    input.disabled = state;
    submit.dataset.busy = state ? "true" : "false";
  }

  async function loadPayload() {
    if (payload) return payload;
    const response = await fetch(ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error("unavailable");
    payload = await response.json();
    return payload;
  }

  async function decrypt(passphrase, vault) {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: fromBase64(vault.kdf.salt),
        iterations: vault.kdf.iterations,
        hash: vault.kdf.hash
      },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(vault.iv) },
      key,
      fromBase64(vault.data)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  function paragraph(block) {
    const node = document.createElement("p");
    if (block.lead) {
      const lead = document.createElement("strong");
      lead.textContent = block.lead;
      node.appendChild(lead);
      node.appendChild(document.createTextNode(" "));
    }
    node.appendChild(document.createTextNode(block.text || ""));
    return node;
  }

  function meta(project) {
    const values = [project.start, project.end].filter(Boolean);
    if (!values.length) return null;

    const wrap = document.createElement("p");
    wrap.className = "project-meta";

    values.forEach((value, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.className = "project-meta__separator";
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = "–";
        wrap.appendChild(separator);
      }
      const chip = document.createElement("span");
      chip.className = "project-chip";
      chip.textContent = value;
      wrap.appendChild(chip);
    });

    return wrap;
  }

  function placeholder() {
    const frame = document.createElement("div");
    frame.className = "about-placeholder about-placeholder--project";
    frame.textContent = "Project image";
    return frame;
  }

  function trigger(nextId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "about-reveal";
    button.setAttribute("data-reveal", "");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", nextId);

    const icon = document.createElement("span");
    icon.className = "about-reveal__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";

    const label = document.createElement("span");
    label.className = "about-reveal__label";
    label.textContent = "Read more";

    button.append(icon, label);
    return button;
  }

  function module(project, index, total) {
    const section = document.createElement("section");
    section.className = "about about--project";
    section.id = project.id || `project-${index + 1}`;
    section.setAttribute("data-module", "");
    if (index > 0) section.hidden = true;

    const media = document.createElement("div");
    media.className = "about-media";
    if (project.image) {
      const shot = document.createElement("img");
      shot.className = "project-shot";
      shot.src = project.image;
      shot.alt = project.alt || "";
      shot.loading = index > 0 ? "lazy" : "eager";
      shot.decoding = "async";
      media.appendChild(shot);
    } else {
      media.appendChild(placeholder());
    }

    const content = document.createElement("div");
    content.className = "about-content";

    const text = document.createElement("div");
    text.className = "about-text";

    const header = document.createElement("div");
    header.className = "project-header";

    const head = document.createElement("div");
    head.className = "project-head";

    const heading = document.createElement("h3");
    heading.className = "about-heading about-heading--project";
    heading.setAttribute("data-glitch", "");
    heading.textContent = project.title || "";
    head.appendChild(heading);

    const chips = meta(project);
    if (chips) head.appendChild(chips);

    header.appendChild(head);

    if (project.role) {
      const role = document.createElement("p");
      role.className = "project-role";
      role.textContent = project.role;
      header.appendChild(role);
    }

    text.appendChild(header);

    (project.blocks || []).forEach((block) => text.appendChild(paragraph(block)));

    content.appendChild(text);

    const next = index + 1;
    if (next < total) {
      const nextId = (project.nextId || `project-${next + 1}`);
      content.appendChild(trigger(nextId));
    }

    section.append(media, content);
    return section;
  }

  function render(data) {
    const projects = Array.isArray(data.projects) ? data.projects : [];
    if (!projects.length) throw new Error("empty");

    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
      fragment.appendChild(module(project, index, projects.length));
    });

    stage.textContent = "";
    stage.appendChild(fragment);
    stage.hidden = false;

    const first = stage.querySelector("[data-module]");
    stage.querySelectorAll("[data-reveal]").forEach((button) => {
      const target = document.getElementById(button.getAttribute("aria-controls"));
      button.hidden = !target;
    });

    if (reduced.matches || typeof gsap === "undefined") {
      gate.hidden = true;
      settle(first);
      return;
    }

    gsap.timeline({
      onComplete: () => {
        gsap.set(first.children, { clearProps: "opacity,transform" });
        settle(first);
      }
    })
      .to(gate, { opacity: 0, y: -16, duration: 0.3, ease: "power2.in" }, 0)
      .add(() => {
        gate.hidden = true;
        gsap.set(first.children, { opacity: 0, y: 24 });
      }, 0.3)
      .to(first.children, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out"
      }, 0.36);
  }

  function settle(target) {
    document.dispatchEvent(new CustomEvent(REVEAL_EVENT, { detail: { target } }));
    const heading = target && target.querySelector(".about-heading");
    if (!heading) return;
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  async function attempt(event) {
    event.preventDefault();
    if (busy) return;

    const passphrase = input.value;
    if (!passphrase) return;

    setError("");
    setBusy(true);

    try {
      const vault = await loadPayload();
      const data = await decrypt(passphrase, vault);
      input.value = "";
      render(data);
    } catch (failure) {
      setBusy(false);
      setError(failure && failure.message === "unavailable"
        ? "This section is unavailable right now."
        : "That key doesn't open this.");
      input.select();
      input.focus();
    }
  }

  form.addEventListener("submit", attempt);
  input.addEventListener("input", () => {
    if (error.hidden) return;
    setError("");
  });
})();
