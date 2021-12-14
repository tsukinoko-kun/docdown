import type { BlockTool, BlockAPI, SanitizerConfig } from "@editorjs/editorjs";

export interface ITableOfContentsData {
  title: string;
}

export default class TableOfContents implements BlockTool {
  sanitize: SanitizerConfig = {
    p: true,
  };
  api: BlockAPI;
  isReadOnlySupported = true;

  constructor(config?: { api: any }) {
    if (config) {
      this.api = config.api;
    } else {
      throw new Error("Config is needed!");
    }
  }

  save(block: HTMLInputElement): ITableOfContentsData {
    return {
      title: block.innerText,
    };
  }
  render(): HTMLElement {
    const toc = document.createElement("div");
    toc.classList.add("ce-toc");
    toc.setAttribute("data-placeholder", "true");
    toc.spellcheck = true;
    toc.contentEditable = "true";
    toc.innerText = "Table of Contents";
    return toc;
  }

  static get toolbox() {
    return {
      title: "Table of Contents",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z"/></svg>',
    };
  }
}
