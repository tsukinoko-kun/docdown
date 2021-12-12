import type { Content } from "pdfmake/interfaces";

export interface IHtmlHelper {
  fulfillsSchema(node: ChildNode): boolean;
  parse(node: ChildNode): Content;
}
