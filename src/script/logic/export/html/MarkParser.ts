import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class MarkParser implements IHtmlHelper {
  fulfillsSchema(node: Element): boolean {
    return node.tagName === "MARK" && node.classList.contains("cdx-marker");
  }
  getStyle(): Partial<Content> {
    return { style: "mark" };
  }
}
