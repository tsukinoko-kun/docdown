import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import type { IExportHelper } from "./ExportHelper";
import { parseHtml } from "./html/parseHtml";

interface IParagraphData {
  text: string;
}

export class ExportParagraph implements IExportHelper<IParagraphData> {
  fulfillsSchema(block: OutputBlockData<string, IParagraphData>): boolean {
    return block.type === "paragraph";
  }
  parse(block: OutputBlockData<"paragraph", IParagraphData>): Content {
    if (block.id) {
      return {
        id: block.id,
        text: parseHtml(block.data.text),
      };
    }

    return { text: parseHtml(block.data.text) };
  }
}
