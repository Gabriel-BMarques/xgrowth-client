import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataService } from '@app/services/data.service';
import { IBrief } from '@app/shared/models/brief.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import * as _ from 'lodash';
@Injectable({
  providedIn: 'root'
})
export class LoadBriefsService {
  briefsAux: IBrief[] = [];
  adminBriefs: IBrief[] = [];
  sentBriefs: IBrief[] = [];
  receivedBriefs: IBrief[] = [];
  briefSuppliers: IBrief[] = [];

  hasLoadedSent: boolean = false;
  hasLoadedReceived: boolean = false;
  hasLoadedAdmin: boolean = false;

  currentUserCompany: ICompanyProfile;

  categoriesHeader: any[];
  filterForm: FormGroup = undefined;
  searchForm: FormGroup = undefined;

  constructor(private dataService: DataService) {}

  resetFilterAndSearch() {
    this.filterForm = undefined;
    this.searchForm = undefined;
  }

  resetService() {
    this.briefsAux = [];
    this.adminBriefs = [];
    this.sentBriefs = [];
    this.receivedBriefs = [];
    this.briefSuppliers = [];
    this.hasLoadedSent = false;
    this.hasLoadedReceived = false;
    this.hasLoadedAdmin = false;
    this.currentUserCompany = undefined;
  }

  async loadAdminData() {
    await this.dataService
      .listAll('/brief')
      .toPromise()
      .then(briefs => {
        this.adminBriefs = briefs.body.filter(brief => brief.IsDraft !== true);
        this.adminBriefs.map(brief => ((brief.isSent = true), (brief.isPublic = true)));
      });
    this.hasLoadedAdmin = true;
  }

  async getSentBriefs() {
    await this.dataService
      .listByOrganization('/brief/byOrganization')
      .toPromise()
      .then(briefs => {
        briefs.body.map(brief => ((brief.isPublic = true), (brief.isSent = true)));
        this.sentBriefs = [];
        this.sentBriefs = this.sentBriefs.concat(briefs.body);
      });
    this.hasLoadedSent = true;
  }

  async getReceivedBriefs() {
    await this.dataService
      .listById('/brief-supplier/supplier', this.currentUserCompany._id)
      .toPromise()
      .then(briefSuppliers => {
        this.briefSuppliers = briefSuppliers.body;
        briefSuppliers.body
          .filter(briefSupplier => briefSupplier.BriefId !== null)
          .map(briefSupplier => (this.setPrivacy(briefSupplier), (briefSupplier.BriefId.isSent = false)));
        const publishedBriefs = briefSuppliers.body.filter(briefSupplier => {
          return briefSupplier.BriefId !== null && briefSupplier.BriefId.IsDraft !== true;
        });
        const receivedBriefs = _.orderBy(
          publishedBriefs.map(briefSupplier => {
            return briefSupplier.BriefId;
          }),
          brief => brief.createdAt,
          'desc'
        );

        this.receivedBriefs = [];
        this.receivedBriefs = this.receivedBriefs.concat(receivedBriefs);
      });
    this.hasLoadedReceived = true;
  }

  setPrivacy(briefSupplier: any) {
    if (briefSupplier.BriefId) {
      if (briefSupplier.BriefId.NdaRequirementMode === 2) {
        briefSupplier.BriefId.isPublic = true;
        return;
      }
      briefSupplier.BriefId.isPublic = briefSupplier.NdaAcceptance === 1 && briefSupplier.SignedNda;
    }
  }
}
