import { defaultStyle, fonts, styles } from "../../data/pdfStylesheet";
import { createPdf as pdfmakeCreatePdf } from "pdfmake/build/pdfmake";
import { listenForMessage, sendMessage, service } from "../../router";
import { centimeterToPoint, mapIterableAllowEmptyAsync } from "../dataHelper";

import type { IExportHelper } from "./ExportHelper";
import { ExportHeader } from "./_exportHeader";
import { ExportList } from "./_exportList";
import { ExportParagraph } from "./_exportParagraph";
import { ExportTable } from "./_exportTable";
import { ExportQuote } from "./_exportQuote";
import { ExportCodeBox } from "./_exportCode";
import { ExportTableOfContents } from "./_exportTableOfContents";
import { ExportReferences } from "./_exportReferences";

import type { ITuneHelper } from "./TuneHelper";
import { TuneSource } from "./_tuneSource";

import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";
import type { BlockTuneData } from "@editorjs/editorjs/types/block-tunes/block-tune-data";
import { ExportImage } from "./_exportImage";
import { pageMargins } from "../../data/pageSize";
import { flatArrayKeepAsArray } from "../../data/flatArrayLevel";
import { toId } from "../../data/toId";

const exportHelpers: Array<IExportHelper> = [
  new ExportParagraph(),
  new ExportHeader(),
  new ExportList(),
  new ExportTable(),
  new ExportQuote(),
  new ExportCodeBox(),
  new ExportImage(),
  new ExportTableOfContents(),
  new ExportReferences(),
];

const tuneHelpers: Array<ITuneHelper> = [new TuneSource()];

const mapOutputBlockToPdfContent = async (
  data: OutputBlockData<string, any>
): Promise<Content> => {
  for (const helper of exportHelpers) {
    if (helper.fulfillsSchema(data)) {
      const content = await helper.parse(data);
      if (data.tunes) {
        return tuneContent(content, data.tunes);
      } else {
        return content;
      }
    }
  }

  throw new Error(`No export helper found for ${data.type}`);
};

const tuneContent = (
  content: Content,
  tunes: { [name: string]: BlockTuneData }
): Content => {
  for (const name in tunes) {
    for (const helper of tuneHelpers) {
      if (helper.fulfillsSchema(name, tunes[name])) {
        return helper.tune(content, tunes[name]);
      }
    }
  }

  return content;
};

const createDocDefinition = async (
  outputData: OutputData
): Promise<TDocumentDefinitions> => {
  sendMessage(service.prepareExport);

  const now = new Date();

  return {
    info: {
      creationDate: now,
      modDate: now,
      title: sendMessage(service.getDocumentName) || "DocDown PDF Export",
      producer: "docdown.app",
    },
    ownerPassword: toId(Math.random() * Math.pow(10, 20)),
    version: "1.7ext3",
    defaultStyle,
    styles: styles(),
    pageMargins,
    header: {
      text: now.toLocaleDateString(sendMessage(service.getLocale)),
      margin: [pageMargins[0], centimeterToPoint(0.5)],
      opacity: 0.5,
    },
    content: flatArrayKeepAsArray(
      await mapIterableAllowEmptyAsync(
        outputData.blocks,
        mapOutputBlockToPdfContent
      )
    ),
    footer: (currentPage, pageCount) => ({
      text: `${currentPage}/${pageCount}`,
      alignment: "right",
      margin: [pageMargins[0], centimeterToPoint(0.5)],
      opacity: 0.5,
    }),
    pageBreakBefore: (
      currentNode,
      followingNodesOnPage
      /*,nodesOnNextPage,
        previousNodesOnPage*/
    ) => {
      console.debug(currentNode);
      return (
        typeof currentNode.headlineLevel === "number" &&
        currentNode.headlineLevel > 0 &&
        (followingNodesOnPage.length === 0 ||
          followingNodesOnPage[0]!.startPosition.verticalRatio > 0.75)
      );
    },
    compress: true,
    pageSize: "A4",
    pageOrientation: "portrait",
    permissions: {
      annotating: true,
      contentAccessibility: true,
      documentAssembly: true,
      copying: true,
      modifying: false,
    },
  };
};

const createPdf = async () => {
  const data = await sendMessage(service.getDocumentData);
  if (data) {
    return pdfmakeCreatePdf(await createDocDefinition(data), undefined, fonts);
  } else {
    throw new Error("No data");
  }
};

export enum pdfOutput {
  print,
  download,
  open,
}

listenForMessage(service.createPdf, (output) => {
  createPdf()
    .catch(console.error)
    .then((x) => {
      if (!x) {
        return;
      }

      switch (output) {
        case pdfOutput.print:
          x.print();

          break;
        case pdfOutput.download:
          x.download();
          break;
        case pdfOutput.open:
          x.open();
          break;
      }
    });
});
