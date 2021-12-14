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

import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";
import { ExportImage } from "./_exportImage";
import { pageMargins } from "../../data/pageSize";

const exportHelpers: Array<IExportHelper<any>> = [
  new ExportParagraph(),
  new ExportHeader(),
  new ExportList(),
  new ExportTable(),
  new ExportQuote(),
  new ExportCodeBox(),
  new ExportTableOfContents(),
  new ExportImage(),
];

const mapOutputBlockToPdfContent = async (
  el: OutputBlockData<string, any>
): Promise<Content> => {
  for (const helper of exportHelpers) {
    if (helper.fulfillsSchema(el)) {
      return await helper.parse(el);
    }
  }

  const err = `No export helper found for ${el.type}`;
  console.error(err);
  throw new Error(err);
};

const createDocDefinition = async (
  outputData: OutputData
): Promise<TDocumentDefinitions> => ({
  info: {
    creationDate: new Date(),
  },
  defaultStyle,
  styles: styles(),
  pageMargins,
  header: {
    text: new Date().toLocaleDateString(sendMessage(service.getLocale)),
    margin: centimeterToPoint<[number, number]>([3.5, 0.5]),
    opacity: 0.5,
  },
  content: await mapIterableAllowEmptyAsync(
    outputData.blocks,
    mapOutputBlockToPdfContent
  ),
  footer: (currentPage, pageCount) => ({
    text: `${currentPage}/${pageCount}`,
    alignment: "right",
    margin: [40, 20],
    opacity: 0.5,
  }),
  pageBreakBefore: function (
    currentNode,
    followingNodesOnPage
    /*,nodesOnNextPage,
    previousNodesOnPage*/
  ) {
    return currentNode.headlineLevel === 1 && followingNodesOnPage.length === 0;
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
});

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
