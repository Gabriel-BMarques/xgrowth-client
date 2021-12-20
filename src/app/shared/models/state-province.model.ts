export interface IStateProvince {
  _id?: string;
  name?: string;
  countryId?: string;
}

export class StateProvince implements IStateProvince {
  constructor(public _id?: string, public name?: string, public countryId?: string) {}
}
