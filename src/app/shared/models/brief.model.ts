import { IUploadedFile } from './uploadedFile.model';

export interface IBrief {
  _id?: string;
  ClientId?: string;
  Title?: string;
  Description?: string;
  NonDisclosureAgreement?: string;
  NdaFileId?: string;
  MembersOnly?: boolean;
  ContentType?: string;
  Type?: number;
  type?: any;
  BriefType?: string;
  State?: string;
  Categories?: any[];
  Tags?: any[];
  IsPublished?: boolean;
  IsDraft?: boolean;
  Markets?: any[];
  TeamMembers?: any[];
  Solvers?: any[];
  UploadedFiles?: IUploadedFile[];
  Attachments?: IUploadedFile[];
  Nda?: IUploadedFile;
  Companies?: any[];
  CompanyProfileId?: string;
  isPublic?: boolean;
  Deadline?: string;
  DeadlineTimezone?: { text: string; offset: number };
  RecipientsCompanyProfileId?: string[];
  NdaRequirementMode?: number;
  isSent?: boolean;
  isActive?: boolean;
  CreatedBy?: any;
}

export class Brief implements IBrief {
  constructor(
    public _id?: string,
    public ClientId?: string,
    public Title?: string,
    public Description?: string,
    public NonDisclosureAgreement?: string,
    public NdaFileId?: string,
    public MembersOnly?: boolean,
    public NdaRequirementMode?: number,
    public ContentType?: string,
    public Type?: number,
    public type?: any,
    public BriefType?: string,
    public State?: string,
    public Categories?: any[],
    public Tags?: any[],
    public IsPublished?: boolean,
    public IsDraft?: boolean,
    public Markets?: any[],
    public TeamMembers?: any[],
    public Solvers?: any[],
    public UploadedFiles?: IUploadedFile[],
    public Attachments?: IUploadedFile[],
    public Nda?: IUploadedFile,
    public Companies?: any[],
    public CompanyProfileId?: string,
    public isPublic?: boolean,
    public Deadline?: string,
    public DeadlineTimezone?: { text: string; offset: number },
    public RecipientsCompanyProfileId?: string[],
    public isSent?: boolean,
    public isActive?: boolean,
    public CreatedBy?: any
  ) {}
}
