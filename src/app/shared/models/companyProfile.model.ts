import { IOrganization } from './organizations.model';

export interface ICompanyProfile {
  _id?: string;
  companyName?: string;
  corporateName?: string;
  corporateTaxPayer?: string;
  description?: string;
  coverImage?: string;
  logo?: { url: string };
  skills?: [];
  segments?: [];
  otherSegments?: string[];
  levelOfQualityTeam?: number;
  levelOfResearch?: number;
  yearOfEstablishment?: number;
  numberOfEmployees?: string;
  exportationExpertise?: [];
  annualSalesInUSD?: number;
  companyWebsite?: string;
  allowedDomain?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressNumber?: number;
  city?: string;
  stateProvinceRegion?: string;
  zipCode?: string;
  country?: {};
  Email?: string;
  Phone?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  disable?: boolean;
  organization?: any;
  FileId?: string;
  postLimit?: number;
  postWaitDays?: number;
  Type?: number;
  selected?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  LastActivity?: Date;
  numberOfPosts?: number;
  type?: string;
  hasWebinarAccess?: boolean;
}

export class CompanyProfile implements ICompanyProfile {
  constructor(
    public _id?: string,
    public companyName?: string,
    public corporateName?: string,
    public corporateTaxPayer?: string,
    public description?: string,
    public coverImage?: string,
    public logo?: { url: string },
    public skills?: [],
    public segments?: [],
    public otherSegments?: string[],
    public levelOfQualityTeam?: number,
    public levelOfResearch?: number,
    public yearOfEstablishment?: number,
    public numberOfEmployees?: string,
    public exportationExpertise?: [],
    public annualSalesInUSD?: number,
    public companyWebsite?: string,
    public allowedDomain?: string,
    public addressLine1?: string,
    public addressLine2?: string,
    public addressNumber?: number,
    public city?: string,
    public stateProvinceRegion?: string,
    public zipCode?: string,
    public country?: {},
    public Email?: string,
    public Phone?: string,
    public CreatedBy?: string,
    public UpdatedBy?: string,
    public organization?: any,
    public FileId?: string,
    public postLimit?: number,
    public postWaitDays?: number,
    public Type?: number,
    public selected?: boolean,
    public createdAt?: Date,
    public updatedAt?: Date,
    public LastActivity?: Date,
    public type?: string,
    public hasWebinarAccess?: boolean,
    public numberOfPosts?: number
  ) {}
}
