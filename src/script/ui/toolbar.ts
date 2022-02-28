import { sendMessage, service } from "../router";
import { downloadData, ISaveData, uploadData } from "../logic/saveAndLoad";
import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import { defaultStyle } from "../data/pdfStylesheet";

document.getElementById("preview-pdf")?.addEventListener("click", () => {
  sendMessage(service.createPdf, true, 2);
});
document.getElementById("download-pdf")?.addEventListener("click", () => {
  sendMessage(service.createPdf, true, 1);
});

document.getElementById("download")?.addEventListener("click", downloadData);
document.getElementById("formatting-signs")?.addEventListener("click", () => {
  document.body.classList.toggle("formatting-signs");
});

const fontSizeEl = document.getElementById("font-size") as HTMLInputElement;
if (fontSizeEl) {
  fontSizeEl.addEventListener("change", () => {
    const value = Number(fontSizeEl.value);
    defaultStyle.fontSize = value;
    document.body.style.setProperty("--font-size", `${value}pt`);
  });
}

const open = () => {
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
};
document.getElementById("open")?.addEventListener("click", () => {
  open();
});

addDisposableEventListener(
  document,
  "keydown",
  (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      switch (ev.key) {
        case "o":
          ev.preventDefault();
          ev.stopPropagation();
          open();
          break;
        case "s":
          ev.preventDefault();
          ev.stopPropagation();
          downloadData();
          break;
        case "p":
          ev.preventDefault();
          ev.stopPropagation();
          sendMessage(service.createPdf, true, 0);
          break;
      }
    }
  },
  {
    capture: true,
    passive: false,
  }
);
