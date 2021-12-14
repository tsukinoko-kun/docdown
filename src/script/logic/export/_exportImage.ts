import type { OutputBlockData } from "@editorjs/editorjs";
import type { Content } from "pdfmake/interfaces";
import { A4 } from "../../data/pageSize";
import { getImageData } from "../dataHelper/getImageData";
import type { IExportHelper } from "./ExportHelper";

interface IImageData {
  /** image's url */
  url: string;

  /** image's caption */
  caption: string;

  /** add border to image */
  withBorder: boolean;

  /** need to add background */
  withBackground: boolean;

  /** stretch image to screen's width */
  stretched: boolean;
}

export class ExportImage implements IExportHelper<IImageData> {
  fulfillsSchema(block: OutputBlockData<string, IImageData>): boolean {
    return block.type === "image";
  }
  async parse(block: OutputBlockData<"image", IImageData>): Promise<Content> {
    const imageData = await getImageData(block.data.url);

    if (imageData.size.width > A4.width) {
      imageData.size.width = A4.width;
      imageData.size.height =
        (imageData.size.width / imageData.size.width) * imageData.size.height;
    } else if (imageData.size.height > A4.height) {
      imageData.size.height = A4.height;
      imageData.size.width =
        (imageData.size.height / imageData.size.height) * imageData.size.width;
    }

    const contentImage = block.id
      ? { image: await (await imageData).dataUrl, id: block.id }
      : { image: await (await imageData).dataUrl };

    if (block.data.caption) {
      return [contentImage, { text: block.data.caption, style: "caption" }];
    } else {
      return contentImage;
    }
  }
}
