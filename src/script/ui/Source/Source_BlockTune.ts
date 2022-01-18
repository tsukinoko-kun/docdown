import type { API, BlockTune, ToolConfig, BlockAPI } from "@editorjs/editorjs";
import { addDisposableEventListener } from "@frank-mayer/magic";
import { SourcesManager } from "./SourcesManager";
import type { sourceId } from "./SourceTypes";

export default class Source implements BlockTune {
  private readonly api: API;
  private get sources(): Array<sourceId> {
    return this.sourcesManager.sources;
  }
  private blockContent: HTMLElement | undefined = undefined;
  private readonly sourcesManager: SourcesManager;

  public static get isTune() {
    return true;
  }

  public constructor(config: {
    api: API;
    config?: ToolConfig;
    block: BlockAPI;
    data?: Array<sourceId>;
  }) {
    this.api = config.api;
    this.sourcesManager = new SourcesManager(config.data);
  }

  public render(): HTMLElement {
    const button = document.createElement("div");
    addDisposableEventListener(button, "click", () => {
      this.sourcesManager
        .triggerSelectSource()
        .then((sources) => {
          this.setDataSource(sources);
        })
        .catch((err) => {
          if (err) {
            console.error(err);
          }
        });
    });

    button.classList.add(this.api.styles.settingsButton);
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7.17 17c.51 0 .98-.29 1.2-.74l1.42-2.84c.14-.28.21-.58.21-.89V8c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2l-1.03 2.06c-.45.89.2 1.94 1.2 1.94zm10 0c.51 0 .98-.29 1.2-.74l1.42-2.84c.14-.28.21-.58.21-.89V8c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2l-1.03 2.06c-.45.89.2 1.94 1.2 1.94z"/></svg>';

    return button;
  }

  public save(): Array<sourceId> {
    return this.sources ?? [];
  }

  private setDataSource(sources: Array<sourceId> = this.sources) {
    if (this.blockContent) {
      if (sources.length === 0) {
        this.blockContent.removeAttribute("data-sources");
      } else {
        this.blockContent.setAttribute("data-sources", JSON.stringify(sources));
      }
    }
  }

  public wrap(blockContent: HTMLElement): HTMLElement {
    this.blockContent = blockContent;

    this.setDataSource();

    return blockContent;
  }
}
