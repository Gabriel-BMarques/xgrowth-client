export interface ICity {
  _id?: string;
  name?: string;
  stateProvinceId?: string;
}

export class City implements ICity {
  constructor(public _id?: string, public name?: string, public stateProvinceId?: string) {}
}
