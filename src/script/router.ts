import type { OutputData } from "@editorjs/editorjs";

/**
 * module service
 */
export enum service {
  save,
}

enum paramResult {
  param,
  result,
}
type ParamResult<P, R> = {
  [paramResult.param]: P;
  [paramResult.result]: R;
};

interface IServiceMap {
  [service.save]: ParamResult<undefined, OutputData>;
}

const messageReciever = new Map<service, Array<Function>>();
const messageNotifyReciever = new Map<service, Array<Function>>();

export const listenForMessage = <S extends keyof IServiceMap>(
  service: S,
  callback: (
    message: IServiceMap[S][paramResult.param]
  ) =>
    | IServiceMap[S][paramResult.result]
    | Promise<IServiceMap[S][paramResult.result]>
) => {
  const s = messageReciever.get(service);
  if (s) {
    s.push(callback);
  } else {
    messageReciever.set(service, [callback]);
  }
};

export const notifyOnMessage = <S extends keyof IServiceMap>(
  service: S,
  callback: (messageResult: IServiceMap[S][paramResult.result]) => void
) => {
  const s = messageNotifyReciever.get(service);
  if (s) {
    s.push(callback);
  } else {
    messageNotifyReciever.set(service, [callback]);
  }
};

export const sendMessage = async <
  S extends keyof IServiceMap,
  R extends IServiceMap[S][paramResult.result]
>(
  service: S,
  message: IServiceMap[S][paramResult.param]
) =>
  new Promise<R | null>((resolve, reject) => {
    const s = messageReciever.get(service);
    if (s && s.length > 0) {
      let value: R | null = null;
      for (const callback of s) {
        try {
          if (value === null) {
            resolve((value = callback(message)));
          } else {
            callback(message);
          }
        } catch (e) {
          console.error(e);
        }
      }
      const s2 = messageNotifyReciever.get(service);
      if (s2 && s2.length > 0) {
        s2.forEach((cb) => cb(value));
      }
      return;
    } else {
      return reject(new Error(`No listener for service ${service}`));
    }
  });
