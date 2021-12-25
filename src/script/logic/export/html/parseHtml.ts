import type { Content } from "pdfmake/interfaces";
import { AnchorParser } from "./AnchorParser";
import { BoldParser } from "./BoldParser";
import type { IHtmlHelper } from "./HtmlHelper";
import { ItalicParser } from "./ItalicParser";
import { MarkParser } from "./MarkParser";

const htmlParsers: Array<IHtmlHelper> = [
  new MarkParser(),
  new BoldParser(),
  new ItalicParser(),
  new AnchorParser(),
];

const getParsedStyle = (el: Element): object => {
  const style: Partial<Content> = {};

  for (const parser of htmlParsers) {
    if (parser.fulfillsSchema(el)) {
      Object.assign(style, parser.getStyle(el));
    }
  }

  return style;
};

export const parseHtml = (text: string, parentStyle: object = {}): Content => {
  let tempEl: HTMLElement = document.createElement("div");
  if (text.startsWith("<") && text.endsWith(">")) {
    tempEl.innerHTML = text;
    tempEl = tempEl.firstElementChild as HTMLElement;
  } else {
    tempEl.innerHTML = text;
  }

  const style: object = { ...parentStyle, ...getParsedStyle(tempEl) };

  if (tempEl.children.length === 0) {
    const innerText = tempEl.innerText;
    tempEl.remove();

    return { ...style, text: innerText };
  } else {
    const content = new Array<Content>();
    for (const child of Array.from(tempEl.childNodes)) {
      console.debug("child", child);
      if (child.nodeType === Node.ELEMENT_NODE) {
        const parsed = parseHtml((child as HTMLElement).outerHTML, style);
        if (Array.isArray(parsed)) {
          content.push(...parsed);
        } else {
          content.push(parsed);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) {
          content.push({ ...style, text: child.textContent });
        }
      }
    }

    tempEl.remove();

    console.debug({ ...style, text: content });
    return { ...style, text: content };
  }
};
