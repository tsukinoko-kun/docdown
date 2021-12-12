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

export const parseHtml = (text: string): Array<Content> => {
  console.debug("parseHtml", text, typeof text);
  const tempHtml = document.createElement("div");
  tempHtml.innerHTML = text;

  const content = new Array<Content>();

  for (const el of Array.from(tempHtml.childNodes)) {
    if (el.textContent) {
      if (el.nodeType === Node.ELEMENT_NODE) {
        let done = false;
        for (const parser of htmlParsers) {
          if (parser.fulfillsSchema(el)) {
            content.push(parser.parse(el));
            done = true;
            break;
          }
        }
        if (!done) {
          if ("innerText" in el) {
            content.push((el as HTMLElement).innerText);
          } else {
            content.push(el.textContent);
          }
        }
      } else {
        content.push(el.textContent);
      }
    }
  }

  return content;
};
