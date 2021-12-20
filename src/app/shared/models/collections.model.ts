export interface ICollection {
  _id?: string;
  Name?: string;
  postsIds?: string[];
  members?: object[];
  numberOfPosts?: number;
}

export class Collection implements ICollection {
  constructor(
    public _id?: string,
    public Name?: string,
    public postsIds?: string[],
    public members?: object[],
    public numberOfPosts?: number
  ) {}
}
