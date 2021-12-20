import { IUploadedFile } from './uploadedFile.model';

export interface IResponse {
  _id?: string;
  Title?: string;
  Description?: string;
  ContentType?: string;
  IsPublished?: boolean;
  IsDraft?: boolean;
  AcceptedTerms?: boolean;
  UploadedFiles?: IUploadedFile[];
  Attachments?: IUploadedFile[];
  CompanyProfileId?: string;
  BriefId?: string;
}

export class Response implements IResponse {
  constructor(
    public _id?: string,
    public Title?: string,
    public Description?: string,
    public ContentType?: string,
    public IsPublished?: boolean,
    public IsDraft?: boolean,
    public AcceptedTerms?: boolean,
    public UploadedFiles?: IUploadedFile[],
    public Attachments?: IUploadedFile[],
    public CompanyProfileId?: string,
    public BriefId?: string
  ) {}
}
