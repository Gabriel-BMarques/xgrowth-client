export interface ICompanyRelation {
  _id?: string;
  companyA?: string;
  companyB?: string;
  disabled?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompanyRelation implements ICompanyRelation {
  constructor(
    public _id?: string,
    public companyA?: string,
    public companyB?: string,
    public disabled?: boolean,
    public createdBy?: string,
    public updatedBy?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
