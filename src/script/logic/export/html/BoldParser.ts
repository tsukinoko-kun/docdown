import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class BoldParser implements IHtmlHelper {
  fulfillsSchema(node: Element): boolean {
    return node.tagName === "B";
  }
  getStyle(): Partial<Content> {
    return {
      bold: true,
    };
  }
}
