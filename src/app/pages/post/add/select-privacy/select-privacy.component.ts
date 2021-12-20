import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { IOrganization } from '@app/shared/models/organizations.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import * as _ from 'lodash';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-select-privacy',
  templateUrl: './select-privacy.component.html',
  styleUrls: ['./select-privacy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectPrivacyComponent {
  header: string;
  searchbar: string;
  isLoading = true;
  privacyForm!: FormGroup;
  organizations: IOrganization[];
  companies: ICompanyProfile[];
  organizationData: MatTableDataSource<IOrganization>;
  loadingCompanies = true;
  companyIds: string[] = [];
  allSelected: boolean;
  currentUserCompany: any;

  get privacy() {
    return this.privacyForm.controls.privacy.value;
  }

  get isEditing() {
    return this.wizard.isEditing;
  }

  get postId() {
    return this.wizard.postId;
  }

  constructor(
    private headerService: HeaderService,
    public wizard: PostAddWizardService,
    public modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private navigationService: NavigationService
  ) {
    this.headerService.setHeader(this.header);
    this.headerService.setHeader(this.searchbar);
  }

  async ionViewWillEnter() {
    this.wizard.currentView = 2;
    this.verifyHeaderLang();
    await this.checkWizardReset();
    this.isLoading = true;
    await this.loadData();
    this.isLoading = false;
  }

  async resetPostCreation() {
    const postId = this.route.snapshot.params.id;
    if (!postId) this.router.navigate(['/post/add'], { replaceUrl: true });
    else this.wizard.postId = postId;
    await this.wizard.loadWizard();
  }

  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetPostCreation();
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Post Privacy';
      this.searchbar = 'Search Companies';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Privacidade do Post';
      this.searchbar = 'Procurar Empresas';
    }
  }

  prepareSelection() {
    this.companyIds = this.wizard.step2Form.controls.recipientsCompanyProfileId.value;
    this.organizations.map((org: any) => {
      org.companies.map((comp: any) => {
        if (this.companyIds.includes(comp._id)) comp.selected = true;
        else comp.selected = false;
      });
    });

    let found;
    this.organizations.map(org => {
      found = org.companies.some(comp => comp.selected !== true);
    });
    this.allSelected = !found;
  }

  async loadData() {
    this.privacyForm = _.cloneDeep(this.wizard.step2Form);
    await this.refreshOrganizations();
    if (this.privacy === 'Selected Companies') {
      this.prepareSelection();
    }
  }

  canDeactivate() {
    return this.navigationService.generateAlert(
      'Discard Post?',
      'If you leave the post creation now, you will lose the edited information',
      'Discard',
      'Keep'
    );
  }

  deselectCompanies() {
    this.organizations.map(organization => {
      organization.companies.map(company => (company.selected = false));
    });
    this.companyIds = [];
    this.privacyForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  async switchPrivacy(privacy?: string) {
    const isPublic: boolean = privacy === 'Public';
    this.privacyForm.controls.privacy.setValue(privacy);
    this.privacyForm.controls.isPublic.setValue(isPublic);
    this.deselectCompanies();
    this.wizard.step2Form = _.cloneDeep(this.privacyForm);
  }

  async submitPrivacy() {
    this.wizard.step2Form;
    this.wizard.saveChanges();
    if (!this.isEditing) {
      this.router.navigate(['/post/add']);
    } else {
      this.router.navigate(['/post/add/edit', this.postId]);
    }
  }

  back() {
    if (this.isEditing) {
      console.log(this.wizard.step2Form.value);
      this.router.navigate(['/post/add/edit', this.postId]);
    } else {
      this.router.navigate(['/post/add']);
    }
  }

  fillOrganizationsCompanies() {
    this.organizations.map(organization => {
      organization.companies = this.companies.filter(company => {
        return company.organization._id === organization._id;
      });
    });
  }

  async refreshOrganizations() {
    this.loadingCompanies = true;
    await this.dataService
      .list('/company-relation', { companyId: this.wizard.currentCompany._id })
      .toPromise()
      .then(res => {
        const companiesOrganizations = res.body.map(companyRelation => {
          const company = companyRelation.companyA || companyRelation.companyB;
          return company.organization;
        });

        this.organizations = _.uniqWith(companiesOrganizations, _.isEqual);
        this.organizationData = new MatTableDataSource(this.organizations);

        const companies = res.body.map(companyRelation => {
          const company = companyRelation.companyA || companyRelation.companyB;
          return company;
        });

        this.companies = _.uniqWith(companies, _.isEqual);
        this.fillOrganizationsCompanies();
      });
    this.loadingCompanies = false;
  }

  // async onChanges() {
  //   this.wizard.step2Form = _.cloneDeep(this.privacyForm);
  //   await this.wizard.saveChanges();
  // }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.organizationData.filter = '';
    } else {
      this.organizationData.filter = filterValue.trim().toLowerCase();
    }

    if (this.organizationData.paginator) {
      this.organizationData.paginator.firstPage();
    }
  }

  selectCompany(company?: ICompanyProfile) {
    if (company.selected) {
      this.companyIds.push(company._id);
    } else {
      this.companyIds.splice(this.companyIds.indexOf(company._id), 1);
    }
    this.companyIds = _.uniqWith(this.companyIds, _.isEqual);
    this.privacyForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  toggleAllCompanies() {
    let allCompaniesIDs = this.companies.map(company => company._id);
    // allCompaniesIDs = _.uniqWith(allCompaniesIDs, _.isEqual);
    if (!this.allSelected) {
      this.deselectCompanies();
    } else {
      this.organizations.map(organization => {
        organization.companies.map(company => (company.selected = true));
      });
      this.companyIds = allCompaniesIDs;
    }
    this.privacyForm.controls.recipientsCompanyProfileId.setValue(this.companyIds);
  }

  async saveEditChanges() {
    this.wizard.step2Form = _.cloneDeep(this.privacyForm);
    await this.wizard.saveChanges();
    this.router.navigate(['/post/add/preview'], {
      replaceUrl: true
    });
  }

  get form() {
    return this.privacyForm.controls;
  }
}
