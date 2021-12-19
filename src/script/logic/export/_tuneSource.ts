import type { Content } from "pdfmake/interfaces";
import type { sourceId } from "../../ui/Source";
import type { ITuneHelper } from "./TuneHelper";

export class TuneSource implements ITuneHelper<Array<sourceId>> {
  fulfillsSchema(name: string, data: any): boolean {
    return name === "source" && Array.isArray(data) && data.length !== 0;
  }

  tune(
    content: Content & { [key: string]: any },
    data: Array<sourceId>
  ): Content {
    const sourceElements: Content =
      data.length > 1
        ? {
            text: ["[", data.map((id) => ({ text: id })), "]"],
            style: "src",
          }
        : { text: "[" + data[0]! + "]", style: "src" };

    if (content.text) {
      if (Array.isArray(content.text)) {
        content.text.push(sourceElements);
      } else if (typeof content.text === "string") {
        content.text = [content.text, sourceElements];
      }
    }

    return content;
  }
}
