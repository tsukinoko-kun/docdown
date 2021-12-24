import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import { IExportHelper, wrapEmoji } from "./ExportHelper";
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
        text: wrapEmoji(parseHtml(block.data.text)),
        style: "paragraph",
      };
    }

    return { text: wrapEmoji(parseHtml(block.data.text)), style: "paragraph" };
  }
}
