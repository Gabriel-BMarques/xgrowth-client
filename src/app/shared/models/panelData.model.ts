import { IItem } from './item.model';

export interface IPanelData {
  _id?: string;
  name?: string;
  type?: string;
  companyName?: string;
  isEditing?: boolean;
  items?: IItem[];
}

export class PanelData implements IPanelData {
  constructor(
    public _id?: string,
    public name?: string,
    public type?: string,
    public companyName?: string,
    public isEditing?: boolean,
    public items?: IItem[]
  ) {}
}
