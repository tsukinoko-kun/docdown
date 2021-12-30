import {
  listenForMessage,
  notifyOnMessage,
  sendMessage,
  service,
} from "../router";
import type { sourceId, ISourceData } from "../ui/Source/SourceTypes";
import type { OutputData } from "@editorjs/editorjs";
import { openDB } from "idb";
import { addDisposableEventListener } from "@frank-mayer/magic/bin";
import { indicateProcess } from "../ui/processingIndicator";

const getEditorData = async () =>
  Object.assign(
    {},
    ...(await Promise.all(sendMessage(service.getSaveData, false)))
  ) as Partial<ISaveData>;

//#region Document Name
let documentName: string = "";
let prevDocumentName: typeof documentName = documentName;
const documentNameEl = document.getElementById(
  "document-name"
) as HTMLInputElement;

const setDocumentName = (newName: string) => {
  prevDocumentName = documentName;
  documentName = newName;
  documentNameEl.value = newName;
};

listenForMessage(service.setDocumentName, setDocumentName);
listenForMessage(service.getDocumentName, () => documentName);
listenForMessage(service.getSaveData, () =>
  Promise.resolve({ name: documentName })
);
listenForMessage(service.initFromData, (data) => {
  if (data.name) {
    setDocumentName(data.name);
  }
});
addDisposableEventListener(documentNameEl, "change", () => {
  sendMessage(service.setDocumentName, true, documentNameEl.value);
});

//preset
setDocumentName("Unnamed Document");
//#endregion

export interface ISaveData {
  sources: { [key: sourceId]: ISourceData };
  editor: OutputData;
  name: string;
}

//#region Download
const downloadTxt = (data: string, fileName: string, mime = "text/plain") => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:${mime};charset=utf-8,${encodeURIComponent(data)}`
  );
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const downloadData = async () => {
  const data = await getEditorData();
  const name = data.name ?? sendMessage(service.getDocumentName);
  downloadTxt(
    JSON.stringify(data, undefined, 2),
    `${name}.json`,
    "application/json"
  );
};
//#endregion

//#region Open
const uploadEl = document.getElementById(
  "upload-file-input"
) as HTMLInputElement;

uploadEl.multiple = false;

uploadEl.onchange = async () => {
  const file = uploadEl.files![0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    const data = JSON.parse(reader.result as string);
    await sendMessage(service.initFromData, true, data);
  };
  reader.readAsText(file);
};

export const uploadData = () => {
  uploadEl.click();
};
//#endregion

//#region store in db
enum stores {
  documents = "documents",
}

openDB("docdown.app", 1, {
  upgrade(db) {
    db.createObjectStore(stores.documents, {
      autoIncrement: true,
    });
  },
})
  .then((db) => {
    const save = () => {
      indicateProcess(async () => {
        const data = await getEditorData();

        if (
          data.editor &&
          data.editor.blocks &&
          data.editor.blocks.length !== 0
        ) {
          await db.put(stores.documents, await getEditorData(), documentName);
        }
      });
    };

    let timerToken: number | undefined = undefined;
    listenForMessage(service.dataChanged, () => {
      if (timerToken !== undefined) {
        window.clearTimeout(timerToken);
      }
      timerToken = window.setTimeout(() => {
        save();
        timerToken = undefined;
      }, 2500);
    });

    notifyOnMessage(service.setDocumentName, () => {
      if (timerToken !== undefined) {
        window.clearTimeout(timerToken);
      }
      db.delete(stores.documents, prevDocumentName);
      timerToken = window.setTimeout(() => {
        save();
        timerToken = undefined;
      }, 2000);
    });

    listenForMessage(service.forEachSavedDocument, (cb) => {
      db.getAll(stores.documents).then((docs) => {
        // order by date (latest first)
        docs.sort((a, b) => b.editor.time - a.editor.time).forEach(cb);
      });
    });
  })
  .catch((err) => {
    if (err) {
      console.error(err);
    }
  });
//#endregion
