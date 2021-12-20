import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { DataService } from '@app/services/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IonContent, ModalController } from '@ionic/angular';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { IOrganization } from '@app/shared/models/organizations.model';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminCategoriesComponent implements OnInit {
  header: string;
  isLoading = true;
  categories: any[];
  categoryData: MatTableDataSource<any>;
  currentModal: any;
  skeletonLoading = true;
  categoryClients: any[];
  counter: number;
  organizations: IOrganization[];
  companies: ICompanyProfile[];

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
    private dataService: DataService,
    private modalController: ModalController,
    public platform: Platform
  ) {}

  ngOnInit() {
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Categories';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Categorias';
    }
    this.skeletonLoading = true;
    this.refreshData();
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  ionViewWillEnter() {}

  refreshData() {
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
      });
    this.refreshCategories();
    this.headerService.setHeader(this.header);
  }

  countCompaniesByOrganization(category: any) {
    const categoryClients = this.categoryClients.filter(relation => {
      return relation.categoryId === category._id;
    });
    return categoryClients.length;
  }

  refreshCategories() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/category')
        .toPromise()
        .then(categories => {
          this.categories = categories.body;
          this.dataService
            .listAll('/category-client')
            .toPromise()
            .then(categoryClients => {
              this.categoryClients = categoryClients.body;
              Object.entries(this.categories).forEach(([key, category]) => {
                category.companiesCount = this.countCompaniesByOrganization(category);
              });
              this.categoryData = new MatTableDataSource(this.categories.slice(0, 14));
              this.categoryData.paginator = this.paginator;
              this.categoryData.sort = this.sort;
              this.skeletonLoading = false;
            });
        });
    }, 100);
  }

  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.categoryData.filter = '';
    } else {
      this.categoryData = new MatTableDataSource(this.categories);
      this.categoryData.filter = filterValue.trim().toLowerCase();
    }

    if (this.categoryData.paginator) {
      this.categoryData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.categoryData = new MatTableDataSource(this.categories.slice(0, this.categoryData.data.length + 14));
    this.categoryData.paginator = this.paginator;
    this.categoryData.sort = this.sort;
    event.target.complete();
    if (this.categoryData.data.length === this.categories.length) {
      event.target.disabled = true;
    }
  }

  async addCategory(mode: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        Mode: mode,
        type: 'categories',
        Organizations: this.organizations,
        Companies: this.companies,
        Categories: this.categories
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async edit(id?: any) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type: 'categories'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.refreshData();
        this.currentModal = null;
      });
    }
  }
}
