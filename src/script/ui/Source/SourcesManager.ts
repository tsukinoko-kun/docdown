import { addDisposableEventListener, disposeNode } from "@frank-mayer/magic";
import { h64 } from "xxhashjs";
import { mapIterableAllowEmpty } from "../../logic/dataHelper";
import { listenForMessage, service } from "../../router";
import { toId } from "../../data/toId";
import type { sourceId, ISourceData } from "./SourceTypes";

interface IUiTemplate {
  id: keyof ISourceData;
  label: string;
  type: string;
  value?: string;
  required: boolean;
  min?: string;
  max?: string;
}

const today = new Date().toISOString().split("T")[0]!;

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
      max: today,
    },
    {
      id: "dateOfAccess",
      label: "Date of access",
      type: "date",
      required: true,
      value: today,
      max: today,
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

  public static getSource(id: sourceId): ISourceData | undefined {
    return SourcesManager.sources.get(id);
  }

  public triggerAddNewSource(
    data: Partial<ISourceData> = {},
    id?: sourceId
  ): Promise<void> {
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
        if (data[template.id]) {
          input.value = data[template.id]!;
        } else if (template.value) {
          input.value = template.value;
        }
        if (template.min) {
          input.min = template.min;
        }
        if (template.max) {
          input.max = template.max;
        }
        label.innerText = template.label;

        label.appendChild(input);
        form.appendChild(label);
      }

      const submit = document.createElement("input");
      submit.type = "submit";
      submit.value = "Add";
      submit.className = "button";
      form.appendChild(submit);

      ui.appendChild(form);
      document.body.appendChild(ui);

      addDisposableEventListener(
        form,
        "submit",
        (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          this.addSource(
            SourcesManager.sourceDataFromForm(new FormData(form)),
            id
          );
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

  private addSource(source: ISourceData, id?: sourceId) {
    if (id) {
      SourcesManager.sources.set(id, source);
      return id;
    } else {
      this.hash.update(JSON.stringify(source));
      const hash = toId(this.hash.digest());
      SourcesManager.sources.set(hash, source);
      return hash;
    }
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
      addSrcButton.className = "button";
      addSrcButton.innerText = "Add new source";
      addDisposableEventListener(addSrcButton, "click", () => {
        this.triggerAddNewSource()
          .then(() => {
            this.populateSourcesCheckList(ul);
          })
          .catch((err) => {
            console.error(err);
            if (err) {
              reject();
            }
          });
      });
      form.appendChild(addSrcButton);

      const submit = document.createElement("input");
      submit.type = "submit";
      submit.value = "OK";
      submit.className = "button";
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
      const edit = document.createElement("span");

      input.type = "checkbox";
      input.value = id;
      input.id = "src_" + id;
      input.name = "source";
      input.checked = this.sources.includes(id);

      span.innerText = SourcesManager.sourceToString(source);

      edit.classList.add("edit");

      addDisposableEventListener(edit, "click", () => {
        this.triggerAddNewSource(source, id).then(() => {
          this.populateSourcesCheckList(ul);
        });
      });

      label.appendChild(input);
      label.appendChild(span);
      label.appendChild(edit);
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
