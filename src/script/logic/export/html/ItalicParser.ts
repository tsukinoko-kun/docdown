import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class ItalicParser implements IHtmlHelper {
  fulfillsSchema(node: Element): boolean {
    return node.tagName === "I";
  }
  getStyle(): Partial<Content> {
    return {
      italics: true,
    };
  }
}
