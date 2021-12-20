import { IUploadedFile } from './uploadedFile.model';

export interface ITutorial {
  _id?: string;
  title?: string;
  text?: string;
  uploadedFiles?: IUploadedFile[];
  type?: any;
  topic?: any;
  visible?: boolean;
  createdBy?: string;
}

export class Tutorial implements ITutorial {
  constructor(
    public _id?: string,
    public title?: string,
    public text?: string,
    public uploadedFiles?: IUploadedFile[],
    public type?: any,
    public createdBy?: string,
    public topic?: string,
    public visible?: boolean
  ) {}
}
