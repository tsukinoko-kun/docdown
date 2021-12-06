import passive from "../data/passive";
import { setUsedSources, sourceTag } from "../logic/sources";
import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import hljs from "highlight.js";
import MD from "markdown-it";
import { syncScroll } from "./syncScroll";
import { countWords } from "./statistics";
import { download, gsb } from "../logic/database";
import { listenForMessage, sendMessage, service } from "../router";
import { convertToDataUrl, isNullOrWhitespace } from "../data/dataHelper";

const md = new MD("default", {
  breaks: false,
  linkify: true,
  xhtmlOut: true,
  typographer: true,
  html: false,
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

const deleteEmptyRows = (table: HTMLTableElement) => {
  const rows = table.getElementsByTagName("tr");
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]!;

    // no cells
    if (row.childElementCount === 0) {
      row.remove();
      continue;
    }

    // all cells empty
    let empty = true;
    for (let j = 0; j < row.childElementCount; j++) {
      const cell = row.children[j]!;
      if (!isNullOrWhitespace(cell.textContent)) {
        empty = false;
        break;
      }
    }

    if (empty) {
      row.remove();
    }
  }
};

const manipulateRenderedTables = () => {
  const tables = document.getElementsByTagName("table");
  for (const table of Array.from(tables)) {
    deleteEmptyRows(table as HTMLTableElement);
  }
};

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

const manipulateRenderedLists = () => {
  for (const li of Array.from(displayEl.getElementsByTagName("li"))) {
    if (li.innerText.startsWith("[ ] ")) {
      li.classList.add("unchecked");
      li.innerHTML = li.innerHTML.replace(/\[\s\]\s+/g, "");
    } else if (li.innerText.startsWith("[x] ")) {
      li.classList.add("checked");
      li.innerHTML = li.innerHTML.replace(/\[x\]\s+/g, "");
    }
  }
};

const resolveImages = async () => {
  for (const img of Array.from(displayEl.getElementsByTagName("img"))) {
    const src = img.src;
    if (src) {
      if (src.startsWith(gsb)) {
        const url = await download(src);
        img.src = await convertToDataUrl(url);
      } else {
        img.src = await convertToDataUrl(img.src);
      }
    }
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

  displayEl.innerHTML = md.render(markdown).replace(sourceTag, (srcTag) => {
    const srcId = srcTag.substring(2, srcTag.length - 1);
    const i = sources.indexOf(srcId);
    if (i === -1) {
      sources.push(srcId);
      return `<sup src="${srcId}">[${sources.length}]</sup>`;
    } else {
      return `<sup src="${srcId}">[${i + 1}]</sup>`;
    }
  });

  setUsedSources(sources);

  manipulateRenderedTables();
  manipulateRenderedAnchors();
  manipulateRenderedLists();
  resolveImages();
};

let renderDelayId: number | null = null;
codeEl.addEventListener(
  "input",
  () => {
    if (renderDelayId) {
      clearTimeout(renderDelayId);
    }

    sendMessage(service.setChanged, {
      code: codeEl.value,
    });
    renderDelayId = window.setTimeout(() => {
      renderDelayId = null;
      triggerRender();
    }, 500);
  },
  passive
);

const triggerRender = () => {
  render(codeEl.value);
  countWords();
  updateTableOfContents();
};

listenForMessage(service.triggerRender, triggerRender);

codeEl.value = `# Links

- [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet)
- [Source code on GitHub](https://source.docdown.app)
- [Bug reports and feature requests](https://github.com/Frank-Mayer/docdown/issues/new/choose)
- [docdown Q & A](https://source.docdown.app/discussions/categories/q-a)

# Third-party software & services

- [JetBrains Mono](https://www.jetbrains.com/lp/mono) Font by JetBrains, Philipp Nurullin, Konstantin Bulenkov (SIL Open Font License 1.1)
- [Noto Sans Font](fonts.google.com/noto) by Google (SIL Open Font License & Apache License)
- Database and hosting by [Firebase](https://firebase.google.com)
- Markdown to HTML conversion by [markdown-it](https://npmjs.com/package/markdown-it) (MIT License)
- [Highlight.js](https://npmjs.com/package/highlight.js) syntax highlighting (BSD-3-Clause License)
- PDF-API [pdfmake](https://npmjs.com/package/pdfmake) for PDF export (MIT License)
- Icon made by [Vitaly Gorbachev](https://www.flaticon.com/authors/vitaly-gorbachev) from [www.flaticon.com](https://www.flaticon.com) (Flaticon License)
`;

triggerRender();
