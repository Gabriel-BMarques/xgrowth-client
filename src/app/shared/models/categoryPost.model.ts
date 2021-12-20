export interface ICategoryPost {
  _id?: string;
  categoryId?: string;
  postId?: string;
}

export class CategoryPost implements ICategoryPost {
  constructor(public _id?: string, public categoryId?: string, public postId?: string) {}
}
