export interface IFile {
  Name?: string;
  Size?: number;
  Type?: string;
  BriefId_Attachment?: string;
  BriefId_Media?: string;
  Order?: number;
  PostId_Attachment?: string;
  url?: string;
}

export class File implements IFile {
  constructor(
    public Name?: string,
    public Size?: number,
    public Type?: string,
    public BriefId_Attachment?: string,
    public BriefId_Media?: string,
    public Order?: number,
    public PostId_Attachment?: string,
    public url?: string
  ) {}
}
