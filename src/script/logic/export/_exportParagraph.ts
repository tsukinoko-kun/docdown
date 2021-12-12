import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import type { IExportHelper } from "./ExportHelper";
import { parseMark } from "./_parseMark";

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
        text: parseMark(block.data.text),
      };
    }

    return { text: parseMark(block.data.text) };
  }
}
