import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import type { IExportHelper } from "./ExportHelper";

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
        body: block.data.content,
        headerRows: block.data.withHeadings ? 1 : 0,
      },
    };
  }
}
