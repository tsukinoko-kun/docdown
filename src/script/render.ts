import passive from "./passive";
import { exportSourcesRegister, sourceTag } from "./sources";
import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import hljs from "highlight.js";
import MD from "markdown-it";
import { findInText } from "./editor";
import { getTitle } from "./session";
import { escapeRegExp } from "./escape";

const md = new MD("commonmark", {
  breaks: false,
  linkify: true,
  xhtmlOut: true,
  html: true,
  quotes: "„“‚‘",
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true })
          .value;
      } catch {
        return "";
      }
    }

    return ""; // use external default escaping
  },
});

const codeEl = document.getElementById("code") as HTMLTextAreaElement;
const displayEl = document.getElementById("display") as HTMLDivElement;
const navEl = document.getElementById("nav") as HTMLOListElement;

const manipulateRenderedAnchors = () => {
  for (const a of Array.from(displayEl.getElementsByTagName("a"))) {
    addDisposableEventListener(
      a,
      "click",
      (ev) => {
        ev.preventDefault();
        if (ev.ctrlKey || ev.metaKey) {
          window.open(a.href, a.href)?.focus();
        }
      },
      {
        capture: true,
        passive: false,
      }
    );
  }
};

function createTableOfContents(
  toc: HTMLOListElement,
  headers: Array<HTMLElement>
): void {
  const lists = new Array<HTMLOListElement>(toc);
  for (const header of headers) {
    const level = Number(header.tagName.slice(1)) - 1;

    if (lists.length <= level) {
      do {
        const ul = document.createElement("ol");
        lists[lists.length - 1]!.appendChild(ul);
        lists.push(ul);
      } while (lists.length <= level);
    } else if (lists.length > level + 1) {
      lists.length = level + 1;
    }

    const list = lists[level]!;

    const li = document.createElement("li");
    li.classList.add(header.tagName.toLowerCase());
    const a = document.createElement("a");
    header.id = header.innerText;
    a.href = "#" + header.id;
    a.textContent = header.textContent;
    addDisposableEventListener(
      a,
      "click",
      (ev) => {
        ev.preventDefault();
      },
      {
        capture: true,
        passive: false,
      }
    );
    li.appendChild(a);
    list.appendChild(li);
  }
}

const updateTableOfContents = () => {
  // clear ui nav
  for (const li of Array.from(navEl.children)) {
    disposeNode(li, true);
  }

  const allHeaders = Array.from(
    displayEl.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ) as [HTMLElement];

  createTableOfContents(
    document.getElementById("toc") as HTMLOListElement,
    allHeaders
  );

  for (const h of allHeaders) {
    // ui nav
    const tag = h.tagName.toLowerCase();
    h.id = h.innerText;

    const li = document.createElement("li");
    li.innerText = h.innerText;
    addDisposableEventListener(li, "click", () => {
      findInText(codeEl, new RegExp("\\#+\\s+" + escapeRegExp(h.innerText)));

      h.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "start",
      });
    });
    li.classList.add(tag);
    navEl.appendChild(li);
  }
};

const render = (markdown: string) => {
  const sources = new Array<string>();
  disposeNode(displayEl, false);

  displayEl.innerHTML =
    `<p class="title">${getTitle()}</p>` +
    '<ol id="toc"></ol><hr/>' +
    md.render(markdown).replace(sourceTag, (srcId) => {
      const i = sources.indexOf(srcId);
      if (i === -1) {
        sources.push(srcId);
        return `<sup>[${sources.length}]</sup>`;
      } else {
        return `<sup>[${i + 1}]</sup>`;
      }
    }) +
    exportSourcesRegister(sources);

  manipulateRenderedAnchors();
};

let renderDelayId: number | null = null;
codeEl.addEventListener(
  "input",
  () => {
    if (renderDelayId) {
      clearTimeout(renderDelayId);
    }

    renderDelayId = window.setTimeout(() => {
      renderDelayId = null;
      triggerRender();
    }, 500);
  },
  passive
);

window["triggerRender"] = () => {
  render(codeEl.value);
  updateTableOfContents();
};

const favicon = (document.querySelector("link[rel*='icon']") as HTMLLinkElement)
  .href;

codeEl.value = `# Title

Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas, similique nam? Fugiat excepturi modi, dolorum incidunt provident, praesentium labore nulla, minima pariatur nisi corporis maiores natus aut amet doloremque error?

## Foo

[foobar](https://example.com)

## Bar

*foo* **bar**

\`\`\`cpp
// C++ Hello World Program

#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}
\`\`\`

Icon made by [Vitaly Gorbachev](https://www.flaticon.com/authors/vitaly-gorbachev) from [www.flaticon.com](https://www.flaticon.com)

![favicon](${favicon})
`;

triggerRender();
