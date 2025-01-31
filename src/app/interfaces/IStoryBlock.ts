export interface IStoryBlock {
    id: string;
    type: "paragraph" | "image" | "video" | "delimeter" | "header" | "table";
    data: any | { text?: string };
    cdn_url?: string;
}