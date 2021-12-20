import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { MockService } from '@app/services/mock.service';
import { DataService } from '@app/services/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { ModalCategoryComponent } from './modal-category/modalCategory.component';
import { ICategoryOrganization } from '@app/shared/models/categoryOrganization.model';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-category-organization',
  templateUrl: './category-organization.component.html',
  styleUrls: ['./category-organization.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoriesOrganizationComponent implements OnInit {
  header: string;
  isLoading = false;
  categoryOrganization: ICategoryOrganization[];
  categoryOrganizationData: MatTableDataSource<ICategoryOrganization>;
  currentModal: any;
  skeletonLoading = true;

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private modalController: ModalController,
    private dataService: DataService,
    public alertController: AlertController,
    public platform: Platform
  ) {}

  ngOnInit() {
    this.skeletonLoading = true;
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Companies';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Empresas';
    }
    setTimeout(() => {
      this.dataService
        .list('/category-organization')
        .toPromise()
        //lazy loading
        .then(categoryOrganization => {
          this.categoryOrganization = categoryOrganization.body;
          this.categoryOrganizationData = new MatTableDataSource(this.categoryOrganization.slice(0, 14));
          this.categoryOrganizationData.paginator = this.paginator;
          this.categoryOrganizationData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  refreshCategoryOrganization() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .list('/category-organization')
        .toPromise()
        .then(categoryOrganization => {
          this.categoryOrganization = categoryOrganization.body;
          this.categoryOrganizationData = new MatTableDataSource(this.categoryOrganization.slice(0, 14));
          this.categoryOrganizationData.paginator = this.paginator;
          this.categoryOrganizationData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  //Search bar
  applyFilter(filterValue: string) {
    if (filterValue === null) {
      this.categoryOrganizationData.filter = '';
    } else {
      this.categoryOrganizationData = new MatTableDataSource(this.categoryOrganization);
      this.categoryOrganizationData.filter = filterValue.trim().toLowerCase();
    }

    if (this.categoryOrganizationData.paginator) {
      this.categoryOrganizationData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.categoryOrganizationData = new MatTableDataSource(
      this.categoryOrganization.slice(0, this.categoryOrganizationData.data.length + 14)
    );
    this.categoryOrganizationData.paginator = this.paginator;
    this.categoryOrganizationData.sort = this.sort;
    event.target.complete();
    if (this.categoryOrganizationData.data.length === this.categoryOrganization.length) {
      event.target.disabled = true;
    }
  }

  itemClick(entity?: any) {
    this.editCompany(entity);
  }
  async editCompany(entity?: any) {
    const modal = this.modalController.create({
      component: ModalCategoryComponent,
      componentProps: {
        categoryOrganization: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(response => {
      entity = response.data;
      this.refreshCategoryOrganization();
    });
  }

  async addCategoryOrganization() {
    const modal = await this.modalController.create({
      component: ModalCategoryComponent
    });
    await modal.present();
    modal.onDidDismiss().then(modalRes => {
      this.refreshCategoryOrganization();
    });
  }

  async delete(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete Category Organization',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: () => {
              this.dataService
                .remove('/category-organization', item)
                .toPromise()
                .then(res => {
                  this.refreshCategoryOrganization();
                });
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }
}
