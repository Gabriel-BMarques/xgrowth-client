export interface IPhonePrefix {
  _id?: string;
  name?: string;
  description?: string;
}

export class PhonePrefix implements IPhonePrefix {
  constructor(public _id?: string, public name?: string, public description?: string) {}
}
