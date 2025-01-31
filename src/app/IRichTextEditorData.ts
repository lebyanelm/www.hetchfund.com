import { IStoryBlock } from "./interfaces/IStoryBlock";

export interface IRichTextEditorData {
    time?: string;
    blocks: IStoryBlock[];
    version?: string;
}