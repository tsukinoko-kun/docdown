import {
  addDisposableEventListener,
  disposeNode,
} from "@frank-mayer/magic/bin";
import { alert, form } from "./alert";
import { context } from "./context";
import { DataBase } from "./database";
import { exportSourcesJSON, importSourcesJSON } from "./sources";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const db = new DataBase();

const session = {
  active: false,
  title: "untitled",
  id: "",
  getLocalData: () => {
    return {
      title: session.title,
      code: codeEl.value,
      sources: exportSourcesJSON(),
    };
  },
};

const tryStartSession = (sessionId: string, fromLocal = false) => {
  const addEventListeners = () => {
    db.addEventListener(["session", sessionId], "value", (snapshot) => {
      if (snapshot.val()) {
        const data = snapshot.val();
        session.title = data.title;
        session.id = sessionId;
        codeEl.value = data.code;
        importSourcesJSON(data.sources);
        session.active = true;
      } else {
        alert(`Session "${sessionId}" not found`);
      }
    });
  };

  if (fromLocal) {
    db.setAt(["session", sessionId], session.getLocalData())
      .catch((e) => {
        alert(e);
      })
      .then(() => {
        session.id = sessionId;
        session.active = true;
        document.location.hash = sessionId;

        addEventListeners();
      });
  } else {
    addEventListeners();
  }
};

if (window.location.hash.length > 1) {
  tryStartSession(window.location.hash.substring(1));
}

const newSessionId = () =>
  Date.now().toString(36) +
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);

document.body.addEventListener(
  "contextmenu",
  (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    context(ev, [
      {
        label: "Start new session",
        action: () => {
          form([
            {
              name: "title",
              label: "Title",
              placeholder: "Name of the document",
              required: true,
              type: "text",
            },
          ])
            .then((data) => {
              session.title = data.title;
              tryStartSession(newSessionId());
            })
            .catch(() => {});
        },
      },
    ]);
  },
  {
    passive: false,
    capture: true,
  }
);

export const saveLocal = () => {
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(session.getLocalData()))
  );
  a.setAttribute("download", session.title + ".mdd");

  a.style.display = "none";
  document.body.appendChild(a);

  a.click();
  a.remove();
};

export const loadLocal = () => {
  const upload = document.createElement("input");
  upload.setAttribute("type", "file");
  upload.setAttribute("accept", ".mdd");
  addDisposableEventListener(upload, "change", () => {
    if (!upload.files || upload.files.length === 0) {
      disposeNode(upload, true);
      return;
    }

    const file = upload.files[0]!;
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);
      console.debug("Loaded local data", data);
      codeEl.value = data.markdown;
      importSourcesJSON(data.sources);
      triggerRender();
      disposeNode(upload, true);
    };
    reader.readAsText(file);
  });
  upload.click();
};
