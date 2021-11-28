import { context } from "./context";
import * as pdfMake from "pdfmake/build/pdfmake";
import { getLocale, getLocalizedString } from "./local";
import { getTitle } from "./session";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { defaultStyle, fonts, styles, syntaxStyles } from "./pdfStylesheet";
import { getUser } from "./database";
import { hasSources, mapSources } from "./sources";

const displayEl = document.getElementById("display") as HTMLDivElement;

const getBase64Image = (img: HTMLImageElement) => {
  // Create an empty canvas element
  const canvas = document.createElement("canvas");
  const rect = img.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Copy the image contents to the canvas
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get context for canvas");
  }

  ctx.drawImage(img, 0, 0);

  const dataUrl = canvas.toDataURL();

  canvas.remove();

  return dataUrl;
};

const parseStyleData = (el: Element) => {
  const styleData = window.getComputedStyle(el);
  return {
    fontSize: parseFloat(styleData.fontSize),
    color: styleData.color,
  };
};

const mapSyntaxToPdfContent = (el: Node): Content => {
  if (el instanceof HTMLElement) {
    if (el.children.length === 0) {
      const classes = Array.from(el.classList);
      for (const cls of classes) {
        const classStyle = syntaxStyles.get(cls);
        if (classStyle) {
          return {
            text: el.innerText,
            style: classStyle,
          };
        }
      }

      return {
        text: el.innerText,
        style: "code",
      };
    } else {
      return Array.from(el.childNodes).map(mapSyntaxToPdfContent).flat();
    }
  } else {
    if (!el.textContent) {
      return [];
    }

    const classes = Array.from(el.parentElement!.classList);
    for (const cls of classes) {
      const classStyle = syntaxStyles.get(cls);
      if (classStyle) {
        return {
          text: el.textContent,
          style: classStyle,
        };
      }
    }

    return {
      text: el.textContent,
      style: "code",
    };
  }
};

const mapDomToPdfContent = (el: Node): Content => {
  if (el instanceof Element) {
    switch (el.tagName) {
      case "H1":
        const h1 = el as HTMLHeadingElement;
        return {
          text: h1.innerText,
          style: "h1",
          tocItem: "mainToc",
          tocStyle: "toc_h1",
        };
      case "H2":
        const h2 = el as HTMLHeadingElement;
        return {
          text: h2.innerText,
          style: "h2",
          tocItem: "mainToc",
          tocStyle: "toc_h2",
          tocMargin: [20, 0, 0, 0],
        };
      case "H3":
        const h3 = el as HTMLHeadingElement;
        return {
          text: h3.innerText,
          style: "h3",
          tocItem: "mainToc",
          tocStyle: "toc_h3",
          tocMargin: [40, 0, 0, 0],
        };
      case "H4":
        const h4 = el as HTMLHeadingElement;
        return {
          text: h4.innerText,
          style: "h4",
        };
      case "H5":
        const h5 = el as HTMLHeadingElement;
        return {
          text: h5.innerText,
          style: "h5",
        };
      case "H6":
        const h6 = el as HTMLHeadingElement;
        return {
          text: h6.innerText,
          style: "h6",
        };
      case "UL":
        const ul = el as HTMLUListElement;
        return {
          ul: Array.from(ul.getElementsByTagName("li")).map((li) => {
            if (li.children.length === 0) {
              return {
                text: li.innerText,
                style: "list",
                ...parseStyleData(li),
              };
            } else {
              return mapDomToPdfContent(li);
            }
          }),
        };
      case "OL":
        const ol = el as HTMLOListElement;
        return {
          ol: Array.from(ol.getElementsByTagName("li")).map((li) => {
            if (li.children.length === 0) {
              return {
                text: li.innerText,
                style: "list",
                ...parseStyleData(li),
              };
            } else {
              return mapDomToPdfContent(li);
            }
          }),
        };
      case "PRE":
        const pre = el as HTMLPreElement;
        if (pre.children.length === 0) {
          return {
            text: pre.innerText,
            style: "code",
            font: "JetBrainsMono",
          };
        } else {
          return Array.from(pre.childNodes).map((el) => mapDomToPdfContent(el));
        }
      case "BLOCKQUOTE":
        const blockquote = el as HTMLQuoteElement;
        return {
          text: blockquote.innerText,
          style: "blockquote",
        };
      case "IMG":
        const img = el as HTMLImageElement;
        try {
          return {
            image: getBase64Image(img),
            fit: [img.width, img.height],
            style: "image",
          };
        } catch {
          return img.alt ? { text: img.alt, style: "span" } : [];
        }
      case "TABLE":
        const table = el as HTMLTableElement;
        return {
          table: {
            widths: Array.from(table.querySelectorAll("col")).map((col) => {
              return col.width;
            }),
            body: Array.from(table.querySelectorAll("tr")).map((tr) => {
              return Array.from(tr.querySelectorAll("td")).map((td) => {
                return {
                  text: td.innerText,
                  style: "table",
                  ...parseStyleData(td),
                };
              });
            }),
          },
        };
      case "A":
        const a = el as HTMLAnchorElement;
        if (a.children.length === 0) {
          return {
            text: a.innerText,
            link: a.href,
            style: "a",
          };
        } else {
          return Array.from(a.childNodes)
            .map((el) => mapDomToPdfContent(el))
            .flat();
        }
      case "CODE":
        const code = el as HTMLElement;
        if (code.children.length === 0) {
          return {
            text: code.innerText,
            style: "code",
            font: "JetBrainsMono",
          };
        } else {
          return {
            text: Array.from(code.childNodes)
              .map((el) => mapSyntaxToPdfContent(el))
              .flat(),
          };
        }
      case "SUP":
        const sup = el as HTMLElement;
        const src = sup.getAttribute("src");
        if (src) {
          return {
            text: sup.innerText,
            style: "src",
            linkToDestination: src,
          };
        } else {
          return {
            text: sup.innerText,
            style: "sup",
          };
        }
      case "SUB":
        const sub = el as HTMLElement;
        return {
          text: sub.innerText,
          style: "sub",
        };
      case "BR":
        return { text: "\n" };
      case "HR":
        return {
          margin: [0, 12, 0, 0],
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 514,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#BDBDBD",
            },
          ],
        };
      default:
        if (el.children.length === 0) {
          if ("innerText" in el) {
            return {
              text: (el as HTMLElement).innerText,
            };
          } else {
            if (el.textContent) {
              return {
                text: el.textContent,
              };
            } else {
              return [];
            }
          }
        } else {
          return {
            text: Array.from(el.childNodes)
              .map((el) => mapDomToPdfContent(el))
              .flat(),
          };
        }
    }
  } else {
    if (el.textContent) {
      return {
        text: el.textContent,
      };
    } else {
      return [];
    }
  }
};

