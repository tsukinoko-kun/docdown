import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import type { IExportHelper } from "./ExportHelper";

type listStyle = "ordered" | "unordered";

interface IListData {
  items: Array<string>;
  style: listStyle;
}

export class ExportList implements IExportHelper<IListData> {
  fulfillsSchema(block: OutputBlockData<string, IListData>): boolean {
    return block.type === "list";
  }
  parse(block: OutputBlockData<"list", IListData>): Content {
    const { items, style } = block.data;

    if (style === "unordered") {
      return {
        ul: items,
      };
    } else {
      return {
        ol: items,
      };
    }
  }
}
