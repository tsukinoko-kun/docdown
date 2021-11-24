import { addDisposableEventListener } from "@frank-mayer/magic/bin";
import { context, ContextOption } from "./context";
import xxhash from "xxhash-wasm";
import { insertText } from "./editor";
import { triggerRender } from "./render";

let exportSourcesRegisterIntern:
  | ((sources: Array<string>) => string)
  | undefined = undefined;
export const exportSourcesRegister = (sources: Array<string>) =>
  exportSourcesRegisterIntern ? exportSourcesRegisterIntern(sources) : "";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

export const sourceTag = /(?<=<source>)[0-9a-f]+(?=<\/source>)/g;

xxhash().then((xxh) => {
  class SourceData {
    id: string;
    author: string;
    title: string;
    creationDate: string;
    lastAccessed: string;

    constructor(
      author: string,
      title: string,
      creationDate: string,
      lastAccessed: string
    ) {
      this.author = author;
      this.title = title;
      this.creationDate = creationDate;
      this.lastAccessed = lastAccessed;

      this.id = xxh.h64(`${author}-${title}-${creationDate}-${lastAccessed}`);
    }

    toString(): string;
    toString(shorten: boolean): string;
    toString(shorten: boolean = false) {
      const str = `${this.author} - ${this.title}`;
      if (shorten) {
        return str.length > 25 ? str.substring(0, 23) + "…" : str;
      }

      return str;
    }
  }

  const sourcesRegister = new Map<string, SourceData>();

  exportSourcesRegisterIntern = (sources: Array<string>) =>
    sources.length === 0
      ? ""
      : "<h1>Sources</h1><ol>" +
        sources
          .map((sourceId) => {
            const sourceData = sourcesRegister.get(sourceId);
            if (sourceData) {
              return `<li>${sourceData.toString()}</li>`;
            }
            return "<li>Unknown source</li>";
          })
          .join("") +
        "</ol>";

  const sourcesEl = document.getElementById("sources") as HTMLUListElement;

  const useSource = (source: SourceData) => {
    if (document.activeElement === codeEl) {
      insertText(codeEl, `<source>${source.id}</source>`);
      triggerRender();
    }
  };

  const contextOptionAdd: ContextOption = {
    display: "Add New",
    action: () => {
      const sourceData = new SourceData(
        "Random Guy",
        "New super cool source",
        new Date().toISOString(),
        new Date().toISOString()
      );

      sourcesRegister.set(sourceData.id, sourceData);

      const li = document.createElement("li");
      li.innerText = sourceData.toString(true);
      li.title = sourceData.toString();
      addDisposableEventListener(
        li,
        "mousedown",
        (ev) => {
          ev.preventDefault();
          useSource(sourceData);
        },
        {
          capture: true,
          passive: false,
        }
      );
      sourcesEl.appendChild(li);
    },
  };

  sourcesEl.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();

    let tEl = ev.target as HTMLElement | null;
    while (tEl) {
      if (tEl.tagName === "LI") {
        context(ev, [
          contextOptionAdd,
          {
            display: "Delete",
            action: () => {
              sourcesRegister.delete(tEl!.innerText);
              tEl!.remove();
            },
          },
        ]);

        return;
      }

      tEl = tEl.parentElement;
    }

    context(ev, [contextOptionAdd]);
  });
});
