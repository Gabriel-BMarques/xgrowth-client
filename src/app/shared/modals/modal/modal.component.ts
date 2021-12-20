import { BusinessUnit } from '../../models/businessUnit.model';
import { Component, Input, ViewEncapsulation, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { NavParams, IonContent, ModalController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ICompanyRelation, CompanyRelation } from '../../models/companyRelation.model';
import { IOrganization, Organization } from '../../models/organizations.model';
import { ICompanyProfile, CompanyProfile } from '../../models/companyProfile.model';
import { ICategory, Category } from '../../models/category.model';
import { INotification, Notification } from '../../models/notification.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ICategoryClient, CategoryClient } from '../../models/category-client.model';
import { DataService } from '@app/services/data.service';
import { IUser } from '../../models/user.model';
import { AuthenticationService, CredentialsService, untilDestroyed, Logger, CreationContext } from '@app/core';
import { map } from 'rxjs/operators';
import { forkJoin, from } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileUpload } from 'primeng/fileupload';
import { FilterService } from '@app/services/filter.service';
import * as _ from 'lodash';
import { IOrganizationType } from '../../models/organizationType.model';
import { IInitiative } from '../../models/initiative.model';
import { ICertification } from '../../models/certifications.model';
import { ISkill } from '../../models/skill.model';

const log = new Logger('Login');

