export interface IBriefMember {
  _id?: string;
  BriefId?: string;
  UserId?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  Admin?: boolean;
  IsContact?: boolean;
}

export class BriefMember implements IBriefMember {
  constructor(
    public _id?: string,
    public BriefId?: string,
    public UserId?: string,
    public CreatedBy?: string,
    public UpdatedBy?: string,
    public Admin?: boolean,
    public IsContact?: boolean
  ) {}
}
