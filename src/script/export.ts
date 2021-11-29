import { context } from "./context";
import * as pdfMake from "pdfmake/build/pdfmake";
import { getLocale, getText, textId } from "./local";
import { getTitle } from "./session";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { defaultStyle, fonts, styles, syntaxStyles } from "./pdfStylesheet";
import { getUser } from "./database";
import { hasSources, mapSources } from "./sources";
import { isNullOrWhitespace } from "./dataHelper";

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
      case "OL":
      case "UL":
        const listEl = el as HTMLUListElement;
        const parseListEl = (listEl: HTMLElement): Content => {
          const parseListItem = (li: ChildNode): Content => {
            if (li.nodeType === Node.TEXT_NODE) {
              if (isNullOrWhitespace(li.textContent)) {
                return [];
              }
              return li.textContent ?? [];
            } else if (li.nodeType === Node.ELEMENT_NODE) {
              const liEl = li as HTMLElement;
              if (liEl.tagName === "LI") {
                if (liEl.children.length === 0) {
                  if (isNullOrWhitespace(liEl.textContent)) {
                    return [];
                  }
                  return liEl.innerText;
                } else {
                  return Array.from(liEl.childNodes).map((c) => {
                    if (c.nodeType === Node.TEXT_NODE) {
                      if (isNullOrWhitespace(c.textContent)) {
                        return [];
                      }
                      return c.textContent!;
                    } else if (c.nodeType === Node.ELEMENT_NODE) {
                      return parseListEl(c as HTMLElement);
                    } else {
                      return [];
                    }
                  });
                }
              } else {
                return [];
              }
            } else {
              return [];
            }
          };

          if (listEl.tagName === "OL") {
            return {
              ol: Array.from(listEl.childNodes).map(parseListItem),
              style: "list",
            };
          } else if (listEl.tagName === "UL") {
            return {
              ul: Array.from(listEl.childNodes).map(parseListItem),
              style: "list",
            };
          } else {
            return mapDomToPdfContent(listEl);
          }
        };

        return JSON.parse(
          JSON.stringify(parseListEl(listEl)).replace(/\[\],/g, "")
        );
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
      case "BOLD":
      case "STRONG":
        const strong = el as HTMLElement;
        if (strong.children.length === 0) {
          return {
            text: strong.innerText,
            bold: true,
          };
        } else {
          return Array.from(strong.childNodes)
            .map((el) => mapDomToPdfContent(el))
            .flat();
        }
      case "EM":
      case "ITALIC":
        const em = el as HTMLElement;
        if (em.children.length === 0) {
          return {
            text: em.innerText,
            italics: true,
          };
        } else {
          return Array.from(em.childNodes)
            .map((el) => mapDomToPdfContent(el))
            .flat();
        }
      case "UNDERLINE":
      case "U":
        const u = el as HTMLElement;
        if (u.children.length === 0) {
          return {
            text: u.innerText,
            decoration: "underline",
          };
        } else {
          return Array.from(u.childNodes)
            .map((el) => mapDomToPdfContent(el))
            .flat();
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
    title: { text: getText(textId.table_of_contents), style: "h1" },
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
      text: getText(textId.sources),
      style: "h1",
      tocItem: "mainToc",
      tocStyle: "toc_h1",
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
      opacity: 0.5,
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
            opacity: 0.5,
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
        label: getText(textId.export_pdf),
        action: () => {
          createPdf().open();
        },
      },
      {
        label: getText(textId.download_pdf),
        action: () => {
          createPdf().download(getTitle() + ".pdf");
        },
      },
      {
        label: getText(textId.print),
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
