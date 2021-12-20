export interface IBusinessUnit {
  _id?: string;
  name?: string;
  countries?: any[];
  company?: string;
  organization?: string;
}

export class BusinessUnit implements IBusinessUnit {
  constructor(
    public _id?: string,
    public name?: string,
    public countries?: [],
    public company?: string,
    public organization?: string
  ) {}
}
