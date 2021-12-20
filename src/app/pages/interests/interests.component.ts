import { OnInit, Component, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PanelData } from '@app/shared/models/panelData.model';
import { IItem } from '@app/shared/models/item.model';
import { IonContent } from '@ionic/angular';
import { MockService } from '@app/services/mock.service';
import { DataService } from '@app/services/data.service';
import { Interest, IInterest } from '@app/shared/models/interests.model';
import { CredentialsService } from '@app/core/authentication/credentials.service';
import { LoadInterestsService } from '@app/services/load-interests.service';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-interests',
  templateUrl: './interests.component.html',
  styleUrls: ['./interests.component.scss']
})
export class InterestsComponent implements OnInit {
  arrayCategories: any[] = [];
  arrayCategoriesCopy: any[] = [];
  arraySubCategories: any[] = [];
  arraySubCategoriesCopy: any[] = [];
  skeletonLoading = true;
  isLoading = true;
  isChecking = false;
  header: string;
  categoriesData: MatTableDataSource<PanelData>;
  subCategoriesData: MatTableDataSource<IItem>;
  postCategories: IItem[] = [];
  arraySelect: boolean[] = [];
  userId: string;
  user: any;
  hasSeenInterestsTutorial: boolean;
  userInterests: IInterest[] = [];
  closeTutorial: number;
  nextTutorial: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;
  userRole: string;

  constructor(
    private headerService: HeaderService,
    private dataService: DataService,
    private credentialsService: CredentialsService,
    private loadInterestsService: LoadInterestsService,
    private navigationService: NavigationService
  ) {}

  async ngOnInit() {
    this.userRole = this.credentialsService.checkRole;
    await this.loadUser();
    await this.dataService
      .getUserInfo()
      .toPromise()
      .then(user => {
        this.userId = user.body.id;
      });
    await this.refreshInterests();
    await this.refreshData();
    this.skeletonLoading = false;
    this.isLoading = false;
  }

  async loadUser() {
    this.user = (await this.dataService.getUserInfo().toPromise()).body;
    this.hasSeenInterestsTutorial = this.user.hasSeenInterestsTutorial;
  }

  async ionViewWillEnter() {}

  ionViewDidEnter() {
    this.navigationService.getRoute(window.location.hash);
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Interests';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Interesses';
    }
    this.headerService.setHeader(this.header);
  }

  async refreshInterests() {
    await this.dataService
      .list('/interests', { userId: this.userId })
      .toPromise()
      .then(interests => {
        this.userInterests = interests.body;
        this.isChecking = false;
      });
  }

  async refreshData() {
    if (!this.loadInterestsService.hasLoadedCategories) {
      await this.loadInterestsService.refreshData(this.userRole);
      this.arrayCategories = this.loadInterestsService.arrayCategories;
      this.arraySubCategories = this.loadInterestsService.arraySubCategories;
    } else {
      this.arrayCategories = this.loadInterestsService.arrayCategories;
      this.arraySubCategories = this.loadInterestsService.arraySubCategories;
    }
    this.arrayCategoriesCopy = this.arrayCategories;
    this.arraySubCategoriesCopy = this.arraySubCategories;
    this.startSelection();
  }

  startSelection() {
    this.arrayCategories.map(category => {
      const foundCategory = this.userInterests.some(userInterest => {
        return userInterest.categoryId === category._id;
      });
      if (foundCategory) {
        category.selected = true;
        this.arraySubCategories.map(subcategory => {
          const foundSubCategory = this.arraySubCategories.some(subcategory2 => {
            return subcategory2.parentId === category._id;
          });
          foundSubCategory ? (subcategory.selected = true) : (subcategory.selected = false);
        });
      }
    });
    this.arraySubCategories.map(val => {
      const found = this.userInterests.some(userInterest => {
        return userInterest.categoryId === val._id;
      });
      found ? (val.selected = true) : (val.selected = false);
    });
  }

  async changeSelection(entity: any) {
    entity.selected = !entity.selected;
    this.isChecking = true;

    let counter = 0;
    if (entity.parentId === null) {
      if (entity.selected) {
        const found = this.userInterests.some(interest => {
          return interest.categoryId === entity._id;
        });
        if (!found) {
          await this.createInterest(entity);
        }
      } else {
        await this.removeInterest(entity);
      }
      this.arraySubCategories.map(async subcategory => {
        if (subcategory.parentId === entity._id) {
          counter++;
          if (entity.selected === true) {
            const found = this.userInterests.some(interest => {
              return interest.categoryId === subcategory._id;
            });
            if (!found) {
              subcategory.selected = true;
              await this.createInterest(subcategory);
            }
          } else {
            subcategory.selected = false;
            await this.removeInterest(subcategory);
          }
        }
      });
    } else {
      if (entity.selected === true) {
        const found = this.userInterests.some(interest => {
          return interest.categoryId === entity._id;
        });
        if (!found) {
          await this.createInterest(entity);
        }
      } else {
        const parentCategory = this.arrayCategories.find(category => {
          return category._id === entity.parentId;
        });
        parentCategory.selected = false;
        await this.removeInterest(entity);
      }
    }
    await this.refreshInterests();
  }

  async createInterest(entity: any) {
    const interest = new Interest();
    interest.categoryId = entity._id;
    interest.userId = this.userId;
    await this.dataService
      .create('/interests', interest)
      .toPromise()
      .then(() => {});
  }

  async removeInterest(entity: any) {
    const interest = this.userInterests.find(userInterest => {
      return userInterest.categoryId === entity._id;
    });
    await this.dataService
      .remove('/interests', interest)
      .toPromise()
      .then(() => {});
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.categoriesData.filter = '';
    } else {
      this.categoriesData.filter = filterValue.trim().toLocaleLowerCase();
    }

    if (this.subCategoriesData.paginator) {
      this.categoriesData.paginator.firstPage();
    }
    this.refreshPanelData();
  }

  refreshPanelData() {
    this.arrayCategories = [];

    Object.entries(this.categoriesData.filteredData).forEach(([, filteredCategories]) => {
      this.arrayCategories.push(filteredCategories);
    });
  }

  selectAll(category: PanelData, index: number) {
    if (!this.arraySelect[index]) {
      this.arraySelect[index] = true;
      for (const item of category.items) {
        item.selected = true;
      }
    } else {
      this.arraySelect[index] = false;
      for (const item of category.items) {
        item.selected = false;
      }
    }
  }

  async onNextTutorial(event: any) {
    this.nextTutorial = event.nextTutorial;
    console.log(this.nextTutorial);
    if (this.nextTutorial == 10) {
      this.user.hasSeenInterestsTutorial = true;
      this.hasSeenInterestsTutorial = true;
      await this.dataService.updateUser('/users', this.user).toPromise();
      await this.loadUser();
    }
  }
}
