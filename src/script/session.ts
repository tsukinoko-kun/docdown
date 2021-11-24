import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import { exportSourcesJSON, importSourcesJSON } from "./sources";

const sessionId =
  document.location.hash.length > 2
    ? document.location.hash.substring(1)
    : Date.now().toString(36) +
      Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);

document.location.hash = sessionId;

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const getLocalData = () => {
  return {
    markdown: codeEl.value,
    sources: exportSourcesJSON(),
  };
};

export const saveLocal = () => {
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(getLocalData()))
  );
  a.setAttribute("download", sessionId + ".mdd");

  a.style.display = "none";
  document.body.appendChild(a);

  a.click();
  a.remove();
};

export const loadLocal = () => {
  const upload = document.createElement("input");
  upload.setAttribute("type", "file");
  upload.setAttribute("accept", ".mdd");
  addDisposableEventListener(upload, "change", () => {
    if (!upload.files || upload.files.length === 0) {
      disposeNode(upload, true);
      return;
    }

    const file = upload.files[0]!;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);
      console.debug("Loaded local data", data);
      codeEl.value = data.markdown;
      importSourcesJSON(data.sources);
      triggerRender();
      disposeNode(upload, true);
    };
    reader.readAsText(file);
  });
  upload.click();
};
