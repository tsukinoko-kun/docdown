import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  onValue,
  DataSnapshot,
  onChildAdded,
  onChildChanged,
  onChildMoved,
  onChildRemoved,
  Unsubscribe,
} from "firebase/database";

import { getAuth, signInWithEmailAndPassword, User } from "firebase/auth";
import { alert, form } from "./alert";

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
const db = getDatabase(app);

const enshureLoggedIn = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
    }

    form([
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
        console.debug("login", data);
        signInWithEmailAndPassword(auth, data.email, data.password)
          .then((uc) => {
            resolve(uc.user);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch(alert);
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
          set(ref(db, this.path + "/" + path.join("/")), value)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  }

  addEventListener<K extends keyof DatabaseEventMap>(
    path: Array<string>,
    type: K,
    listener: DatabaseEventMap[K]
  ) {
    enshureLoggedIn()
      .then(() => {
        let unsubscribe: Unsubscribe;
        const dbRef = ref(db, this.path + "/" + path.join("/"));

        switch (type) {
          case "value":
            unsubscribe = onValue(dbRef, listener as any);
            break;
          case "child_added":
            unsubscribe = onChildAdded(dbRef, listener as any);
            break;
          case "child_changed":
            unsubscribe = onChildChanged(dbRef, listener as any);
            break;
          case "child_moved":
            unsubscribe = onChildMoved(dbRef, listener as any);
            break;
          case "child_removed":
            unsubscribe = onChildRemoved(dbRef, listener as any);
            break;
          default:
            throw new Error(`Unknown event type "${type}"`);
        }

        this.unsubscribes.push(unsubscribe);
      })
      .catch(alert);
  }

  unsubscribeAll() {
    for (const unsubscribe of this.unsubscribes) {
      unsubscribe();
    }
  }
}
