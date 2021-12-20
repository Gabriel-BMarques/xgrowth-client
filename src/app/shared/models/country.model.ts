export interface ICountry {
  _id?: string;
  name?: string;
  description?: string;
  globalRegion?: any;
  selected?: boolean;
}

export class Country implements ICountry {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public globalRegion?: any,
    public selected?: boolean
  ) {}
}
