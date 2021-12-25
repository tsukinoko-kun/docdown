import type { Content } from "pdfmake/interfaces";
import { styles } from "../../../data/pdfStylesheet";
import type { IHtmlHelper } from "./HtmlHelper";

export class AnchorParser implements IHtmlHelper {
  fulfillsSchema(node: Element): boolean {
    return node.tagName === "A";
  }
  getStyle(node: ChildNode): Partial<Content> {
    return { link: (node as HTMLAnchorElement).href, ...styles().anchor };
  }
}
