import { ICompanyProfile } from './../../../shared/models/companyProfile.model';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IonContent, ModalController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from '@app/services/data.service';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminCompaniesComponent implements OnInit {
  header: string;
  isLoading = false;
  companies: ICompanyProfile[];
  companyData: MatTableDataSource<ICompanyProfile>;
  currentModal: any;
  skeletonLoading = true;

  isApp: boolean = false;
  showTooltipInfo: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
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
        .listAll('/company-profile')
        .toPromise()
        .then(companies => {
          this.companies = companies.body;
          this.companyData = new MatTableDataSource(this.companies.slice(0, 14));
          this.companyData.paginator = this.paginator;
          this.companyData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  ionViewWillEnter() {}

  async disable(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Disable company',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Disable',
            handler: () => {
              item.disable = true;
              this.dataService
                .update('/company-profile', item)
                .toPromise()
                .then(() => {});
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  async enable(item?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Enable company',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Enable',
            handler: () => {
              item.disable = false;
              this.dataService
                .update('/company-profile', item)
                .toPromise()
                .then(() => {});
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  refreshCompanies() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/company-profile')
        .toPromise()
        .then(companies => {
          this.companies = companies.body;
          this.companyData = new MatTableDataSource(this.companies.slice(0, 14));
          this.companyData.paginator = this.paginator;
          this.companyData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  applyFilter(filterValue: string) {
    if (filterValue === null || filterValue === '') {
      // this.companyData.filter = '';
      this.companyData = new MatTableDataSource(this.companies.slice(0, 14));
    } else {
      this.companyData = new MatTableDataSource(this.companies);
      this.companyData.filter = filterValue.trim().toLowerCase();
    }

    if (this.companyData.paginator) {
      this.companyData.paginator.firstPage();
    }
  }

  loadData(event: any) {
    this.companyData = new MatTableDataSource(this.companies.slice(0, this.companyData.data.length + 14));
    this.companyData.paginator = this.paginator;
    this.companyData.sort = this.sort;
    event.target.complete();
    if (this.companyData.data.length === this.companies.length) {
      event.target.disabled = true;
    }
  }

  itemClick(id?: string) {
    this.editCompany(id);
  }

  async editCompany(id?: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type: 'company'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  async addCompany() {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        type: 'company'
      }
    });

    (await modal).present();
    this.currentModal = modal;
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
