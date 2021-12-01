/**
 * This module ist for any modal dialogs that are shown to the user.
 */

import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import passive from "./passive";

const activeModalPromises = new Map<bigint, () => void>();

let modalId = BigInt(0);
const modal = <T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => void
) =>
  new Promise<T>((resolve, reject) => {
    cancelAllAlerts();

    const localModalId = ++modalId;

    const prom = new Promise<T>(executor);

    const cancel = () => {
      activeModalPromises.delete(localModalId);
      reject(`Modal canceled ${localModalId}`);
    };

    activeModalPromises.set(localModalId, cancel);

    prom
      .then((value) => {
        if (activeModalPromises.has(localModalId)) {
          activeModalPromises.delete(localModalId);
          resolve(value);
        }
      })
      .catch((reason) => {
        if (activeModalPromises.has(localModalId)) {
          activeModalPromises.delete(localModalId);
          reject(reason);
        }
      });
  });

type IAlertOverload = {
  /**
   * Show alert dialog with a string text message.
   */
  (messageText: string, asHtml?: false): Promise<void>;

  /**
   * Show alert dialog with a custom html message.
   */
  (messageHtml: string, asHtml: true): Promise<void>;
};
export const userAlert: IAlertOverload = (message: string, asHtml = false) =>
  modal<void>((resolve) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const p = document.createElement("p");
    alert.appendChild(p);
    if (asHtml) {
      p.outerHTML = message;
    } else {
      p.innerText = message;
    }

    document.body.appendChild(alert);
    addDisposableEventListener(
      alert,
      "click",
      (ev) => {
        if (ev.target === alert) {
          disposeNode(alert, true);
          resolve();
        }
      },
      passive
    );
  });

/**
 * Show a form to the user.
 * @param query Define all input elements on the form.
 * @returns Filled form data. Promise rejects it user cancels the form.
 */
export const userForm = <KEY extends string>(
  query: Array<{
    label: string;
    name: KEY;
    type: string;
    placeholder?: string;
    required: boolean;
    autocomplete?: string;
    value?: string;
    min?: string | number;
    max?: string | number;
  }>
) =>
  modal<{ [key in KEY]: string }>((resolve, reject) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const form = document.createElement("form");
    form.classList.add("interactable");

    let first: HTMLInputElement | null = null;

    for (const queryEl of query) {
      const labelEl = document.createElement("label");
      labelEl.innerText = queryEl.label;

      const inputEl = document.createElement("input");
      inputEl.name = queryEl.name;
      inputEl.type = queryEl.type;
      inputEl.required = queryEl.required;
      if (queryEl.autocomplete) {
        inputEl.autocomplete = queryEl.autocomplete;
      }
      if (queryEl.placeholder) {
        inputEl.placeholder = queryEl.placeholder;
      }
      if (queryEl.min) {
        inputEl.min = queryEl.min.toString();
      }
      if (queryEl.max) {
        inputEl.max = queryEl.max.toString();
      }
      if (queryEl.value) {
        if (queryEl.type === "checkbox") {
          inputEl.checked = Boolean(queryEl.value);
        } else {
          inputEl.value = queryEl.value;
        }
      }

      if (!first) {
        first = inputEl;
      }

      labelEl.appendChild(inputEl);

      form.appendChild(labelEl);
    }

    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "OK";
    form.appendChild(submit);

    addDisposableEventListener(
      form,
      "submit",
      (ev) => {
        ev.preventDefault();

        const inputValues: {
          [key in KEY]: string;
        } = new Object() as any;
        for (const el of Array.from(form.querySelectorAll("input"))) {
          if (el.type === "checkbox") {
            inputValues[el.name as KEY] = el.checked ? "x" : "";
          } else {
            inputValues[el.name as KEY] = el.value;
          }
        }
        resolve(inputValues);
        disposeNode(alert, true);
      },
      {
        capture: true,
        once: true,
        passive: false,
      }
    );

    alert.appendChild(form);
    addDisposableEventListener(
      alert,
      "click",
      (ev) => {
        if (ev.target === alert) {
          disposeNode(alert, true);
          reject();
        }
      },
      passive
    );

    document.body.appendChild(alert);

    if (first) {
      first.focus();
      if (first.value.length > 0) {
        first.selectionStart = 0;
        first.selectionEnd = first.value.length;
      }
    }
  });

interface ISelectOption<T> {
  label: string;
  value: T;
}
/**
 * Let the user pick an option from a list.
 * @param title Title/description of the selection dialog.
 * @param options Options to select from.
 * @returns Selected option. Promise rejects it user cancels the dialog.
 */
export const userSelect = <T extends any>(
  title: string,
  ...options: Array<ISelectOption<T>>
): Promise<T> =>
  modal((resolve, reject) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const ul = document.createElement("ul");
    ul.classList.add("interactable");

    const titleEl = document.createElement("p");
    titleEl.innerText = title;
    titleEl.style.pointerEvents = "none";
    ul.appendChild(titleEl);

    for (const option of options) {
      const li = document.createElement("li");
      li.innerText = option.label;
      ul.appendChild(li);
      addDisposableEventListener(
        li,
        "click",
        () => {
          resolve(option.value);
          disposeNode(alert, true);
        },
        passive
      );
    }

    alert.appendChild(ul);
    document.body.appendChild(alert);

    addDisposableEventListener(
      alert,
      "click",
      (ev) => {
        if (ev.target === alert) {
          disposeNode(alert, true);
          reject();
        }
      },
      passive
    );
  });

/**
 * Cancel all open alert dialogs.
 */
export const cancelAllAlerts = () => {
  for (const [id, cancel] of activeModalPromises) {
    cancel();
  }

  for (const el of Array.from(document.getElementsByClassName("alert"))) {
    disposeNode(el, true);
  }
};

////////////////////////////////////////////////////////////////////////////////

export interface ContextOption {
  label: string;
  action: (ev: MouseEvent) => void;
}

let contextModalId = BigInt(0);

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
  ul.classList.add("interactable");

  const localModalId =
    existingContexts.length === 0 ? ++modalId : contextModalId;
  contextModalId = localModalId;

  if (existingContexts.length === 0) {
    const ct = document.createElement("div");

    const clear = () => {
      disposeNode(ct, true);
      activeModalPromises.delete(localModalId);
      contextOptions.clear();
    };
    activeModalPromises.set(localModalId, clear);

    ct.classList.add("alert");
    ct.appendChild(ul);
    addDisposableEventListener(ct, "click", clear, passive);
    addDisposableEventListener(
      ct,
      "contextmenu",
      (ev) => {
        ev.preventDefault();
        clear();
      },
      {
        passive: false,
        capture: true,
      }
    );

    ct.style.setProperty("--pos-x", ev.clientX + "px");
    ct.style.setProperty("--pos-y", ev.clientY + "px");

    document.body.appendChild(ct);
  }

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
        activeModalPromises.get(localModalId)!();
      },
      {
        capture: true,
        once: true,
        passive: true,
      }
    );
    ul.appendChild(li);
  }
};
