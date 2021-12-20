import { ICompanyProfile } from './companyProfile.model';

export interface IProfile {
  id?: string;
  userId?: string;
  name?: string;
  familyName?: string;
  company?: ICompanyProfile;
  email?: string;
  jobTitle?: string;
  department?: string;
  country?: string;
  phonePrefix?: string;
  phoneNumber?: string;
}

export class Profile implements IProfile {
  constructor(
    public id?: string,
    public userId?: string,
    public name?: string,
    public familyName?: string,
    public company?: ICompanyProfile,
    public email?: string,
    public jobTitle?: string,
    public department?: string,
    public country?: string,
    public phonePrefix?: string,
    public phoneNumber?: string
  ) {}
}
