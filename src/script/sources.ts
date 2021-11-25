import { context, ContextOption } from "./context";
import { insertText } from "./editor";
import { addDisposableEventListener } from "@frank-mayer/magic/bin";
import xxhash from "xxhash-wasm";

const sourcesEl = document.getElementById("sources") as HTMLUListElement;
const codeEl = document.getElementById("code") as HTMLTextAreaElement;

interface ISourceData {
  id: string;
  author: string;
  title: string;
  creationDate: string;
  lastAccessed: string;
}

const sourceDataToString = (
  sourceData: ISourceData,
  shorten: boolean = false
) => {
  const str = `${sourceData.author} - ${sourceData.title}`;
  if (shorten) {
    return str.length > 25 ? str.substring(0, 23) + "…" : str;
  }

  return str;
};

const sourcesRegister = new Map<string, ISourceData>();

const useSource = (source: ISourceData) => {
  if (document.activeElement === codeEl) {
    insertText(codeEl, `<source>${source.id}</source>`);
    triggerRender();
  }
};

function createLiFromSource(sourceData: ISourceData) {
  const li = document.createElement("li");
  li.innerText = sourceDataToString(sourceData, true);
  li.title = sourceDataToString(sourceData);
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
  return li;
}

export const exportSourcesRegister = (sources: Array<string>) =>
  sources.length === 0
    ? ""
    : "<h1>Sources</h1><ol>" +
      sources
        .map((sourceId) => {
          const sourceData = sourcesRegister.get(sourceId);
          if (sourceData) {
            return `<li>${sourceDataToString(sourceData)}</li>`;
          }
          return "<li>Unknown source</li>";
        })
        .join("") +
      "</ol>";

export const exportSourcesJSON = () => Array.from(sourcesRegister.values());
export const importSourcesJSON = (sources: IterableIterator<ISourceData>) => {
  sourcesRegister.clear();
  sourcesEl.innerHTML = "";
  if (Array.isArray(sources)) {
    for (const source of sources) {
      sourcesRegister.set(source.id, source);

      sourcesEl.appendChild(createLiFromSource(source));
    }
  }
};

export const sourceTag = /(?<=<source>)[0-9a-z]+(?=<\/source>)/g;

xxhash().then((xxh) => {
  class SourceData implements ISourceData {
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

      this.id = Number.parseInt(
        "0x" + xxh.h64(`${author}-${title}-${creationDate}-${lastAccessed}`)
      ).toString(36);
    }
  }

  const contextOptionAdd: ContextOption = {
    label: "Add New",
    action: () => {
      const sourceData = new SourceData(
        "Random Guy",
        "New super cool source",
        new Date().toISOString(),
        new Date().toISOString()
      );

      sourcesRegister.set(sourceData.id, sourceData);

      sourcesEl.appendChild(createLiFromSource(sourceData));
    },
  };

  sourcesEl.addEventListener(
    "contextmenu",
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      let tEl = ev.target as HTMLElement | null;
      while (tEl) {
        if (tEl.tagName === "LI") {
          context(ev, [
            contextOptionAdd,
            {
              label: "Delete",
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
    },
    {
      capture: true,
      passive: false,
    }
  );
});
