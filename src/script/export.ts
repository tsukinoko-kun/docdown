import { context } from "./alert";
import * as pdfMake from "pdfmake/build/pdfmake";
import { getLocale, getText, textId } from "./local";
import { getTitle } from "./session";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { defaultStyle, fonts, styles, syntaxStyles } from "./pdfStylesheet";
import { getUser } from "./database";
import { hasSources, mapSources } from "./sources";
import {
  isNullOrWhitespace,
  mapArrayAllowEmpty,
  removeEmpty,
} from "./dataHelper";

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

export const sourcesJump = new Map<string, [Content]>();

const addSourceJump = (sup: HTMLElement, sourceId: string) => {
  console.debug("addSourceJump", sourceId);
  const jumpArr = sourcesJump.get(sourceId);
  if (jumpArr) {
    sup.id = `${sourceId}_${jumpArr.length}`;
    jumpArr.push({
      text: "↑" + (jumpArr.length + 1),
      style: "src",
      linkToDestination: sup.id,
    });
    sourcesJump.set(sourceId, jumpArr);
  } else {
    sup.id = `${sourceId}_0`;
    sourcesJump.set(sourceId, [
      { text: "↑1", style: "src", linkToDestination: sup.id },
    ]);
  }
};

const mapSyntaxToPdfContent = (el: Node): Content | null => {
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
      return mapArrayAllowEmpty(
        Array.from(el.childNodes),
        mapSyntaxToPdfContent
      ).flat();
    }
  } else {
    if (!el.textContent) {
      return null;
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

const mapDomToPdfContent = (el: Node): Content | null => {
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
        const parseListEl = (listEl: HTMLElement): Content | null => {
          const parseListItem = (li: ChildNode): Content => {
            if (li.nodeType === Node.TEXT_NODE) {
              if (isNullOrWhitespace(li.textContent)) {
                return null!;
              }
              return li.textContent!;
            } else if (li.nodeType === Node.ELEMENT_NODE) {
              const liEl = li as HTMLElement;
              if (liEl.tagName === "LI") {
                if (liEl.children.length === 0) {
                  if (isNullOrWhitespace(liEl.textContent)) {
                    return null!;
                  }
                  return liEl.innerText;
                } else {
                  return mapArrayAllowEmpty(
                    Array.from(liEl.childNodes),
                    (c) => {
                      if (c.nodeType === Node.TEXT_NODE) {
                        if (isNullOrWhitespace(c.textContent)) {
                          return null!;
                        }
                        return c.textContent!;
                      } else if (c.nodeType === Node.ELEMENT_NODE) {
                        return parseListEl(c as HTMLElement);
                      } else {
                        return null!;
                      }
                    }
                  );
                }
              } else {
                return null!;
              }
            } else {
              return null!;
            }
          };

          if (listEl.tagName === "OL") {
            return {
              ol: mapArrayAllowEmpty(
                Array.from(listEl.childNodes),
                parseListItem
              ),
              style: "list",
            };
          } else if (listEl.tagName === "UL") {
            return {
              ul: mapArrayAllowEmpty(
                Array.from(listEl.childNodes),
                parseListItem
              ),
              style: "list",
            };
          } else {
            return mapDomToPdfContent(listEl);
          }
        };

        return parseListEl(listEl);
      case "PRE":
        const pre = el as HTMLPreElement;
        if (pre.children.length === 0) {
          return {
            text: pre.innerText,
            style: "code",
            font: "JetBrainsMono",
          };
        } else {
          return mapArrayAllowEmpty(Array.from(pre.childNodes), (el) =>
            mapDomToPdfContent(el)
          );
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
          return { text: img.alt, style: "span" };
        }
      case "TABLE":
        const table = el as HTMLTableElement;

        let headerRows = 0;
        let oddEven = false;

        return {
          table: {
            widths: "auto",
            layout: "headerLineOnly",
            dontBreakRows: true,
            body: mapArrayAllowEmpty(Array.from(table.rows), (row) => {
              let containsTableHead = false;

              const pdfRow = mapArrayAllowEmpty(
                Array.from(row.cells),
                (cell) => {
                  if (cell.tagName === "TH") {
                    containsTableHead = true;
                  }
                  return {
                    text: cell.innerText,
                    style: cell.tagName.toLowerCase(),
                    fillColor: oddEven ? "#f2f2f2" : "white",
                  };
                }
              );

              if (containsTableHead) {
                headerRows++;
              }

              oddEven = !oddEven;

              return pdfRow;
            }),
            headerRows,
            keepWithHeaderRows: headerRows,
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
          return mapArrayAllowEmpty(Array.from(a.childNodes), (el) =>
            mapDomToPdfContent(el)
          ).flat();
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
            text: mapArrayAllowEmpty(Array.from(code.childNodes), (el) =>
              mapSyntaxToPdfContent(el)
            ).flat(),
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
          return mapArrayAllowEmpty(Array.from(strong.childNodes), (el) =>
            mapDomToPdfContent(el)
          ).flat();
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
          return mapArrayAllowEmpty(Array.from(em.childNodes), (el) =>
            mapDomToPdfContent(el)
          ).flat();
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
          return mapArrayAllowEmpty(Array.from(u.childNodes), (el) =>
            mapDomToPdfContent(el)
          ).flat();
        }
      case "SUP":
        const sup = el as HTMLElement;
        const src = sup.getAttribute("src");
        if (src) {
          addSourceJump(sup, src);
          return {
            id: sup.id,
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
              x2: 434,
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
              return null;
            }
          }
        } else {
          return {
            text: mapArrayAllowEmpty(Array.from(el.childNodes), (el) =>
              mapDomToPdfContent(el)
            ).flat(),
          };
        }
    }
  } else {
    if (el.textContent) {
      return {
        text: el.textContent,
      };
    } else {
      return null;
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

const sources = (): Content | null => {
  if (!hasSources()) {
    return null;
  }

  console.debug(sourcesJump);

  return removeEmpty([
    {
      pageBreak: "before",
      text: getText(textId.sources),
      style: "h1",
      tocItem: "mainToc",
      tocStyle: "toc_h1",
    },
    {
      ol: mapSources<Content>((s) => {
        console.debug(s.id, sourcesJump.get(s.id));
        return {
          text: [
            ...sourcesJump.get(s.id)!,
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
  ]);
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
    content: removeEmpty([
      title(),
      toc,
      ...mapArrayAllowEmpty<ChildNode, Content>(
        Array.from(displayEl.childNodes),
        mapDomToPdfContent
      ),
      sources(),
    ]),
    footer: (currentPage, pageCount) =>
      currentPage === 1
        ? null
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

export const createPdf = () => {
  sourcesJump.clear();
  return pdfMake.createPdf(createDocDefinition(), undefined, fonts);
};

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
