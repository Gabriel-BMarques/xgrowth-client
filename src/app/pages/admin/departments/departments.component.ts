import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HeaderService } from '@app/services/header.service';
import { PanelData } from '@app/shared/models/panelData.model';
import { MockService } from '@app/services/mock.service';
import { ModalController, IonContent, AlertController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '@app/services/data.service';
import { ModalDepartmentsComponent } from './modal-department/modal-departments.component';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-admin-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DepartmentsComponent implements OnInit {
  header: string;
  isLoading = false;
  departments: any[];
  panelData: PanelData;
  departmentData: MatTableDataSource<any>;
  currentModal: any;
  skeletonLoading = true;
  searchActive: boolean = false;

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

  async ngOnInit() {
    this.skeletonLoading = true;
    if (this.platform.is('desktop')) {
      this.isApp = false;
    } else {
      this.isApp = true;
    }
    this.panelData = {
      type: 'organizations',
      name: 'Organizations',
      items: []
    };
    await this.refreshDepartments();
  }

  ionViewWillEnter() {}

  ionViewDidEnter() {
    this.headerService.setHeader('Job Titles');
    this.isLoading = true;
  }

  toggleTooltipInfo() {
    this.showTooltipInfo = !this.showTooltipInfo;
  }

  async refreshDepartments() {
    this.skeletonLoading = true;
    await this.dataService
      .list('/misc/department')
      .toPromise()
      .then(res => {
        this.departments = res.body;
        this.departmentData = new MatTableDataSource(this.departments.slice(0, 16));
        this.refreshPanelData();
        this.departmentData.paginator = this.paginator;
        this.departmentData.sort = this.sort;
        this.skeletonLoading = false;
      });

    this.isLoading = false;
  }

  refreshPanelData() {
    this.panelData.items = [];
    Object.entries(this.departmentData.filteredData).forEach(([key, value]) => {
      const department = this.departmentData.filteredData[key];
      this.panelData.items.push({
        id: department._id,
        title: department.name,
        subtitle: department.domain
      });
    });
  }

  async itemClick(entity?: any) {
    const modal = this.modalController.create({
      component: ModalDepartmentsComponent,
      componentProps: {
        department: entity
      }
    });
    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(response => {
      entity = response.data;
      this.refreshDepartments();
    });
  }

  async delete(entity?: any) {
    this.alertController
      .create({
        header: 'Are you sure?',
        message: 'Delete department',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            handler: async () => {
              await this.dataService.remove('/misc/department', entity).toPromise();
              this.refreshDepartments();
            }
          }
        ]
      })
      .then(alerEl => {
        alerEl.present();
      });
  }

  applyFilter(filterValue: string) {
    if (filterValue === null || filterValue === '') {
      // this.departmentData.filter = '';
      this.departmentData = new MatTableDataSource(this.departments.slice(0, 16));
      this.searchActive = false;
    } else {
      this.departmentData = new MatTableDataSource(this.departments);
      this.departmentData.filter = filterValue.trim().toLowerCase();
      this.searchActive = true;
    }

    if (this.departmentData.paginator) {
      this.departmentData.paginator.firstPage();
    }
    this.refreshPanelData();
  }

  loadData(event: any) {
    this.isLoading = true;
    this.departmentData = new MatTableDataSource(this.departments.slice(0, this.departmentData.data.length + 7));
    this.refreshPanelData();
    this.departmentData.paginator = this.paginator;
    this.departmentData.sort = this.sort;
    event.target.complete();
    if (this.departmentData.data.length === this.departments.length) {
      event.target.disabled = true;
    }
    this.isLoading = false;
  }

  async addDepartment() {
    const modal = this.modalController.create({
      component: ModalDepartmentsComponent,
      componentProps: {
        department: ''
      }
    });

    (await modal).present();
    this.currentModal = modal;
    (await modal).onDidDismiss().then(() => {
      this.refreshDepartments();
    });
  }

  dismissModal() {
    if (this.currentModal) {
      this.currentModal.dismiss().then(() => {
        this.currentModal = null;
      });
    }
  }
}
