import { IUploadedFile } from './uploadedFile.model';

export interface IPostShare {
  _id?: string;
  PostId?: string;
  RecipientId?: string;
  SenderId?: string;
  Description?: string;
}

export class PostShare implements IPostShare {
  constructor(
    public _id?: string,
    public PostId?: string,
    public RecipientId?: string,
    public SenderId?: string,
    public Description?: string
  ) {}
}
