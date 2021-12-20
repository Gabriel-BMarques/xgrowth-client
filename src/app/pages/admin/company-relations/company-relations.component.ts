import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IonContent, ModalController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { ICompanyProfile } from '@app/shared/models/companyProfile.model';
import { DataService } from '@app/services/data.service';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-company-relations',
  templateUrl: './company-relations.component.html',
  styleUrls: ['./company-relations.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminCompanyRelationsComponent implements OnInit {
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
    public platform: Platform
  ) {}

  ngOnInit() {
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Company Relations';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Relações da Empresa';
    }
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

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
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
    this.editCompanyRelations(id);
  }

  async editCompanyRelations(id?: string) {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        id,
        type: 'company-relation'
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
