/// <reference path="global.d.ts" />

import { userAlert, userForm, context } from "./alert";
import { DataBase } from "./database";
import { getLocale, getText, language, setLocale, textId } from "./local";
import { exportSourcesJSON, importSourcesJSON } from "./sources";
import type { ISourceData } from "./sources";
import { getThemeId, setTheme } from "./theme";
import { h32 } from "xxhashjs";
import { listenForMessage, mod, sendMessage, service } from "./router";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const db = new DataBase();

export interface ISessionData {
  title: string;
  code: string;
  sources: ISourceData[];
  language: language;
  lastUpdate: number;
  theme: string;
}

const session = {
  active: false,
  title: getText(textId.untitled),
  id: "",
  getLocalData: (): ISessionData => {
    return {
      title: session.title,
      code: codeEl.value,
      sources: exportSourcesJSON(),
      language: getLocale(),
      lastUpdate: Date.now(),
      theme: getThemeId(),
    };
  },
};

export const setTitle = (title: string, render = true) => {
  session.title = title;
  document.title = `docdown - ${title}`;
  if (render) {
    triggerRender();
  }

  sendMessage(mod.session, service.setChanged, {
    title,
  });
};
setTitle(session.title, false);

export const getTitle = () => session.title;

export const importData = (data: Partial<ISessionData> = {}) => {
  setTitle(data.title ?? getText(textId.untitled), false);
  setLocale(data.language ?? navigator.language.includes("de") ? "de" : "en");
  codeEl.value = data.code ?? "";
  importSourcesJSON(data.sources ?? ([] as any));
  setTheme(data.theme ?? "ocean");

  triggerRender();
};

let changedData: Partial<ISessionData> = {};
let updateDbToken: number | null = null;

listenForMessage(mod.session, service.setChanged, (data) => {
  if (!session.active) {
    return;
  }

  changedData = { ...changedData, ...data };

  if (updateDbToken !== null) {
    clearTimeout(updateDbToken);
  }

  updateDbToken = window.setTimeout(() => {
    updateDbToken = null;
    for (const key in changedData) {
      db.setAt(
        ["session", session.id, key],
        changedData[key as keyof ISessionData]
      );
    }
    db.setAt(["session", session.id, "lastUpdate"], Date.now());
  }, 2000);
});

export const logout = () => {
  db.unsubscribeAll();
  db.signOut();
};

const tryStartSession = (sessionId: string, fromLocal = false) => {
  console.debug(
    "tryStartSession",
    sessionId,
    fromLocal ? "from local" : "from database"
  );

  if (session.active) {
    console.error("session already active");
    return;
  }

  const combinedPath = ["session", sessionId];

  const addEventListeners = () => {
    db.addEventListener(combinedPath, "value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let render = false;

        if (data.title !== getTitle()) {
          setTitle(data.title, false);
        }

        if (data.language !== getLocale()) {
          setLocale(data.language);
        }

        if (data.theme !== getThemeId()) {
          setTheme(data.theme);
        }

        if (h32(data.code, 0) !== h32(codeEl.value, 0)) {
          codeEl.value = data.code;
          render = true;
        }

        if (
          data.sources &&
          h32(JSON.stringify(exportSourcesJSON()), 0) !==
            h32(JSON.stringify(data.sources), 0)
        ) {
          importSourcesJSON(data.sources);
        }

        if (render) {
          triggerRender();
        }

        session.active = true;
      }
    });
  };

  if (fromLocal) {
    db.setAt(combinedPath, session.getLocalData())
      .catch((e) => {
        userAlert(e);
      })
      .then(() => {
        session.id = sessionId;
        document.location.hash = sessionId;
        session.active = true;

        addEventListeners();
      });
  } else {
    session.id = sessionId;
    document.location.hash = sessionId;
    addEventListeners();
  }
};

if (window.location.hash.length > 3) {
  tryStartSession(window.location.hash.substring(1));
}

const newSessionId = () =>
  Date.now().toString(36) + Math.floor(Math.random() * 0xfffff).toString(36);

document.addEventListener(
  "contextmenu",
  (ev) => {
    ev.preventDefault();

    if (!session.active) {
      context(ev, [
        {
          label: getText(textId.start_new_session),
          action: () => {
            userForm([
              {
                name: "title",
                label: getText(textId.title),
                required: true,
                type: "text",
                value: getTitle(),
              },
            ])
              .then((data) => {
                setTitle(data.title);
                tryStartSession(newSessionId(), true);
              })
              .catch((err) => {
                if (err) {
                  console.info(err);
                }
              });
          },
        },
      ]);
    } else {
      context(ev, [
        {
          label: getText(textId.stop_session),
          action: () => {
            db.unsubscribeAll();
            db.dropAt(["session", session.id]);
            location.hash = "";
          },
        },
      ]);
    }
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
  a.setAttribute("download", session.title + ".ddd"); // doc down document

  a.style.display = "none";
  document.body.appendChild(a);

  a.click();
  a.remove();
};
