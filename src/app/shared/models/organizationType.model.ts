export interface IOrganizationType {
  _id?: string;
  name?: string;
  description?: string;
  parentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrganizationType implements IOrganizationType {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public parentId?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
