import { None, Some } from "./Option";

import type { IInsertTextData, IReplaceTextData } from "./ui/editor";
import type { ISessionData } from "./logic/session";
import type { themeId, ITheme } from "./logic/theme";

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
  logout,
}

enum paramResult {
  param,
  result,
}
type ParamResult<P, R> = {
  [paramResult.param]: P;
  [paramResult.result]: R;
};

interface ServiceMap {
  [service.setChanged]: ParamResult<Partial<ISessionData>, void>;
  [service.setTheme]: ParamResult<themeId, void>;
  [service.getTheme]: ParamResult<undefined, ITheme>;
  [service.getThemeId]: ParamResult<undefined, themeId>;
  [service.getThemes]: ParamResult<undefined, Array<themeId>>;
  [service.triggerRender]: ParamResult<undefined, void>;
  [service.insertText]: ParamResult<IInsertTextData, void>;
  [service.replaceSelectedText]: ParamResult<IReplaceTextData, boolean>;
  [service.logout]: ParamResult<undefined, void>;
}

const messageReciever = new Map<service, Array<Function>>();

export const listenForMessage = <S extends keyof ServiceMap>(
  service: S,
  callback: (
    message: ServiceMap[S][paramResult.param]
  ) => ServiceMap[S][paramResult.result]
) => {
  const s = messageReciever.get(service);
  if (s) {
    s.push(callback);
  } else {
    messageReciever.set(service, [callback]);
  }
};

export const sendMessage = <
  S extends keyof ServiceMap,
  R extends ServiceMap[S][paramResult.result]
>(
  service: S,
  message: ServiceMap[S][paramResult.param]
) => {
  const s = messageReciever.get(service);
  if (s && s.length > 0) {
    return Some<R>(s.map((cb) => cb(message))[0]);
  } else {
    return None<R>();
  }
};
