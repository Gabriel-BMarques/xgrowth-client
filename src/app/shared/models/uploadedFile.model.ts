export interface IUploadedFile {
  _id?: string;
  Name?: string;
  Description?: string;
  url?: string;
  Order?: number;
  Size?: number;
  Type?: string;
  isImage?: boolean;
  isVideo?: boolean;
}

export class IUploadedFile implements IUploadedFile {
  constructor(
    public _id?: string,
    public Name?: string,
    public Description?: string,
    public url?: string,
    public Order?: number,
    public Size?: number,
    public Type?: string,
    public isImage?: boolean,
    public isVideo?: boolean
  ) {}
}
