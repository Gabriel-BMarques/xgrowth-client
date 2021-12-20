export interface IBriefCategory {
  _id?: string;
  briefId?: string;
  categoryId?: number;
}

export class BriefCategory implements IBriefCategory {
  constructor(public _id?: string, public briefId?: string, public categoryId?: number) {}
}
