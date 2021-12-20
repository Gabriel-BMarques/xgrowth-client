export interface ICertification {
  _id?: string;
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Certification implements ICertification {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
