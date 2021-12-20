import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouteReuseStrategy } from '@angular/router';
import { AuthenticationService } from '@app/core';
import * as _ from 'lodash';
import { DataService } from './../../services/data.service';
import { UserInfoService } from './../../services/user-info.service';
import { CompanyProfile } from './../../shared/models/companyProfile.model';
import { Organization } from './../../shared/models/organizations.model';
import { NotificationService } from '@app/services/notification.service';

@Component({
  selector: 'app-complete-register',
  templateUrl: './complete-register.component.html',
  styleUrls: ['./complete-register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CompleteRegisterComponent implements OnInit, OnDestroy {
  //user info
  SSOUser: boolean = false;
  AllowedDomainUser: boolean = false;
  NotAllowedDomainUser: boolean = false;
  user: any;
  userInfoSSO: any;
  domain: string;

  //form
  userForm!: FormGroup;
  orgForm!: FormGroup;
  canSubmitOrg: boolean = false;

  //form data
  departmentsSI: any;
  countriesSI: any;
  businessUnitsSI: any;
  jobTitlesSI: any;
  itemsSI: any;
  organizationTypesSI: any;
  organizationSegmentsSI: any;
  organizationSkillsSI: any;
  orgNameTaken: boolean = false;

  //placeholders
  firstNamePlaceHolder: string = 'e. g. Caroline';
  familyNamePlaceHolder: string = 'e. g. Smith';
  departmentPlaceHolder: string = 'Choose a department';
  jobTitlePlaceHolder: string = 'Select your job title';
  countryPlaceHolder: string = 'Choose a country';
  businessUnitPlaceHolder: string = 'Choose a BU';
  itemsPlaceHolder: string = 'Select item(s) from the list';
  organizationTypePlaceHolder: string = 'Choose a type from the list';
  organizationPlaceHolder: string = 'e.g. Growinco';
  segmentPlaceHolder: string = 'Choose segment(s)';
  skillsPlaceHolder: string = 'Select option(s) from the list';

  //page
  isLoading: boolean = true;
  activeStep: number = 1;
  @ViewChild('completeregisterSelect') completeregisterSelect: any;

  //new data
  newOrganizationId: any;
  newCompanyProfileId: any;

  // footer
  pdfTerms: any = '../../assets/Terms and Conditions.pdf';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private userInfoService: UserInfoService,
    private authenticationService: AuthenticationService,
    private routeReuseStrategy: RouteReuseStrategy,
    private notificationService: NotificationService
  ) {
    this.routeReuseStrategy.shouldReuseRoute;
    this.createUserForm();
    this.createOrgForm();
  }

  async ngOnInit() {
    this.user = this.userInfoService.storedUserInfo;
    await this.verifyEmailDomain();
  }

  async loadData() {
    if (this.AllowedDomainUser || this.SSOUser) {
      const data = await Promise.all([
        this.dataService.list('/misc/department').toPromise(),
        this.dataService.list('/misc/job-title').toPromise(),
        this.dataService.list('/misc/country').toPromise(),
        this.dataService.listAll('/company-profile', { organization: this.user.organization._id }).toPromise(),
        this.dataService.list('/category-organization').toPromise(),
        this.dataService.list('/organization/organization-type').toPromise(),
        this.dataService.listAll('/segments').toPromise(),
        this.dataService.listAll('/skills').toPromise()
      ]);
      [
        this.departmentsSI,
        this.jobTitlesSI,
        this.countriesSI,
        this.businessUnitsSI,
        this.itemsSI,
        this.organizationTypesSI,
        this.organizationSegmentsSI,
        this.organizationSkillsSI
      ] = data.map(d => new MatTableDataSource(d.body));
    }

    if (this.NotAllowedDomainUser) {
      const data = await Promise.all([
        this.dataService.list('/misc/department').toPromise(),
        this.dataService.list('/misc/job-title').toPromise(),
        this.dataService.list('/misc/country').toPromise(),
        this.dataService.list('/category-organization').toPromise(),
        this.dataService.list('/organization/organization-type').toPromise(),
        this.dataService.listAll('/segments').toPromise(),
        this.dataService.listAll('/skills').toPromise()
      ]);
      [
        this.departmentsSI,
        this.jobTitlesSI,
        this.countriesSI,
        this.itemsSI,
        this.organizationTypesSI,
        this.organizationSegmentsSI,
        this.organizationSkillsSI
      ] = data.map(d => new MatTableDataSource(d.body));
    }
  }

  async verifyEmailDomain() {
    let userEmail;
    if (this.user) {
      userEmail = this.user.email;
    } else {
      await this.route.queryParams.toPromise().then(params => {
        if (params['email']) {
          userEmail = params['email'];
        }
      });
    }
    this.domain = userEmail.substring(userEmail.lastIndexOf('@') + 1);

    // SSO
    if (this.domain.toLowerCase() === 'growinco.com' || this.domain.toLowerCase() === 'mdlz.com') {
      this.SSOUser = true;
      await this.loadPage();
    } else {
      this.authenticationService
        .verifyDomain({ email: userEmail })
        .toPromise()
        .then(async (res: any) => {
          // Allowed domain
          if (res.body.domain || this.user.organization) {
            this.AllowedDomainUser = true;
            await this.loadPage();
          }
          // Not allowed domain
          else {
            this.NotAllowedDomainUser = true;
            await this.loadPage();
          }
        });
    }
  }

  async loadPage() {
    await this.loadData();
    await this.setUserData();
    this.isLoading = false;
  }

  inputEmpty(control: FormControl): boolean {
    return control.value === undefined || control.value === '' || control.value === null;
  }

  async submitUser() {
    await this.dataService.updateUser('/users', this.prepareUserDataToSubmit()).toPromise();
    this.router.navigate(['/interests'], { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }

  async submitNotAllowedUser() {
    await this.dataService.updateUser('/users', this.prepareUserDataToSubmit()).toPromise();
    this.canSubmitOrg = true;
    this.activeStep = 2;
  }

  async submitOrganization() {
    try {
      await this.dataService
        .create('/organization', this.prepareOrganizationDataToSubmit())
        .toPromise()
        .then(res => {
          this.newOrganizationId = res.body._id;
        });
    } catch (err) {
      if (err.error == 'ERROR: this organization name has been taken') {
        this.orgForm.controls.organizationName.setValue('');
        this.orgNameTaken = true;
        return;
      }
      return;
    }

    await this.dataService
      .create('/company-profile', this.prepareBusinessUnitToSubmit())
      .toPromise()
      .then(res => {
        this.newCompanyProfileId = res.body._id;
        console.log(res.body);
      });

    await this.dataService
      .updateUser('/users', this.prepareUserDataWithNewBu())
      .toPromise()
      .then(res => {
        console.log(res.body);
      });

    await this.sendWelcomeNotification();

    await this.userInfoService.refreshUserInfo();

    await this.router.navigate([`/organization/${this.newOrganizationId}/overview`], { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }

  prepareBusinessUnitToSubmit() {
    const entity = new CompanyProfile();
    entity.companyName = this.orgForm.controls.organizationName.value;
    entity.Email = this.user.email;
    entity.organization = this.newOrganizationId;
    return entity;
  }

  sendWelcomeNotification() {
    this.notificationService.sendWelcomeNotification(this.user);
  }

  prepareUserDataWithNewBu() {
    const entity = this.user;
    entity.company = this.newCompanyProfileId;
    entity.organization = this.newOrganizationId;
    entity.profileComplete = true;
    return entity;
  }

  prepareUserDataToSubmit() {
    const entity = this.user;

    if (this.SSOUser || this.AllowedDomainUser) {
      entity.firstName = this.userForm.controls.firstName.value;
      entity.familyName = this.userForm.controls.familyName.value;
      entity.department = this.userForm.controls.department.value;
      entity.jobTitle = this.userForm.controls.jobTitle.value;
      entity.country = this.userForm.controls.country.value;
      entity.company = this.userForm.controls.businessUnit.value;
      entity.categoryOrganization = this.userForm.controls.items.value;
      entity.profileComplete = true;
    }
    if (this.NotAllowedDomainUser) {
      entity.firstName = this.userForm.controls.firstName.value;
      entity.familyName = this.userForm.controls.familyName.value;
      entity.department = this.userForm.controls.department.value;
      entity.jobTitle = this.userForm.controls.jobTitle.value;
      entity.country = this.userForm.controls.country.value;
      entity.categoryOrganization = this.userForm.controls.items.value;
    }

    return entity;
  }

  prepareOrganizationDataToSubmit() {
    const entity = new Organization();
    entity.organizationType = this.orgForm.controls.organizationType.value;
    entity.name = this.orgForm.controls.organizationName.value;
    entity.segments = this.orgForm.controls.organizationSegments.value;
    entity.skills = this.orgForm.controls.organizationSkills.value;
    entity.organizationReach = this.orgForm.controls.organizationReach.value;
    return entity;
  }

  switchStep(n: number) {
    this.activeStep = n;
    console.log('user form', this.userForm);
  }

  get title(): string {
    if (this.activeStep == 1) return 'user profile';
    if (this.activeStep == 2) return 'organization overview';
  }

  get disableSubmitUser(): boolean {
    if (
      this.userForm.controls.firstName.invalid ||
      this.userForm.controls.familyName.invalid ||
      this.userForm.controls.department.invalid ||
      this.userForm.controls.jobTitle.invalid ||
      this.userForm.controls.country.invalid ||
      this.userForm.controls.businessUnit.invalid ||
      this.userForm.controls.items.invalid
    )
      return true;
    else return false;
  }

  get disableSubmitNotAllowedUser(): boolean {
    if (
      this.userForm.controls.firstName.invalid ||
      this.userForm.controls.familyName.invalid ||
      this.userForm.controls.department.invalid ||
      this.userForm.controls.jobTitle.invalid ||
      this.userForm.controls.country.invalid
    )
      return true;
    else return false;
  }

  get orgNameError(): string {
    if (this.orgNameTaken) return 'This organization name has been taken';
    else return "That's a required field";
  }

  get disableSubmitOrganization(): boolean {
    if (
      this.orgForm.controls.organizationType.invalid ||
      this.orgForm.controls.organizationName.invalid ||
      this.orgForm.controls.organizationSegments.invalid ||
      this.orgForm.controls.organizationSkills.invalid ||
      this.orgForm.controls.organizationReach.invalid ||
      !this.canSubmitOrg
    )
      return true;
    else return false;
  }

  applyFilter(filterValue: string, values: MatTableDataSource<any[]>) {
    if (filterValue === null) {
      values.filter = '';
    } else {
      values.filter = filterValue.trim().toLowerCase();
    }
  }

  includes(object: any, array: any[]) {
    return array.some(el => el._id === object._id);
  }

  get globalRegions() {
    let uniqGlobalRegion = _.uniqWith(
      this.countriesSI.filteredData.map((or: any) => or.globalRegion),
      _.isEqual
    );
    uniqGlobalRegion = _.uniqBy(uniqGlobalRegion, '_id');
    return uniqGlobalRegion;
  }

  toggleCountries(region: any) {
    region.selected = !region.selected;
    const regionCountries = this.countriesSI.data.filter((c: any) => c.globalRegion._id === region._id);
    let selectedCountries = this.orgForm.controls.organizationReach.value;

    if (!selectedCountries) {
      selectedCountries = [];
    }

    if (region.selected) {
      const newCountries = _.uniqWith(selectedCountries.concat(regionCountries.map((c: any) => c._id)), _.isEqual);
      this.orgForm.controls.organizationReach.setValue(newCountries);
    } else {
      selectedCountries = selectedCountries.filter((sc: any) => !regionCountries.map((c: any) => c._id).includes(sc));
      this.orgForm.controls.organizationReach.setValue(selectedCountries);
    }
  }

  loadRegionSelection() {
    this.globalRegions.map((gr: any) => {
      gr.selected = this.allRegionCountriesSelected(this.countriesSI, gr, this.orgForm.controls.organizationReach);
    });
  }

  allRegionCountriesSelected(dataSource: MatTableDataSource<any>, parent: any, formControl: any): boolean {
    const dataSourceIds = dataSource.data.filter(d => d.globalRegion._id === parent._id).map(d => d._id);
    let selectedItems = formControl.value.filter((si: any) => {
      return dataSourceIds.includes(si);
    });
    const allSelected = selectedItems.length === dataSourceIds.length;
    return allSelected;
  }

  private createUserForm() {
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      familyName: ['', Validators.required],
      department: ['', Validators.required],
      jobTitle: ['', Validators.required],
      country: ['', Validators.required],
      orgName: ['', Validators.required],
      businessUnit: ['', Validators.required],
      items: ['']
    });
  }

  private createOrgForm() {
    this.orgForm = this.formBuilder.group({
      organizationType: ['', Validators.required],
      organizationName: ['', Validators.required],
      organizationSegments: ['', Validators.required],
      organizationSkills: ['', Validators.required],
      organizationReach: ['', Validators.required]
    });
  }

  private async setUserData() {
    if (this.SSOUser) {
      //await this.loadSSOUserInfo();
      if (this.user.firstName) {
        this.userForm.controls.firstName.setValue(this.user.firstName);
        this.userForm.controls.firstName.disable();
      }
      if (this.user.familyName) {
        this.userForm.controls.familyName.setValue(this.user.familyName);
        this.userForm.controls.familyName.disable();
      }
      if (this.user.department) {
        this.userForm.controls.department.setValue(this.user.department);
        this.userForm.controls.department.disable();
      }
      if (this.user.jobTitle) {
        this.userForm.controls.jobTitle.setValue(this.user.jobTitle);
        this.userForm.controls.jobTitle.disable();
      }
      if (this.user.company) {
        this.userForm.controls.businessUnit.setValue(this.user.company);
        this.userForm.controls.businessUnit.disable();
      }
      if (this.user.organization) {
        this.userForm.controls.orgName.setValue(this.user.organization.name);
      }
      this.userForm.controls.orgName.disable();
    }

    if (this.AllowedDomainUser) {
      console.log(this.user);
      this.userForm.setValue({
        orgName: this.user.organization?.name || null,
        firstName: this.user.firstName || null,
        familyName: this.user.familyName || null,
        businessUnit: this.user.company?._id || null,
        jobTitle: this.user.jobTitle || null,
        department: this.user.department || null,
        country: this.user.country || null,
        items: null
      });
      this.userForm.controls.orgName.disable();
    }
  }

  async loadSSOUserInfo() {
    await this.route.queryParams.toPromise().then(params => {
      if (params['firstName']) {
        this.userInfoSSO.firstName = params['firstName'];
      }
      if (params['familyName']) {
        this.userInfoSSO.familyName = params['familyName'];
      }
      if (params['jobTitle']) {
        this.userInfoSSO.jobTitle = params['jobTitle'];
      }
      if (params['department']) {
        this.userInfoSSO.department = params['department'];
      }
    });
  }

  closesDropdowns() {
    this.completeregisterSelect.close();
  }

  logout() {
    this.authenticationService
      .logout()
      .toPromise()
      .then(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  openTerms() {
    window.open(this.pdfTerms, '_blank');
  }

  needHelp() {
    window.location.href = 'mailto:support@growinco.com';
  }

  async ngOnDestroy() {}
}
