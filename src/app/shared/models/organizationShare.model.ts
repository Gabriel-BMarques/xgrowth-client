export interface IOrganizationShare {
  _id?: string;
  organizationId?: string;
  recipientId?: string;
  senderId?: string;
}

export class OrganizationShare implements IOrganizationShare {
  constructor(
    public _id?: string,
    public organizationId?: string,
    public recipientId?: string,
    public senderId?: string
  ) {}
}
