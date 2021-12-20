export interface ICategoryOrganization {
  _id?: string;
  name?: string;
  segment?: string;
  isPublic?: boolean;
}

export class CategoryOrganization implements ICategoryOrganization {
  constructor(public _id?: string, public name?: string, public segment?: string, public isPublic?: boolean) {}
}
