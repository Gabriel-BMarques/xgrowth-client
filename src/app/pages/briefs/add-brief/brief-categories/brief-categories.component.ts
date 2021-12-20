import { OnInit, Component, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { DataService } from '@app/services/data.service';
import { IBrief } from '@app/shared/models/brief.model';
import { IBriefCategory, BriefCategory } from '@app/shared/models/briefCategory.model';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NotificationService } from '@app/services/notification.service';
import { NavigationService } from '@app/services/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-brief-categories',
  templateUrl: './brief-categories.component.html',
  styleUrls: ['./brief-categories.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BriefCategoriesComponent implements IAlertControtllerGuard {
  arrayCategories: any[] = [];
  arrayCategoriesCopy: any[] = [];
  arraySubCategories: any[] = [];
  arraySubCategoriesCopy: any[] = [];
  category1: PanelData;
  category2: PanelData;
  category3: PanelData;
  skeletonLoading: boolean;
  isLoading: boolean = true;
  header: string;
  categoriesData: MatTableDataSource<any>;
  subCategoriesData: MatTableDataSource<any>;
  postCategories: IItem[] = [];
  arraySelect: boolean[] = [];
  categoriesForm: FormGroup;
  brief: IBrief;
  briefid: any;
  selectedCategories: any[] = [];
  briefCategories: IBriefCategory[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  get briefId(): string {
    return this.wizard.entity._id;
  }

  constructor(
    private headerService: HeaderService,
    public wizard: BriefAddWizardService,
    private router: Router,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private dataService: DataService
  ) {
    this.setHeaderLang();
    this.headerService.setHeader(this.header);
  }

  setHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Categories';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Categorias';
    }
  }

  async ionViewWillEnter() {
    this.wizard.currentView = 4;
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = this.skeletonLoading = false;
  }

  async checkWizardReset() {
    if (this.wizard.isReseted) await this.resetBriefCreation();
  }

  async resetBriefCreation() {
    const briefId = this.route.snapshot.params.id;
    if (!briefId) this.router.navigate(['/briefs'], { replaceUrl: true });
    else this.wizard.entity._id = briefId;
    await this.wizard.loadWizard();
  }

  async loadData() {
    this.categoriesForm = _.cloneDeep(this.wizard.step4Form);
    console.log(this.categoriesForm);
    await this.refreshData();
    this.prepareSelection();
    this.onChanges();
  }

  async refreshData() {
    this.briefid = _.cloneDeep(this.wizard.entity._id);
    // this.categoriesForm = this.wizard.step4Form;
    await this.dataService
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
        this.categoriesData = new MatTableDataSource(this.arrayCategories);
        // if (this.wizard.entity.Categories) {
        //   console.log(this.categoriesForm.controls.categories.value);
        // this.prepareSelection();
        // }
      });
  }

  prepareSelection() {
    this.selectedCategories = this.categoriesForm.controls.categories.value;
    const briefCategoryIds = this.selectedCategories.map((category: any) => {
      return category._id;
    });
    this.arrayCategories.map((category: any) => {
      const foundCat = briefCategoryIds.some((briefCategoryId: any) => {
        return briefCategoryId === category._id;
      });
      if (foundCat) {
        category.selected = true;
        this.arraySubCategories.map((subcategory: any) => {
          if (subcategory.parentId === category._id) {
            subcategory.selected = true;
          }
        });
      } else {
        category.selected = false;
        this.arraySubCategories.map((subcategory: any) => {
          const foundSubCat = briefCategoryIds.some((briefSubCategoryId: any) => {
            return briefSubCategoryId === subcategory._id;
          });
          foundSubCat ? (subcategory.selected = true) : (subcategory.selected = false);
        });
      }
    });
  }

  selectSubCategories(category: any) {
    this.arraySubCategories.map((subcategory: any) => {
      if (subcategory.parentId === category._id) {
        category.selected ? (subcategory.selected = true) : (subcategory.selected = false);
        subcategory.selected ? this.createBriefCategory(subcategory) : this.removeBriefCategory(subcategory);
      }
    });
  }

  createBriefCategory(category: any) {
    if (!this.categoriesForm.controls.categories.value.includes(category._id)) {
      this.selectedCategories.push(category);
      this.categoriesForm.controls.categories.setValue(this.selectedCategories);
    }
  }

  removeBriefCategory(category: any) {
    const found = this.categoriesForm.controls.categories.value.some((cat: any) => {
      return cat._id === category._id;
    });
    if (found) {
      // tslint:disable-next-line: max-line-length
      const index = _.findIndex(this.selectedCategories, (cat: any) => {
        return cat._id === category._id;
      });
      this.selectedCategories.splice(index, 1);
      this.categoriesForm.controls.categories.setValue(this.selectedCategories);
    }
  }

  briefCategoryExists(entity: any) {
    const found = this.briefCategories.some((briefCategory: any) => {
      return briefCategory.categoryId._id === entity._id;
    });
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  changeSelection(entity: any) {
    entity.selected = !entity.selected;
    if (entity.parentId === null) {
      if (entity.selected) {
        this.createBriefCategory(entity);
        this.selectSubCategories(entity);
      } else {
        this.removeBriefCategory(entity);
        this.selectSubCategories(entity);
      }
    } else if (entity.selected) {
      this.createBriefCategory(entity);
    } else {
      this.removeBriefCategory(entity);
    }
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.categoriesData.filter = '';
    } else {
      this.categoriesData = new MatTableDataSource(this.arrayCategories);
      this.categoriesData.filter = filterValue.trim().toLocaleLowerCase();
    }

    // if (this.categoriesData.paginator) {
    //   this.categoriesData.paginator.firstPage();
    // }
  }

  selectAll(category: PanelData, index: number) {
    if (!this.arraySelect[index]) {
      this.arraySelect[index] = true;
      for (let item of category.items) {
        item.selected = true;
      }
    } else {
      this.arraySelect[index] = false;
      for (let item of category.items) {
        item.selected = false;
      }
    }
  }

  onChanges(): void {
    this.categoriesForm.valueChanges.subscribe(() => {
      console.log('CAIU AQUI');
      this.wizard.step4Form = _.cloneDeep(this.categoriesForm);
      this.wizard.saveChanges();
    });
  }

  saveEditChanges() {
    const finish = true;
    this.wizard.saveChanges(finish);
    this.router.navigate(['briefs', 'my-brief', this.wizard.entity._id], { replaceUrl: true });
  }

  next() {
    this.wizard.next();
    this.wizard.step4Form = _.cloneDeep(this.categoriesForm);
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/team-members'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/team-members', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }

  back() {
    this.wizard.back();
    if (!this.wizard.isEditing) {
      this.router.navigate(['/briefs/add-brief/market-info'], { replaceUrl: true });
    } else {
      this.router.navigate(['/briefs/add-brief/market-info', 'edit', this.wizard.entity._id], { replaceUrl: true });
    }
  }
  canDeactivate() {
    if (this.wizard.isEditing && this.categoriesForm.touched) {
      return this.navigationService.generateAlertBrief(
        'Discard Brief?',
        'If you leave the brief edition now, you will lose the edited information',
        'Discard',
        'Keep'
      );
    } else if (!this.wizard.isEditing && !this.categoriesForm.pristine) {
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
