import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import { IExportHelper, wrapEmoji } from "./ExportHelper";
import { parseHtml } from "./html/parseHtml";

interface ITableData {
  /**
   * Uses the first line as headings
   */
  withHeadings: boolean;

  /**
   * two-dimensional array with table contents
   */
  content: string[][];
}

export class ExportTable implements IExportHelper<ITableData> {
  fulfillsSchema(block: OutputBlockData<string, ITableData>): boolean {
    return block.type === "table";
  }
  parse(block: OutputBlockData<"table", ITableData>): Content {
    return {
      table: {
        body: block.data.content.map((row) =>
          row.map((cell) => wrapEmoji(parseHtml(cell)))
        ),
        headerRows: block.data.withHeadings ? 1 : 0,
      },
    };
  }
}
