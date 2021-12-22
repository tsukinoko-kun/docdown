import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import { flatArrayKeepAsArray } from "../../data/flatArrayLevel";
import { mapIterableAllowEmpty } from "../dataHelper";

export interface IExportHelper<T extends object = any> {
  fulfillsSchema(data: OutputBlockData<string, any>): boolean;
  parse(data: OutputBlockData<string, T>): Content | Promise<Content>;
}

const emojiSplitRegex =
  /(?<=\p{Extended_Pictographic})|(?=\p{Extended_Pictographic})/gu;
const emojiRegex = /^\p{Extended_Pictographic}$/u;
export const wrapEmoji = (
  text: Content | Array<Content>
): Content | Array<Content> => {
  if (Array.isArray(text)) {
    return flatArrayKeepAsArray(text.map(wrapEmoji));
  }

  if (typeof text !== "string") {
    if ((text as any).text) {
      (text as any).text = wrapEmoji((text as any).text);
      return text;
    }

    return text;
  }

  const content = mapIterableAllowEmpty(text.split(emojiSplitRegex), (el) => {
    if (el.length > 0) {
      if (emojiRegex.test(el)) {
        return { text: el, style: "emoji" };
      } else {
        return el;
      }
    }

    return undefined;
  });

  if (content.length === 1) {
    return content[0] as string;
  } else {
    return content;
  }
};
