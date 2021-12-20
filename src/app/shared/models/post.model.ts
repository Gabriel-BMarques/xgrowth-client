import { IUploadedFile } from './uploadedFile.model';
import { IUser } from './user.model';

export interface IPost {
  _id?: string;
  Id_GUID?: string;
  SupplierId?: string;
  Title?: string;
  Description?: string;
  ContentType?: string;
  Categories?: any[];
  Tags?: any[];
  isConfidential?: boolean;
  isExclusive?: boolean;
  TypeOfContent?: number;
  Views?: number;
  IsPublic?: boolean;
  IsPublished?: boolean;
  IsDraft?: boolean;
  AcceptedTerms?: boolean;
  UploadedFiles?: IUploadedFile[];
  Attachments?: IUploadedFile[];
  CompanyProfileId?: string;
  BriefId?: string;
  RecipientsCompanyProfileId?: string[];
  Privacy?: string;
  CreatedBy?: IUser;
  isVisible?: boolean;
}

export class Post implements IPost {
  constructor(
    public _id?: string,
    public Id_GUID?: string,
    public SupplierId?: string,
    public Title?: string,
    public Description?: string,
    public ContentType?: string,
    public Categories?: any[],
    public Tags?: any[],
    public isConfidential?: boolean,
    public isExclusive?: boolean,
    public TypeOfContent?: number,
    public Views?: number,
    public IsPublic?: boolean,
    public IsPublished?: boolean,
    public IsDraft?: boolean,
    public AcceptedTerms?: boolean,
    public UploadedFiles?: IUploadedFile[],
    public Attachments?: IUploadedFile[],
    public CompanyProfileId?: string,
    public BriefId?: string,
    public RecipientsCompanyProfileId?: string[],
    public Privacy?: string,
    public CreatedBy?: IUser,
    public isVisible?: boolean
  ) {}
}
