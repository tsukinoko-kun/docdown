/// <reference path="global.d.ts" />

import { userAlert, userForm, context } from "./alert";
import { DataBase } from "./database";
import { getLocale, getText, textId } from "./local";
import { exportSourcesJSON, importSourcesJSON } from "./sources";
import { getThemeId } from "./theme";

const codeEl = document.getElementById("code") as HTMLTextAreaElement;

const db = new DataBase();

const session = {
  active: false,
  title: getText(textId.untitled),
  id: "",
  getLocalData: () => {
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
};
setTitle(session.title, false);

export const getTitle = () => session.title;

export const tryPushLocalToDatabase = () => {
  if (session.active) {
    db.setAt(["session", session.id], session.getLocalData()).catch((e) => {
      userAlert(e);
    });
  }
};

const tryStartSession = (sessionId: string, fromLocal = false) => {
  const addEventListeners = () => {
    db.addEventListener(["session", sessionId], "value", (snapshot) => {
      if (snapshot.val()) {
        const data = snapshot.val();
        session.active = true;
        setTitle(data.title);
        session.id = sessionId;
        codeEl.value = data.code;
        importSourcesJSON(data.sources);
      } else {
        userAlert(`Session "${sessionId}" not found`);
      }
    });
  };

  if (fromLocal) {
    db.setAt(["session", sessionId], session.getLocalData())
      .catch((e) => {
        userAlert(e);
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
  Date.now().toString(36) + Math.floor(Math.random() * 0xffff).toString(36);

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
