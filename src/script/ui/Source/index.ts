import type { BlockTuneConstructable } from "@editorjs/editorjs";
import SourceTool from "./Source_BlockTune";
import type { sourceId, ISourceData } from "./SourceTypes";

const Source = SourceTool as unknown as BlockTuneConstructable;

export { Source, sourceId, ISourceData };
