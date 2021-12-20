export interface IInitiative {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Initiative implements IInitiative {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
