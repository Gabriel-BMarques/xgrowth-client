export interface IInterest {
  _id?: string;
  categoryId?: string;
  userId?: string;
}

export class Interest implements IInterest {
  constructor(public _id?: string, public categoryId?: string, public userId?: string) {}
}
