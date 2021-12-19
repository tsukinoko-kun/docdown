import type { BlockTuneData } from "@editorjs/editorjs/types/block-tunes/block-tune-data";
import type { Content } from "pdfmake/interfaces";

export interface ITuneHelper<T extends object = any> {
  fulfillsSchema(name: string, data: BlockTuneData): boolean;
  tune(content: Content, data: T): Content;
}
