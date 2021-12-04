import { deleteAllSubstringsInText } from "../ui/editor";
import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import { h64 } from "xxhashjs";
import { userAlert, userForm, context } from "../ui/alert";
import { getLocale, getText, textId } from "../data/local";

import type { ContextOption } from "../ui/alert";
import { sendMessage, service } from "../router";

const sourcesEl = document.getElementById("sources") as HTMLUListElement;
const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const hashSeed = 0x12345678;

export interface ISourceData {
  id: string;
  author: string;
  title: string;
  creationDate: number | null;
  lastAccessed: number;
  link: string;
}

const sourceDataToString = (
  sourceData: ISourceData,
  shorten: boolean = false
) => {
  if (shorten) {
    const str = `${sourceData.author} - ${sourceData.title}`;
    return str.length > 25 ? str.substring(0, 23) + "…" : str;
  } else {
    const lastAcc = new Date(sourceData.lastAccessed).toLocaleDateString(
      getLocale()
    );
    const creationDate = sourceData.creationDate
      ? new Date(sourceData.creationDate).toLocaleDateString(getLocale())
      : getText(textId.unknown);
    return [
      sourceData.author,
      sourceData.title,
      getText(textId.creation_date) + " " + creationDate,
      getText(textId.last_accessed_at) + " " + lastAcc,
      sourceData.link,
    ].join(", ");
  }
};

const sourcesRegister = new Map<string, ISourceData>();

const useSource = (source: ISourceData) => {
  if (document.activeElement === codeEl) {
    sendMessage(service.insertText, {
      textEl: codeEl,
      textToInsert: `<src>${source.id}</src>`,
    });
    sendMessage(service.triggerRender, undefined);
  }
};

function createLiFromSource(sourceData: ISourceData) {
  const li = document.createElement("li");
  li.innerText = sourceDataToString(sourceData, true);
  li.title = sourceDataToString(sourceData, false);
  li.id = sourceData.id;
  addDisposableEventListener(
    li,
    "mousedown",
    (ev) => {
      if (ev.button !== 0) {
        return;
      }

      useSource(sourceData);
    },
    {
      passive: true,
      capture: true,
    }
  );
  return li;
}

let usedSources = new Array<string>();
export const setUsedSources = (sources: string[]) => {
  usedSources = sources;
};

export const hasSources = () => usedSources.length > 0;

interface ISourceExport {
  author: string;
  title: string;
  creationDate: string;
  lastAccessed: string;
  link: string;
  id: string;
}
export const mapSources = <T>(callbackfn: (data: ISourceExport) => T): T[] => {
  const returnValue = new Array<T>();

  for (const sourceId of usedSources) {
    const sourceData = sourcesRegister.get(sourceId);
    if (sourceData) {
      returnValue.push(
        callbackfn({
          author: sourceData.author,
          title: sourceData.title,
          creationDate:
            getText(textId.creation_date) +
            " " +
            (sourceData.creationDate
              ? new Date(sourceData.creationDate).toLocaleDateString(
                  getLocale()
                )
              : getText(textId.unknown)),
          lastAccessed:
            getText(textId.last_accessed_at) +
            " " +
            new Date(sourceData.lastAccessed).toLocaleDateString(getLocale()),
          link: sourceData.link,
          id: sourceData.id,
        })
      );
    } else {
      userAlert(`${getText(textId.unknown_source)} "${sourceId}"`);
      returnValue.push(
        callbackfn({
          author: "",
          title: "",
          creationDate: "",
          lastAccessed: "",
          link: "",
          id: sourceId,
        })
      );
    }
  }

  return returnValue;
};

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

export const sourceTag = /(?<=<src>)[0-9a-z]+(?=<\/src>)/g;

class SourceData implements ISourceData {
  id: string;
  author: string;
  title: string;
  creationDate: number | null;
  lastAccessed: number;
  link: string;

  constructor(
    author: string,
    title: string,
    creationDate: number | null,
    lastAccessed: number,
    link: string
  ) {
    this.author = author;
    this.title = title;
    this.creationDate = creationDate;
    this.lastAccessed = lastAccessed;
    this.link = link;

    this.id = h64(
      `${author}-${title}-${creationDate}-${lastAccessed}-${link}`,
      hashSeed
    ).toString(36);
  }

  static from(data: {
    author: string;
    title: string;
    creationDate: string | null;
    lastAccessed: string;
    link: string;
  }) {
    return new SourceData(
      data.author,
      data.title,
      data.creationDate ? new Date(data.creationDate).getTime() : null,
      new Date(data.lastAccessed).getTime(),
      data.link
    );
  }
}

const contextOptionAdd: ContextOption = {
  label: getText(textId.add_source),
  action: () => {
    const today = new Date().toISOString().split("T")[0]!;
    userForm([
      {
        name: "author",
        label: getText(textId.author),
        required: true,
        type: "text",
      },
      {
        name: "title",
        label: getText(textId.title),
        required: true,
        type: "text",
      },
      {
        name: "creationDate",
        label: getText(textId.creation_date),
        required: false,
        type: "date",
        max: today,
      },
      {
        name: "lastAccessed",
        label: getText(textId.last_access),
        required: true,
        type: "date",
        value: today,
        max: today,
      },
      {
        name: "link",
        label: getText(textId.link) + " (URL)",
        placeholder: "https://example.com",
        required: true,
        type: "url",
      },
    ])
      .then((data) => {
        const sourceData = SourceData.from(data);
        sourcesRegister.set(sourceData.id, sourceData);
        sourcesEl.appendChild(createLiFromSource(sourceData));
        sendMessage(service.setChanged, {
          sources: exportSourcesJSON(),
        });
      })
      .catch((err) => {
        if (err) {
          console.info(err);
        }
      });
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
            label: getText(textId.delete_source),
            action: () => {
              sourcesRegister.delete(tEl!.id);
              deleteAllSubstringsInText(codeEl, `<src>${tEl!.id}</src>`);
              disposeNode(tEl!);
              sendMessage(service.triggerRender, undefined);
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
