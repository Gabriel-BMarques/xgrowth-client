export interface INotification {
  _id?: string;
  title?: string;
  description?: string;
  link?: string;
  sendDate?: Date;
  sentOn?: Date;
  receiverId?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification implements INotification {
  constructor(
    public _id?: string,
    public title?: string,
    public description?: string,
    public link?: string,
    public sendDate?: Date,
    public sentOn?: Date,
    public receiverId?: string,
    public status?: string,
    public createdBy?: string,
    public updatedBy?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
