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
  public fulfillsSchema(block: OutputBlockData<string, IImageData>): boolean {
    return block.type === "image";
  }

  public async parse(
    block: OutputBlockData<"image", IImageData>
  ): Promise<Content> {
    const imageData = await getImageData(block.data.url);

    if (imageData.size.width > A4.width) {
      console.debug(`${imageData.size.width} > ${A4.width} too wide`);
      imageData.size.height =
        (A4.width / imageData.size.width) * imageData.size.height;
      imageData.size.width = A4.width;
    } else if (imageData.size.height > A4.height) {
      console.debug(`${imageData.size.height} > ${A4.height} too high`);
      imageData.size.width =
        (A4.height / imageData.size.height) * imageData.size.width;
      imageData.size.height = A4.height;
    } else {
      console.debug("Image is ok");
    }

    console.debug("Image size", imageData.size.toString());

    const contentImage: Content = block.id
      ? {
          image: imageData.dataUrl,
          id: block.id,
          width: imageData.size.width,
          height: imageData.size.height,
        }
      : {
          image: imageData.dataUrl,
          width: imageData.size.width,
          height: imageData.size.height,
        };

    if (block.data.caption) {
      return [contentImage, { text: block.data.caption, style: "caption" }];
    } else {
      return contentImage;
    }
  }
}
