import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalController, IonContent } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { IOrganization } from '@app/shared/models/organizations.model';
import { ModalPageComponent } from '@app/shared/modals/modal/modal.component';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-admin-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminOrganizationsComponent implements OnInit {
  header: string;
  isLoading = false;
  organizations: IOrganization[];
  panelData: PanelData;
  organizationData: MatTableDataSource<IOrganization>;
  currentModal: any;
  skeletonLoading = true;
  searchActive: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(IonContent, { static: true }) contentArea: IonContent;

  constructor(
    private headerService: HeaderService,
    private mockService: MockService,
    private modalController: ModalController,
    private dataService: DataService
  ) {}

  ngOnInit() {
    if (localStorage.getItem('language') === 'en-US') {
      this.header = 'Organizations';
    } else if (localStorage.getItem('language') === 'pt-BR') {
      this.header = 'Organizações';
    }
    this.skeletonLoading = true;
    setTimeout(() => {
      this.panelData = {
        type: 'organizations',
        name: 'Organizations',
        items: []
      };
      this.dataService
        .listAll('/organization')
        .toPromise()
        .then(users => {
          this.organizations = users.body;
          this.organizationData = new MatTableDataSource(this.organizations.slice(0, 16));
          this.refreshPanelData();
          this.organizationData.paginator = this.paginator;
          this.organizationData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader(this.header);
    this.isLoading = false;
  }

  refreshOrganizations() {
    this.skeletonLoading = true;
    setTimeout(() => {
      this.dataService
        .listAll('/organization')
        .toPromise()
        .then(users => {
          this.organizations = users.body;
          this.organizationData = new MatTableDataSource(this.organizations.slice(0, 16));
          this.refreshPanelData();
          this.organizationData.paginator = this.paginator;
          this.organizationData.sort = this.sort;
          this.skeletonLoading = false;
        });
    }, 100);
  }

  refreshPanelData() {
    this.panelData.items = [];
    Object.entries(this.organizationData.filteredData).forEach(([key, value]) => {
      const organization = this.organizationData.filteredData[key];
      this.panelData.items.push({
        id: organization._id,
        title: organization.name,
        subtitle: organization.domain
      });
    });
  }

  applyFilter(filterValue: string) {
    if (filterValue === null || filterValue === '') {
      // this.organizationData.filter = '';
      this.organizationData = new MatTableDataSource(this.organizations.slice(0, 16));
      this.searchActive = false;
    } else {
      this.organizationData = new MatTableDataSource(this.organizations);
      this.organizationData.filter = filterValue.trim().toLowerCase();
      this.searchActive = true;
    }

    if (this.organizationData.paginator) {
      this.organizationData.paginator.firstPage();
    }
    this.refreshPanelData();
  }

  loadData(event: any) {
    this.isLoading = true;
    this.organizationData = new MatTableDataSource(this.organizations.slice(0, this.organizationData.data.length + 7));
    this.refreshPanelData();
    this.organizationData.paginator = this.paginator;
    this.organizationData.sort = this.sort;
    event.target.complete();
    if (this.organizationData.data.length === this.organizations.length) {
      event.target.disabled = true;
    }
    this.isLoading = false;
  }

  async addOrganization() {
    const modal = this.modalController.create({
      component: ModalPageComponent,
      componentProps: {
        type: 'organization',
        firstName: 'Douglas',
        lastName: 'Adams',
        middleInitial: 'N'
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
