import { None, Some } from "./Option";

import type {
  IInsertTextData,
  IReplaceAllSubstringsInTextData,
  IReplaceTextData,
} from "./ui/editor";
import type { IContextData } from "./ui/alert";
import type { ISessionData } from "./logic/session";
import type { themeId, ITheme } from "./logic/theme";
import type { pdfOutput } from "./logic/export";
import type { language } from "./data/local";

/**
 * module service
 */
export enum service {
  setChanged,
  setTheme,
  getTheme,
  getThemeId,
  getThemes,
  triggerRender,
  insertText,
  replaceSelectedText,
  replaceAllSubstringsInText,
  logout,
  context,
  createPdf,
  setLocale,
  serHeaderText,
  format,
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
  [service.setChanged]: ParamResult<Partial<ISessionData>, void>;
  [service.setTheme]: ParamResult<themeId, void>;
  [service.getTheme]: ParamResult<undefined, ITheme>;
  [service.getThemeId]: ParamResult<undefined, themeId>;
  [service.getThemes]: ParamResult<undefined, Array<themeId>>;
  [service.triggerRender]: ParamResult<undefined, void>;
  [service.insertText]: ParamResult<IInsertTextData, void>;
  [service.replaceSelectedText]: ParamResult<IReplaceTextData, boolean>;
  [service.replaceAllSubstringsInText]: ParamResult<
    IReplaceAllSubstringsInTextData,
    void
  >;
  [service.logout]: ParamResult<undefined, void>;
  [service.context]: ParamResult<IContextData, void>;
  [service.createPdf]: ParamResult<pdfOutput, void>;
  [service.setLocale]: ParamResult<language, void>;
  [service.serHeaderText]: ParamResult<string, void>;
  [service.format]: ParamResult<undefined, void>;
}

const messageReciever = new Map<service, Array<Function>>();
const messageNotifyReciever = new Map<service, Array<Function>>();

export const listenForMessage = <S extends keyof IServiceMap>(
  service: S,
  callback: (
    message: IServiceMap[S][paramResult.param]
  ) => IServiceMap[S][paramResult.result]
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

export const sendMessage = <
  S extends keyof IServiceMap,
  R extends IServiceMap[S][paramResult.result]
>(
  service: S,
  message: IServiceMap[S][paramResult.param]
) => {
  const s = messageReciever.get(service);
  if (s && s.length > 0) {
    const value = s.map((cb) => cb(message))[0];
    const s2 = messageNotifyReciever.get(service);
    if (s2 && s2.length > 0) {
      s2.forEach((cb) => cb(value));
    }
    return Some<R>(value);
  } else {
    return None<R>();
  }
};
