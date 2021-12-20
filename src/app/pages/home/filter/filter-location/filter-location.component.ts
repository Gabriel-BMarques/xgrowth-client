import { Component, ViewEncapsulation, OnInit, OnDestroy, ViewChild, Input, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonContent, ModalController, NavParams, LoadingController } from '@ionic/angular';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import { IUser } from '@app/shared/models/user.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { FilterService } from '@app/services/filter.service';
import { FileUpload } from 'primeng/fileupload';
import { IOrganization } from '@app/shared/models/organizations.model';
import { ICategory } from '@app/shared/models/category.model';
import { ICategoryClient } from '@app/shared/models/category-client.model';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, untilDestroyed, Logger } from '@app/core';
import { from, forkJoin } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

const log = new Logger('Login');

@Component({
  selector: 'filter-location',
  templateUrl: './filter-location.component.html',
  styleUrls: ['./filter-location.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterLocationComponent implements OnInit, OnDestroy {
  // Data passed in by componentProps
  @Input() id: string;
  @Input() type: string;
  @Input() Companies: ICompanyProfile[];
  @Input() Categories: ICategory[];
  @Input() mode: string;
  title: string;
  entityId: string;

  selectedRegionFilters: any[] = [];
  selectedCategoryFilters: any[] = [];
  arrayCategories: any[] = [];
  arrayCategoriesCopy: any[] = [];
  arraySubCategories: any[] = [];
  arraySubCategoriesCopy: any[] = [];
  companyData: MatTableDataSource<any>;
  companiesAux: ICompanyProfile[];
  category: ICategory;
  organization: IOrganization;
  company: ICompanyProfile;
  user: IUser;
  userId: string;
  isLoading = true;
  isLoadingRelations = true;

  countries: any[];
  organizations: any[];
  companies: any[];
  companyRelations: any[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  error: string | undefined;
  loginInfo: any = {
    username: undefined,
    impersonation: undefined
  };
  selectedEntity: any;

  feedFilterForm!: FormGroup;

  constructor(
    private navParams: NavParams,
    private router: Router,
    private route: ActivatedRoute,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService,
    private filterService: FilterService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    this.entityId = navParams.get('id');
    // componentProps can also be accessed at construction time using NavParams
    this.type = this.navParams.get('type');
    this.createForm(this.type);
  }

  ngOnInit() {
    this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.userId = user.body._id;
        this.user = user.body;
        this.refreshRegionsData();
      });
    this.isLoading = false;
  }

  ngOnDestroy() {}

  clearAll() {
    this.selectedRegionFilters = [];
    this.save();
  }

  refreshRegionsData() {
    if (this.user.Global) {
      this.dataService
        .find('/company-profile', this.user.company.toString())
        .toPromise()
        .then(company => {
          this.company = company.body;
          this.dataService
            .listAll('/company-profile', { organization: this.company.organization._id })
            .toPromise()
            .then(companies => {
              this.companies = companies.body;
              if (this.filterService.feedRegions) {
                this.selectedRegionFilters = this.filterService.feedRegions;
                this.startSelection();
              } else {
                this.selectedRegionFilters = [];
              }
              this.isLoading = false;
            });
        });
    }
  }

  startSelection() {
    Object.entries(this.companies).forEach(([, company]) => {
      const foundCompany = this.selectedRegionFilters.some(userCompany => {
        return userCompany._id === company._id;
      });
      if (foundCompany) {
        company.selected = true;
      }
    });
    Object.entries(this.arrayCategories).forEach(([, category]) => {
      const foundCategory = this.selectedCategoryFilters.some(userInterest => {
        return userInterest._id === category._id;
      });
      if (foundCategory) {
        category.selected = true;
        Object.entries(this.arraySubCategories).forEach(([, subcategory]) => {
          const foundSubCategory = this.arraySubCategories.some(subcategory2 => {
            return subcategory2.parentId === category._id;
          });
          foundSubCategory ? (subcategory.selected = true) : (subcategory.selected = false);
        });
      }
    });
    Object.entries(this.arraySubCategories).forEach(([, val]) => {
      const found = this.selectedCategoryFilters.some(userInterest => {
        return userInterest._id === val._id;
      });
      found ? (val.selected = true) : (val.selected = false);
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  changeSelectionRegion(entity: any) {
    if (!entity.selected) {
      this.selectedRegionFilters.push(entity);
    } else {
      const index = this.selectedRegionFilters.findIndex(selection => selection._id === entity._id);
      if (index >= 0) {
        this.selectedRegionFilters.splice(index, 1);
      }
    }
    entity.selected = !entity.selected;
  }

  sortCompanies() {
    this.Companies.sort((company1, company2) => {
      if (company1.companyName > company2.companyName) {
        return 1;
      }
      if (company1.companyName < company2.companyName) {
        return -1;
      }
      return 0;
    });
  }

  refreshCompanyData() {
    this.Companies = this.companyData.filteredData;
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.companyData.filter = '';
      this.Companies = this.companiesAux;
    } else {
      this.companyData.filter = filterValue.trim().toLowerCase();
    }

    if (this.companyData.paginator) {
      this.companyData.paginator.firstPage();
    }
    this.refreshCompanyData();
  }

  createForm(type: string) {
    this.feedFilterForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  impersonateUser() {
    this.loginInfo = {
      username: this.selectedEntity.email,
      impersonation: true
    };
    this.impersonate();
  }

  async impersonate() {
    this.isLoading = true;
    const impersonate$ = this.authenticationService.impersonate(this.loginInfo);
    const loadingOverlay = await this.loadingController.create({});
    const loading$ = from(loadingOverlay.present());
    forkJoin([impersonate$, loading$])
      .pipe(
        map(([credentials, ...rest]) => credentials),
        finalize(() => {
          this.isLoading = false;
          loadingOverlay.dismiss();
        }),
        untilDestroyed(this)
      )
      .toPromise()
      .then(
        credentials => {
          log.debug(`${credentials.username} successfully logged in`);
          this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true });
          this.modalController.dismiss();
        },
        error => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  back() {
    this.modalController.dismiss();
  }

  cancel() {
    this.modalController.dismiss();
  }

  save() {
    this.isLoading = true;
    this.applyFilters();
  }

  applyFilters() {
    this.filterService.feedRegions = this.selectedRegionFilters;
    // this.filterService.feedCategories = this.selectedCategoryFilters;
    this.dismiss();
  }

  get form() {
    return this.feedFilterForm.controls;
  }

  get selectedForm() {
    return this.feedFilterForm;
  }
}
