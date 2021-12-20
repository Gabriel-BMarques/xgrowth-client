import { IUploadedFile } from './uploadedFile.model';

export interface IWebinar {
  _id?: string;
  title?: string;
  description?: string;
  descriptionSlice?: boolean;
  isPublished?: boolean;
  meetingLink?: string;
  reviewStatus?: string;
  denialReason?: string;
  editingStatus?: boolean;
  type?: any;
  createdBy?: any;
  uploadedFiles?: IUploadedFile[];
  eventDate?: string;
  eventEndDate?: string;
  eventTimezone?: { text: string; offset: number };
  targetOrganization?: string[];
  targetDepartments?: string[];
  targetCountries?: string[];
  targetCompanies?: string[];
}

export class Webinar implements IWebinar {
  constructor(
    public _id?: string,
    public title?: string,
    public description?: string,
    public descriptionSlice?: boolean,
    public isPublished?: boolean,
    public meetingLink?: string,
    public reviewStatus?: string,
    public denialReason?: string,
    public editingStatus?: boolean,
    public type?: any,
    public createdBy?: any,
    public uploadedFiles?: IUploadedFile[],
    public eventDate?: string,
    public eventEndDate?: string,
    public eventTimezone?: { text: string; offset: number },
    public targetOrganization?: string[],
    public targetDepartments?: string[],
    public targetCountries?: string[],
    public targetCompanies?: string[]
  ) {}
}
