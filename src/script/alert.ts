import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import passive from "./passive";

type IAlertOverload = {
  (messageText: string, asHtml?: false): Promise<void>;
  (messageHtml: string, asHtml: true): Promise<void>;
};
export const userAlert: IAlertOverload = (message: string, asHtml = false) =>
  new Promise<void>((resolve) => {
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

export const userForm = <KEY extends string>(
  query: Array<{
    label: string;
    name: KEY;
    type: string;
    placeholder?: string;
    required: boolean;
    autocomplete?: string;
    value?: string;
  }>
) =>
  new Promise<{ [key in KEY]: string }>((resolve, reject) => {
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

    first?.focus();
  });

interface ISelectOption<T> {
  label: string;
  value: T;
}
export const userSelect = <T extends any>(
  title: string,
  ...options: Array<ISelectOption<T>>
): Promise<T> =>
  new Promise((resolve, reject) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const ul = document.createElement("ul");
    ul.classList.add("interactable");

    const titleEl = document.createElement("p");
    titleEl.innerText = title + ":";
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
