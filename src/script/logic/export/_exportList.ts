import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import { IExportHelper, wrapEmoji } from "./ExportHelper";
import { parseHtml } from "./html/parseHtml";

type listStyle = "ordered" | "unordered";

interface INestedList {
  content: string;
  items: Array<INestedList>;
}

interface IListData {
  items: Array<INestedList>;
  style: listStyle;
}

export class ExportList implements IExportHelper<IListData> {
  fulfillsSchema(block: OutputBlockData<string, IListData>): boolean {
    return block.type === "list";
  }

  private unwrapList(list: Array<Content>): Content {
    if (list.length === 1) {
      return list[0]!;
    } else {
      return list;
    }
  }

  private mapNestedList(
    nestedListItem: INestedList,
    style: listStyle
  ): Array<Content> {
    const data = new Array<Content>();

    if (nestedListItem.content) {
      data.push(wrapEmoji(parseHtml(nestedListItem.content)));
    }

    if (nestedListItem.items.length > 0) {
      data.push(
        style === "ordered"
          ? {
              ol: nestedListItem.items.map((item) =>
                this.unwrapList(this.mapNestedList(item, style))
              ),
            }
          : {
              ul: nestedListItem.items.map((item) =>
                this.unwrapList(this.mapNestedList(item, style))
              ),
            }
      );
    }

    return data;
  }

  parse(block: OutputBlockData<"list", IListData>): Content {
    const { items, style } = block.data;

    const listPdfData = new Array<Content>();
    for (const item of items) {
      listPdfData.push(...this.mapNestedList(item, style));
    }

    if (style === "unordered") {
      return {
        ul: listPdfData,
      };
    } else {
      return {
        ol: listPdfData,
      };
    }
  }
}
