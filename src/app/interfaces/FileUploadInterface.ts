import { ITimeCreated } from './ITimeCreated';

export interface FileUploadInterface {
  time_created: ITimeCreated;
  filaname: string;
  filepath: string;
  original_name: string;
  server_filename: string;
  url: string;
  uploader_id: string;
  mimetype: string;
  filetype: string;
  key: string;
}
