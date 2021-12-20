export interface IDates {
  date?: Date;
  dateString?: string;
}

export class Dates implements IDates {
  constructor(public date?: Date, public dateString?: string) {}
}
