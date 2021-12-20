export interface IDefaultModel {
  id?: string;
  name?: string;
  description?: string;
}

export class DefaultModel implements IDefaultModel {
  constructor(public id?: string, public name?: string, public description?: string) {}
}
