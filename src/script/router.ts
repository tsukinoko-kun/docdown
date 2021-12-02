import type { ISessionData } from "./session";

export enum mod {
  session,
}

export enum service {
  setChanged,
}

interface Modules {
  [mod.session]: {
    [service.setChanged]: Partial<ISessionData>;
  };
}

export const sendMessage = <
  M extends keyof Modules,
  S extends keyof Modules[M],
  T extends Modules[M][S]
>(
  module: M,
  service: S,
  message: T
) => {
  window.postMessage({
    module,
    service,
    message,
  });
};

const messageReciever = new Map<mod, Map<service, Array<Function>>>();

window.addEventListener("message", (ev) => {
  const data = ev.data;

  const m = data.module;
  const s = data.service;
  const message = data.message;

  if (m === undefined || s === undefined || message === undefined) {
    return;
  }

  const moduleMap = messageReciever.get(m);
  if (moduleMap) {
    const serviceMap = moduleMap.get(s);
    if (serviceMap) {
      for (const fn of serviceMap) {
        fn(message);
      }
    }
  }
});

export const listenForMessage = <
  M extends keyof Modules & mod,
  S extends keyof Modules[M] & service,
  T extends Modules[M][S]
>(
  recieverModule: M,
  recieverService: S,
  callback: (message: T) => void
) => {
  const m = messageReciever.get(recieverModule);
  if (m) {
    const s = m.get(recieverService);
    if (s) {
      s.push(callback);
    } else {
      m.set(recieverService, [callback]);
    }
  } else {
    messageReciever.set(
      recieverModule,
      new Map([[recieverService, [callback]]])
    );
  }
};
