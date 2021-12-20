import { ICompanyProfile } from './companyProfile.model';
import { IOrganization } from './organizations.model';

export interface IUser {
  id?: string;
  _id?: string;
  _id_XG?: string;
  role?: string;
  activated?: boolean;
  reactivated?: boolean;
  Global?: boolean;
  profileComplete?: boolean;
  firstName?: string;
  familyName?: string;
  company?: ICompanyProfile;
  organization?: IOrganization;
  department?: string;
  jobTitle?: string;
  email?: string;
  businessUnit?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  selected?: boolean;
}

export class User implements IUser {
  constructor(
    public id?: string,
    public _id?: string,
    public _id_XG?: string,
    public role?: string,
    public activated?: boolean,
    public reactivated?: boolean,
    public Global?: boolean,
    public profileComplete?: boolean,
    public firstName?: string,
    public familyName?: string,
    public company?: ICompanyProfile,
    public organization?: IOrganization,
    public department?: string,
    public jobTitle?: string,
    public email?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public selected?: boolean,
    public businessUnit?: string[]
  ) {}
}
