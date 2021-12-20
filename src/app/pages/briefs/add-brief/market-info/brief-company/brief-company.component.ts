import { OnInit, Component, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem, Item } from '@app/shared/models/item.model';
import { IonContent } from '@ionic/angular';
import { MockService } from '@app/services/mock.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BriefAddWizardService } from '@app/services/brief-add-wizard.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { DataService } from '@app/services/data.service';
import { IUser } from '@app/shared/models/user.model';
import { BriefCompany } from '@app/shared/models/briefCompany.model';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-brief-company',
  templateUrl: './brief-company.component.html',
  styleUrls: ['./brief-company.component.scss']
})
export class BriefCompanyComponent implements OnInit, IAlertControtllerGuard {
  skeletonLoading = true;
  isLoading = true;
  header: string;
  searchbar: string;
  briefId: string;
  currentUser: IUser;
  companyMock: any[];
  companies: ICompanyProfile[] = [];
  selectedCompanies: ICompanyProfile[] = [];
  companyData: MatTableDataSource<ICompanyProfile>;
  companySelected: any[];
  currentCompany: any;
  selectAllCheck: boolean;
  isIndeterminate: boolean;
  briefCompanies: any[] = [];
  briefCompanyForm: FormGroup;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private mockService: MockService,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private wizard: BriefAddWizardService,
    private router: Router,
    private formBuilder: FormBuilder,
    private navigationService: NavigationService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.skeletonLoading = true;
    this.isLoading = true;
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
    this.headerService.setHeader(this.searchbar);
    this.loadData();
    this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.dataService
          .findById('/company-profile', user.body.company)
          .toPromise()
          .then(company => {
            this.currentCompany = company.body;
            this.dataService
              .listById('/company-profile/ByOrganization', this.currentCompany.organization._id)
              .toPromise()
              .then(companies => {
                this.companies = companies.body.filter(company => {
                  return company._id !== this.currentCompany._id;
                });
                this.companyData = new MatTableDataSource(this.companies);
                this.companyData.paginator = this.paginator;
                this.companyData.sort = this.sort;
                if (this.wizard.entity.Companies) {
                  this.prepareSelection();
                }
                this.skeletonLoading = false;
                this.isLoading = false;
              });
          });
      });
  }

  ionViewWillEnter() {}

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Select Company';
      this.searchbar = 'Search for Company';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Selecione Empresas';
      this.searchbar = 'Procurar Empresa';
    }
  }

  loadData() {
    this.briefId = this.wizard.entity._id;
    this.briefCompanyForm.controls.companies.setValue(this.wizard.step3Form.controls.companies.value);
  }

  prepareSelection() {
    const briefCompanyIds = this.wizard.entity.Companies;

    this.companies.map((company: any) => {
      const found = briefCompanyIds.some(briefCompanyId => {
        return briefCompanyId === company._id;
      });
      if (found) {
        this.selectedCompanies.push(company);
        this.briefCompanyForm.controls.companies.value.push(company);
        company.isChecked = true;
      } else {
        company.isChecked = false;
      }
    });
  }

  applyFilter(filterValue: any) {
    if (filterValue === null) {
      this.companyData.filter = '';
    } else {
      this.companyData = new MatTableDataSource(this.companies);
      this.companyData.filter = filterValue.trim().toLowerCase();
    }

    if (this.companyData.paginator) {
      this.companyData.paginator.firstPage();
    }
  }

  select(entity: any) {
    if (entity.isChecked) {
      if (!this.briefCompanyForm.controls.companies.value.includes(entity)) {
        this.selectedCompanies.push(entity);
        this.briefCompanyForm.controls.companies.setValue(this.selectedCompanies);
      }
    } else {
      if (this.briefCompanyForm.controls.companies.value.includes(entity)) {
        const index = this.selectedCompanies.indexOf(entity);
        this.selectedCompanies.splice(index, 1);
        this.briefCompanyForm.controls.companies.setValue(this.selectedCompanies);
      }
    }
  }

  briefCompanyExists(entity: any) {
    const found = this.briefCompanies.some((briefCompany: any) => {
      return briefCompany.CompanyId._id === entity._id;
    });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  selectAll() {
    this.companyData.filteredData.map((company: any) => {
      if (!this.selectAllCheck) {
        if (company.isChecked) {
          company.isChecked = true;
        } else {
          company.isChecked = true;
        }
      } else {
        if (company.isChecked) {
          company.isChecked = false;
        } else {
          company.isChecked = false;
        }
      }
    });
  }

  back() {
    if (!this.wizard.isEditing) {
      if (this.wizard.step3Form.controls.companies.length === 0) {
        this.briefCompanyForm.controls.companies.setValue([]);
        this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
      } else {
        this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
      }
    } else {
      this.router.navigate(['/briefs/add-brief/market-info', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  onChanges(): void {
    this.briefCompanyForm.valueChanges.subscribe(() => {
      this.wizard.step3Form.controls.companies = this.briefCompanyForm.controls.companies;
      this.wizard.saveChanges();
    });
  }

  confirmSelection() {
    this.wizard.step3Form.controls.companies.setValue(this.briefCompanyForm.controls.companies.value);
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  createForm() {
    this.briefCompanyForm = this.formBuilder.group({
      companies: [[], Validators.required]
    });
    setTimeout(() => {
      this.briefCompanyForm.controls.companies.setValue([]);
      this.onChanges();
    }, 100);
  }
  canDeactivate() {
    if (this.wizard.isEditing && this.briefCompanyForm.touched) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else if (!this.wizard.isEditing && !this.briefCompanyForm.pristine) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief creation now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else {
      return true;
    }
  }
}
