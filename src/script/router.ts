import { None, Some } from "./Option";

import type { IInsertTextData, IReplaceTextData } from "./ui/editor";
import type { IContextData } from "./ui/alert";
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
  context,
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
  [service.logout]: ParamResult<undefined, void>;
  [service.context]: ParamResult<IContextData, void>;
}

const messageReciever = new Map<service, Array<Function>>();

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

export const sendMessage = <
  S extends keyof IServiceMap,
  R extends IServiceMap[S][paramResult.result]
>(
  service: S,
  message: IServiceMap[S][paramResult.param]
) => {
  const s = messageReciever.get(service);
  if (s && s.length > 0) {
    return Some<R>(s.map((cb) => cb(message))[0]);
  } else {
    return None<R>();
  }
};
