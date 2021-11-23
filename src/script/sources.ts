import { addDisposableEventListener } from "@frank-mayer/magic/bin";
import { context } from "./context";
import xxhash from "xxhash-wasm";

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

    toString() {
      const str = `${this.author} - ${this.title}`;
      return str.length >= 25 ? str.substring(0, 25) + "…" : str;
    }
  }

  const sourcesEl = document.getElementById("sources");

  if (!sourcesEl) {
    throw new Error("No sources element found");
  }

  const useSource = (source: SourceData) => {
    document.execCommand("insertText", false, `<source>${source.id}</source>`);
  };

  sourcesEl.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    context(ev, [
      {
        display: "Add New",
        action: () => {
          const sourceData = new SourceData(
            "Random Guy",
            "New super cool source",
            new Date().toISOString(),
            new Date().toISOString()
          );

          const li = document.createElement("li");
          li.innerText = sourceData.toString();
          addDisposableEventListener(
            li,
            "click",
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
      },
    ]);
  });
});
