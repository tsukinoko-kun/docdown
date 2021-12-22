import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class ItalicParser implements IHtmlHelper {
  fulfillsSchema(node: HTMLElement): boolean {
    return node.tagName === "I";
  }
  parse(node: ChildNode): Content {
    return {
      text: (node as HTMLElement).innerText,
      italics: true,
    };
  }
}
