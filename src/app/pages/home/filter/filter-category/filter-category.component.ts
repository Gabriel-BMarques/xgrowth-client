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
import { TranslateService } from '@ngx-translate/core';

const log = new Logger('Login');

@Component({
  selector: 'filter-category',
  templateUrl: './filter-category.component.html',
  styleUrls: ['./filter-category.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilterCategoryComponent implements OnInit, OnDestroy {
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
  selectedEntity: any;

  feedFilterForm!: FormGroup;

  constructor(
    private navParams: NavParams,
    private filterService: FilterService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private translate: TranslateService
  ) {
    // var self = this;
    this.translate.use('en');
    this.entityId = navParams.get('id');
    // componentProps can also be accessed at construction time using NavParams
    this.type = this.navParams.get('type');
    this.createForm(this.type);
  }

  async ngOnInit() {
    await this.refreshInterestsData();
    this.isLoading = false;
  }

  ngOnDestroy() {}

  public async clearAll() {
    this.selectedCategoryFilters = [];
    this.save();
  }

  async refreshInterestsData() {
    let categories;
    let subcategories;

    await this.dataService
      .list('/category/company')
      .toPromise()
      .then(res => {
        categories = res.body.filter(category => {
          return category.parentId === null;
        });
        subcategories = res.body.filter(subcategory => {
          return subcategory.parentId !== null;
        });
      });

    this.arrayCategories = categories;
    this.arraySubCategories = subcategories;
    if (this.filterService.feedCategories) {
      this.selectedCategoryFilters = this.filterService.feedCategories;
      this.startSelection();
    } else {
      this.selectedCategoryFilters = [];
    }
  }

  startSelection() {
    this.arrayCategories.map(category => {
      const foundCategory = this.selectedCategoryFilters.some(userInterest => {
        return userInterest._id === category._id;
      });
      if (foundCategory) {
        category.selected = true;
        const subcategories = this.arraySubCategories.filter(subcategory => {
          return subcategory.parentId === category._id;
        });
        subcategories.map(subcategory => (subcategory.selected = true));
      }
    });
    this.arraySubCategories.map(subcategory => {
      const found = this.selectedCategoryFilters.some(userInterest => {
        return userInterest._id === subcategory._id;
      });
      found ? (subcategory.selected = true) : (subcategory.selected = false);
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getThumbnailImage(url: string) {
    const image = 'https://weleverimages.blob.core.windows.net/app-images/' + url;
    return image;
  }

  changeSelectionCategory(entity: any) {
    entity.selected = !entity.selected;
    let counter = 0;
    if (this.isParent(entity)) {
      const catIndex = this.selectedCategoryFilters.indexOf(entity);
      entity.selected && this.getIndex(this.selectedCategoryFilters, entity) === -1
        ? this.selectedCategoryFilters.push(entity)
        : this.selectedCategoryFilters.splice(catIndex, 1);
      this.arraySubCategories.map(subcategory => {
        if (subcategory.parentId === entity._id) {
          counter++;
          if (entity.selected === true) {
            subcategory.selected = true;
            if (this.getIndex(this.selectedCategoryFilters, subcategory) === -1) {
              this.selectedCategoryFilters.push(subcategory);
            }
          } else {
            const subCatIndex = this.getIndex(this.selectedCategoryFilters, subcategory);
            subcategory.selected = false;
            this.selectedCategoryFilters.splice(subCatIndex, 1);
          }
        }
      });
    } else {
      if (entity.selected === true) {
        if (this.getIndex(this.selectedCategoryFilters, entity) === -1) {
          this.selectedCategoryFilters.push(entity);
        }
      } else {
        const parentCategory = this.arrayCategories.find(category => {
          return category._id === entity.parentId;
        });
        parentCategory.selected = false;
        const catIndex = this.getIndex(this.selectedCategoryFilters, parentCategory);
        this.selectedCategoryFilters.splice(catIndex, 1);
        const subCatIndex = this.getIndex(this.selectedCategoryFilters, entity);
        this.selectedCategoryFilters.splice(subCatIndex, 1);
      }
    }
  }

  getIndex(array: any, entity: any): any {
    let elementIndex;
    let found = false;
    array.map((element: any, index: number = 0) => {
      if (element._id === entity._id) {
        elementIndex = index;
        found = true;
      }
      index++;
    });
    if (found) {
      return elementIndex;
    } else {
      return -1;
    }
  }

  allSelected(entities: any[]) {
    let counter = 0;
    entities.map(entity => {
      if (entity.selected) {
        counter += 1;
      }
    });
    if (counter === entities.length) {
      return true;
    } else {
      return false;
    }
  }

  isParent(entity: any) {
    if (entity.parentId === null) {
      return true;
    } else {
      return false;
    }
  }

  createForm(type: string) {
    this.feedFilterForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
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
    this.filterService.feedCategories = this.selectedCategoryFilters;
    this.dismiss();
  }

  get form() {
    return this.feedFilterForm.controls;
  }

  get selectedForm() {
    return this.feedFilterForm;
  }
}
