import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import type { IExportHelper } from "./ExportHelper";
import { parseHtml } from "./html/parseHtml";

interface IQuoteData {
  /** quote's text */
  text: string;

  /** caption or an author */
  caption: string;

  alignment: "left" | "center";
}

export class ExportQuote implements IExportHelper<IQuoteData> {
  fulfillsSchema(block: OutputBlockData<string, IQuoteData>): boolean {
    return block.type === "quote";
  }
  parse(block: OutputBlockData<"quote", IQuoteData>): Content {
    const content: Content = {
      alignment: block.data.alignment,
      text: block.data.caption
        ? [
            {
              text: ["„", ...parseHtml(block.data.text), "“"],
            },
            {
              text: [" — ", ...parseHtml(block.data.caption)],
              style: "caption",
            },
          ]
        : "„" + block.data.text + "“",
    };

    if (block.id) {
      return {
        ...content,
        id: block.id,
      };
    } else {
      return content;
    }
  }
}
