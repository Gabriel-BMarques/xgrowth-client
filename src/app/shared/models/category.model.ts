export interface ICategory {
  _id?: string;
  name?: string;
  parentId?: string;
  organizationId?: string;
  isPublic?: boolean;
}

export class Category implements ICategory {
  constructor(
    public _id?: string,
    public name?: string,
    public parentId?: string,
    public organizationId?: string,
    public isPublic?: boolean
  ) {}
}
