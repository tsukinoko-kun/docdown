import type { Content } from "pdfmake/interfaces";

export interface IHtmlHelper {
  fulfillsSchema(node: Element): boolean;
  getStyle(node: ChildNode): Partial<Content>;
}
