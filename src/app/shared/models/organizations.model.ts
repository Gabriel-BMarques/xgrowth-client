import { ICompanyProfile } from './companyProfile.model';
import { IFile } from './file.model';

export interface IOrganization {
  _id?: string;
  name?: string;
  website?: string;
  whoWeAre?: string;
  numberOfEmployees?: string;
  annualSales?: string;
  domain?: string;
  segments?: any[];
  subSegments?: any[];
  skills?: any[];
  categoryOrganizations?: any[];
  allowedDomains?: any[];
  companies?: ICompanyProfile[];
  organizationType?: any;
  subType?: any;
  organizationAdmins?: any[];
  initiatives?: any[];
  certifications?: any[];
  organizationReach?: any[];
  logo?: Object;
  coverImage?: any;
  numberOfPosts?: number;
  yearFounded?: string;
  uploadedContent?: IFile;
  selected?: boolean;
  canEdit?: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization implements IOrganization {
  constructor(
    public _id?: string,
    public name?: string,
    public website?: string,
    public whoWeAre?: string,
    public numberOfEmployees?: string,
    public annualSales?: string,
    public domain?: string,
    public segments?: any[],
    public subSegments?: any[],
    public skills?: any[],
    public categoryOrganizations?: any[],
    public allowedDomains?: any[],
    public companies?: ICompanyProfile[],
    public organizationType?: any,
    public subType?: any,
    public organizationAdmins?: any[],
    public initiatives?: any[],
    public certifications?: any[],
    public organizationReach?: any[],
    public logo?: Object,
    public coverImage?: any,
    public numberOfPosts?: number,
    public yearFounded?: string,
    public uploadedContent?: IFile,
    public selected?: boolean,
    public canEdit?: boolean,
    public createdBy?: string,
    public updatedBy?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}
}
