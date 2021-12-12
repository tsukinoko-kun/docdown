import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class BoldParser implements IHtmlHelper {
  fulfillsSchema(node: HTMLElement): boolean {
    return node.tagName === "B";
  }
  parse(node: ChildNode): Content {
    return {
      text: (node as HTMLElement).innerText,
      bold: true,
    };
  }
}
