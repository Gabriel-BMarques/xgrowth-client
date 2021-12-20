import { IDates } from './dates.model';
import { IUploadedFile } from './uploadedFile.model';

export interface IItem extends IDates {
  id?: string;
  Id_GUID?: string;
  parentId?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  selected?: boolean;
  UploadedFiles?: IUploadedFile[];
  attachments?: IUploadedFile[];
  isPublic?: boolean;
  sentOn?: any;
  link?: string;
  read?: boolean;
  timeDifference?: number;
  src?: string;
}

export class Item implements IItem {
  constructor(
    public id?: string,
    public Id_GUID?: string,
    public parentId?: string,
    public title?: string,
    public subtitle?: string,
    public description?: string,
    public selected?: boolean,
    public date?: Date,
    public dateString?: string,
    public UploadedFiles?: IUploadedFile[],
    public attachments?: IUploadedFile[],
    public isPublic?: boolean,
    public sentOn?: any,
    public link?: string,
    public read?: boolean,
    public timeDifference?: number,
    public src?: string
  ) {}
}
