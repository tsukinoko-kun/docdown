import { getText, textId } from "../data/local";
import { sendMessage, service } from "../router";

window.onbeforeunload = function () {
  sendMessage(service.logout, undefined);
  return getText(textId.exit_confirm);
};