@Component({
  selector: 'modal-page',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModalPageComponent implements OnInit, OnDestroy {
  @ViewChild('fileInputLogo')
  fileInputLogo: FileUpload;
  @ViewChild('fileInput')
  fileInput: FileUpload;
  uploadedFile: string;
  fileUrl: [];

  // Data passed in by componentProps
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() middleInitial: string;
  @Input() id: string;
  @Input() type: string;
  @Input() Organizations: IOrganization[];
  @Input() Companies: ICompanyProfile[];
  @Input() Categories: ICategory[];
  @Input() mode: string;
  title: string;
  entityId: string;

  categoryForm: FormGroup;

  reactivationLink: string;
  selectedRegionFilters: any[] = [];
  selectedCategoryFilters: any[] = [];
  arrayCategories: any[] = [];
  arrayCategoriesCopy: any[] = [];
  arraySubCategories: any[] = [];
  arraySubCategoriesCopy: any[] = [];
  parentCategories: ICategory[];
  companyData: MatTableDataSource<any>;
  companiesAux: ICompanyProfile[];
  newCategory: ICategory;
  newCategoryClient: ICategoryClient;
  oldCategoryClient: ICategoryClient;
  categoryClients: ICategoryClient[];
  category: ICategory;
  organization: IOrganization;
  company: ICompanyProfile;
  user: IUser;
  userId: string;
  isLoading = true;
  isLoadingRelations = true;

  countries: any[];
  businessUnits: any[];
  categoryOrganizations: any[];
  segmentOrganization: any[];
  organizations: any[] = [];
  companies: any[];
  companyRelations: any[];
  departments: any[];
  jobTitles: any[];
  organizationTypes: IOrganizationType[];
  organizationSubTypes: IOrganizationType[];
  organizationUsers: IUser[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  error: string | undefined;
  loginInfo: any = {
    username: undefined,
    impersonation: undefined
  };
  selectedEntity: any;

  organizationForm!: FormGroup;
  notificationForm!: FormGroup;
  companyForm!: FormGroup;
  companyRelationForm!: FormGroup;
  userForm!: FormGroup;
  feedFilterForm!: FormGroup;

  get orgTypeSubTypes() {
    return this.organizationSubTypes.filter(st => st.parentId === this.form.organizationType.value);
  }

  get hasSubType() {
    const foundType = this.organizationTypes.find(ot => ot._id === this.form.organizationType.value)?.name;
    return foundType === 'External Manufacturer' || foundType === 'Startup';
  }

  constructor(
    private navParams: NavParams,
    private router: Router,
    private route: ActivatedRoute,
    private el: ElementRef,
    private loadingController: LoadingController,
    private authenticationService: AuthenticationService,
    private credentials: CredentialsService,
    private filterService: FilterService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.entityId = navParams.get('id');
    // componentProps can also be accessed at construction time using NavParams
    this.type = this.navParams.get('type');
    this.createForm(this.type);
  }

  async listOrganizationTypes() {
    await this.dataService
      .list('/organization/organization-type')
      .toPromise()
      .then(res => {
        this.organizationTypes = res.body;
      });
  }

  async listOrganizationUsers() {
    await this.dataService
      .list('/users', { organization: this.selectedEntity._id })
      .toPromise()
      .then(res => {
        this.organizationUsers = res.body;
      });
  }

  async ngOnInit() {
    switch (this.type) {
      case 'categories':
        switch (this.entityId) {
          case undefined:
            this.mode = 'create';
            this.setHeaderTitle();
            this.sortCompanies();
            this.companiesAux = this.Companies;
            this.prepareCompaniesData();
            this.getParentCategories();
            this.isLoading = false;

            this.categoryForm.valueChanges.subscribe(values => {
              localStorage.setItem('categoryForm', JSON.stringify(values));
            });
            setTimeout(() => {
              localStorage.removeItem('categoryForm');
            }, 300000); // clear localStorage data after 7 minutes
            break;
          default:
            this.mode = 'edit';
            this.setHeaderTitle();
            this.Categories = (await this.dataService.listAll('/category').toPromise()).body;
            this.getParentCategories();
            await this.prepareDataToEdit();
            this.isLoading = false;
            break;
        }
        if (this.mode !== 'edit' && this.mode !== 'create') {
          this.mode = 'delete';
          this.prepareDataToRemove();
        }
        break;
      case 'select-privacy':
        this.setHeaderTitle();
        this.isLoading = false;
        break;
      case 'user':
        const data = await Promise.all([
          this.dataService.list('/category-organization').toPromise(),
          this.dataService.listAll('/organization').toPromise(),
          this.dataService.list('/misc/country').toPromise(),
          this.dataService.list('/misc/department').toPromise(),
          this.dataService.list('/misc/job-title').toPromise()
        ]);
        [this.categoryOrganizations, this.organizations, this.countries, this.departments, this.jobTitles] = data.map(
          d => d.body
        );

        this.entityId = this.navParams.get('id');
        switch (this.entityId) {
          case undefined:
            this.mode = 'create';
            this.setHeaderTitle();
            this.isLoading = false;

            this.userForm.valueChanges.subscribe(values => {
              localStorage.setItem('userForm', JSON.stringify(values));
            });
            setTimeout(() => {
              localStorage.removeItem('userForm');
            }, 300000);
            break;
          default:
            this.mode = 'edit';
            this.setHeaderTitle();
            this.prepareDataToEdit();
            break;
        }
        break;
      case 'organization':
        const organizationData = await Promise.all([
          this.dataService.list('/organization/organization-type').toPromise(),
          this.dataService.list('/organization/organization-type/sub-type').toPromise()
        ]);
        [this.organizationTypes, this.organizationSubTypes] = organizationData.map((od: any) => od.body);
        switch (this.entityId) {
          case undefined:
            this.mode = 'create';
            this.organizationUsers = [];
            this.setHeaderTitle();
            this.isLoading = false;

            this.organizationForm.valueChanges.subscribe(values => {
              localStorage.setItem('organizationForm', JSON.stringify(values));
            });
            setTimeout(() => {
              localStorage.removeItem('organizationForm');
            }, 300000);
            break;
          default:
            this.mode = 'edit';
            await this.dataService
              .list('/users', { organization: this.entityId })
              .toPromise()
              .then(orgUsers => {
                this.organizationUsers = orgUsers.body;
              });
            this.setHeaderTitle();
            this.prepareDataToEdit();
            break;
        }
        break;
      case 'notification':
        switch (this.entityId) {
          case undefined:
            this.mode = 'create';
            this.setHeaderTitle();
            this.isLoading = false;

            this.notificationForm.valueChanges.subscribe(values => {
              localStorage.setItem('notificationForm', JSON.stringify(values));
            });
            setTimeout(() => {
              localStorage.removeItem('notificationForm');
            }, 300000);
            break;
          default:
            this.mode = 'edit';
            this.setHeaderTitle();
            this.prepareDataToEdit();
            break;
        }
        break;
      case 'company':
        await this.dataService
          .list('/misc/country')
          .toPromise()
          .then(countries => {
            this.countries = countries.body;
          });
        await this.dataService
          .listAll('/organization')
          .toPromise()
          .then(organizations => {
            this.organizations = organizations.body;
          });
        switch (this.entityId) {
          case undefined:
            this.mode = 'create';
            this.setHeaderTitle();
            this.isLoading = false;

            this.companyForm.valueChanges.subscribe(values => {
              localStorage.setItem('companyForm', JSON.stringify(values));
            });
            setTimeout(() => {
              localStorage.removeItem('companyForm');
            }, 300000);
            break;
          default:
            this.mode = 'edit';
            this.setHeaderTitle();
            this.prepareDataToEdit();
            break;
        }
        break;
      case 'company-relation':
        this.dataService
          .list('/misc/country')
          .toPromise()
          .then(countries => {
            this.countries = countries.body;
            this.dataService
              .listAll('/organization')
              .toPromise()
              .then(organizations => {
                this.organizations = organizations.body;
              });
            this.dataService
              .listAll('/company-profile')
              .toPromise()
              .then(companies => {
                this.companies = companies.body;
                this.companies = this.companies.filter(filteredCompany => {
                  return filteredCompany._id !== this.entityId;
                });
                switch (this.entityId) {
                  case undefined:
                    this.mode = 'create';
                    this.setHeaderTitle();
                    this.isLoading = false;

                    this.companyRelationForm.valueChanges.subscribe(values => {
                      localStorage.setItem('companyRelationForm', JSON.stringify(values));
                    });
                    setTimeout(() => {
                      localStorage.removeItem('companyRelationForm');
                    }, 300000);
                    break;
                  default:
                    this.mode = 'edit';
                    this.setHeaderTitle();
                    this.prepareDataToEdit();
                    break;
                }
              });
          });
        break;
      case 'feed-filter':
        this.dataService
          .getUserInfo()
          .toPromise()
          .then(user => {
            this.userId = user.body._id;
            this.user = user.body;
            // this.refreshInterests();
            this.refreshRegionsData();
            this.refreshInterestsData();
          });
        this.setHeaderTitle();
        this.isLoading = false;

        this.feedFilterForm.valueChanges.subscribe(values => {
          localStorage.setItem('feedFilterForm', JSON.stringify(values));
        });
        setTimeout(() => {
          localStorage.removeItem('feedFilterForm');
        }, 300000);
        break;
      default:
        break;
    }
  }

  // refill the form data previously
  async ngAfterContentInit() {
    switch (this.type) {
      case 'categories':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('categoryForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.categoryForm.setValue(formData);
              }
            }
            break;
        }
      case 'organization':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('organizationForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.organizationForm.setValue(formData);
              }
            }
            break;
        }
      case 'notification':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('notificationForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.notificationForm.setValue(formData);
              }
            }
            break;
        }
      case 'company':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('companyForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.companyForm.setValue(formData);
              }
            }
            break;
        }
      case 'company-relation':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('companyRelationForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.companyRelationForm.setValue(formData);
              }
            }
            break;
        }
      case 'feed-filter':
        if (localStorage) {
          const formDataStored = localStorage.getItem('feedFilterForm');
          if (formDataStored) {
            const formData = JSON.parse(formDataStored);
            this.feedFilterForm.setValue(formData);
          }
        }
        break;
      case 'user':
        switch (this.entityId) {
          case undefined:
            if (localStorage) {
              const formDataStored = localStorage.getItem('userForm');
              if (formDataStored) {
                const formData = JSON.parse(formDataStored);
                this.userForm.setValue(formData);
              }
            }
            break;
        }
    }
  }

  ngOnDestroy() {}

  ionViewWillEnter() {}

  async listCategoryOrganizationsAndSkillsBySegment(segmentIds: string[]) {
    this.categoryOrganizations = [];
    const catOrgs = (await this.dataService.list('/category-organization', { segment: segmentIds }).toPromise()).body;
    this.categoryOrganizations = _.sortBy(catOrgs, cat => cat.segment.name);
    this.form.organizationCategories.setValue(
      this.form.organizationCategories.value.filter((item: any) =>
        this.categoryOrganizations.map(cat => cat._id).includes(item)
      )
    );
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

  refreshInterestsData() {
    this.dataService
      .list('/category/company')
      .toPromise()
      .then(res => {
        const categories = res.body.filter(category => {
          return category.parentId === null;
        });
        const subcategories = res.body.filter(subcategory => {
          return subcategory.parentId !== null;
        });
        this.arrayCategories = this.arrayCategoriesCopy = categories;
        this.arraySubCategories = this.arraySubCategoriesCopy = subcategories;
        if (this.filterService.feedCategories) {
          this.selectedCategoryFilters = this.filterService.feedCategories;
          this.startSelection();
        } else {
          this.selectedRegionFilters = [];
          this.selectedCategoryFilters = [];
        }
        this.isLoading = false;
      });
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

  prepareDataToRemove() {
    switch (this.mode) {
      case 'categories':
        this.dataService
          .find('/category', this.entityId)
          .toPromise()
          .then(foundCategory => {
            this.category = foundCategory.body;
          });
        break;
      case 'organization':
        this.dataService
          .find('/organization', this.entityId)
          .toPromise()
          .then(foundOrganization => {
            this.organization = foundOrganization.body;
          });
        break;
      case 'company':
        this.dataService
          .find('/company-profile', this.entityId)
          .toPromise()
          .then(foundCompany => {
            this.company = foundCompany.body;
          });
        break;
      case 'user':
        this.dataService
          .find('/user', this.entityId)
          .toPromise()
          .then(foundUser => {
            this.user = foundUser.body;
          });
        break;
    }
  }

  async prepareDataToEdit() {
    switch (this.type) {
      case 'categories':
        [this.selectedEntity, this.categoryClients, this.Companies, this.Organizations] = (
          await Promise.all([
            this.dataService.find('/category', this.entityId).toPromise(),
            this.dataService.listAll('/category-client').toPromise(),
            this.dataService.listAll('/company-profile').toPromise(),
            this.dataService.listAll('/organization').toPromise()
          ])
        ).map(res => res.body);

        this.form.name.setValue(this.selectedEntity.name);
        this.form.parentCategory.setValue(this.selectedEntity.parentId);
        this.form.organization.setValue(this.selectedEntity.organizationId);
        if (this.selectedEntity.isPublic) {
          this.form.isPublic.setValue(this.selectedEntity.isPublic);
        } else {
          this.form.isPublic.setValue(false);
        }
        this.form.companies.setValue(this.getCategoryCompanies());
        this.sortCompanies();
        this.prepareCompaniesData();
        break;
      case 'organization':
        this.dataService
          .find('/organization', this.entityId)
          .toPromise()
          .then(async organization => {
            this.selectedEntity = organization.body;
            this.form.name.setValue(this.selectedEntity.name);
            if (this.selectedEntity.organizationType)
              this.form.organizationType.setValue(this.selectedEntity.organizationType?._id);
            this.form.organizationSubType.setValue(this.selectedEntity.subType?._id);
            this.form.initiatives.setValue(this.selectedEntity.initiatives.map((i: any) => i._id));
            this.form.certifications.setValue(this.selectedEntity.certifications.map((c: any) => c._id));
            this.form.skills.setValue(this.selectedEntity.skills.map((s: any) => s._id));
            this.form.organizationAdmins.setValue(this.selectedEntity.organizationAdmins.map((oa: any) => oa._id));
            if (organization.body.allowedDomains.length) {
              organization.body.allowedDomains.forEach((ad: string) => {
                const orgDomain = this.formBuilder.group({
                  aDomain: [`${ad}`, Validators.required]
                });
                this.allowedDomainsArray.push(orgDomain);
              });
              this.allowedDomainsArray.removeAt(0);
            }
            if (this.selectedEntity.categoryOrganizations) {
              this.form.organizationCategories.setValue(this.selectedEntity.categoryOrganizations);
            }
            this.isLoading = false;
          });
        break;
      case 'notification':
        this.dataService
          .find('/notification', this.entityId)
          .toPromise()
          .then(notification => {
            this.selectedEntity = notification.body;
            this.form.title.setValue(this.selectedEntity.title);
            this.form.description.setValue(this.selectedEntity.description);
            this.form.link.setValue(this.selectedEntity.link);
            this.isLoading = false;
          });
        break;
      case 'company':
        this.selectedEntity = (await this.dataService.find('/company-profile', this.entityId).toPromise()).body;
        const country = this.countries.filter(selectedCountry => selectedCountry._id === this.selectedEntity.country);
        const organization = (
          await this.dataService.find('/organization', this.selectedEntity.organization._id).toPromise()
        ).body;
        this.form.organization.setValue(organization._id);
        this.form.companyName.setValue(this.selectedEntity.companyName);
        if (country.length) this.form.country.setValue(country[0]._id);
        this.form.postLimit.setValue(this.selectedEntity.postLimit);
        this.form.postWaitDays.setValue(this.selectedEntity.postWaitDays);
        if (this.selectedEntity.logo) this.form.logo.setValue(this.selectedEntity.logo.url);
        this.form.hasWebinarAccess.setValue(!!this.selectedEntity.hasWebinarAccess);
        this.isLoading = false;
        break;
      case 'company-relation':
        this.dataService
          .find('/company-profile', this.entityId)
          .toPromise()
          .then(company => {
            this.selectedEntity = company.body;
            this.listCompanyRelations();
            this.form.companyName.setValue(this.selectedEntity.companyName);
            // this.form.relations.setValue(this.companyRelations);
          });
        break;
      case 'user':
        this.dataService
          .find('/users', this.entityId)
          .toPromise()
          .then(user => {
            this.selectedEntity = user.body;
            let country: any;
            if (this.selectedEntity.country) {
              country = this.countries.filter(selectedCountry => {
                return selectedCountry._id === this.selectedEntity.country;
              });
            } else {
              country = [];
              country.push({ _id: undefined });
            }
            this.form.blocked.setValue(this.selectedEntity.blocked);
            this.form.Global.setValue(this.selectedEntity.Global);
            this.form.email.setValue(this.selectedEntity.email.toLowerCase());
            this.form.firstName.setValue(this.selectedEntity.firstName);
            this.form.familyName.setValue(this.selectedEntity.familyName);
            this.form.jobTitle.setValue(this.selectedEntity.jobTitle);
            this.form.department.setValue(this.selectedEntity.department);
            this.form.country.setValue(country[0]?._id);
            this.form.businessUnit.setValue(this.selectedEntity.businessUnit);
            this.form.categoryOrganizations.setValue(this.selectedEntity.categoriesOrganization);
            if (this.selectedEntity.profileComplete) {
              this.form.profileComplete.setValue(this.selectedEntity.profileComplete);
            } else {
              this.form.profileComplete.setValue(false);
            }
            if (this.selectedEntity.company) {
              this.dataService
                .find('/company-profile', this.selectedEntity.company)
                .toPromise()
                .then(res => {
                  if (res.body.organization) {
                    this.getOrganization(undefined, res.body.organization);
                  } else {
                    this.isLoading = false;
                  }
                });
              this.dataService
                .list('/businessUnit', { company: this.selectedEntity.company })
                .toPromise()
                .then(res => {
                  this.businessUnits = res.body;
                });
            } else {
              this.isLoading = false;
            }
          });
        break;
    }
  }

  prepareDataToSubmit() {
    switch (this.type) {
      case 'categories':
        if (this.selectedEntity) {
          this.selectedEntity.name = this.form.name.value;
          this.selectedEntity.parentId = this.form.parentCategory.value;
          this.selectedEntity.organizationId = this.form.organization.value;
          this.selectedEntity.isPublic = this.form.isPublic.value;
          this.dataService
            .update('/category', this.selectedEntity)
            .toPromise()
            .then(category => {
              this.isLoading = false;
              this.updateCategoryClients();
              this.dismiss();
            });
        } else {
          this.newCategory = new Category();
          this.newCategory.name = this.form.name.value;
          this.newCategory.parentId = this.form.parentCategory.value;
          this.newCategory.organizationId = this.form.organization.value;
          this.newCategory.isPublic = this.form.isPublic.value;
          this.dataService
            .create('/category', this.newCategory)
            .toPromise()
            .then(category => {
              this.prepareCategoryClientToSubmit(category.body);
              this.createCategoryClients();
              this.dismiss();
            });
        }
        break;
      case 'organization':
        if (this.selectedEntity) {
          this.selectedEntity.name = this.form.name.value;
          const allowedDomains = this.allowedDomainsArray.value.map((ad: any) => ad.aDomain);
          this.selectedEntity.allowedDomains = allowedDomains;
          this.selectedEntity.organizationType = this.form.organizationType.value || undefined;
          this.selectedEntity.subType = this.form.organizationSubType.value;
          this.selectedEntity.initiatives = this.form.initiatives.value;
          this.selectedEntity.certifications = this.form.certifications.value;
          this.selectedEntity.skills = this.form.skills.value;
          this.selectedEntity.categoryOrganizations = this.form.organizationCategories.value;
          this.selectedEntity.organizationAdmins = this.form.organizationAdmins.value;
          this.dataService
            .update('/organization', this.selectedEntity)
            .toPromise()
            .then(organization => {
              this.isLoading = false;
              this.dismiss();
            })
            .catch(err => {
              this.snackBar.open(err.error, '', {
                duration: 8000,
                panelClass: ['centered-snackbar']
              });
              this.dismiss();
            });
        } else {
          const entity = new Organization();
          entity.name = this.form.name.value;
          const allowedDomains = this.allowedDomainsArray.value.map((ad: any) => ad.aDomain);
          entity.allowedDomains = allowedDomains;
          entity.categoryOrganizations = this.form.organizationCategories.value;
          this.dataService
            .create('/organization', entity)
            .toPromise()
            .then(organization => {
              this.isLoading = false;
              this.dismiss();
            })
            .catch(err => {
              this.snackBar.open(err.error, '', {
                duration: 8000,
                panelClass: ['centered-snackbar']
              });
              this.dismiss();
            });
        }
        break;
      case 'notification':
        if (this.selectedEntity) {
          this.selectedEntity.title = this.form.title.value;
          this.selectedEntity.description = this.form.description.value;
          this.selectedEntity.link = this.form.link.value;
          this.dataService
            .update('/notification', this.selectedEntity)
            .toPromise()
            .then(notification => {
              this.isLoading = false;
              this.dismiss();
            });
        } else {
          const entity = new Notification();
          entity.title = this.form.title.value;
          entity.description = this.form.description.value;
          entity.link = this.form.link.value;
          const notificationData = {
            type: 'admin-panel-notification',
            title: entity.title,
            link: entity.link
          };
          this.dataService.create('/notification', notificationData).toPromise();
          this.isLoading = false;
          this.dismiss();
        }
        break;
      case 'company':
        if (this.selectedEntity) {
          this.selectedEntity.companyName = this.form.companyName.value;
          this.selectedEntity.country = this.form.country.value;
          this.selectedEntity.postLimit = this.form.postLimit.value;
          this.selectedEntity.postWaitDays = this.form.postWaitDays.value;
          this.selectedEntity.organization = this.form.organization.value;
          if (this.selectedEntity.logo) {
            this.selectedEntity.logo.url = this.form.logo.value;
          } else {
            const logo = { url: this.form.logo.value };
            this.selectedEntity.logo = logo;
          }
          this.selectedEntity.hasWebinarAccess = !!this.form.hasWebinarAccess.value;
          this.dataService
            .update('/company-profile', this.selectedEntity)
            .toPromise()
            .then(company => {
              this.isLoading = false;
              this.dismiss();
            });
        } else {
          const entity = new CompanyProfile();
          entity.companyName = this.form.companyName.value;
          entity.country = this.form.country.value;
          entity.postLimit = this.form.postLimit.value;
          entity.postWaitDays = this.form.postWaitDays.value;
          entity.organization = this.form.organization.value;
          const logo = { url: this.form.logo.value };
          entity.logo = logo;
          entity.hasWebinarAccess = !!this.form.hasWebinarAccess.value;
          this.dataService
            .create('/company-profile', entity)
            .toPromise()
            .then(company => {
              this.isLoading = false;
              this.dismiss();
            });
        }
        break;
      case 'company-relation':
        this.isLoading = false;
        this.dismiss();
        break;
      case 'user':
        if (this.selectedEntity) {
          this.selectedEntity.blocked = this.form.blocked.value;
          this.selectedEntity.Global = this.form.Global.value;
          this.selectedEntity.email = this.form.email.value.toLowerCase();
          if (this.form.organization.value) this.selectedEntity.organization = this.form.organization.value;
          if (this.form.company.value && this.form.company.value.length)
            this.selectedEntity.company = this.form.company.value;
          this.selectedEntity.firstName = this.form.firstName.value;
          this.selectedEntity.familyName = this.form.familyName.value;
          this.selectedEntity.profileComplete = this.form.profileComplete.value;
          this.selectedEntity.jobTitle = this.form.jobTitle.value;
          this.selectedEntity.department = this.form.department.value;
          if (this.form.country.value) {
            this.selectedEntity.country = this.form.country.value;
          }
          if (this.form.businessUnit.value) {
            this.selectedEntity.businessUnit = this.form.businessUnit.value;
          }
          if (this.form.categoryOrganizations.value) {
            this.selectedEntity.categoriesOrganization = this.form.categoryOrganizations.value;
          }
          if (this.reactivationLink) {
            this.selectedEntity.reactivationKey = this.reactivationLink.split('=')[1];
          }
          this.dataService
            .updateUser('/users', this.selectedEntity)
            .toPromise()
            .then(user => {
              this.isLoading = false;
              this.dismiss();
            });
        } else {
          let user: CreationContext;
          user = {
            selectedPlan: 'supplier innovation',
            role: 'user',
            email: this.form.email.value.toLowerCase(),
            company: this.form.company.value,
            organization: this.form.organization.value,
            firstName: this.form.firstName.value,
            familyName: this.form.familyName.value,
            jobTitle: this.form.jobTitle.value,
            department: this.form.department.value,
            password: null,
            invitationKey: null,
            profileComplete: this.form.profileComplete.value,
            country: this.form.country.value.length ? this.form.country.value : undefined,
            businessUnit: this.form.businessUnit.value.length ? this.form.businessUnit.value : undefined,
            reactivationKey: this.reactivationLink ? this.reactivationLink.split('=')[1] : undefined,
            categoriesOrganization: this.form.categoryOrganizations.value.length
              ? this.form.categoryOrganizations.value
              : undefined
          };
          this.authenticationService
            .create(user)
            .toPromise()
            .then(
              res => {
                const msg = this.translate.instant('global.messages.newUserCreated');
                this.snackBar.open(msg, '', {
                  duration: 8000,
                  panelClass: ['centered-snackbar']
                });
                this.dismiss();
              },
              error => {
                const msg = error.error.message.toString();
                this.snackBar.open(msg, '', {
                  duration: 8000,
                  panelClass: ['centered-snackbar']
                });
                this.dismiss();
              }
            );
        }
        break;
    }
  }

  async generateReactivationLink(email: string) {
    await this.authenticationService
      .generateReactivationLink(email)
      .toPromise()
      .then(res => {
        this.reactivationLink = res.body.toString();
      });
  }

  disableRelation(id: string) {
    this.isLoading = true;
    let entity: ICompanyRelation;
    this.dataService
      .find('/company-relation', id)
      .toPromise()
      .then(relation => {
        entity = relation.body;
        this.dataService
          .remove('/company-relation', entity)
          .toPromise()
          .then(() => {
            this.dataService
              .listAll('/company-profile')
              .toPromise()
              .then(companies => {
                this.companies = companies.body;
                this.companies = this.companies.filter(filteredCompany => {
                  return filteredCompany._id !== this.entityId;
                });
              });
            this.listCompanyRelations();
          });
      });
  }

  getCategoryCompanies() {
    const categoryClients = this.categoryClients.filter(categoryClient => {
      return categoryClient.categoryId === this.selectedEntity._id;
    });
    const companyIds = categoryClients.map(categoryClient => {
      return categoryClient.clientId;
    });
    return companyIds;
  }

  deleteItem(id?: string) {
    switch (this.type) {
      case 'categories':
        this.dataService
          .remove('/category', this.category)
          .toPromise()
          .then(() => {
            this.dismiss();
          });
        break;
    }
  }

  listCompanyRelations() {
    this.dataService
      .list('/company-relation', { companyId: this.entityId })
      .toPromise()
      .then(companyRelations => {
        this.companyRelations = companyRelations.body;
        Object.entries(this.companyRelations).forEach(([key, value]) => {
          if (value.companyB) {
            this.companies = this.companies.filter(filteredCompany => {
              return filteredCompany._id !== value.companyB._id;
            });
          }
        });
        this.isLoading = false;
      });
  }

  updateCategoryClients() {
    const categoryClients = this.categoryClients.filter(categoryClient => {
      return categoryClient.categoryId === this.selectedEntity._id;
    });
    this.prepareCategoryClientToSubmit(this.selectedEntity);
    this.updateRemovedCompanies(categoryClients);
    this.updateAddedCompanies(categoryClients);
  }

  updateRemovedCompanies(categoryClients: ICategoryClient[]) {
    const formValues = this.form.companies.value;
    Object.entries(categoryClients).forEach(([, val]) => {
      const found = formValues.some((clientId: any) => {
        return clientId === val.clientId;
      });
      switch (found) {
        case false:
          this.dataService
            .remove('/category-client', val)
            .toPromise()
            .then(() => {});
          break;
        default:
          break;
      }
    });
  }

  updateAddedCompanies(categoryClients: ICategoryClient[]) {
    const formValues = this.form.companies.value;
    Object.entries(formValues).forEach(([key, val]) => {
      const found = categoryClients.some((categoryClient: any) => {
        return categoryClient.clientId === val;
      });
      switch (found) {
        case false:
          this.newCategoryClient.clientId = val.toString();
          this.dataService
            .create('/category-client', this.newCategoryClient)
            .toPromise()
            .then(() => {});
          break;
        default:
          break;
      }
    });
  }

  updateCategory() {
    this.newCategory = new Category();
    this.newCategory._id = this.selectedEntity._id;
    this.newCategory.name = this.form.name.value;
    this.newCategory.parentId = this.form.parentCategory.value;
    this.newCategory.organizationId = this.form.organization.value;
    this.dataService
      .update('/category', this.newCategory)
      .toPromise()
      .then(newCategory => {});
    this.updateCategoryClients();
    this.dismiss();
  }

  prepareCategoryClientToSubmit(category: ICategory) {
    this.newCategoryClient = new CategoryClient();
    this.newCategoryClient.categoryId = category._id;
  }

  createCategory() {
    this.dataService
      .create('/category', this.newCategory)
      .toPromise()
      .then(category => {
        this.prepareCategoryClientToSubmit(category.body);
        this.createCategoryClients();
        this.dismiss();
      });
  }

  createCategoryClients() {
    if (this.form.companies.value) {
      Object.entries(this.form.companies.value).forEach(([key, companyId]) => {
        this.newCategoryClient.clientId = companyId.toString();
        this.dataService
          .create('/category-client', this.newCategoryClient)
          .toPromise()
          .then(() => {});
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  uploadFile(event: any) {
    const inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#file');
    const fileCount: number = event.files.length;
    if (fileCount > 0) {
      if (fileCount >= 2) {
        this.fileInput.clear();
        const msg = 'ERROR: Maximum of 1 file supported.';
        this.snackBar.open(msg, '', {
          duration: 4000,
          panelClass: ['centered-snackbar']
        });
      } else {
        let formData = new FormData();
        event.files.forEach((file: any) => {
          formData.append('file', file);
          this.dataService
            .upload('/upload', formData)
            .toPromise()
            .then(res => {
              this.uploadedFile = res.body;
              const blob = res.body.blob;
              this.form.logo.setValue(this.getThumbnailImage(blob));
            });
          this.fileInput.clear();
        });
      }
    }
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

  changeSelectionCategory(entity: any) {
    if (!entity.selected) {
      this.selectedCategoryFilters.push(entity);
    } else {
      const index = this.selectedCategoryFilters.findIndex(selection => selection._id === entity._id);
      if (index >= 0) {
        this.selectedCategoryFilters.splice(index, 1);
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

  getParentCategories() {
    this.parentCategories = this.Categories.filter(category => {
      return category.parentId === null;
    });
  }

  prepareCompaniesData() {
    this.companyData = new MatTableDataSource(this.Companies);
    this.refreshCompanyData();
    this.companyData.paginator = this.paginator;
    this.companyData.sort = this.sort;
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

  setHeaderTitle() {
    switch (this.type) {
      case 'categories':
        switch (this.mode) {
          case 'edit':
            this.title = 'Edit Category';
            break;
          case 'create':
            this.title = 'Create Category';
            break;
          case 'delete':
            this.title = 'Delete Category';
            break;
          default:
            break;
        }
        break;
      case 'select-privacy':
        this.title = 'Post Privacy';
        break;
      case 'feed-filter':
        this.title = 'Filter Feed';
        break;
      case 'user':
        switch (this.mode) {
          case 'create':
            this.title = 'Add New User';
            break;
          case 'edit':
            this.title = 'Edit User';
            break;
          case 'delete':
            this.title = 'Delete User';
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  addDomain() {
    const newDomain = this.formBuilder.group({
      aDomain: ['', Validators.required]
    });
    this.allowedDomainsArray.push(newDomain);
  }

  deleteDomain(index: number) {
    this.allowedDomainsArray.removeAt(index);
  }

  get allowedDomainsArray() {
    return this.organizationForm.get('allowedDomains') as FormArray;
  }

  createForm(type: string) {
    switch (type) {
      case 'categories':
        this.categoryForm = this.formBuilder.group({
          name: ['', Validators.required],
          parentCategory: [undefined, Validators.required],
          organization: [undefined, Validators.required],
          companies: [undefined, Validators.required],
          isPublic: [false]
        });
        break;
      case 'organization':
        const firstDomain = this.formBuilder.group({
          aDomain: ['', Validators.required]
        });
        this.organizationForm = this.formBuilder.group({
          name: ['', Validators.required],
          allowedDomains: this.formBuilder.array([firstDomain]),
          organizationType: [''],
          organizationSubType: [''],
          initiatives: [''],
          certifications: [''],
          skills: [''],
          description: [''],
          organizationCategories: [[]],
          organizationAdmins: [[], Validators.required]
        });
        break;
      case 'notification':
        this.notificationForm = this.formBuilder.group({
          title: ['', Validators.required],
          description: [''],
          link: ['']
        });
        break;
      case 'company':
        this.companyForm = this.formBuilder.group({
          companyName: ['', Validators.required],
          country: ['', Validators.required],
          organization: ['', Validators.required],
          postLimit: [0, Validators.required],
          postWaitDays: [0, Validators.required],
          logo: ['', Validators.required],
          hasWebinarAccess: [false]
        });
        break;
      case 'company-relation':
        this.companyRelationForm = this.formBuilder.group({
          companyName: ['', Validators.required],
          relations: []
        });
        break;
      case 'user':
        this.userForm = this.formBuilder.group({
          blocked: [false, Validators.required],
          Global: [false, Validators.required],
          email: ['', Validators.required],
          organization: ['', Validators.required],
          categoryOrganizations: ['', Validators.required],
          company: ['', Validators.required],
          firstName: ['', Validators.required],
          familyName: ['', Validators.required],
          country: ['', Validators.required],
          jobTitle: ['', Validators.required],
          department: ['', Validators.required],
          profileComplete: [false],
          businessUnit: [''],
          selectedOrganization: ['']
        });
        break;
      case 'feed-filter':
        this.feedFilterForm = this.formBuilder.group({
          name: ['', Validators.required]
        });
        break;
      default:
        break;
    }
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
          this.router.navigate([this.route.snapshot.queryParams.redirect || '/'], { replaceUrl: true }).then(() => {
            window.location.reload();
          });
          this.modalController.dismiss();
        },
        error => {
          log.debug(`Login error: ${error}`);
          this.error = error;
        }
      );
  }

  addRelation(event: { component: IonicSelectableComponent; value: any }) {
    this.isLoading = true;
    const entity = new CompanyRelation();
    entity.companyA = this.entityId;
    entity.companyB = event.value._id;
    this.dataService
      .create('/company-relation', entity)
      .toPromise()
      .then(companyRelation => {
        this.listCompanyRelations();
      });
  }

  getOrganization(event?: { component: IonicSelectableComponent; value: any }, organization?: any) {
    if (event) {
      this.form.organization.setValue(event.value._id);
      this.form.selectedOrganization = event.value;
      this.dataService
        .listAll('/company-profile', {
          organization: this.form.organization.value
        })
        .toPromise()
        .then(res => {
          this.companies = res.body;
          this.isLoading = false;
        });
    } else {
      this.form.organization.setValue(organization._id);
      this.form.selectedOrganization.setValue(organization);
      this.dataService
        .listAll('/company-profile', {
          organization: this.form.organization.value
        })
        .toPromise()
        .then(res => {
          this.companies = res.body;
          this.form.company.setValue(this.selectedEntity.company);
          this.isLoading = false;
        });
    }
    if (this.form.selectedOrganization.value) {
      this.dataService
        .list('/category-organization', {
          _id: this.form.selectedOrganization.value.categoryOrganizations
        })
        .toPromise()
        .then(res => {
          this.categoryOrganizations = res.body;
        });
    }
  }

  cancel() {
    this.modalController.dismiss();
    switch (this.type) {
      case 'categories':
        localStorage.removeItem('categoryForm');
        break;
      case 'organization':
        localStorage.removeItem('organizationForm');
        break;
      case 'notification':
        localStorage.removeItem('notificationForm');
        break;
      case 'company':
        localStorage.removeItem('companyForm');
        break;

      case 'company-relation':
        localStorage.removeItem('companyRelationForm');
        break;

      case 'user':
        localStorage.removeItem('userForm');
        break;

      case 'feed-filter':
        localStorage.removeItem('feedFilterForm');
        break;
    }
  }

  save() {
    this.isLoading = true;
    if (this.type === 'feed-filter') {
      this.applyFilters();
    }
    this.prepareDataToSubmit();
    switch (this.type) {
      case 'categories':
        localStorage.removeItem('categoryForm');
        break;
      case 'organization':
        localStorage.removeItem('organizationForm');
        break;
      case 'notification':
        localStorage.removeItem('notificationForm');
        break;
      case 'company':
        localStorage.removeItem('companyForm');
        break;

      case 'company-relation':
        localStorage.removeItem('companyRelationForm');
        break;

      case 'user':
        localStorage.removeItem('userForm');
        break;

      case 'feed-filter':
        localStorage.removeItem('feedFilterForm');
        break;
    }
  }

  applyFilters() {
    this.filterService.feedRegions = this.selectedRegionFilters;
    this.filterService.feedCategories = this.selectedCategoryFilters;
    this.dismiss();
  }

  get form() {
    switch (this.type) {
      case 'categories':
        return this.categoryForm.controls;
        break;
      case 'organization':
        return this.organizationForm.controls;
        break;
      default:
        break;
    }
    if (this.type === 'notification') {
      return this.notificationForm.controls;
    }
    if (this.type === 'company') {
      return this.companyForm.controls;
    }
    if (this.type === 'company-relation') {
      return this.companyRelationForm.controls;
    }
    if (this.type === 'user') {
      return this.userForm.controls;
    }
    if (this.type === 'feed-filter') {
      return this.feedFilterForm.controls;
    }
  }

  get selectedForm() {
    switch (this.type) {
      case 'categories':
        return this.categoryForm;
        break;
      case 'organization':
        return this.organizationForm;
        break;
      default:
        break;
    }
    if (this.type === 'notification') {
      return this.notificationForm;
    }
    if (this.type === 'company') {
      return this.companyForm;
    }
    if (this.type === 'company-relation') {
      return this.companyRelationForm;
    }
    if (this.type === 'user') {
      return this.userForm;
    }
    if (this.type === 'feed-filter') {
      return this.feedFilterForm;
    }
  }
}
