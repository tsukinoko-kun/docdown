import { sendMessage, service } from "../router";
import { downloadData, uploadData } from "../logic/saveAndLoad";

document.getElementById("pdf")?.addEventListener("click", () => {
  sendMessage(service.createPdf, 2);
});

document.getElementById("download")?.addEventListener("click", downloadData);
document.getElementById("upload")?.addEventListener("click", uploadData);
