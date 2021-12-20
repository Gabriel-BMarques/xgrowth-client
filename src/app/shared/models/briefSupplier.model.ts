import { IUploadedFile } from './uploadedFile.model';

export interface IBriefSupplier {
  _id?: string;
  BriefId?: string;
  SupplierId?: string;
  Accepted?: boolean;
  Responded?: boolean;
  CreatedBy?: string;
  UpdatedBy?: string;
  SignedNda?: boolean;
  SignedNdaFile?: object;
  SignedNdaFileId?: string;
  NdaAcceptance?: number;
  NdaAcceptanceReason?: string;
  NdaFileId?: string;
  Nda?: IUploadedFile;
}

export class BriefSupplier implements IBriefSupplier {
  constructor(
    public _id?: string,
    public BriefId?: string,
    public SupplierId?: string,
    public Accepted?: boolean,
    public Responded?: boolean,
    public CreatedBy?: string,
    public SignedNda?: boolean,
    public SignedNdaFile?: object,
    public SignedNdaFiledId?: string,
    public NdaAcceptance?: number,
    public NdaAcceptanceReason?: string,
    public NdaFileId?: string,
    public Nda?: IUploadedFile
  ) {}
}
