# Luis Romero Loconte — UX & Visual Designer

Design Systems · Product Design · Design Ops
Valencia, Spain

**Live site → [romeroloconte.github.io/dm-for-colaborations](https://romeroloconte.github.io/dm-for-colaborations/)**

This repository holds my personal site: a small, hand-built portfolio where the interface itself is part of the argument. No framework, no build step — plain HTML, CSS and GSAP.

---

## About

Degree in Advertising Art Direction, with over 12 years in the agency and creative studio ecosystem. Since 2019 I have been focused on the UX/UI Designer role, working end-to-end on digital products with a strategic approach.

My background spans complex projects across several industries — primarily banking, alongside logistics and retail — designing solutions that balance user needs with business goals.

That advertising origin still shapes how I work: I think in systems, governance and scalability by default, not in isolated screens or one-off deliverables.

## What I work on

**Design Systems**
Token architecture, variables, components and patterns. Multi-brand and federated library models, governance, versioning and deprecation, scalability strategy, and clean design-to-development handoff.

**Design Ops**
Ways of working, rituals and cadences, tooling ecosystem, handoff optimisation, and team capacity and operations.

**Product Design**
End-to-end process from concept to launch: UX/UI audits of existing flows, interface design, accessibility standards, quality bar and stakeholder communication.

## How I work

- Systems over deliverables — every screen is an instance of something reusable
- Scalability and adoption with the lowest possible friction
- Quality over scope whenever the two are in tension
- Documentation must be self-sufficient: clear, precise, no gaps left to interpretation
- Consistency is not negotiable; adaptability lives inside the system, not against it

## Get in touch

Open to collaborations and design system work.

- LinkedIn — [in/romeroloconte](https://www.linkedin.com/in/romeroloconte/)
- Figma — [@romeroloconte](https://www.figma.com/@romeroloconte)
- GitHub — [@romeroloconte](https://github.com/romeroloconte)

---

## About this site

### Pages

| File | Purpose |
| --- | --- |
| `index.html` | Hero — name, role and the animated text lines |
| `who_i_am.html` | Bio, portrait and background |
| `recent_projects.html` | Case studies — *coming soon* |

### The text effect

Every `<h1>` is split into lines and characters with GSAP `SplitText`. On hover over a line, each character animates outward from the centre of the line and, at random:

- swaps into another character — letter, number or symbol — before restoring its original value
- shifts colour through a fixed five-tone palette
- reveals its own pixel width (`△x = …px`) with an outlined border

The stagger is driven by distance from the line's midpoint, so the glitch spreads outwards rather than left to right.

### Stack

- Plain HTML and CSS — no framework, no bundler
- [GSAP 3](https://gsap.com/) via CDN, with the `SplitText` plugin (`ScrollTrigger` is registered but not yet in use)
- Inter, loaded from Google Fonts

### Structure

```
index.html              hero / entry point
who_i_am.html           bio
recent_projects.html    case studies (WIP)
style/styles.css        all styles
js/gsap.js              text effect logic
resources/              images
.github/workflows/      GitHub Pages deployment
```

### Running it locally

Static site — clone the repository and open `index.html` in a browser. No install, no build, no server required.

### Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/static.yml`, which publishes the site to GitHub Pages.

---

© Luis Romero Loconte
