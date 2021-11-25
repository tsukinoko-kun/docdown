import { insertText, replaceSelectedText, textSelected } from "./editor";
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
      switch (ev.key.toLowerCase()) {
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
      if (ev.key === "Tab") {
        ev.preventDefault();
        if (textSelected(codeEl)) {
          if (ev.shiftKey) {
            replaceSelectedText(codeEl, (t) => t.replace(/^  /, ""));
          } else {
            replaceSelectedText(codeEl, (t) => "  " + t);
          }
        } else {
          insertText(codeEl, "  ", false);
        }
        triggerRender();
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        insertText(codeEl, "\n", false);
        triggerRender();
      } else {
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
        } else if (ev.key === "#") {
          if (
            replaceSelectedText(
              codeEl,
              (t) => {
                if (ev.altKey) {
                  if (t.startsWith("#")) {
                    return t.substring(1);
                  } else {
                    return "#";
                  }
                } else {
                  if (t.startsWith("#")) {
                    return "#" + t;
                  } else {
                    return "# " + t;
                  }
                }
              },
              false
            )
          ) {
            ev.preventDefault();
          }
        }
      }
    }
  },
  {
    capture: true,
    passive: false,
  }
);
