import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup } from '@angular/forms';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IonContent } from '@ionic/angular';
import { PostAddWizardService } from '@app/services/post-add-wizard.service';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { DataService } from '@app/services/data.service';
import * as _ from 'lodash';
import { IAlertControtllerGuard } from '@app/shared/i-alert-controtller-guard';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-add-categories',
  templateUrl: './add-categories.component.html',
  styleUrls: ['./add-categories.component.scss']
})
export class AddCategoriesComponent implements IAlertControtllerGuard {
  arrayCategories: any[] = [];
  arrayCategoriesCopy: any[] = [];
  arraySubCategories: any[] = [];
  arraySubCategoriesCopy: any[] = [];
  skeletonLoading: boolean = true;
  isLoading: boolean = true;
  header: string;
  categoriesData: MatTableDataSource<any>;
  arraySelect: boolean[] = [];
  categoriesForm: FormGroup;
  selectedCategories: any[] = [];

  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  get isEditing() {
    return this.wizard.isEditing;
  }

  get postId() {
    return this.wizard.postId;
  }

  constructor(
    private route: ActivatedRoute,
    public wizard: PostAddWizardService,
    private router: Router,
    private dataService: DataService,
    private navigationService: NavigationService,
    private headerService: HeaderService
  ) {
    this.verifyHeaderLang();
    this.headerService.setHeader(this.header);
  }

  async ionViewWillEnter() {
    this.wizard.currentView = 2;
    await this.checkWizardReset();
    await this.loadData();
    this.isLoading = this.skeletonLoading = false;
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

  async loadData() {
    this.categoriesForm = _.cloneDeep(this.wizard.step2Form);
    await this.refreshCategories();
    this.prepareSelection();
    this.onChanges();
  }

  verifyHeaderLang() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Categories';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Categorias';
    }
  }

  async refreshCategories() {
    await this.dataService
      .list('/category/company')
      .toPromise()
      .then(res => {
        console.log(res.body);
        const categories = res.body.filter(category => {
          return category.parentId === null;
        });
        const subcategories = res.body.filter(subcategory => {
          return subcategory.parentId !== null;
        });
        this.arrayCategories = this.arrayCategoriesCopy = categories;
        this.arraySubCategories = this.arraySubCategoriesCopy = subcategories;
        this.categoriesData = new MatTableDataSource(this.arrayCategories);
      });
  }

  prepareSelection() {
    this.selectedCategories = this.categoriesForm.controls.categories.value;
    const postCategoryIds = this.selectedCategories.map((cat: any) => {
      return cat._id;
    });
    this.arrayCategories.map((category: any) => {
      const foundCat = postCategoryIds.some((postCategoryId: any) => {
        return postCategoryId === category._id;
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
          const foundSubCat = postCategoryIds.some((postSubCategoryId: any) => {
            return postSubCategoryId === subcategory._id;
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
        subcategory.selected ? this.createPostCategory(subcategory) : this.removePostCategory(subcategory);
      }
    });
  }

  createPostCategory(category: any) {
    if (!this.categoriesForm.controls.categories.value.includes(category._id)) {
      this.selectedCategories.push(category);
      this.categoriesForm.controls.categories.setValue(this.selectedCategories);
    }
  }

  removePostCategory(category: any) {
    const found = this.categoriesForm.controls.categories.value.some((cat: any) => {
      return cat._id === category._id;
    });
    if (found) {
      const index = _.findIndex(this.selectedCategories, cat => {
        return cat._id === category._id;
      });
      this.selectedCategories.splice(index, 1);
      this.categoriesForm.controls.categories.setValue(this.selectedCategories);
    }
  }

  changeSelection(entity: any) {
    entity.selected = !entity.selected;
    if (entity.parentId === null) {
      if (entity.selected) {
        this.createPostCategory(entity);
        this.selectSubCategories(entity);
      } else {
        this.removePostCategory(entity);
        this.selectSubCategories(entity);
      }
    } else if (entity.selected) {
      this.createPostCategory(entity);
    } else {
      this.removePostCategory(entity);
    }
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.categoriesData.filter = '';
    } else {
      this.categoriesData = new MatTableDataSource(this.arrayCategories);
      this.categoriesData.filter = filterValue.trim().toLocaleLowerCase();
    }
  }

  onChanges(): void {
    this.categoriesForm.valueChanges.subscribe(() => {
      this.wizard.step2Form = _.cloneDeep(this.categoriesForm);
      this.wizard.saveChanges();
    });
  }

  saveEditChanges() {
    this.wizard.step2Form = _.cloneDeep(this.categoriesForm);
    this.wizard.saveChanges();
    this.router.navigate(['/post/add/preview'], {
      replaceUrl: true
    });
  }

  next() {
    if (this.isEditing) {
      this.router.navigate(['/post/add/edit/terms-and-conditions', this.postId]);
    } else {
      this.router.navigate(['/post/add/terms-and-conditions']);
    }
  }

  back() {
    if (this.isEditing) {
      this.router.navigate(['/post/add/edit', this.postId]);
    } else {
      this.router.navigate(['/post/add']);
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
}
