export interface ISegment {
  _id?: string;
  name?: string;
  description?: string;
  parentId?: any;
  selected?: boolean;
}

export class Segment implements ISegment {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public parentId?: any,
    public selected?: boolean
  ) {}
}
