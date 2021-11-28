import passive from "./passive";
import { setUsedSources, sourceTag } from "./sources";
import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import hljs from "highlight.js";
import MD from "markdown-it";
import { syncScroll } from "./syncScroll";

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

const updateTableOfContents = () => {
  // clear ui nav
  for (const li of Array.from(navEl.children)) {
    disposeNode(li, true);
  }

  const allHeaders = Array.from(
    displayEl.querySelectorAll("h1, h2, h3, h4, h5, h6")
  ) as [HTMLElement];

  for (const h of allHeaders) {
    // ui nav
    const tag = h.tagName.toLowerCase();

    const li = document.createElement("li");
    li.innerText = h.innerText;
    addDisposableEventListener(li, "click", () => {
      // findInText(codeEl, new RegExp("\\#+\\s+" + escapeRegExp(h.innerText)));

      h.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "start",
      });

      syncScroll(displayEl, codeEl);
    });

    li.classList.add(tag);
    navEl.appendChild(li);
  }
};

const render = (markdown: string) => {
  const sources = new Array<string>();
  disposeNode(displayEl, false);

  displayEl.innerHTML = md.render(markdown).replace(sourceTag, (srcId) => {
    const i = sources.indexOf(srcId);
    if (i === -1) {
      sources.push(srcId);
      return `<sup src="${srcId}">[${sources.length}]</sup>`;
    } else {
      return `<sup src="${srcId}">[${i + 1}]</sup>`;
    }
  });

  setUsedSources(sources);

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

\`\`\`typescript
// TypeScript insertion sort

import { compareable } from "./compareable";

export const insertionSort = <T extends compareable>(arr: Array<T>): Array<T> => {
  for (let i: number = 0; i < arr.length; i++) {
    let j = i - 1;
    let key = arr[i];

    while (j > -1 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }

    arr[j + 1] = key;
  }
  return arr;
}
\`\`\`

Icon made by [Vitaly Gorbachev](https://www.flaticon.com/authors/vitaly-gorbachev) from [www.flaticon.com](https://www.flaticon.com)
`;

triggerRender();
