import { getText, textId } from "../data/local";
import {
  listenForMessage,
  notifyOnMessage,
  sendMessage,
  service,
} from "../router";

const headerTextEl = document.getElementById("headerText") as HTMLInputElement;

headerTextEl.addEventListener("input", () => {
  sendMessage(service.setChanged, {
    headerText: headerTextEl.value,
  });
});

export const getHeaderText = () => headerTextEl.value;

headerTextEl.placeholder = getText(textId.header_text);
notifyOnMessage(service.setLocale, () => {
  headerTextEl.placeholder = getText(textId.header_text);
});

listenForMessage(service.serHeaderText, (text) => {
  headerTextEl.value = text;
});
