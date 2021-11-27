import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import passive from "./passive";

export interface ContextOption {
  label: string;
  action: (ev: MouseEvent) => void;
}

const contextOptions = new Set<string>();

export const context = (
  ev: { clientX: number; clientY: number },
  options: Array<ContextOption>
) => {
  const existingContexts = document.getElementsByClassName("context");

  const ul: HTMLUListElement =
    existingContexts.length > 0
      ? (existingContexts[0] as HTMLUListElement)
      : document.createElement("ul");

  ul.classList.add("pos");
  ul.classList.add("context");

  for (const option of options) {
    if (contextOptions.has(option.label)) {
      continue;
    } else {
      contextOptions.add(option.label);
    }
    const li = document.createElement("li");
    li.textContent = option.label;
    addDisposableEventListener(
      li,
      "click",
      (ev) => {
        option.action(ev);
        const ct = document.querySelector("div.alert");
        if (ct) {
          disposeNode(ct, true);
        }
        contextOptions.clear();
      },
      {
        capture: true,
        once: true,
        passive: true,
      }
    );
    ul.appendChild(li);
  }

  if (ul.parentElement) {
    return;
  }

  const ct = document.createElement("div");
  ct.classList.add("alert");
  ct.appendChild(ul);
  addDisposableEventListener(
    ct,
    "click",
    () => {
      disposeNode(ct, true);
      contextOptions.clear();
    },
    passive
  );
  addDisposableEventListener(
    ct,
    "contextmenu",
    (ev) => {
      ev.preventDefault();
      disposeNode(ct, true);
      contextOptions.clear();
    },
    {
      passive: false,
      capture: true,
    }
  );

  ct.style.setProperty("--pos-x", ev.clientX + "px");
  ct.style.setProperty("--pos-y", ev.clientY + "px");

  document.body.appendChild(ct);
};
