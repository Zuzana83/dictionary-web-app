# Frontend Mentor - Dictionary Web App Solution

This is a solution to the [Dictionary Web App challenge](https://www.frontendmentor.io/challenges/dictionary-web-app-h5wwnyuKFL)
on [Frontend Mentor](https://www.frontendmentor.io).

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Useful resources](#useful-resources)
  - [AI Collaboration](#ai-collaboration)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

Users should be able to:

- Search for words using the input field
- See the Free Dictionary API's response for the searched word
- See a form validation message when trying to submit a blank form
- Play the audio file for a word when it's available
- Switch between serif, sans serif, and monospace fonts
- Switch between light and dark themes
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page
- **Bonus**: Have the correct color scheme chosen for them based on their computer preferences.

### Screenshot

![Project screenshot](./screenshot.png)

### Links

- Solution URL: https://github.com/Zuzana83/dictionary-web-app
- Live Site URL: https://zuzana83.github.io/dictionary-web-app/

## My process

### Built with

- Semantic HTML5 markup
- Vanilla CSS with custom properties (variables) for theme and font switching
- Flexbox
- Mobile-first workflow
- Vanilla JavaScript (no frameworks or libraries)
- [Free Dictionary API](https://dictionaryapi.dev/)
- `AbortController` for managing in-flight API requests
- ARIA roles and attributes for a custom-built dropdown and toggle switch

### What I learned

The biggest challenge in this project was sequencing my JavaScript correctly — making sure functions ran in the right order, and that async operations (like fetching from the API) fully completed before the UI tried to use their results. A completely new concept for me was `AbortController`, which cancels a previous in-flight request the moment a new search starts:

```js
if (currentRequest) {
  currentRequest.abort();
}
currentRequest = new AbortController();

const data = await fetchSearchedTerm(`${baseURL}${word}`, currentRequest.signal);
```

Without this, two searches fired close together (e.g. "cat" then "dog") could resolve in the wrong order — whichever response happened to arrive last would win, even if it wasn't the most recent search. `AbortController` guarantees only one request is ever "live" at a time, so the result on screen always matches what the user actually searched for last.

I also focused on differentiating error states instead of showing one generic message for everything:

```js
if (resp.status === 404) return { error: "notFound" };
if (!resp.ok) return { error: "serverError" };
```

A missing word, a network failure, and a server error are all meaningfully different situations for a user, so they get distinct messages rather than a single catch-all "something went wrong."

For theme and font preferences, I validated data coming out of `localStorage` against an allowlist of accepted values, falling back to safe defaults if the stored value was missing, invalid, or corrupted:

```js
const validThemes = ["light", "dark"];
const validFonts = ["sans", "serif", "mono"];

preferences = {
  theme: validThemes.includes(parsedValue.theme) ? parsedValue.theme : "light",
  font: validFonts.includes(parsedValue.font) ? parsedValue.font : "sans"
};
```

`localStorage` can be edited manually in DevTools or become corrupted, so I don't trust it blindly — I only accept values I explicitly expect. I also learned this script needs to run in the `<head>`, before the browser paints the page, so the correct theme applies immediately instead of causing a "flash" of the wrong theme right after load.

Accessibility was the other major focus. With my mentor's guidance, I built a custom dropdown (font selector) and a custom toggle (theme switch) from scratch, since native `<select>` elements don't offer full styling control. That meant rebuilding keyboard behavior that native elements get for free — arrow keys to move between options, `Enter` to select, `Escape` to close:

```js
dropdownList.addEventListener("keydown", function (e) {
  const options = [...dropdownList.querySelectorAll("[role='option']")];
  const index = options.indexOf(document.activeElement);

  if (e.key === "ArrowDown") options[Math.min(index + 1, options.length - 1)].focus();
  if (e.key === "ArrowUp") options[Math.max(index - 1, 0)].focus();
});
```

I also used an `aria-live` region so screen readers automatically announce a new search result once it loads, without the user needing to navigate to it manually.

A related fix I made after initially building the dropdown was implementing a **roving tabindex** pattern. At first, every option had `tabindex="0"`, so pressing Tab moved through each option individually before reaching the next control on the page — duplicating what my arrow-key handler already did. The fix keeps `tabindex="0"` on only the *currently active* option, with `tabindex="-1"` on the rest, updating on every arrow-key press:

```js
if (e.key === "ArrowUp") {
  e.preventDefault();

  const currentOption = options.find(option => option.getAttribute("tabindex") === "0");
  currentOption.setAttribute("tabindex", "-1");

  const newOption = options[Math.max(index - 1, 0)];
  newOption.setAttribute("tabindex", "0");
  newOption.focus();
}
```

Now Tab skips past the whole dropdown in a single press instead of stopping on every option, while arrow keys still move focus within it — matching how native `<select>` elements behave. It also correctly remembers the selected option: reopening the dropdown after picking "Mono," for example, sends Tab straight to "Mono" rather than resetting to the first option.

### Useful resources

- [MDN Web Docs](https://developer.mozilla.org/) - My first stop for understanding new concepts like `AbortController` and ARIA roles at a reference/theory level before applying them.
- After reading MDN, I generally search for real-world implementations of the same concept (e.g. "AbortController fetch example", "ARIA listbox keyboard pattern") to see how the theory is applied in practice, since seeing a working example alongside the official docs made concepts click faster than either alone.

### AI Collaboration

I used an AI tool as a learning mentor throughout this build — asking it to explain concepts in theory first (like why `AbortController` prevents race conditions, or why validating `localStorage` values against an allowlist matters) before writing any code myself. I'd build a draft, iterate on it with AI feedback until it felt solid. After getting review feedback, I'd go back and work through fixing the specific issues raised — for example, restructuring my `localStorage` handling after being told it needed protection against invalid or malicious values. This README itself was also written with AI guidance.

## Acknowledgments

Thanks to this AI mentor/guide approach I am able to solve more complex projects, learn new concepts, explore more advanced javascript which I would not be able to do just on my own, without verifying I understand theory and implement it correctly. 