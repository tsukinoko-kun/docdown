import { sendMessage, service } from "../router";
import { downloadData, ISaveData, uploadData } from "../logic/saveAndLoad";
import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";

document.getElementById("pdf")?.addEventListener("click", () => {
  sendMessage(service.createPdf, true, 2);
});

document.getElementById("download")?.addEventListener("click", downloadData);
document.getElementById("open")?.addEventListener("click", () => {
  const recent = document.createElement("ul");
  recent.className = "recent";
  sendMessage(service.forEachSavedDocument, true, (doc) => {
    if (doc.name && doc.editor) {
      const item = document.createElement("li");
      item.innerText = doc.name;
      recent.appendChild(item);
      addDisposableEventListener(item, "click", () => {
        sendMessage(service.initFromData, true, doc as ISaveData);
        disposeNode(ui);
      });
    }
  });

  const upload = document.createElement("p");
  upload.className = "button";
  upload.innerText = "Upload";
  addDisposableEventListener(upload, "click", () => {
    disposeNode(ui);
    uploadData();
  });

  const ctrl = document.createElement("ul");
  ctrl.className = "ctrl";
  ctrl.appendChild(upload);

  const form = document.createElement("div");
  form.appendChild(recent);
  form.appendChild(ctrl);

  const ui = document.createElement("div");
  ui.className = "open-file";
  ui.appendChild(form);
  document.body.appendChild(ui);
  addDisposableEventListener(ui, "click", () => {
    disposeNode(ui);
  });
});
