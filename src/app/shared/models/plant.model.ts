import { ILine } from './line.model';

export interface IPlant {
  _id?: string;
  name?: string;
  address?: string;
  city?: any;
  stateProvinceRegion?: any;
  country?: any;
  contact?: string;
  organization?: any;
  company?: any;
  lines?: ILine[];
  linesActive?: boolean;
}

export class Plant implements IPlant {
  constructor(
    public _id?: string,
    public name?: string,
    public address?: string,
    public city?: any,
    public stateProvinceRegion?: any,
    public country?: any,
    public contact?: string,
    public organization?: any,
    public company?: any,
    public lines?: ILine[],
    public linesActive?: boolean
  ) {}
}
