import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { CredentialsService } from '@app/core';
import { DataService } from '@app/services/data.service';
import { NavigationService } from '@app/services/navigation.service';
import { IBrief } from '@app/shared/models/brief.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';

@Injectable({
  providedIn: 'root'
})
export class MyBriefGuard implements CanActivate {
  _currentCompany: ICompanyProfile;
  _userRole: string;
  _briefId: string;
  _brief: any;

  constructor(
    private router: Router,
    private dataService: DataService,
    private credentialsService: CredentialsService,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {
    this._userRole = this.credentialsService.checkRole;
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    this.briefId = route.params.id;
    if (this._userRole === 'admin') {
      return true;
    }
    return await this.canView();
  }

  private async loadInfo() {
    await this.dataService
      .getUserCompany()
      .toPromise()
      .then(resCompany => {
        this.currentCompany = resCompany.body;
      });
  }

  async getBrief() {
    await this.dataService
      .find('/brief', this.briefId)
      .toPromise()
      .then(resBrief => {
        this.brief = resBrief.body;
      });
  }

  private get currentCompany() {
    return this._currentCompany;
  }

  private set currentCompany(company: ICompanyProfile) {
    this._currentCompany = company;
  }

  private get briefId() {
    return this._briefId;
  }

  private set briefId(id: string) {
    this._briefId = id;
  }

  private get brief() {
    return this._brief;
  }

  private set brief(entity: any) {
    this._brief = entity;
  }

  private async canView(): Promise<boolean> {
    // this.brief = this.navigationService.brief;
    // this.briefId = this.route.snapshot.params.id;
    if (!this.currentCompany) {
      await this.loadInfo();
    }
    if (this.briefId) {
      await this.getBrief();
    }
    return (
      this.brief.ClientId.organization._id === this.currentCompany.organization._id ||
      this.brief.ClientId.organization === this.currentCompany.organization._id ||
      this.brief.ClientId.organization === this.currentCompany.organization
    );
  }
}
