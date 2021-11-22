import passive from "./passive";

import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";

import hljs from "highlight.js";

import MD from "markdown-it";
const md = new MD("commonmark", {
  breaks: false,
  linkify: true,
  xhtmlOut: true,
  html: true,
  quotes: "„“‚‘",
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch {
        return "";
      }
    }

    return ""; // use external default escaping
  },
});

const codeEl = document.getElementById("code") as HTMLTextAreaElement | null;
const displayEl = document.getElementById("display") as HTMLDivElement | null;
const navEl = document.getElementById("nav") as HTMLOListElement | null;

if (!codeEl) {
  throw new Error("No code element found");
}

if (!displayEl) {
  throw new Error("No display element found");
}

if (!navEl) {
  throw new Error("No nav element found");
}

const updateNavigation = () => {
  for (const li of Array.from(navEl.children)) {
    disposeNode(li, true);
  }

  for (const h of Array.from(
    displayEl.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ) as [HTMLElement]) {
    const li = document.createElement("li");
    li.innerText = h.innerText;
    addDisposableEventListener(li, "click", () => {
      h.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    });
    li.classList.add(h.tagName.toLowerCase());
    navEl.appendChild(li);
  }
};

const insertSvg = (svgCode: string) => {
  displayEl.innerHTML = svgCode;
};

const render = (graphDefinition: string) =>
  insertSvg(md.render(graphDefinition));

let renderDelayId: number | null = null;
codeEl.addEventListener(
  "input",
  () => {
    if (renderDelayId) {
      clearTimeout(renderDelayId);
    }

    renderDelayId = window.setTimeout(() => {
      renderDelayId = null;
      render(codeEl.value);
      updateNavigation();
    }, 500);
  },
  passive
);

render(codeEl.value);
updateNavigation();
