export interface IGlobalRegion {
  _id?: string;
  name?: string;
  description?: string;
  reachLevel?: string;
  selected?: boolean;
}

export class GlobalRegion implements IGlobalRegion {
  constructor(
    public _id?: string,
    public name?: string,
    public description?: string,
    public reachLevel?: string,
    public selected?: boolean
  ) {}
}
