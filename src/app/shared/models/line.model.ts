import { IProduct } from './product.model';

export interface ILine {
  _id?: string;
  name?: string;
  description?: string;
  plantId?: string;
  company?: string;
  products?: IProduct[];
}

export class Line implements ILine {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public plantId?: string,
    public company?: string,
    public products?: IProduct[]
  ) {}
}
