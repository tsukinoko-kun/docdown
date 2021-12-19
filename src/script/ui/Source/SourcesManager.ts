import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import { h64 } from "xxhashjs";
import { mapIterableAllowEmpty } from "../../logic/dataHelper";
import { listenForMessage, service } from "../../router";
import { numberToSourceId } from "./numberToSourceId";
import type { sourceId, ISourceData } from "./SourceTypes";

interface IUiTemplate {
  id: keyof ISourceData;
  label: string;
  type: string;
  value?: string;
  required: boolean;
}

export class SourcesManager {
  private readonly hash = h64(0x123);
  private static uiTemplate: Array<IUiTemplate> = [
    {
      id: "author",
      label: "Author",
      type: "text",
      required: true,
      value: "Me",
    },
    {
      id: "title",
      label: "Title",
      type: "text",
      required: true,
      value: "Meep",
    },
    {
      id: "dateOfCreation",
      label: "Date of creation",
      type: "date",
      required: false,
    },
    {
      id: "dateOfAccess",
      label: "Date of access",
      type: "date",
      required: true,
    },
    {
      id: "url",
      label: "URL",
      type: "url",
      required: false,
    },
  ];

  public sources: Array<sourceId>;
  public static readonly sources = new Map<sourceId, ISourceData>();

  public constructor(sources?: Array<sourceId>) {
    this.sources = sources ?? [];
  }

  public triggerAddNewSource(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ui = document.createElement("div");
      ui.classList.add("register-source-ui");

      const form = document.createElement("form");

      for (const template of SourcesManager.uiTemplate) {
        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = template.type;
        input.name = template.id;
        input.required = template.required;
        if (template.value) {
          input.value = template.value;
        }

        label.innerText = template.label;

        label.appendChild(input);
        form.appendChild(label);
      }

      const submit = document.createElement("input");
      submit.type = "submit";
      submit.value = "Add";
      form.appendChild(submit);

      ui.appendChild(form);
      document.body.appendChild(ui);

      addDisposableEventListener(
        form,
        "submit",
        (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          this.addSource(SourcesManager.sourceDataFromForm(new FormData(form)));
          disposeNode(ui);
          resolve();
        },
        {
          passive: false,
          capture: true,
        }
      );

      addDisposableEventListener(
        ui,
        "click",
        (ev) => {
          if (ev.target === ui) {
            disposeNode(ui);
            reject();
          }
        },
        { passive: true, capture: false }
      );
    });
  }

  private static sourceDataFromForm(form: FormData): ISourceData {
    const data = {} as { [key in keyof ISourceData]: any } & ISourceData;
    form.forEach((value, key) => {
      data[key as keyof ISourceData] = value;
    });
    return data;
  }

  private addSource(source: ISourceData) {
    this.hash.update(JSON.stringify(source));
    const hash = numberToSourceId(this.hash.digest());
    SourcesManager.sources.set(hash, source);
    return hash;
  }

  public triggerSelectSource(): Promise<Array<sourceId>> {
    return new Promise((resolve, reject) => {
      const ui = document.createElement("div");
      ui.classList.add("select-source-ui");

      const form = document.createElement("form");

      const ul = document.createElement("ul");
      form.appendChild(ul);
      this.populateSourcesCheckList(ul);

      const addSrcButton = document.createElement("p");
      addSrcButton.innerText = "Add new source";
      addDisposableEventListener(addSrcButton, "click", () => {
        this.triggerAddNewSource().then(() => {
          this.populateSourcesCheckList(ul);
        });
      });
      form.appendChild(addSrcButton);

      const submit = document.createElement("input");
      submit.type = "submit";
      submit.value = "OK";
      form.appendChild(submit);

      ui.appendChild(form);
      document.body.appendChild(ui);

      addDisposableEventListener(
        form,
        "submit",
        (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          disposeNode(ui);

          this.sources = mapIterableAllowEmpty(
            Array.from(
              form.querySelectorAll(
                "input[type=checkbox]"
              ) as NodeListOf<HTMLInputElement>
            ),
            (el) => (el.checked ? el.value : null)
          );

          resolve(this.sources);
        },
        {
          passive: false,
          capture: true,
        }
      );

      addDisposableEventListener(
        ui,
        "click",
        (ev) => {
          if (ev.target === ui) {
            disposeNode(ui);
            reject();
          }
        },
        { passive: true, capture: false }
      );
    });
  }

  private populateSourcesCheckList(ul: HTMLElement) {
    for (const el of Array.from(ul.children)) {
      disposeNode(el);
    }

    for (const [id, source] of SourcesManager.sources) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      const span = document.createElement("span");

      input.type = "checkbox";
      input.value = id;
      input.id = "src_" + id;
      input.name = "source";
      input.checked = this.sources.includes(id);

      span.innerText = SourcesManager.sourceToString(source);

      label.appendChild(input);
      label.appendChild(span);
      ul.appendChild(label);
    }
  }

  private static sourceToString(source: ISourceData) {
    return `${source.author} - ${source.title}`;
  }

  public static export(): { [key: sourceId]: ISourceData } {
    const data = {} as { [key: sourceId]: ISourceData };
    for (const [id, source] of SourcesManager.sources) {
      data[id] = source;
    }
    return data;
  }
}

listenForMessage(service.getSaveData, () =>
  Promise.resolve({ sources: SourcesManager.export() })
);

listenForMessage(service.initFromData, (data) => {
  if (data.sources) {
    SourcesManager.sources.clear();
    for (const [id, source] of Object.entries(data.sources)) {
      SourcesManager.sources.set(id, source);
    }
  }
});
