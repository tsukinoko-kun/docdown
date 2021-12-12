import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class MarkParser implements IHtmlHelper {
  fulfillsSchema(node: HTMLElement): boolean {
    return node.tagName === "MARK" && node.classList.contains("cdx-marker");
  }
  parse(node: ChildNode): Content {
    return { text: (node as HTMLElement).innerText, style: "mark" };
  }
}
