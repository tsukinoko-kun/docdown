import { replaceSelectedText } from "./editor";
import { loadLocal, saveLocal } from "./session";

let mode: "code" | "display" | "both" = "both";

document.body.setAttribute("view-mode", mode);

const surroundChar = ["*", "'", '"', "Dead", "(", "{", "[", "_", "~"];
const surroundCharB = [
  ["*", "*"],
  ["'", "'"],
  ['"', '"'],
  ["`", "`"],
  ["(", ")"],
  ["{", "}"],
  ["[", "]"],
  ["_", "_"],
  ["~", "~"],
];

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

window.addEventListener(
  "keydown",
  (ev) => {
    if (ev.ctrlKey || ev.metaKey) {
      switch (ev.key) {
        case "e":
          ev.preventDefault();

          if (ev.shiftKey) {
            switch (mode) {
              case "display":
              case "code":
                mode = "both";
                break;
              case "both":
                mode = "code";
                break;
            }
          } else {
            switch (mode) {
              case "display":
              case "both":
                mode = "code";
                break;
              case "code":
                mode = "display";
                break;
            }
          }
          break;

        case "s":
          ev.preventDefault();
          saveLocal();
          break;

        case "o":
          ev.preventDefault();
          loadLocal();
          break;
      }

      document.body.setAttribute("view-mode", mode);
    } else if (document.activeElement === codeEl) {
      let surroundCharIndex = surroundChar.indexOf(ev.key);

      if (surroundCharIndex !== -1) {
        const surroundLR = surroundCharB.at(surroundCharIndex);
        if (!surroundLR) {
          return;
        }

        if (
          replaceSelectedText(
            codeEl,
            (t) => surroundLR[0] + t + surroundLR[1],
            false
          )
        ) {
          ev.preventDefault();
        }

        triggerRender();
      }
    }
  },
  {
    capture: true,
    passive: false,
  }
);
