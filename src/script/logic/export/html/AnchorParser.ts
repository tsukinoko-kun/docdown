import type { Content } from "pdfmake/interfaces";
import type { IHtmlHelper } from "./HtmlHelper";

export class AnchorParser implements IHtmlHelper {
  fulfillsSchema(node: HTMLElement): boolean {
    return node.tagName === "A";
  }
  parse(node: ChildNode): Content {
    return {
      text: (node as HTMLElement).innerText,
      style: "anchor",
      link: (node as HTMLAnchorElement).href,
    };
  }
}
