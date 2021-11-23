let mode: "code" | "display" | "both" = "both";

document.body.setAttribute("view-mode", mode);

const surroundChar = "*'\"`({[_~";
const surroundCharB = "*'\"`)}]_~";

window.addEventListener(
  "keydown",
  (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === "e") {
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

      document.body.setAttribute("view-mode", mode);
    } else {
      let surroundCharIndex = surroundChar.indexOf(ev.key);
      const selection = window.getSelection();
      if (surroundCharIndex !== -1 && selection) {
        ev.preventDefault();

        document.execCommand(
          "insertText",
          true,
          surroundChar.at(surroundCharIndex) +
            selection.toString() +
            surroundCharB.at(surroundCharIndex)
        );
      }
    }
  },
  {
    capture: true,
    passive: false,
  }
);
