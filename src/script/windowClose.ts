import { getText, textId } from "./local";
import { logout } from "./session";

window.onbeforeunload = function () {
  logout();
  return getText(textId.exit_confirm);
};
