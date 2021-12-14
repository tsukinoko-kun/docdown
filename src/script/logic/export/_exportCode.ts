import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content, Style } from "pdfmake/interfaces";
import { syntaxStyles } from "../../data/pdfStylesheet";
import { mapIterableAllowEmpty } from "../dataHelper";
import type { IExportHelper } from "./ExportHelper";

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

    console.debug("codeBox", JSON.stringify(content, undefined, 2));

    return content;
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
      text: lines,
      style: "code",
      // preserveLeadingSpaces: true,
    };
  }

  private parseHtmlCodeWithStyle(el: ChildNode): Content | null {
    if (el.nodeType === Node.ELEMENT_NODE) {
      const style = this.getSyntaxStyleFor(el as HTMLElement);
      if (style) {
        return {
          text: (el as HTMLElement).innerText,
          style,
        };
      } else {
        return (el as HTMLElement).innerText;
      }
    }

    return el.textContent;
  }

  private getSyntaxStyleFor(node: Node): Style | undefined {
    let combinedStyle: Style = {};

    let el: Node | null = node;

    for (let i = 0; i < 5 && el !== null; i++) {
      if ("classList" in el) {
        for (const cls of Array.from((el as HTMLElement).classList)) {
          console.debug("class", cls);
          const style = syntaxStyles.get(cls);
          if (style) {
            combinedStyle = { ...style, ...combinedStyle };
          }
        }
      }

      el = el.parentNode;
    }

    return combinedStyle;
  }
}
