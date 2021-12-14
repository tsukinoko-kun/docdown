import { sendMessage, service } from "../router";

//#region Download
const downloadTxt = (data: string, fileName: string) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(data)
  );
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const downloadData = async () => {
  const data = await sendMessage(service.getDocumentData);
  if (data) {
    downloadTxt(JSON.stringify(data, undefined, 2), "data.json");
  } else {
    console.error(new Error("No data to export"));
  }
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
    await sendMessage(service.setDocumentData, data);
  };
  reader.readAsText(file);
});

export const uploadData = () => {
  uploadEl.click();
};
//#endregion
