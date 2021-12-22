import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content, Style } from "pdfmake/interfaces";
import { syntaxStyles } from "../../data/pdfStylesheet";
import { mapIterableAllowEmpty, tryFlatIfArray } from "../dataHelper";
import { IExportHelper, wrapEmoji } from "./ExportHelper";

interface ICodeBoxData {
  code: string;
  language: string;
  theme: string;
}

export class ExportCodeBox implements IExportHelper<ICodeBoxData> {
  public fulfillsSchema(block: OutputBlockData<string, ICodeBoxData>): boolean {
    return block.type === "codeBox";
  }

  public parse(block: OutputBlockData<"codeBox", ICodeBoxData>): Content {
    const content = this.parseHtml(block.data.code);

    if (block.id) {
      (content as any).id = block.id;
    }

    return tryFlatIfArray(content as Array<Content>);
  }

  private parseHtml(code: string): Content {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = code;

    const lines = mapIterableAllowEmpty<ChildNode, Content>(
      Array.from(tempEl.childNodes),
      (line) => this.parseHtmlCodeWithStyle(line)
    );

    tempEl.remove();

    return {
      text: wrapEmoji(tryFlatIfArray(lines)),
      style: "code",
    };
  }

  private parseHtmlCodeWithStyle(el: ChildNode): Content | null {
    if (el.nodeType === Node.ELEMENT_NODE) {
      if (el.childNodes.length === 0) {
        const style = this.getSyntaxStyleFor(el as HTMLElement);
        if (style) {
          return {
            text: (el as HTMLElement).innerText,
            style,
          };
        } else {
          return (el as HTMLElement).innerText;
        }
      } else {
        const snippets = mapIterableAllowEmpty<ChildNode, Content>(
          Array.from(el.childNodes),
          (snippet) => this.parseHtmlCodeWithStyle(snippet)
        );

        return tryFlatIfArray(snippets);
      }
    }

    if (el.textContent) {
      const style = this.getSyntaxStyleFor(el.parentElement as HTMLElement);
      if (style) {
        return {
          text: el.textContent,
          style,
        };
      } else {
        return el.textContent;
      }
    }
    return null;
  }

  private getSyntaxStyleFor(node: Node): Style | undefined {
    let combinedStyle: Style = {};

    let el: null | HTMLElement = node as HTMLElement;

    for (let i = 0; i < 10 && el !== null; i++) {
      if ("classList" in el) {
        for (const cls of Array.from((el as HTMLElement).classList)) {
          const style = syntaxStyles.get(cls);
          if (style) {
            combinedStyle = { ...style, ...combinedStyle };
          }
        }
      }

      el = el.parentNode as HTMLElement;
    }

    return combinedStyle;
  }
}
