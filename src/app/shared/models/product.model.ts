import { ICountry } from './country.model';

export interface IProduct {
  _id?: string;
  name?: string;
  description?: string;
  plantId?: string;
  lineId?: string;
  samples?: boolean;
  weight?: number;
  measuringUnit?: string;
  salesMarket?: ICountry[];
  isPublished?: boolean;
  uploadedFiles?: any[];
  company?: any;
  organization?: any;
}

export class Product implements IProduct {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public plantId?: string,
    public lineId?: string,
    public samples?: boolean,
    public weight?: number,
    public measuringUnit?: string,
    public salesMarket?: ICountry[],
    public isPublished?: boolean,
    public uploadedFiles?: any[],
    public company?: any,
    public organization?: any
  ) {}
}
