import type { BlockTuneConstructable } from "@editorjs/editorjs";
import SourceTool from "./Source_BlockTune";
import type { sourceId, ISourceData } from "./SourceTypes";
import type { IReferencesData } from "./IReferencesData";
import { SourcesManager } from "./SourcesManager";
import References from "./References";

const Source = SourceTool as unknown as BlockTuneConstructable;

export {
  Source,
  sourceId,
  ISourceData,
  IReferencesData,
  SourcesManager,
  References,
};
