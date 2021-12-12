import { sendMessage, service } from "../router";

document.getElementById("pdf")?.addEventListener("click", () => {
  sendMessage(service.createPdf, 2);
});
