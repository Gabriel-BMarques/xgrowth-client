export interface IPostCompany {
  _id?: string;
  CompanyId?: string;
  PostId?: string;
}

export class PostCompany implements IPostCompany {
  constructor(public _id?: string, public CompanyId?: string, public PostId?: string) {}
}
