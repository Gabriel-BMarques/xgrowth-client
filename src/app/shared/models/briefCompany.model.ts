export interface IBriefCompany {
  BriefId?: string;
  CompanyId?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
}

export class BriefCompany implements IBriefCompany {
  constructor(
    public BriefId?: string,
    public CompanyId?: string,
    public CreatedBy?: string,
    public UpdatedBy?: string
  ) {}
}
