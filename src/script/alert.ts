import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import passive from "./passive";

export const alert = (message: string) =>
  new Promise<void>((resolve) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const p = document.createElement("p");
    p.innerText = message;
    alert.appendChild(p);

    document.body.appendChild(alert);
    addDisposableEventListener(alert, "click", () => {
      disposeNode(alert, true);
      resolve();
    });
  });

export const form = <KEY extends string>(
  query: Array<{
    label: string;
    name: KEY;
    type: string;
    placeholder?: string;
    required: boolean;
    autocomplete?: string;
  }>
) =>
  new Promise<{ [key in KEY]: string }>((resolve, reject) => {
    const alert = document.createElement("div");
    alert.classList.add("alert");

    const form = document.createElement("form");
    for (const {
      label,
      type,
      required,
      name,
      placeholder,
      autocomplete,
    } of query) {
      const labelEl = document.createElement("label");
      labelEl.innerText = label;

      const inputEl = document.createElement("input");
      inputEl.name = name;
      inputEl.type = type;
      inputEl.required = required;
      if (autocomplete) {
        inputEl.autocomplete = autocomplete;
      }
      if (placeholder) {
        inputEl.placeholder = placeholder;
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
        console.debug("submit", ev);
        ev.preventDefault();

        const inputValues: {
          [key in KEY]: string;
        } = new Object() as any;
        for (const el of Array.from(form.querySelectorAll("input"))) {
          inputValues[el.name as KEY] = el.value;
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
  });
