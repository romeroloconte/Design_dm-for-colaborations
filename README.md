# Text Code Effects

Personal experiment to test interactive text effects with [GSAP](https://gsap.com/) and its `SplitText` plugin.

## What it does

On hover over a line of text, each character briefly glitches into a random character (letters, numbers, symbols), shifts color, and in some cases shows its pixel width with an outlined border, before returning to its original value.

## Stack

- Plain HTML / CSS
- [GSAP 3](https://gsap.com/) (core, loaded via CDN)
- GSAP plugins: `SplitText` (required) and `ScrollTrigger` (registered, currently unused)

## Structure

```
index.html          entry point
style/styles.css     styles
js/gsap.js            effect logic
```

## Usage

Static site: open `index.html` in the browser, no build or server required.

## Status

Prototype / testing — not a production project.