const toc: Content = {
  toc: {
    id: "mainToc",
    title: { text: getLocalizedString("table_of_contents"), style: "h1" },
  },
  pageBreak: "after",
};

const title = (): Content => {
  return {
    text: getTitle() + "\n",
    style: "title",
  };
};

const sources = (): Content => {
  if (!hasSources()) {
    return [];
  }

  return [
    {
      pageBreak: "before",
      text: getLocalizedString("sources"),
      style: "h1",
      tocItem: "mainToc",
    },
    {
      ol: mapSources<Content>((s) => {
        return {
          text: [
            `${s.author}, ${s.title}, ${s.creationDate}, ${s.lastAccessed}, `,
            {
              text: s.link,
              link: s.link,
              style: "a",
            },
          ],
          style: "list",
          id: s.id,
        };
      }),
    },
  ];
};

const createDocDefinition = (): TDocumentDefinitions => {
  const docDefinition: TDocumentDefinitions = {
    info: {
      title: getTitle(),
      subject: getTitle(),
      creationDate: new Date(),
      author: getUser(),
      creator: getUser(),
    },
    defaultStyle,
    styles,
    pageMargins: [80, 60, 80, 60],
    header: {
      text: `${getTitle()} - ${new Date().toLocaleDateString(getLocale())}`,
      margin: [80, 20],
    },
    content: [
      title(),
      toc,
      ...Array.from(displayEl.childNodes).map(mapDomToPdfContent),
      sources(),
    ],
    footer: (currentPage, pageCount) =>
      currentPage === 1
        ? []
        : {
            text: `${currentPage - 1}/${pageCount - 1}`,
            alignment: "right",
            margin: [40, 20],
          },
    compress: true,
    pageSize: "A4",
    pageOrientation: "portrait",
    images: {},
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

export const createPdf = () =>
  pdfMake.createPdf(createDocDefinition(), undefined, fonts);

document.body.addEventListener(
  "contextmenu",
  (ev) => {
    ev.preventDefault();

    context(ev, [
      {
        label: getLocalizedString("export_pdf"),
        action: () => {
          createPdf().open();
        },
      },
      {
        label: getLocalizedString("download_pdf"),
        action: () => {
          createPdf().download(getTitle() + ".pdf");
        },
      },
      {
        label: getLocalizedString("print"),
        action: () => {
          createPdf().print();
        },
      },
    ]);
  },
  {
    passive: false,
    capture: true,
  }
);
