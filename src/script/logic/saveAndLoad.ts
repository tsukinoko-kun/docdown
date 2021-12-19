import { sendMessage, service } from "../router";
import type { sourceId, ISourceData } from "../ui/Source/SourceTypes";
import type { OutputData } from "@editorjs/editorjs";

export interface ISaveData {
  sources: { [key: sourceId]: ISourceData };
  editor: OutputData;
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
  const data = Object.assign(
    {},
    ...(await Promise.all(sendMessage(service.getSaveData, false)))
  );

  downloadTxt(
    JSON.stringify(data, undefined, 2),
    "data.json",
    "application/json"
  );
};
//#endregion

//#region Upload
const uploadEl = document.getElementById(
  "upload-file-input"
) as HTMLInputElement;

uploadEl.multiple = false;

uploadEl.addEventListener("change", async () => {
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
});

export const uploadData = () => {
  uploadEl.click();
};
//#endregion
