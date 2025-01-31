import { IRichTextEditorData } from "../IRichTextEditorData";
import { IStoryBlock } from "./IStoryBlock";
import { ITimeCreated } from "./ITimeCreated";

export interface ISupportArticle {
    time_created?: ITimeCreated;
    last_modified?: ITimeCreated;
    key?: string;
    name?: string;
    thumbnail_image?: string;
    data?: IRichTextEditorData;
    author?: string;
    category?: string;
    upvotes?: number;
    upvotes_list?: string[];
    downvotes?: number;
    downvotes_list?: string[];
    is_published?: boolean;
    is_recommended?: string;
    is_admin?: boolean;
    age?: string;
    __schema_version__?: string;
}