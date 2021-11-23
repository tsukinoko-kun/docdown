import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import passive from "./passive";

export interface ContextOption {
  display: string;
  action: (ev: MouseEvent) => void;
}

export const context = (
  ev: { clientX: number; clientY: number },
  options: Array<ContextOption>
) => {
  const ul = document.createElement("ul");

  for (const option of options) {
    const li = document.createElement("li");
    li.textContent = option.display;
    addDisposableEventListener(
      li,
      "click",
      (ev) => {
        option.action(ev);
        disposeNode(ct, true);
      },
      {
        capture: true,
        once: true,
        passive: true,
      }
    );
    ul.appendChild(li);
  }

  const ct = document.createElement("div");
  ct.classList.add("context");
  ct.appendChild(ul);
  addDisposableEventListener(
    ct,
    "click",
    () => {
      disposeNode(ct, true);
    },
    passive
  );

  ct.style.setProperty("--pos-x", ev.clientX + "px");
  ct.style.setProperty("--pos-y", ev.clientY + "px");

  document.body.appendChild(ct);
};
