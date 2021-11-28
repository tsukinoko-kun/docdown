import { context } from "./context";
import * as pdfMake from "pdfmake/build/pdfmake";
import { getLocalizedString } from "./local";
import { getTitle } from "./session";
import type {
  Content,
  TDocumentDefinitions,
  TFontDictionary,
} from "pdfmake/interfaces";

const displayEl = document.getElementById("display") as HTMLDivElement;

const serverBase = location.protocol + "//" + location.host + "/";

const fonts: TFontDictionary = {
  NotoSans: {
    normal: serverBase + "static/Noto_Sans/NotoSans-Regular.ttf",
    bold: serverBase + "static/Noto_Sans/NotoSans-Bold.ttf",
    italics: serverBase + "static/Noto_Sans/NotoSans-Italic.ttf",
    bolditalics: serverBase + "static/Noto_Sans/NotoSans-BoldItalic.ttf",
  },
  JetBrainsMono: {
    normal: serverBase + "static/JetBrainsMono/JetBrainsMono-Regular.ttf",
    bold: serverBase + "static/JetBrainsMono/JetBrainsMono-Bold.ttf",
    italics: serverBase + "static/JetBrainsMono/JetBrainsMono-Italic.ttf",
    bolditalics:
      serverBase + "static/JetBrainsMono/JetBrainsMono-BoldItalic.ttf",
  },
};

const mapDomToPdfContent = (el: Element): Content => {
  switch (el.tagName) {
    case "H1":
      const h1 = el as HTMLHeadingElement;
      return { text: h1.innerText, style: "header" };
    case "H2":
      const h2 = el as HTMLHeadingElement;
      return { text: h2.innerText, style: "header2" };
    case "H3":
      const h3 = el as HTMLHeadingElement;
      return { text: h3.innerText, style: "header3" };
    case "H4":
      const h4 = el as HTMLHeadingElement;
      return { text: h4.innerText, style: "header4" };
    case "H5":
      const h5 = el as HTMLHeadingElement;
      return { text: h5.innerText, style: "header5" };
    case "H6":
      const h6 = el as HTMLHeadingElement;
      return { text: h6.innerText, style: "header6" };
    case "P":
      const p = el as HTMLParagraphElement;
      return { text: p.innerText, style: "paragraph" };
    case "UL":
      const ul = el as HTMLUListElement;
      return {
        ul: Array.from(ul.querySelectorAll("li")).map((li) => {
          return { text: li.innerText, style: "list" };
        }),
      };
    case "OL":
      const ol = el as HTMLOListElement;
      return {
        ol: Array.from(ol.querySelectorAll("li")).map((li) => {
          return { text: li.innerText, style: "list" };
        }),
      };
    case "PRE":
      const pre = el as HTMLPreElement;
      return { text: pre.innerText, style: "code" };
    case "BLOCKQUOTE":
      const blockquote = el as HTMLQuoteElement;
      return { text: blockquote.innerText, style: "blockquote" };
    case "IMG":
      const img = el as HTMLImageElement;
      return { image: img.src, fit: [img.width, img.height] };
    case "TABLE":
      const table = el as HTMLTableElement;
      return {
        table: {
          widths: Array.from(table.querySelectorAll("col")).map((col) => {
            return col.width;
          }),
          body: Array.from(table.querySelectorAll("tr")).map((tr) => {
            return Array.from(tr.querySelectorAll("td")).map((td) => {
              return { text: td.innerText, style: "table" };
            });
          }),
        },
      };
    case "A":
      const a = el as HTMLAnchorElement;
      return { text: a.innerText, link: a.href };
    case "CODE":
      const code = el as HTMLElement;
      return { text: code.innerText, style: "code" };
    case "SPAN":
      const span = el as HTMLSpanElement;
      return { text: span.innerText, style: "span" };
    case "DIV":
      const div = el as HTMLDivElement;
      return { text: div.innerText, style: "div" };
    case "BR":
      return { text: "\n" };
    case "HR":
      return { text: "\n" };
    default:
      return { text: el.innerHTML, style: "paragraph" };
  }
};

const createDocDefinition = (): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    info: {
      title: getTitle(),
      creationDate: new Date(),
    },
    defaultStyle: {
      font: "NotoSans",
    },
    content: Array.from(displayEl.children).map(mapDomToPdfContent),
    compress: true,
    pageSize: "A4",
    pageOrientation: "portrait",
    permissions: {
      annotating: true,
      contentAccessibility: true,
      documentAssembly: true,
      copying: true,
      modifying: false,
    },
  };

  return docDefinition;
};

const createPdf = () => {
  const doc = pdfMake.createPdf(createDocDefinition(), undefined, fonts);
  doc.download(getTitle() + ".pdf");
};

displayEl.addEventListener(
  "contextmenu",
  (ev) => {
    ev.preventDefault();

    context(ev, [
      {
        label: getLocalizedString("export_pdf"),
        action: () => {
          createPdf();
        },
      },
    ]);
  },
  {
    passive: false,
    capture: true,
  }
);
