export interface ICollectionPost {
  _id?: string;
  collectionId?: string;
  postId?: string;
}

export class CollectionPost implements ICollectionPost {
  constructor(public _id?: string, public collectionId?: string, public postId?: string) {}
}
