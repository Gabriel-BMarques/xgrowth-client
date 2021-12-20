export interface IUserAction {
  _id?: string;
  Id_GUID?: string;
  Type?: number;
  UserId?: string;
  TargetUserId?: string;
  PostId?: string;
  BriefId?: string;
  CompanyId?: string;
  id?: string;
}

export class UserAction implements IUserAction {
  constructor(
    public _id?: string,
    public Id_GUID?: string,
    public Type?: number,
    public UserId?: string,
    public TargetUserId?: string,
    public PostId?: string,
    public BriefId?: string,
    public CompanyId?: string,
    public id?: string
  ) {}
}
