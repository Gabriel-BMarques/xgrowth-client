export interface ISkill {
  _id?: string;
  name?: string;
  segment?: any;
  createdBy?: string;
  updatedBy?: string;
}

export class Skill implements ISkill {
  constructor(
    public _id?: string,
    public name?: string,
    public segment?: any,
    public createdBy?: string,
    public updatedBy?: string
  ) {}
}
