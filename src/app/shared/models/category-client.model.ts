export interface ICategoryClient {
  _id?: string;
  categoryId?: string;
  clientId?: string;
}

export class CategoryClient implements ICategoryClient {
  constructor(public _id?: string, public categoryId?: string, public clientId?: string) {}
}
