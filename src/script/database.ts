import { initializeApp } from "firebase/app";

import {
  getDatabase,
  ref as dbRef,
  set,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
} from "firebase/database";

import {
  browserLocalPersistence,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { userAlert, userForm } from "./alert";

import type { DataSnapshot, Unsubscribe } from "firebase/database";
import type { User } from "firebase/auth";

import {
  getStorage,
  ref as storeRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { getText, textId } from "./local";

const firebaseConfig = {
  apiKey: "AIzaSyCSv8c1dqMYtGVxsrfGY_BYFOKHn3oP9bc",
  authDomain: "markdowndoc.firebaseapp.com",
  databaseURL:
    "https://markdowndoc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "markdowndoc",
  storageBucket: "markdowndoc.appspot.com",
  messagingSenderId: "397304984648",
  appId: "1:397304984648:web:57f5aaf6e9dd45b2e0147d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
auth.setPersistence(browserLocalPersistence);
const db = getDatabase(app);

export const getUser = (): string => {
  const user = auth.currentUser;
  if (user) {
    return user.displayName ?? user.email ?? user.uid;
  }
  return getText(textId.guest_user);
};

const enshureLoggedIn = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
    }

    userForm([
      {
        name: "email",
        label: "E-Mail",
        type: "email",
        required: true,
        placeholder: "your@email.com",
        autocomplete: "email",
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        placeholder: "abc123",
        autocomplete: "current-password",
      },
    ])
      .then((data) => {
        signInWithEmailAndPassword(auth, data.email, data.password)
          .then((uc) => {
            resolve(uc.user);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((err) => {
        if (err) {
          userAlert(err);
        }
      });
  });
};

interface DatabaseEventMap {
  value: (snapshot: DataSnapshot) => any;
  child_added: (
    snapshot: DataSnapshot,
    previousChildName?: string | null | undefined
  ) => any;
  child_changed: (
    snapshot: DataSnapshot,
    previousChildName: string | null
  ) => unknown;
  child_moved: (
    snapshot: DataSnapshot,
    previousChildName: string | null
  ) => unknown;
  child_removed: (snapshot: DataSnapshot) => unknown;
}

const storage = getStorage();

export class DataBase {
  private path: string;
  private unsubscribes: Array<Unsubscribe>;

  constructor(...path: Array<string>) {
    this.path = "/" + path.join("/");
    this.unsubscribes = new Array();
  }

  setAt<T>(path: Array<string>, value: T) {
    return new Promise((resolve, reject) => {
      enshureLoggedIn()
        .then(() => {
          set(dbRef(db, this.path + "/" + path.join("/")), value)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  dropAt(path: Array<string>) {
    return this.setAt(path, null);
  }

  addEventListener<K extends keyof DatabaseEventMap>(
    path: Array<string>,
    type: K,
    listener: DatabaseEventMap[K]
  ) {
    enshureLoggedIn()
      .then(() => {
        let unsubscribe: Unsubscribe;
        const dbr = dbRef(db, this.path + "/" + path.join("/"));

        switch (type) {
          case "value":
            unsubscribe = onValue(dbr, listener as any);
            break;
          case "child_added":
            unsubscribe = onChildAdded(dbr, listener as any);
            break;
          case "child_changed":
            unsubscribe = onChildChanged(dbr, listener as any);
            break;
          case "child_moved":
            unsubscribe = onChildMoved(dbr, listener as any);
            break;
          case "child_removed":
            unsubscribe = onChildRemoved(dbr, listener as any);
            break;
          default:
            throw new Error(`Unknown event type "${type}"`);
        }

        this.unsubscribes.push(unsubscribe);
      })
      .catch(userAlert);
  }

  unsubscribeAll() {
    for (const unsubscribe of this.unsubscribes) {
      unsubscribe();
    }
  }
}

export const gsb = "gs://docdown.app/";
const downloadUrlCache = new Map<string, string>();

export const upload = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    enshureLoggedIn()
      .then((u) => {
        const onlineLocation = u.uid + "/" + file.name;
        const uploadRef = storeRef(storage, onlineLocation);
        uploadBytes(uploadRef, file)
          .then((ur) => {
            getDownloadURL(ur.ref)
              .then((url) => {
                const gsbUrl = gsb + onlineLocation;
                downloadUrlCache.set(gsbUrl, url);
                resolve(gsbUrl);
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(reject);
  });

export const download = (path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (downloadUrlCache.has(path)) {
      resolve(downloadUrlCache.get(path) as string);
      return;
    }

    enshureLoggedIn()
      .then(() => {
        getDownloadURL(storeRef(storage, path.replace(gsb, "")))
          .then((url) => {
            downloadUrlCache.set(path, url);
            resolve(url);
          })
          .catch(reject);
      })
      .catch(reject);
  });
