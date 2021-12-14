import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";

export interface IExportHelper<T extends object> {
  fulfillsSchema(data: OutputBlockData<string, any>): boolean;
  parse(data: OutputBlockData<string, T>): Content | Promise<Content>;
}
