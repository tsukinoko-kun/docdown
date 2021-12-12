import type { OutputData } from "@editorjs/editorjs";
import type { language } from "./data/local";
import type { pdfOutput } from "./logic/export";

/**
 * module service
 */
export enum service {
  getLocale,
  setLocale,
  getTheme,
  getDocumentData,
  createPdf,
}

enum paramResult {
  param,
  result,
}

type ParamResult<P, R> = {
  [paramResult.param]: P;
  [paramResult.result]: R;
};

type ServiceMap = {
  [service.setLocale]: ParamResult<language, void>;
  [service.createPdf]: ParamResult<pdfOutput, void>;
};
type ServiceMapNoParam = {
  [service.getLocale]: ParamResult<undefined, language>;
  [service.getTheme]: ParamResult<undefined, string>;
  [service.getDocumentData]: ParamResult<undefined, Promise<OutputData>>;
};

const messageReciever = new Map<service, Array<Function>>();
const messageNotifyReciever = new Map<service, Array<Function>>();

type ListenForMessageOverload = {
  <S extends keyof ServiceMap>(
    service: S,
    callback: (
      param: ServiceMap[S][paramResult.param]
    ) => ServiceMap[S][paramResult.result]
  ): void;

  <
    S extends keyof ServiceMapNoParam,
    P extends ServiceMapNoParam[S][paramResult.param],
    R extends ServiceMapNoParam[S][paramResult.result]
  >(
    service: S,
    callback: (param: P) => R
  ): void;
};

export const listenForMessage: ListenForMessageOverload = ((
  service: any,
  callback: any
) => {
  const s = messageReciever.get(service);
  if (s) {
    s.push(callback);
  } else {
    messageReciever.set(service, [callback]);
  }
}) as ListenForMessageOverload;

type NotifyOnMessageOverload = {
  <S extends keyof ServiceMap>(
    service: S,
    callback: (messageResult: ServiceMap[S][paramResult.result]) => void
  ): void;

  <S extends keyof ServiceMapNoParam>(
    service: S,
    callback: (messageResult: ServiceMapNoParam[S][paramResult.result]) => void
  ): void;
};
export const notifyOnMessage: NotifyOnMessageOverload = (
  service: any,
  callback: any
) => {
  const s = messageNotifyReciever.get(service);
  if (s) {
    s.push(callback);
  } else {
    messageNotifyReciever.set(service, [callback]);
  }
};

type SendMessageOverload = {
  // ServiceMap[S][paramResult.result] can be any type
  <S extends keyof ServiceMap>(
    service: S,
    message: ServiceMap[S][paramResult.param]
  ): ServiceMap[S][paramResult.result] | undefined;

  // ServiceMap[S][paramResult.result] is of type undefined
  <S extends keyof ServiceMapNoParam>(service: S):
    | ServiceMapNoParam[S][paramResult.result]
    | undefined;
};

export const sendMessage = (async (service, message) => {
  const s = messageReciever.get(service);
  if (s && s.length > 0) {
    let value: any = undefined;
    for (const callback of s) {
      try {
        if (value === undefined) {
          value = callback(message);
        } else {
          callback(message);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const s2 = messageNotifyReciever.get(service);
    if (s2) {
      for (const callback of s2) {
        try {
          callback(value);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return value;
  } else {
    throw new Error(`No listener for service ${service}`);
  }
}) as SendMessageOverload;
